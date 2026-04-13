import fs from "node:fs";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { ARCHIVES_MIME_MAP, formatTimestamp, sanitizeFileName } from "./archives-utils.js";

const ARCHIVE_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}$/;

/**
 * Minimal hook event shape used by the archive compliance logic.
 */
export interface ArchiveAfterToolCallEvent {
  error?: unknown;
  toolName: string;
  params?: Record<string, unknown>;
}

/**
 * Minimal runtime context shape used by the archive compliance logic.
 */
export interface ArchiveAfterToolCallContext {
  sessionKey?: string | null;
  sessionId?: string | null;
}

/**
 * Parsed archive path information rooted at one archive id.
 */
export interface ArchivePathInfo {
  archiveId: string;
  fileName: string;
  relativeSubpath: string;
}

/**
 * Parses one workspace-relative archive file path.
 *
 * @param relativePath Workspace-relative path.
 * @returns Parsed archive path segments when the path is under `archives/<id>/...`.
 */
export function parseArchivePath(relativePath: string): ArchivePathInfo | undefined {
  const normalized = relativePath.replaceAll("\\", "/").replace(/^\/+/, "");
  const segments = normalized.split("/").filter(Boolean);

  if (segments.length < 3 || segments[0] !== "archives") {
    return undefined;
  }

  const archiveId = segments[1];
  const relativeSubpath = segments.slice(2).join("/");
  const fileName = segments[segments.length - 1];

  if (!archiveId || !relativeSubpath || !fileName) {
    return undefined;
  }

  return {
    archiveId,
    fileName,
    relativeSubpath
  };
}

/**
 * Registers `/v1/archives` HTTP route and `after_tool_call` archive compliance hook.
 *
 * @param api OpenClaw plugin API.
 */
export function registerArchivesAccess(api: OpenClawPluginApi): void {
  api.registerHttpRoute({
    path: "/v1/archives",
    match: "prefix",
    auth: "gateway",
    handler: async (req: IncomingMessage, res: ServerResponse) => {
      api.logger.debug?.(`Incoming request to dip archives: ${req.url}`);
      try {
        let workspaceDir = api.resolvePath(".") || process.cwd();

        const urlStr = req.url || "/";
        const urlObj = new URL(urlStr, "http://localhost");
        const agentId = urlObj.searchParams.get("agent");

        if (agentId) {
          const cfg = await api.runtime.config.loadConfig();
          const agentsObj = cfg.agents as {
            list?: Array<{ id?: string; workspace?: string }>;
          };
          const agentCfg = agentsObj.list?.find(agent => agent.id === agentId);

          if (!agentCfg?.workspace) {
            api.logger.warn(`Agent workspace not found for: ${agentId}`);
            res.statusCode = 404;
            res.setHeader("Content-Type", "text/plain");
            res.end("Agent workspace not found");
            return true;
          }

          workspaceDir = agentCfg.workspace;
        }

        const sessionId = urlObj.searchParams.get("session");
        let normalizedSessionId = normalizeArchiveId(sessionId);
        if (sessionId?.includes(":")) {
          normalizedSessionId = normalizeArchiveId(sessionId.split(":").filter(Boolean).pop());
        }

        const archivesDir = path.join(workspaceDir, "archives");
        const rawPath = urlObj.pathname;
        let subPath = decodeURIComponent(rawPath).replace(/^\/v1\/archives\/?/, "");

        if (!subPath && normalizedSessionId) {
          subPath = normalizedSessionId;
        }

        const segments = subPath.split("/").filter(Boolean);
        if (segments.length > 0 && segments[0].includes(":")) {
          segments[0] = normalizeArchiveId(segments[0].split(":").filter(Boolean).pop()) ?? segments[0];
          subPath = segments.join("/");
        }

        const targetPath = path.resolve(archivesDir, subPath);
        const relative = path.relative(archivesDir, targetPath);
        if (relative.startsWith("..") || path.isAbsolute(relative)) {
          api.logger.warn(`Path traversal attempt blocked: ${targetPath}`);
          res.statusCode = 403;
          res.end("Forbidden");
          return true;
        }

        let stat: fs.Stats;
        try {
          stat = await fs.promises.stat(targetPath);
        } catch (error: any) {
          if (error.code === "ENOENT") {
            res.statusCode = 404;
            res.end("Not Found");
            return true;
          }
          throw error;
        }

        if (stat.isDirectory()) {
          const entries = await fs.promises.readdir(targetPath, { withFileTypes: true });
          const files = entries.map(entry => ({
            name: entry.name,
            type: entry.isDirectory() ? "directory" : entry.isFile() ? "file" : "other"
          }));

          files.sort((left, right) => right.name.localeCompare(left.name));

          let displaySubPath = "/";
          if (normalizedSessionId) {
            const sessionDir = path.join(archivesDir, normalizedSessionId);
            displaySubPath = path.relative(sessionDir, targetPath);
          } else {
            const pathParts = subPath.split("/").filter(Boolean);
            if (pathParts.length > 0) {
              const sessionDir = path.join(archivesDir, pathParts[0]);
              displaySubPath = path.relative(sessionDir, targetPath);
            }
          }

          if (displaySubPath === "." || !displaySubPath) {
            displaySubPath = "/";
          }

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              path: displaySubPath,
              contents: files
            })
          );
          return true;
        }

        const ext = path.extname(targetPath).toLowerCase();
        const mimeType = ARCHIVES_MIME_MAP[ext] || "application/octet-stream";
        res.setHeader("Content-Type", mimeType);
        res.statusCode = 200;
        fs.createReadStream(targetPath).pipe(res);
        return true;
      } catch (error: any) {
        api.logger.error(`Error serving archive file: ${error.message}`);
        res.statusCode = 500;
        res.end("Internal Server Error");
        return true;
      }
    }
  });

  api.on("after_tool_call", async (event: ArchiveAfterToolCallEvent, ctx: ArchiveAfterToolCallContext) => {
    await handleArchiveAfterToolCall(api, event, ctx);
  });
}

