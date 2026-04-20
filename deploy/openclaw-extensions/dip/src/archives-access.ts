import fs from "node:fs";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { ARCHIVES_MIME_MAP } from "./archives-utils.js";

/**
 * Registers the `/v1/archives` HTTP route for archive browsing.
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
