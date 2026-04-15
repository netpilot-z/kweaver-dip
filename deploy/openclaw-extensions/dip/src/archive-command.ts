import fs from "node:fs/promises";
import type { Stats } from "node:fs";
import path from "node:path";
import {
  formatTimestamp,
  sanitizeFileName
} from "./archives-utils.js";
import { isValidArchiveTimestamp } from "./archives-utils.js";

/** Accepted archive command variants. */
export type ArchiveCommandKind = "plan" | "file";

export interface ArchiveCommandOptions {
  kind: ArchiveCommandKind;
  workspaceDir: string;
  archiveId: string;
  runId?: string;
  sourcePath: string;
  displayName?: string;
  timestamp?: string;
}

export interface ArchiveOperationResult {
  kind: ArchiveCommandKind;
  /**
   * Primary archive identifier used for the written archive root.
   */
  archiveId: string;
  archiveRoot: string;
  archiveRootWithSlash: string;
  relativePath: string;
  subpath: string;
  displayName: string;
  timestamp?: string;
  fileName: string;
  /**
   * Mirrored archive path written for the secondary archive view.
   */
  mirroredRelativePath?: string;
  /**
   * Secondary archive root used for mirrored archive browsing.
   */
  mirroredArchiveRoot?: string;
  /**
   * Mirrored secondary archive path.
   */
  mirroredSubpath?: string;
}

export class ArchiveProtocolError extends Error {
  /**
   * Creates one archive protocol error.
   *
   * @param code Stable machine-readable error code.
   * @param message Human-readable error message.
   */
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "ArchiveProtocolError";
  }
}

/**
 * Executes archive protocol actions for a source file written by the agent.
 *
 * @param options Archive command options.
 * @returns Archive result metadata for card rendering and follow-up reads.
 */
export async function executeArchiveCommand({
  kind,
  workspaceDir,
  archiveId,
  runId,
  sourcePath,
  displayName,
  timestamp
}: ArchiveCommandOptions): Promise<ArchiveOperationResult> {
  if (archiveId.trim() === "") {
    throw new ArchiveProtocolError(
      "INVALID_SESSION",
      "Unable to derive ARCHIVE_ID from session context"
    );
  }

  const resolvedWorkspace = path.resolve(workspaceDir);
  const resolvedSource = path.resolve(workspaceDir, sourcePath);
  const rel = path.relative(resolvedWorkspace, resolvedSource);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new ArchiveProtocolError(
      "INVALID_SOURCE",
      `Source path must live inside workspace (got: ${sourcePath})`
    );
  }

  const stat = await safeStat(resolvedSource);
  if (!stat || (!stat.isFile() && !stat.isDirectory())) {
    throw new ArchiveProtocolError("MISSING_SOURCE", `Source file or directory not found: ${sourcePath}`);
  }

  const isDirectory = stat.isDirectory();
  if (!isDirectory) {
    const content = await fs.readFile(resolvedSource);
    if (content.length === 0) {
      throw new ArchiveProtocolError("EMPTY_SOURCE", "Source file is empty; nothing to archive");
    }
  }

  const primaryArchiveId = kind === "file" && runId !== undefined ? runId : archiveId;
  const archiveRoot = path.join(resolvedWorkspace, "archives", primaryArchiveId);
  const sourceBaseName = path.basename(sourcePath);
  const defaultDisplay = sourceBaseName || "output";
  const display = displayName && displayName.trim().length > 0 ? displayName.trim() : defaultDisplay;
  const sanitizedName = kind === "plan" ? "PLAN.md" : sanitizeFileName(sourceBaseName || display);
  let targetDir = archiveRoot;
  let subpath = "PLAN.md";
  let effectiveTimestamp: string | undefined;

  if (kind === "file") {
    const bucketTimestamp = resolveArchiveTimestamp(timestamp);
    effectiveTimestamp = bucketTimestamp;
    targetDir = path.join(archiveRoot, bucketTimestamp);
    subpath = path.posix.join(bucketTimestamp, sanitizedName);
  }

  const targetPath = path.join(targetDir, sanitizedName);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });

  if (resolvedSource !== targetPath) {
    try {
      await fs.rename(resolvedSource, targetPath);
    } catch (err: any) {
      if (err.code === "EXDEV" || err.code === "ENOTEMPTY") {
        if (isDirectory) {
          await fs.cp(resolvedSource, targetPath, { recursive: true });
          await fs.rm(resolvedSource, { recursive: true, force: true });
        } else {
          await fs.copyFile(resolvedSource, targetPath);
          await fs.unlink(resolvedSource);
        }
      } else {
        throw err;
      }
    }
  }

  if (!isDirectory) {
    const written = await fs.readFile(targetPath);
    if (written.length === 0) {
      throw new ArchiveProtocolError(
        "EMPTY_TARGET",
        "Archive target is empty after copy"
      );
    }
  }

  const posixRelativePath = path.posix.join("archives", primaryArchiveId, subpath);
  const mirroredRelativePath = await mirrorArchiveResult({
    kind,
    workspaceDir: resolvedWorkspace,
    targetPath,
    subpath,
    mirrorArchiveId:
      kind === "file" && runId !== undefined && archiveId !== runId ? archiveId : undefined
  });

  return {
    kind,
    archiveId: primaryArchiveId,
    archiveRoot: `archives/${primaryArchiveId}`,
    archiveRootWithSlash: `archives/${primaryArchiveId}/`,
    relativePath: posixRelativePath,
    subpath,
    displayName: display,
    timestamp: effectiveTimestamp,
    fileName: sanitizedName,
    mirroredRelativePath,
    mirroredArchiveRoot:
      mirroredRelativePath !== undefined && archiveId !== primaryArchiveId
        ? `archives/${archiveId}`
        : undefined,
    mirroredSubpath: mirroredRelativePath !== undefined ? subpath : undefined
  };
}

