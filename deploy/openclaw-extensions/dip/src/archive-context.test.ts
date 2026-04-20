import { describe, expect, it, vi } from "vitest";
import { tmpdir } from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import {
  parseCronSessionKey,
  parseCronRunSessionKey,
  resolveArchiveIdForCronJob,
  resolveArchiveRuntimeContext
} from "./archive-context.js";

function createPluginApi(options?: {
  cron?: {
    getJob?: (id: string) => Promise<{ sessionKey?: string } | undefined> | { sessionKey?: string } | undefined;
    list?: (opts?: { includeDisabled?: boolean }) => Promise<Array<{ id?: string; sessionKey?: string }>> | Array<{ id?: string; sessionKey?: string }>;
  };
  config?: {
    cron?: {
      store?: string;
    };
  };
}): OpenClawPluginApi {
  return {
    id: "dip",
    name: "dip",
    source: "test",
    config: {} as never,
    pluginConfig: {},
    runtime: {
      version: "test",
      config: {
        loadConfig: vi.fn().mockResolvedValue(options?.config ?? {}),
        writeConfigFile: vi.fn()
      },
      system: {} as never,
      media: {} as never,
      tts: {} as never,
      stt: {} as never,
      tools: {} as never,
      events: {} as never,
      logging: {} as never,
      state: {
        resolveStateDir: vi.fn()
      },
      modelAuth: {} as never,
      subagent: {} as never,
      channel: {} as never,
      cron: options?.cron
    } as never,
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    },
    registerTool: vi.fn(),
    registerHook: vi.fn(),
    registerHttpRoute: vi.fn(),
    registerChannel: vi.fn(),
    registerGatewayMethod: vi.fn(),
    registerCli: vi.fn(),
    registerService: vi.fn(),
    registerProvider: vi.fn(),
    registerCommand: vi.fn(),
    registerContextEngine: vi.fn(),
    resolvePath: vi.fn((input: string) => input),
    on: vi.fn()
  };
}

describe("archive-context", () => {
  it("parses cron run session keys", () => {
    expect(parseCronRunSessionKey("agent:dh-1:cron:job-1:run:run-1")).toEqual({
      agentId: "dh-1",
      jobId: "job-1",
      runId: "run-1"
    });
    expect(parseCronRunSessionKey("agent:dh-1:user:u:direct:chat-1")).toBeUndefined();
    expect(parseCronSessionKey("agent:dh-1:cron:job-1")).toEqual({
      agentId: "dh-1",
      jobId: "job-1"
    });
    expect(parseCronSessionKey("agent:dh-1:cron:job-1:run:run-1")).toBeUndefined();
  });

  it("resolves archive id from runtime cron getJob", async () => {
    const api = createPluginApi({
      cron: {
        getJob: vi.fn().mockResolvedValue({
          sessionKey: "agent:dh-1:user:user-1:direct:chat-1"
        })
      }
    });

    await expect(resolveArchiveIdForCronJob(api, "job-1")).resolves.toBe("chat-1");
  });

  it("falls back to cron store when runtime cron is unavailable", async () => {
    const storeDir = await fs.mkdtemp(path.join(tmpdir(), "dip-cron-store-"));
    const storePath = path.join(storeDir, "jobs.json");

    await fs.writeFile(
      storePath,
      JSON.stringify({
        version: 1,
        jobs: [
          {
            id: "job-2",
            sessionKey: "agent:dh-1:user:user-2:direct:chat-2"
          }
        ]
      }),
      "utf8"
    );

    const api = createPluginApi({
      config: {
        cron: {
          store: storePath
        }
      }
    });

    try {
      await expect(resolveArchiveIdForCronJob(api, "job-2")).resolves.toBe("chat-2");
    } finally {
      await fs.rm(storeDir, { recursive: true, force: true });
    }
  });

  it("resolves cron run archive context to canonical archive id and run id", async () => {
    const api = createPluginApi({
      cron: {
        getJob: vi.fn().mockResolvedValue({
          sessionKey: "agent:dh-1:user:user-1:direct:chat-1"
        })
      }
    });

    await expect(
      resolveArchiveRuntimeContext(api, {
        sessionKey: "agent:dh-1:cron:job-1:run:run-1",
        sessionId: "run-1"
      })
    ).resolves.toEqual({
      archiveId: "chat-1",
      runId: "run-1",
      jobId: "job-1",
      agentId: "dh-1"
    });
  });

  it("resolves base cron session context using sessionId as run id", async () => {
    const api = createPluginApi({
      cron: {
        getJob: vi.fn().mockResolvedValue({
          sessionKey: "agent:dh-1:user:user-1:direct:chat-1"
        })
      }
    });

    await expect(
      resolveArchiveRuntimeContext(api, {
        sessionKey: "agent:dh-1:cron:job-1",
        sessionId: "run-1"
      })
    ).resolves.toEqual({
      archiveId: "chat-1",
      runId: "run-1",
      jobId: "job-1",
      agentId: "dh-1"
    });
  });
});
