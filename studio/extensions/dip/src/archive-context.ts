import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { deriveArchiveIdFromSession } from "./archives-utils.js";

/**
 * Parsed cron run session identifiers.
 */
export interface CronRunSessionInfo {
  /**
   * Agent identifier.
   */
  agentId: string;
  /**
   * Cron job identifier.
   */
  jobId: string;
  /**
   * Run session identifier.
   */
  runId: string;
}

/**
 * Parsed base cron session identifiers.
 */
export interface CronSessionInfo {
  /**
   * Agent identifier.
   */
  agentId: string;
  /**
   * Cron job identifier.
   */
  jobId: string;
}

/**
 * Resolved archive context for one runtime session.
 */
export interface ArchiveRuntimeContext {
  /**
   * Canonical archive root identifier.
   */
  archiveId: string;
  /**
   * Optional cron run identifier used for mirrored run views.
   */
  runId?: string;
  /**
   * Parsed cron job identifier for cron-run sessions.
   */
  jobId?: string;
  /**
   * Parsed agent identifier for cron-run sessions.
   */
  agentId?: string;
}

interface CronStoreFile {
  jobs?: Array<{
    id?: string;
    sessionKey?: string;
  }>;
}

/**
 * Parses one cron run session key.
 *
 * @param sessionKey Raw session key from runtime context.
 * @returns Parsed identifiers when the key is `agent:<id>:cron:<jobId>:run:<runId>`.
 */
export function parseCronRunSessionKey(
  sessionKey?: string | null
): CronRunSessionInfo | undefined {
  if (typeof sessionKey !== "string") {
    return undefined;
  }

  const trimmed = sessionKey.trim();
  const match = /^agent:([^:]+):cron:([^:]+):run:([^:]+)$/.exec(trimmed);

  if (!match) {
    return undefined;
  }

  return {
    agentId: match[1],
    jobId: match[2],
    runId: match[3]
  };
}

/**
 * Parses one base cron session key without the run suffix.
 *
 * @param sessionKey Raw session key from runtime context.
 * @returns Parsed identifiers when the key is `agent:<id>:cron:<jobId>`.
 */
export function parseCronSessionKey(
  sessionKey?: string | null
): CronSessionInfo | undefined {
  if (typeof sessionKey !== "string") {
    return undefined;
  }

  const trimmed = sessionKey.trim();
  const match = /^agent:([^:]+):cron:([^:]+)$/.exec(trimmed);

  if (!match) {
    return undefined;
  }

  return {
    agentId: match[1],
    jobId: match[2]
  };
}

/**
 * Resolves the archive id and optional run id from the current plugin runtime context.
 *
 * @param api OpenClaw plugin API.
 * @param params Session context override values.
 * @returns The normalized archive runtime context.
 */
export async function resolveArchiveRuntimeContext(
  api: OpenClawPluginApi,
  params: {
    sessionKey?: string | null;
    sessionId?: string | null;
  }
): Promise<ArchiveRuntimeContext> {
  const cronRunSession = parseCronRunSessionKey(params.sessionKey);

  if (cronRunSession !== undefined) {
    const archiveId = await resolveArchiveIdForCronJob(api, cronRunSession.jobId);

    if (!archiveId) {
      throw new Error(`Failed to resolve archive id for cron job ${cronRunSession.jobId}`);
    }

    return {
      archiveId,
      runId: cronRunSession.runId,
      jobId: cronRunSession.jobId,
      agentId: cronRunSession.agentId
    };
  }

  const cronSession = parseCronSessionKey(params.sessionKey);

  if (cronSession !== undefined) {
    const archiveId = await resolveArchiveIdForCronJob(api, cronSession.jobId);
    const runId =
      typeof params.sessionId === "string" && params.sessionId.trim() !== ""
        ? params.sessionId.trim()
        : undefined;

    if (!archiveId) {
      throw new Error(`Failed to resolve archive id for cron job ${cronSession.jobId}`);
    }

    return {
      archiveId,
      runId,
      jobId: cronSession.jobId,
      agentId: cronSession.agentId
    };
  }

  const archiveId = deriveArchiveIdFromSession(params.sessionKey, params.sessionId);

  if (!archiveId) {
    throw new Error("Unable to derive ARCHIVE_ID from session context");
  }

  return {
    archiveId
  };
}

/**
 * Resolves one canonical archive id from a cron job id.
 *
 * @param api OpenClaw plugin API.
 * @param jobId Cron job identifier.
 * @returns The canonical archive id derived from the job session key.
 */
export async function resolveArchiveIdForCronJob(
  api: OpenClawPluginApi,
  jobId: string
): Promise<string | undefined> {
  const runtimeCron = (api.runtime as { cron?: unknown }).cron as
    | {
        getJob?: (id: string) => { sessionKey?: string } | Promise<{ sessionKey?: string } | undefined> | undefined;
        list?: (opts?: { includeDisabled?: boolean }) => Array<{ id?: string; sessionKey?: string }> | Promise<Array<{ id?: string; sessionKey?: string }>>;
      }
    | undefined;

  if (runtimeCron?.getJob !== undefined) {
    const job = await runtimeCron.getJob(jobId);
    const archiveId = deriveArchiveIdFromSession(job?.sessionKey);

    if (archiveId) {
      return archiveId;
    }
  }

  if (runtimeCron?.list !== undefined) {
    const jobs = await runtimeCron.list({ includeDisabled: true });
    const job = jobs.find((entry) => entry.id === jobId);
    const archiveId = deriveArchiveIdFromSession(job?.sessionKey);

    if (archiveId) {
      return archiveId;
    }
  }

  const store = await loadCronStore(api);
  const job = store.jobs?.find((entry) => entry.id === jobId);

  return deriveArchiveIdFromSession(job?.sessionKey);
}

/**
 * Loads the local cron store file as a fallback when runtime cron APIs are unavailable.
 *
 * @param api OpenClaw plugin API.
 * @returns The normalized cron store payload.
 */
async function loadCronStore(api: OpenClawPluginApi): Promise<CronStoreFile> {
  const cfg = await api.runtime.config.loadConfig();
  const rawStorePath =
    typeof cfg.cron?.store === "string" && cfg.cron.store.trim() !== ""
      ? cfg.cron.store.trim()
      : path.join(os.homedir(), ".openclaw", "cron", "jobs.json");
  const storePath = rawStorePath.startsWith("~")
    ? path.join(os.homedir(), rawStorePath.slice(1))
    : path.resolve(rawStorePath);

  try {
    const raw = await fs.readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as CronStoreFile;

    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      return {};
    }

    throw error;
  }
}