/**
 * Resolves the archive timestamp bucket to use for one file archive.
 *
 * @param timestamp Optional caller-provided timestamp bucket.
 * @returns A valid `YYYY-MM-DD-HH-MM-SS` timestamp bucket.
 */
function resolveArchiveTimestamp(timestamp?: string): string {
  if (timestamp !== undefined && isValidArchiveTimestamp(timestamp)) {
    return timestamp;
  }

  return formatTimestamp(new Date());
}

interface MirrorCronRunArchiveOptions {
  kind: ArchiveCommandKind;
  workspaceDir: string;
  targetPath: string;
  subpath: string;
  mirrorArchiveId?: string;
}

/**
 * Mirrors one archive result into the run-scoped archive view.
 *
 * @param options Mirror operation options.
 * @returns The mirrored workspace-relative path when one mirror was written.
 */
export async function mirrorArchiveResult(
  options: MirrorCronRunArchiveOptions
): Promise<string | undefined> {
  if (options.kind !== "file" || options.mirrorArchiveId === undefined) {
    return undefined;
  }

  const mirroredPath = path.join(
    options.workspaceDir,
    "archives",
    options.mirrorArchiveId,
    options.subpath
  );

  if (mirroredPath === options.targetPath) {
    return undefined;
  }

  await copyPath(options.targetPath, mirroredPath);

  return path.posix.join("archives", options.mirrorArchiveId, options.subpath);
}

async function safeStat(filePath: string): Promise<Stats | undefined> {
  try {
    return await fs.stat(filePath);
  } catch (err: any) {
    if (err?.code === "ENOENT") return undefined;
    throw err;
  }
}

/**
 * Copies one file-system path to the target location.
 *
 * @param sourcePath Absolute source path.
 * @param targetPath Absolute target path.
 */
async function copyPath(sourcePath: string, targetPath: string): Promise<void> {
  const stat = await fs.stat(sourcePath);

  await fs.mkdir(path.dirname(targetPath), { recursive: true });

  if (stat.isDirectory()) {
    await fs.cp(sourcePath, targetPath, { recursive: true });
    return;
  }

  await fs.copyFile(sourcePath, targetPath);
}

/**
 * Formats the final command output containing archive status and card payload.
 */
export function formatArchiveResponseOutput(result: ArchiveOperationResult): string {
  const card = {
    type: "archive_grid",
    data: {
      type: "file",
      archive_root: result.archiveRoot,
      subpath: result.subpath,
      name: result.displayName,
      ...(result.mirroredArchiveRoot !== undefined
        ? {
            mirrored_archive_root: result.mirroredArchiveRoot,
            mirrored_subpath: result.mirroredSubpath
          }
        : {})
    }
  };

  const payload = JSON.stringify(card, null, 2);
  return `\`\`\`json\n${payload}\n\`\`\``;
}