/**
 * Applies archive compliance rules after one file-writing tool call.
 *
 * @param api OpenClaw plugin API.
 * @param event Tool hook event.
 * @param ctx Runtime session context.
 */
async function handleArchiveAfterToolCall(
  api: OpenClawPluginApi,
  event: ArchiveAfterToolCallEvent,
  ctx: ArchiveAfterToolCallContext
): Promise<void> {
  if (event.error) {
    return;
  }

  const toolName = event.toolName.toLowerCase();
  const isFileModification =
    toolName.includes("write") ||
    toolName.includes("edit") ||
    toolName.includes("replace");

  if (!isFileModification) {
    return;
  }

  const filePathInfo = readSingleFilePathFromToolParams(event.params);
  if (!filePathInfo) {
    return;
  }

  try {
    const workspaceDir = api.resolvePath(".") || process.cwd();
    const sourcePath = path.resolve(workspaceDir, filePathInfo);

    const relToWorkspace = path.relative(workspaceDir, sourcePath);
    if (relToWorkspace.startsWith("..") || path.isAbsolute(relToWorkspace)) {
      return;
    }

    const sourceStat = await safeStat(sourcePath);
    if (!sourceStat?.isFile()) {
      return;
    }

    await ensureCompliantArchiveCopy(
      workspaceDir,
      sourcePath,
      ctx.sessionKey,
      ctx.sessionId
    );
  } catch (error: any) {
    api.logger.error(`Failed to handle archive naming: ${error.message}`);
  }
}

/**
 * Ensures one file also exists under the compliant session archive path.
 *
 * @param workspaceDir Absolute workspace directory.
 * @param sourcePath Absolute source file path inside the workspace.
 * @param sessionKey Current session key.
 * @param sessionId Current session id.
 * @returns The compliant archive target path when a copy was written.
 */
async function ensureCompliantArchiveCopy(
  workspaceDir: string,
  sourcePath: string,
  sessionKey?: string | null,
  sessionId?: string | null
): Promise<string | undefined> {
  const relToWorkspace = path.relative(workspaceDir, sourcePath);
  const sessionArchiveId = normalizeArchiveId(
    (typeof sessionKey === "string" ? sessionKey.split(":").filter(Boolean).pop() : undefined) ??
      sessionId
  );

  if (!sessionArchiveId) {
    return undefined;
  }

  const originalFileName = path.basename(sourcePath);
  const isPlan = originalFileName.toLowerCase() === "plan.md";
  const sanitizedFileName = sanitizeFileName(originalFileName);
  const parsedArchivePath = parseArchivePath(relToWorkspace);

  const isPathCompliant = isPlan
    ? parsedArchivePath?.archiveId === sessionArchiveId &&
      parsedArchivePath.relativeSubpath === "PLAN.md" &&
      originalFileName === "PLAN.md"
    : parsedArchivePath?.archiveId === sessionArchiveId &&
      parsedArchivePath.fileName === sanitizedFileName &&
      hasCompliantArchiveTimestamp(parsedArchivePath.relativeSubpath);

  if (isPathCompliant) {
    return undefined;
  }

  const targetArchiveDir = isPlan
    ? path.join(workspaceDir, "archives", sessionArchiveId)
    : path.join(workspaceDir, "archives", sessionArchiveId, formatTimestamp(new Date()));
  const targetFileName = isPlan ? "PLAN.md" : sanitizedFileName;
  const targetPath = path.join(targetArchiveDir, targetFileName);

  if (targetPath === sourcePath) {
    return undefined;
  }

  await fs.promises.mkdir(targetArchiveDir, { recursive: true });
  await fs.promises.copyFile(sourcePath, targetPath);
  return targetPath;
}

/**
 * Reads one path parameter from the tool hook payload.
 *
 * @param params Raw tool parameter record.
 * @returns A single file path string when present.
 */
function readSingleFilePathFromToolParams(
  params?: Record<string, unknown>
): string | undefined {
  const candidate = params?.path ?? params?.file ?? params?.filename;
  return typeof candidate === "string" && candidate.trim().length > 0
    ? candidate.trim()
    : undefined;
}

/**
 * Checks whether one archive relative subpath follows the timestamp bucket layout.
 *
 * @param relativeSubpath Archive subpath below one archive id.
 * @returns True when the first segment is one compliant timestamp.
 */
function hasCompliantArchiveTimestamp(relativeSubpath: string): boolean {
  const [timestamp] = relativeSubpath.split("/");
  return typeof timestamp === "string" && ARCHIVE_TIMESTAMP_PATTERN.test(timestamp);
}

/**
 * Normalizes one archive id candidate for safe filesystem use.
 *
 * @param value Raw archive identifier.
 * @returns Sanitized archive id or `undefined`.
 */
function normalizeArchiveId(value?: string | null): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const normalized = trimmed.replace(/[^a-zA-Z0-9-_]/g, "_");
  return normalized.length > 0 ? normalized : undefined;
}

/**
 * Reads one file stat without throwing on missing files.
 *
 * @param filePath Absolute file path.
 * @returns File stats when the path exists.
 */
async function safeStat(filePath: string): Promise<fs.Stats | undefined> {
  try {
    return await fs.promises.stat(filePath);
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}
