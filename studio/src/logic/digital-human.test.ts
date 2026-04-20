import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HttpError } from "../errors/http-error";
import type { OpenClawCronAdapter } from "../adapters/openclaw-cron-adapter";

import type { AgentSkillsLogic } from "./agent-skills";

/**
 * Mutable fake home for `node:os` `homedir` (see hoisted mock below).
 */
let fakeHomeForOsMock = "/tmp";

vi.mock("node:os", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:os")>();
  return {
    ...actual,
    homedir: (): string => fakeHomeForOsMock
  };
});

import {
  DefaultDigitalHumanLogic,
  normalizeOpenClawAccountIdFromAppId,
  resolveDefaultWorkspace
} from "./digital-human";

function stubAgentSkills(overrides?: Partial<AgentSkillsLogic>): AgentSkillsLogic {
  return {
    listEnabledSkills: vi.fn(),
    listDigitalHumanSkills: vi.fn(),
    listAvailableSkills: vi.fn(),
    getAgentSkills: vi.fn().mockResolvedValue({ agentId: "", skills: [] }),
    updateAgentSkills: vi.fn().mockResolvedValue({
      success: true,
      agentId: "",
      skills: []
    }),
    installSkill: vi.fn().mockResolvedValue({
      name: "",
      skillPath: ""
    }),
    uninstallSkill: vi.fn().mockResolvedValue({ name: "" }),
    ...overrides
  } as AgentSkillsLogic;
}

function stubCronAdapter(
  overrides?: Partial<OpenClawCronAdapter>
): OpenClawCronAdapter {
  return {
    listCronJobs: vi.fn().mockResolvedValue({
      jobs: [],
      total: 0,
      offset: 0,
      limit: 200,
      hasMore: false,
      nextOffset: null
    }),
    updateCronJob: vi.fn(),
    removeCronJob: vi.fn().mockResolvedValue({ removed: true }),
    listCronRuns: vi.fn(),
    ...overrides
  } as OpenClawCronAdapter;
}

describe("DefaultDigitalHumanLogic", () => {
  it("fetches agents and enriches list with full detail fields", async () => {
    const openClawAgentsAdapter = {
      listAgents: vi.fn().mockResolvedValue({
        defaultId: "main",
        mainKey: "sender",
        scope: "per-sender",
        agents: [
          {
            id: "agent-1",
            name: "Listed Agent",
            identity: {
              avatarUrl: "https://example.com/main.png"
            }
          }
        ]
      }),
      getAgentFile: vi.fn().mockImplementation(async ({ name }: { name: string }) => ({
        file: {
          content: name === "IDENTITY.md"
            ? "# IDENTITY.md\n\n- Name: From File\n- Creature: Engineer\n"
            : "Soul content\n"
        }
      }))
    };
    const logic = new DefaultDigitalHumanLogic({
      openClawAgentsAdapter: openClawAgentsAdapter as never,
      openClawCronAdapter: stubCronAdapter(),
      agentSkillsLogic: stubAgentSkills()
    });

    const result = await logic.listDigitalHumans();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "agent-1",
      name: "From File",
      creature: "Engineer",
      soul: "Soul content\n"
    });
    expect(openClawAgentsAdapter.listAgents).toHaveBeenCalledOnce();
  });

  it("filters hidden built-in assistants from the list", async () => {
    const openClawAgentsAdapter = {
      listAgents: vi.fn().mockResolvedValue({
        defaultId: "main",
        mainKey: "sender",
        scope: "per-sender",
        agents: [
          {
            id: "main",
            name: "Main Agent"
          },
          {
            id: "__internal_skill_agent__",
            name: "Skill Agent"
          },
          {
            id: "a1",
            name: "Visible Agent"
          }
        ]
      }),
      getAgentFile: vi.fn().mockImplementation(async ({ name }: { name: string }) => ({
        file: {
          content: name === "IDENTITY.md"
            ? "- Name: Visible Agent\n- Creature: Analyst\n"
            : ""
        }
      }))
    };
    const logic = new DefaultDigitalHumanLogic({
      openClawAgentsAdapter: openClawAgentsAdapter as never,
      openClawCronAdapter: stubCronAdapter(),
      agentSkillsLogic: stubAgentSkills()
    });

    const result = await logic.listDigitalHumans();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "a1",
      name: "Visible Agent",
      creature: "Analyst"
    });
  });

  it("list falls back when getDigitalHuman fails", async () => {
    const openClawAgentsAdapter = {
      listAgents: vi.fn().mockResolvedValue({
        defaultId: "main",
        mainKey: "sender",
        scope: "per-sender",
        agents: [
          {
            id: "a1",
            name: "Listed Name"
          }
        ]
      }),
      getAgentFile: vi.fn().mockRejectedValue(new Error("network"))
    };
    const logic = new DefaultDigitalHumanLogic({
      openClawAgentsAdapter: openClawAgentsAdapter as never,
      openClawCronAdapter: stubCronAdapter(),
      agentSkillsLogic: stubAgentSkills()
    });

    await expect(logic.listDigitalHumans()).resolves.toEqual([
      {
        id: "a1",
        name: "Listed Name",
        creature: undefined,
        soul: "",
        bkn: undefined,
        skills: undefined
      }
    ]);
  });

});

describe("resolveDefaultWorkspace", () => {
  it("places workspace under ~/.openclaw/workspace/<uuid>", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    expect(resolveDefaultWorkspace(id)).toBe(
      join(fakeHomeForOsMock, ".openclaw", "workspace", id)
    );
  });
});


describe("DefaultDigitalHumanLogic lifecycle (filesystem + adapter)", () => {
  let fakeHome: string;

  beforeEach(() => {
    fakeHome = mkdtempSync(join(tmpdir(), "dip-dh-"));
    fakeHomeForOsMock = fakeHome;
  });

  afterEach(() => {
    fakeHomeForOsMock = "/tmp";
    try {
      rmSync(fakeHome, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  });

  it("getDigitalHuman reads template fields and skills", async () => {
    const id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    const ws = resolveDefaultWorkspace(id);
    mkdirSync(ws, { recursive: true });
    writeFileSync(
      join(ws, "IDENTITY.md"),
      "- Name: Alice\n- Creature: QA\n",
      "utf8"
    );
    writeFileSync(join(ws, "SOUL.md"), "Soul text\n", "utf8");

    const adapter = {
      listAgents: vi.fn(),
      createAgent: vi.fn(),
      deleteAgent: vi.fn(),
      getAgentFile: vi.fn().mockImplementation(async ({ name }: { name: string }) => ({
        file: { content: readFileSync(join(ws, name), "utf8") }
      })),
      setAgentFile: vi.fn(),
      getConfig: vi.fn(),
      patchConfig: vi.fn()
    };

    const logic = new DefaultDigitalHumanLogic({
      openClawAgentsAdapter: adapter as never,
      openClawCronAdapter: stubCronAdapter(),
      agentSkillsLogic: stubAgentSkills({
        getAgentSkills: vi.fn().mockResolvedValue({ agentId: id, skills: ["s1"] })
      })
    });

    await expect(logic.getDigitalHuman(id)).resolves.toMatchObject({
      id,
      name: "Alice",
      creature: "QA",
      soul: "Soul text\n",
      skills: ["s1"]
    });
  });

  it("normalizeOpenClawAccountIdFromAppId lowercases valid Feishu-style app ids", () => {
    expect(normalizeOpenClawAccountIdFromAppId("CLI_a92b87f167b99cbb")).toBe(
      "cli_a92b87f167b99cbb"
    );
    expect(normalizeOpenClawAccountIdFromAppId("")).toBe("default");
  });

  it("getDigitalHuman includes channel when OpenClaw config binds feishu via accounts", async () => {
    const id = "b1b2c3d4-e5f6-7890-abcd-ef1234567890";
    const ws = resolveDefaultWorkspace(id);
    mkdirSync(ws, { recursive: true });
    writeFileSync(
      join(ws, "IDENTITY.md"),
      "- Name: Alice\n- Creature: QA\n",
      "utf8"
    );
    writeFileSync(join(ws, "SOUL.md"), "Soul text\n", "utf8");

    const rootDir = join(fakeHome, ".openclaw");
    mkdirSync(rootDir, { recursive: true });
    const configPath = join(rootDir, "openclaw.json");
    const accountId = normalizeOpenClawAccountIdFromAppId("cli_app-1");
    writeFileSync(
      configPath,
      JSON.stringify({
        bindings: [
          {
            agentId: id,
            match: { channel: "feishu", accountId }
          }
        ],
        channels: {
          feishu: {
            enabled: true,
            accounts: {
              [accountId]: {
                enabled: true,
                appId: "cli_app-1",
                appSecret: "secret-1"
              }
            }
          }
        }
      }),
      "utf8"
    );
    const prev = process.env.OPENCLAW_ROOT_DIR;
    process.env.OPENCLAW_ROOT_DIR = rootDir;

    try {
      const adapter = {
        listAgents: vi.fn(),
        createAgent: vi.fn(),
        deleteAgent: vi.fn(),
        getAgentFile: vi.fn().mockImplementation(async ({ name }: { name: string }) => ({
          file: { content: readFileSync(join(ws, name), "utf8") }
        })),
        setAgentFile: vi.fn(),
        getConfig: vi.fn(),
        patchConfig: vi.fn()
      };

      const logic = new DefaultDigitalHumanLogic({
        openClawAgentsAdapter: adapter as never,
        openClawCronAdapter: stubCronAdapter(),
        agentSkillsLogic: stubAgentSkills()
      });

      await expect(logic.getDigitalHuman(id)).resolves.toMatchObject({
        id,
        channel: { type: "feishu", appId: "cli_app-1", appSecret: "secret-1" }
      });
    } finally {
      if (prev === undefined) {
        delete process.env.OPENCLAW_ROOT_DIR;
      } else {
        process.env.OPENCLAW_ROOT_DIR = prev;
      }
    }
  });

  it("getDigitalHuman includes channel when OpenClaw config binds feishu", async () => {
    const id = "b1b2c3d4-e5f6-7890-abcd-ef1234567890";
    const ws = resolveDefaultWorkspace(id);
    mkdirSync(ws, { recursive: true });
    writeFileSync(
      join(ws, "IDENTITY.md"),
      "- Name: Alice\n- Creature: QA\n",
      "utf8"
    );
    writeFileSync(join(ws, "SOUL.md"), "Soul text\n", "utf8");

    const rootDir = join(fakeHome, ".openclaw");
    mkdirSync(rootDir, { recursive: true });
    const configPath = join(rootDir, "openclaw.json");
    writeFileSync(
      configPath,
      JSON.stringify({
        bindings: [{ agentId: id, match: { channel: "feishu" } }],
        channels: {
          feishu: {
            enabled: true,
            appId: "app-1",
            appSecret: "secret-1"
          }
        }
      }),
      "utf8"
    );
    const prev = process.env.OPENCLAW_ROOT_DIR;
    process.env.OPENCLAW_ROOT_DIR = rootDir;

    try {
      const adapter = {
        listAgents: vi.fn(),
        createAgent: vi.fn(),
        deleteAgent: vi.fn(),
        getAgentFile: vi.fn().mockImplementation(async ({ name }: { name: string }) => ({
          file: { content: readFileSync(join(ws, name), "utf8") }
        })),
        setAgentFile: vi.fn(),
        getConfig: vi.fn(),
        patchConfig: vi.fn()
      };

      const logic = new DefaultDigitalHumanLogic({
        openClawAgentsAdapter: adapter as never,
        openClawCronAdapter: stubCronAdapter(),
        agentSkillsLogic: stubAgentSkills()
      });

      await expect(logic.getDigitalHuman(id)).resolves.toMatchObject({
        id,
        channel: { type: "feishu", appId: "app-1", appSecret: "secret-1" }
      });
    } finally {
      if (prev === undefined) {
        delete process.env.OPENCLAW_ROOT_DIR;
      } else {
        process.env.OPENCLAW_ROOT_DIR = prev;
      }
    }
  });

  it("getDigitalHuman omits channel when config JSON is invalid", async () => {
    const id = "c1b2c3d4-e5f6-7890-abcd-ef1234567890";
    const ws = resolveDefaultWorkspace(id);
    mkdirSync(ws, { recursive: true });
    writeFileSync(join(ws, "IDENTITY.md"), "- Name: A\n", "utf8");
    writeFileSync(join(ws, "SOUL.md"), "x\n", "utf8");

    const rootDir = join(fakeHome, ".openclaw");
    mkdirSync(rootDir, { recursive: true });
    const configPath = join(rootDir, "openclaw.json");
    writeFileSync(configPath, "{ not json", "utf8");
    const prev = process.env.OPENCLAW_ROOT_DIR;
    process.env.OPENCLAW_ROOT_DIR = rootDir;

    try {
      const adapter = {
        listAgents: vi.fn(),
        createAgent: vi.fn(),
        deleteAgent: vi.fn(),
        getAgentFile: vi.fn().mockImplementation(async ({ name }: { name: string }) => ({
          file: { content: readFileSync(join(ws, name), "utf8") }
        })),
        setAgentFile: vi.fn(),
        getConfig: vi.fn(),
        patchConfig: vi.fn()
      };
      const logic = new DefaultDigitalHumanLogic({
        openClawAgentsAdapter: adapter as never,
        openClawCronAdapter: stubCronAdapter(),
        agentSkillsLogic: stubAgentSkills()
      });
      const detail = await logic.getDigitalHuman(id);
      expect(detail.channel).toBeUndefined();
    } finally {
      if (prev === undefined) {
        delete process.env.OPENCLAW_ROOT_DIR;
      } else {
        process.env.OPENCLAW_ROOT_DIR = prev;
      }
    }
  });

  it("getDigitalHuman omits channel when binding channel key is unsupported", async () => {
    const id = "a0b2c3d4-e5f6-7890-abcd-ef1234567890";
    const ws = resolveDefaultWorkspace(id);
    mkdirSync(ws, { recursive: true });
    writeFileSync(join(ws, "IDENTITY.md"), "- Name: A\n", "utf8");
    writeFileSync(join(ws, "SOUL.md"), "x\n", "utf8");

    const rootDir = join(fakeHome, ".openclaw");
    mkdirSync(rootDir, { recursive: true });
    const configPath = join(rootDir, "openclaw.json");
    writeFileSync(
      configPath,
      JSON.stringify({
        bindings: [{ agentId: id, match: { channel: "slack" } }],
        channels: { slack: { appId: "a", appSecret: "b" } }
      }),
      "utf8"
    );
    const prev = process.env.OPENCLAW_ROOT_DIR;
    process.env.OPENCLAW_ROOT_DIR = rootDir;

    try {
      const adapter = {
        listAgents: vi.fn(),
        createAgent: vi.fn(),
        deleteAgent: vi.fn(),
        getAgentFile: vi.fn().mockImplementation(async ({ name }: { name: string }) => ({
          file: { content: readFileSync(join(ws, name), "utf8") }
        })),
        setAgentFile: vi.fn(),
        getConfig: vi.fn(),
        patchConfig: vi.fn()
      };
      const logic = new DefaultDigitalHumanLogic({
        openClawAgentsAdapter: adapter as never,
        openClawCronAdapter: stubCronAdapter(),
        agentSkillsLogic: stubAgentSkills()
      });
      const detail = await logic.getDigitalHuman(id);
      expect(detail.channel).toBeUndefined();
    } finally {
      if (prev === undefined) {
        delete process.env.OPENCLAW_ROOT_DIR;
      } else {
        process.env.OPENCLAW_ROOT_DIR = prev;
      }
    }
  });

  it("getDigitalHuman omits channel when binding is for another agent", async () => {
    const id = "d1b2c3d4-e5f6-7890-abcd-ef1234567890";
    const ws = resolveDefaultWorkspace(id);
    mkdirSync(ws, { recursive: true });
    writeFileSync(join(ws, "IDENTITY.md"), "- Name: A\n", "utf8");
    writeFileSync(join(ws, "SOUL.md"), "x\n", "utf8");

    const rootDir = join(fakeHome, ".openclaw");
    mkdirSync(rootDir, { recursive: true });
    const configPath = join(rootDir, "openclaw.json");
    writeFileSync(
      configPath,
      JSON.stringify({
        bindings: [{ agentId: "other-id", match: { channel: "feishu" } }],
        channels: { feishu: { appId: "a", appSecret: "b" } }
      }),
      "utf8"
    );
    const prev = process.env.OPENCLAW_ROOT_DIR;
    process.env.OPENCLAW_ROOT_DIR = rootDir;

    try {
      const adapter = {
        listAgents: vi.fn(),
        createAgent: vi.fn(),
        deleteAgent: vi.fn(),
        getAgentFile: vi.fn().mockImplementation(async ({ name }: { name: string }) => ({
          file: { content: readFileSync(join(ws, name), "utf8") }
        })),
        setAgentFile: vi.fn(),
        getConfig: vi.fn(),
        patchConfig: vi.fn()
      };
      const logic = new DefaultDigitalHumanLogic({
        openClawAgentsAdapter: adapter as never,
        openClawCronAdapter: stubCronAdapter(),
        agentSkillsLogic: stubAgentSkills()
      });
      const detail = await logic.getDigitalHuman(id);
      expect(detail.channel).toBeUndefined();
    } finally {
      if (prev === undefined) {
        delete process.env.OPENCLAW_ROOT_DIR;
      } else {
        process.env.OPENCLAW_ROOT_DIR = prev;
      }
    }
  });

  it("getDigitalHuman omits channel when feishu credentials are incomplete", async () => {
    const id = "e1b2c3d4-e5f6-7890-abcd-ef1234567890";
    const ws = resolveDefaultWorkspace(id);
    mkdirSync(ws, { recursive: true });
    writeFileSync(join(ws, "IDENTITY.md"), "- Name: A\n", "utf8");
    writeFileSync(join(ws, "SOUL.md"), "x\n", "utf8");

    const rootDir = join(fakeHome, ".openclaw");
    mkdirSync(rootDir, { recursive: true });
    const configPath = join(rootDir, "openclaw.json");
    writeFileSync(
      configPath,
      JSON.stringify({
        bindings: [{ agentId: id, match: { channel: "feishu" } }],
        channels: { feishu: { appId: "", appSecret: "only-secret" } }
      }),
      "utf8"
    );
    const prev = process.env.OPENCLAW_ROOT_DIR;
    process.env.OPENCLAW_ROOT_DIR = rootDir;

    try {
      const adapter = {
        listAgents: vi.fn(),
        createAgent: vi.fn(),
        deleteAgent: vi.fn(),
        getAgentFile: vi.fn().mockImplementation(async ({ name }: { name: string }) => ({
          file: { content: readFileSync(join(ws, name), "utf8") }
        })),
        setAgentFile: vi.fn(),
        getConfig: vi.fn(),
        patchConfig: vi.fn()
      };
      const logic = new DefaultDigitalHumanLogic({
        openClawAgentsAdapter: adapter as never,
        openClawCronAdapter: stubCronAdapter(),
        agentSkillsLogic: stubAgentSkills()
      });
      const detail = await logic.getDigitalHuman(id);
      expect(detail.channel).toBeUndefined();
    } finally {
      if (prev === undefined) {
        delete process.env.OPENCLAW_ROOT_DIR;
      } else {
        process.env.OPENCLAW_ROOT_DIR = prev;
      }
    }
  });

  it("getDigitalHuman maps unknown agent errors to 404", async () => {
    const adapter = {
      listAgents: vi.fn(),
      createAgent: vi.fn(),
      deleteAgent: vi.fn(),
      getAgentFile: vi.fn().mockRejectedValue(new Error("unknown agent id")),
      setAgentFile: vi.fn(),
      getConfig: vi.fn(),
      patchConfig: vi.fn()
    };
    const logic = new DefaultDigitalHumanLogic({
      openClawAgentsAdapter: adapter as never,
      openClawCronAdapter: stubCronAdapter(),
      agentSkillsLogic: stubAgentSkills()
    });

    await expect(logic.getDigitalHuman("missing")).rejects.toMatchObject({
      statusCode: 404
    });
  });

  it("getDigitalHuman rethrows HttpError unchanged", async () => {
    const forbidden = new HttpError(403, "forbidden");
    const adapter = {
      listAgents: vi.fn(),
      createAgent: vi.fn(),
      deleteAgent: vi.fn(),
      getAgentFile: vi.fn().mockRejectedValue(forbidden),
      setAgentFile: vi.fn(),
      getConfig: vi.fn(),
      patchConfig: vi.fn()
    };
    const logic = new DefaultDigitalHumanLogic({
      openClawAgentsAdapter: adapter as never,
      openClawCronAdapter: stubCronAdapter(),
      agentSkillsLogic: stubAgentSkills()
    });

    await expect(logic.getDigitalHuman("x")).rejects.toBe(forbidden);
  });

  it("deleteDigitalHuman deletes the agent and its plans", async () => {
    const deleteAgent = vi.fn().mockResolvedValue({ ok: true });
    const listCronJobs = vi.fn().mockResolvedValue({
      jobs: [
        {
          id: "plan-1",
          agentId: "agent-1",
          sessionKey: "agent:agent-1:cron:plan-1:run:run-1",
          name: "Plan 1",
          enabled: true,
          createdAtMs: 1,
          updatedAtMs: 1,
          schedule: {},
          targetType: "session"
        },
        {
          id: "plan-2",
          agentId: "other-agent",
          sessionKey: "agent:other-agent:cron:plan-2:run:run-1",
          name: "Plan 2",
          enabled: true,
          createdAtMs: 1,
          updatedAtMs: 1,
          schedule: {},
          targetType: "session"
        },
        {
          id: "plan-3",
          agentId: "agent-1",
          sessionKey: "agent:agent-1:cron:plan-3:run:run-1",
          name: "Plan 3",
          enabled: false,
          createdAtMs: 1,
          updatedAtMs: 1,
          schedule: {},
          targetType: "session"
        }
      ],
      total: 3,
      offset: 0,
      limit: 200,
      hasMore: false,
      nextOffset: null
    });
    const removeCronJob = vi.fn().mockResolvedValue({ removed: true });
    const logic = new DefaultDigitalHumanLogic({
      openClawAgentsAdapter: {
        listAgents: vi.fn(),
        createAgent: vi.fn(),
        deleteAgent,
        getAgentFile: vi.fn(),
        setAgentFile: vi.fn(),
        listAgentFiles: vi.fn(),
        getConfig: vi.fn(),
        patchConfig: vi.fn()
      } as never,
      openClawCronAdapter: stubCronAdapter({
        listCronJobs,
        removeCronJob
      }),
      agentSkillsLogic: stubAgentSkills()
    });

    await logic.deleteDigitalHuman("agent-1", false);

    expect(listCronJobs).toHaveBeenCalledWith({
      includeDisabled: true,
      limit: 200,
      offset: 0,
      enabled: "all",
      sortBy: "updatedAtMs",
      sortDir: "desc"
    });
    expect(deleteAgent).toHaveBeenCalledWith({
      agentId: "agent-1",
      deleteFiles: false
    });
    expect(removeCronJob).toHaveBeenCalledTimes(2);
    expect(removeCronJob).toHaveBeenCalledWith({ id: "plan-1" });
    expect(removeCronJob).toHaveBeenCalledWith({ id: "plan-3" });
  });

  it("deleteDigitalHuman scans all cron pages before removing matching plans", async () => {
    const listCronJobs = vi
      .fn()
      .mockResolvedValueOnce({
        jobs: [
          {
            id: "plan-1",
            agentId: "agent-1",
            sessionKey: "agent:agent-1:cron:plan-1:run:run-1",
            name: "Plan 1",
            enabled: true,
            createdAtMs: 1,
            updatedAtMs: 1,
            schedule: {},
            targetType: "session"
          }
        ],
        total: 2,
        offset: 0,
        limit: 200,
        hasMore: true,
        nextOffset: 200
      })
      .mockResolvedValueOnce({
        jobs: [
          {
            id: "plan-2",
            agentId: "agent-1",
            sessionKey: "agent:agent-1:cron:plan-2:run:run-1",
            name: "Plan 2",
            enabled: true,
            createdAtMs: 1,
            updatedAtMs: 1,
            schedule: {},
            targetType: "session"
          }
        ],
        total: 2,
        offset: 200,
        limit: 200,
        hasMore: false,
        nextOffset: null
      });
    const removeCronJob = vi.fn().mockResolvedValue({ removed: true });
    const logic = new DefaultDigitalHumanLogic({
      openClawAgentsAdapter: {
        listAgents: vi.fn(),
        createAgent: vi.fn(),
        deleteAgent: vi.fn().mockResolvedValue({ ok: true }),
        getAgentFile: vi.fn(),
        setAgentFile: vi.fn(),
        listAgentFiles: vi.fn(),
        getConfig: vi.fn(),
        patchConfig: vi.fn()
      } as never,
      openClawCronAdapter: stubCronAdapter({
        listCronJobs,
        removeCronJob
      }),
      agentSkillsLogic: stubAgentSkills()
    });

    await logic.deleteDigitalHuman("agent-1");

    expect(listCronJobs).toHaveBeenNthCalledWith(1, expect.objectContaining({ offset: 0 }));
    expect(listCronJobs).toHaveBeenNthCalledWith(2, expect.objectContaining({ offset: 200 }));
    expect(removeCronJob).toHaveBeenCalledTimes(2);
  });

  it("deleteDigitalHuman stops when agent deletion fails", async () => {
    const deleteAgent = vi.fn().mockRejectedValue(new Error("unknown agent id"));
    const removeCronJob = vi.fn();
    const logic = new DefaultDigitalHumanLogic({
      openClawAgentsAdapter: {
        listAgents: vi.fn(),
        createAgent: vi.fn(),
        deleteAgent,
        getAgentFile: vi.fn(),
        setAgentFile: vi.fn(),
        listAgentFiles: vi.fn(),
        getConfig: vi.fn(),
        patchConfig: vi.fn()
      } as never,
      openClawCronAdapter: stubCronAdapter({
        listCronJobs: vi.fn().mockResolvedValue({
          jobs: [
            {
              id: "plan-1",
              agentId: "agent-1",
              sessionKey: "agent:agent-1:cron:plan-1:run:run-1",
              name: "Plan 1",
              enabled: true,
              createdAtMs: 1,
              updatedAtMs: 1,
              schedule: {},
              targetType: "session"
            }
          ],
          total: 1,
          offset: 0,
          limit: 200,
          hasMore: false,
          nextOffset: null
        }),
        removeCronJob
      }),
      agentSkillsLogic: stubAgentSkills()
    });

    await expect(logic.deleteDigitalHuman("agent-1")).rejects.toMatchObject({
      statusCode: 404
    });
    expect(removeCronJob).not.toHaveBeenCalled();
  });

  it("createDigitalHuman writes markdown via gateway RPC and configures skills", async () => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(
      "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
    );

    const listAgentFiles = vi.fn().mockResolvedValue({
      agentId: "",
      files: [] as { name: string }[]
    });
    const setAgentFile = vi.fn().mockResolvedValue({ ok: true });
    const updateAgentSkills = vi.fn().mockResolvedValue({
      success: true,
      agentId: "",
      skills: ["sk1"]
    });
    const createAgent = vi.fn().mockResolvedValue({ ok: true });
    const logic = new DefaultDigitalHumanLogic({
      openClawAgentsAdapter: {
        listAgents: vi.fn(),
        createAgent,
        deleteAgent: vi.fn(),
        getAgentFile: vi.fn(),
        setAgentFile,
        listAgentFiles,
        getConfig: vi.fn(),
        patchConfig: vi.fn()
      } as never,
      openClawCronAdapter: stubCronAdapter(),
      agentSkillsLogic: stubAgentSkills({ updateAgentSkills })
    });

    const result = await logic.createDigitalHuman({
      name: "Bob",
      creature: "Dev",
      soul: "Hi",
      skills: ["sk1"]
    });

    const ws = resolveDefaultWorkspace(result.id);
    expect(createAgent).toHaveBeenCalledWith({
      name: result.id,
      workspace: ws
    });
    expect(listAgentFiles).toHaveBeenCalledWith({ agentId: result.id });
    expect(setAgentFile).toHaveBeenCalledWith(
      expect.objectContaining({
        agentId: result.id,
        name: "IDENTITY.md",
        content: expect.stringContaining("Bob") as string
      })
    );
    expect(setAgentFile).toHaveBeenCalledWith(
      expect.objectContaining({
        agentId: result.id,
        name: "SOUL.md",
        content: expect.stringContaining("Hi") as string
      })
    );
    expect(updateAgentSkills).toHaveBeenCalledWith(result.id, [
      "sk1"
    ]);
    expect(result.skills).toEqual(["sk1"]);
  });

  it("createDigitalHuman uses the provided id instead of generating a uuid", async () => {
    const randomUuidSpy = vi.spyOn(globalThis.crypto, "randomUUID");
    const createAgent = vi.fn().mockResolvedValue({ ok: true });
    const listAgentFiles = vi.fn().mockResolvedValue({
      agentId: "",
      files: [] as { name: string }[]
    });
    const setAgentFile = vi.fn().mockResolvedValue({ ok: true });
    const updateAgentSkills = vi.fn().mockResolvedValue({
      success: true,
      agentId: "",
      skills: []
    });
    const logic = new DefaultDigitalHumanLogic({
      openClawAgentsAdapter: {
        listAgents: vi.fn(),
        createAgent,
        deleteAgent: vi.fn(),
        getAgentFile: vi.fn(),
        setAgentFile,
        listAgentFiles,
        getConfig: vi.fn(),
        patchConfig: vi.fn()
      } as never,
      openClawCronAdapter: stubCronAdapter(),
      agentSkillsLogic: stubAgentSkills({ updateAgentSkills })
    });

    const result = await logic.createDigitalHuman({
      id: "__bkn_creator__",
      name: "BKN Creator"
    });

    expect(randomUuidSpy).not.toHaveBeenCalled();
    expect(createAgent).toHaveBeenCalledWith({
      name: "__bkn_creator__",
      workspace: resolveDefaultWorkspace("__bkn_creator__")
    });
    expect(listAgentFiles).toHaveBeenCalledWith({ agentId: "__bkn_creator__" });
    expect(result.id).toBe("__bkn_creator__");
  });

  it("createDigitalHuman leaves skills empty when request omits skills", async () => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(
      "dddddddd-dddd-dddd-dddd-dddddddddddd"
    );

    const updateAgentSkills = vi.fn().mockResolvedValue({
      success: true,
      agentId: "",
      skills: []
    });
    const logic = new DefaultDigitalHumanLogic({
      openClawAgentsAdapter: {
        listAgents: vi.fn(),
        createAgent: vi.fn().mockResolvedValue({ ok: true }),
        deleteAgent: vi.fn(),
        getAgentFile: vi.fn(),
        setAgentFile: vi.fn().mockResolvedValue({ ok: true }),
        listAgentFiles: vi.fn().mockResolvedValue({ agentId: "", files: [] }),
        getConfig: vi.fn(),
        patchConfig: vi.fn()
      } as never,
      openClawCronAdapter: stubCronAdapter(),
      agentSkillsLogic: stubAgentSkills({ updateAgentSkills })
    });

    const result = await logic.createDigitalHuman({ name: "NoSkills" });

    expect(updateAgentSkills).toHaveBeenCalledWith(result.id, []);
    expect(result.skills).toEqual([]);
  });

  it("createDigitalHuman deduplicates repeated request skill names", async () => {
    const updateAgentSkills = vi.fn().mockResolvedValue({
      success: true,
      agentId: "",
      skills: []
    });
    const logic = new DefaultDigitalHumanLogic({
      openClawAgentsAdapter: {
        listAgents: vi.fn(),
        createAgent: vi.fn().mockResolvedValue({ ok: true }),
        deleteAgent: vi.fn(),
        getAgentFile: vi.fn(),
        setAgentFile: vi.fn().mockResolvedValue({ ok: true }),
        listAgentFiles: vi.fn().mockResolvedValue({ agentId: "", files: [] }),
        getConfig: vi.fn(),
        patchConfig: vi.fn()
      } as never,
      openClawCronAdapter: stubCronAdapter(),
      agentSkillsLogic: stubAgentSkills({ updateAgentSkills })
    });

    const result = await logic.createDigitalHuman({
      name: "Dup",
      skills: ["other", "other", "archive-protocol"]
    });

    expect(updateAgentSkills).toHaveBeenCalledWith(result.id, [
      "other",
      "archive-protocol"
    ]);
    expect(result.skills).toEqual(["other", "archive-protocol"]);
  });

  it("getDigitalHuman returns the full bound skill list in the response", async () => {
    const id = "a1b2c3d4-e5f6-7890-abcd-ef1234567891";
    const ws = resolveDefaultWorkspace(id);
    mkdirSync(ws, { recursive: true });
    writeFileSync(
      join(ws, "IDENTITY.md"),
      "- Name: Alice\n- Creature: QA\n",
      "utf8"
    );
    writeFileSync(join(ws, "SOUL.md"), "Soul text\n", "utf8");

    const adapter = {
      listAgents: vi.fn(),
      createAgent: vi.fn(),
      deleteAgent: vi.fn(),
      getAgentFile: vi.fn().mockImplementation(async ({ name }: { name: string }) => ({
        file: { content: readFileSync(join(ws, name), "utf8") }
      })),
      setAgentFile: vi.fn(),
      getConfig: vi.fn(),
      patchConfig: vi.fn()
    };

    const logic = new DefaultDigitalHumanLogic({
      openClawAgentsAdapter: adapter as never,
      openClawCronAdapter: stubCronAdapter(),
      agentSkillsLogic: stubAgentSkills({
        getAgentSkills: vi.fn().mockResolvedValue({
          agentId: id,
          skills: [
            "archive-protocol",
            "schedule-plan",
            "kweaver-core",
            "extra-skill"
          ]
        })
      })
    });

    await expect(logic.getDigitalHuman(id)).resolves.toMatchObject({
      id,
      skills: [
        "archive-protocol",
        "schedule-plan",
        "kweaver-core",
        "extra-skill"
      ]
    });
  });

  it("updateDigitalHuman merges patch and writes files via gateway RPC", async () => {
    const id = "f1e2d3c4-b5a6-7890-abcd-ef1234567890";
    const ws = resolveDefaultWorkspace(id);
    mkdirSync(ws, { recursive: true });
    writeFileSync(
      join(ws, "IDENTITY.md"),
      "- Name: Old\n- Creature: X\n",
      "utf8"
    );
    writeFileSync(join(ws, "SOUL.md"), "Old soul\n", "utf8");

    const listAgentFiles = vi.fn().mockResolvedValue({ agentId: id, files: [] });
    const setAgentFile = vi.fn().mockResolvedValue({ ok: true });
    const adapter = {
      listAgents: vi.fn(),
      createAgent: vi.fn(),
      deleteAgent: vi.fn(),
      getAgentFile: vi.fn().mockImplementation(async ({ name }: { name: string }) => ({
        file: { content: readFileSync(join(ws, name), "utf8") }
      })),
      setAgentFile,
      listAgentFiles,
      getConfig: vi.fn(),
      patchConfig: vi.fn()
    };

    const logic = new DefaultDigitalHumanLogic({
      openClawAgentsAdapter: adapter as never,
      openClawCronAdapter: stubCronAdapter(),
      agentSkillsLogic: stubAgentSkills()
    });

    await logic.updateDigitalHuman(id, { name: "New", soul: "New soul" });

    expect(listAgentFiles).toHaveBeenCalledWith({ agentId: id });
    expect(setAgentFile).toHaveBeenCalledWith(
      expect.objectContaining({
        agentId: id,
        name: "IDENTITY.md",
        content: expect.stringContaining("New") as string
      })
    );
    expect(setAgentFile).toHaveBeenCalledWith(
      expect.objectContaining({
        agentId: id,
        name: "SOUL.md",
        content: expect.stringContaining("New soul") as string
      })
    );
  });

  it("createDigitalHuman binds channel via config.patch when gateway accepts", async () => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(
      "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
    );

    const stateDir = join(fakeHome, ".openclaw");
    mkdirSync(stateDir, { recursive: true });
    const cfg = join(stateDir, "openclaw.json");
    writeFileSync(cfg, "{}\n", "utf8");
    const prevState = process.env.OPENCLAW_ROOT_DIR;
    process.env.OPENCLAW_ROOT_DIR = stateDir;

    const createAgent = vi.fn().mockResolvedValue({ ok: true });
    const getConfig = vi.fn().mockResolvedValue({ raw: "{}", hash: "base-hash-1" });
    const patchConfig = vi.fn().mockResolvedValue({ ok: true });
    const logic = new DefaultDigitalHumanLogic({
      openClawAgentsAdapter: {
        listAgents: vi.fn(),
        createAgent,
        deleteAgent: vi.fn(),
        getAgentFile: vi.fn(),
        setAgentFile: vi.fn().mockResolvedValue({ ok: true }),
        listAgentFiles: vi.fn().mockResolvedValue({ agentId: "", files: [] }),
        getConfig,
        patchConfig
      } as never,
      openClawCronAdapter: stubCronAdapter(),
      agentSkillsLogic: stubAgentSkills()
    });

    const result = await logic.createDigitalHuman({
      name: "C",
      channel: { appId: "a", appSecret: "b" }
    });

    expect(getConfig).toHaveBeenCalledOnce();
    expect(patchConfig).toHaveBeenCalledOnce();
    expect(patchConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        baseHash: "base-hash-1"
      })
    );
    const patch = JSON.parse(
      (patchConfig.mock.calls[0][0] as { raw: string }).raw
    ) as {
      channels: {
        feishu: { accounts: Record<string, { appId: string; appSecret: string }> };
      };
      bindings: Array<{
        agentId: string;
        match: { channel: string; accountId?: string };
      }>;
    };
    const accId = normalizeOpenClawAccountIdFromAppId("a");
    expect(patch.channels.feishu.accounts[accId]).toMatchObject({
      appId: "a",
      dmPolicy: "open",
      allowFrom: ["*"]
    });
    expect(patch.bindings.some((b) => b.agentId === result.id)).toBe(true);
    expect(
      patch.bindings.find((b) => b.agentId === result.id)?.match.channel
    ).toBe("feishu");
    expect(
      patch.bindings.find((b) => b.agentId === result.id)?.match.accountId
    ).toBe(accId);

    process.env.OPENCLAW_ROOT_DIR = prevState;
  });

  it("createDigitalHuman uses config.patch when OPENCLAW_ROOT_DIR resolves config path", async () => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(
      "cccccccc-cccc-cccc-cccc-cccccccccccc"
    );

    const stateDir = join(fakeHome, "state");
    mkdirSync(stateDir, { recursive: true });
    const cfgPath = join(stateDir, "openclaw.json");
    writeFileSync(cfgPath, "{}\n", "utf8");
    const prevState = process.env.OPENCLAW_ROOT_DIR;
    process.env.OPENCLAW_ROOT_DIR = stateDir;

    const createAgent = vi.fn().mockResolvedValue({ ok: true });
    const getConfig = vi.fn().mockResolvedValue({ raw: "{}", hash: "base-hash-2" });
    const patchConfig = vi.fn().mockResolvedValue({ ok: true });
    const logic = new DefaultDigitalHumanLogic({
      openClawAgentsAdapter: {
        listAgents: vi.fn(),
        createAgent,
        deleteAgent: vi.fn(),
        getAgentFile: vi.fn(),
        setAgentFile: vi.fn().mockResolvedValue({ ok: true }),
        listAgentFiles: vi.fn().mockResolvedValue({ agentId: "", files: [] }),
        getConfig,
        patchConfig
      } as never,
      openClawCronAdapter: stubCronAdapter(),
      agentSkillsLogic: stubAgentSkills()
    });

    const result = await logic.createDigitalHuman({
      name: "D",
      channel: { appId: "x", appSecret: "y" }
    });

    expect(patchConfig).toHaveBeenCalledOnce();
    const patch = JSON.parse(
      (patchConfig.mock.calls[0][0] as { raw: string }).raw
    ) as {
      channels: {
        feishu: { accounts: Record<string, { appId: string }> };
      };
    };
    const accX = normalizeOpenClawAccountIdFromAppId("x");
    expect(patch.channels.feishu.accounts[accX]).toMatchObject({
      appId: "x",
      dmPolicy: "open",
      allowFrom: ["*"]
    });
    const raw = (patchConfig.mock.calls[0][0] as { raw: string }).raw;
    expect(raw).toContain(result.id);

    process.env.OPENCLAW_ROOT_DIR = prevState;
  });

  it("getDigitalHuman includes channel when OpenClaw config binds dingtalk via accounts", async () => {
    const id = "f1b2c3d4-e5f6-7890-abcd-ef1234567890";
    const ws = resolveDefaultWorkspace(id);
    mkdirSync(ws, { recursive: true });
    writeFileSync(
      join(ws, "IDENTITY.md"),
      "- Name: Alice\n- Creature: QA\n",
      "utf8"
    );
    writeFileSync(join(ws, "SOUL.md"), "Soul text\n", "utf8");

    const rootDir = join(fakeHome, ".openclaw");
    mkdirSync(rootDir, { recursive: true });
    const configPath = join(rootDir, "openclaw.json");
    const accountId = normalizeOpenClawAccountIdFromAppId("ding_app_1");
    writeFileSync(
      configPath,
      JSON.stringify({
        bindings: [
          { agentId: id, match: { channel: "dingtalk", accountId } }
        ],
        channels: {
          dingtalk: {
            enabled: true,
            accounts: {
              [accountId]: {
                enabled: true,
                appId: "ding_app_1",
                appSecret: "dt-sec"
              }
            }
          }
        }
      }),
      "utf8"
    );
    const prev = process.env.OPENCLAW_ROOT_DIR;
    process.env.OPENCLAW_ROOT_DIR = rootDir;

    try {
      const adapter = {
        listAgents: vi.fn(),
        createAgent: vi.fn(),
        deleteAgent: vi.fn(),
        getAgentFile: vi.fn().mockImplementation(async ({ name }: { name: string }) => ({
          file: { content: readFileSync(join(ws, name), "utf8") }
        })),
        setAgentFile: vi.fn(),
        getConfig: vi.fn(),
        patchConfig: vi.fn()
      };

      const logic = new DefaultDigitalHumanLogic({
        openClawAgentsAdapter: adapter as never,
        openClawCronAdapter: stubCronAdapter(),
        agentSkillsLogic: stubAgentSkills()
      });

      await expect(logic.getDigitalHuman(id)).resolves.toMatchObject({
        id,
        channel: { type: "dingtalk", appId: "ding_app_1", appSecret: "dt-sec" }
      });
    } finally {
      if (prev === undefined) {
        delete process.env.OPENCLAW_ROOT_DIR;
      } else {
        process.env.OPENCLAW_ROOT_DIR = prev;
      }
    }
  });

  it("getDigitalHuman includes channel when OpenClaw config binds dingtalk (legacy top-level)", async () => {
    const id = "f1b2c3d4-e5f6-7890-abcd-ef1234567890";
    const ws = resolveDefaultWorkspace(id);
    mkdirSync(ws, { recursive: true });
    writeFileSync(
      join(ws, "IDENTITY.md"),
      "- Name: Alice\n- Creature: QA\n",
      "utf8"
    );
    writeFileSync(join(ws, "SOUL.md"), "Soul text\n", "utf8");

    const rootDir = join(fakeHome, ".openclaw");
    mkdirSync(rootDir, { recursive: true });
    const configPath = join(rootDir, "openclaw.json");
    writeFileSync(
      configPath,
      JSON.stringify({
        bindings: [{ agentId: id, match: { channel: "dingtalk" } }],
        channels: {
          dingtalk: {
            enabled: true,
            appId: "dt-1",
            appSecret: "dt-sec"
          }
        }
      }),
      "utf8"
    );
    const prev = process.env.OPENCLAW_ROOT_DIR;
    process.env.OPENCLAW_ROOT_DIR = rootDir;

    try {
      const adapter = {
        listAgents: vi.fn(),
        createAgent: vi.fn(),
        deleteAgent: vi.fn(),
        getAgentFile: vi.fn().mockImplementation(async ({ name }: { name: string }) => ({
          file: { content: readFileSync(join(ws, name), "utf8") }
        })),
        setAgentFile: vi.fn(),
        getConfig: vi.fn(),
        patchConfig: vi.fn()
      };

      const logic = new DefaultDigitalHumanLogic({
        openClawAgentsAdapter: adapter as never,
        openClawCronAdapter: stubCronAdapter(),
        agentSkillsLogic: stubAgentSkills()
      });

      await expect(logic.getDigitalHuman(id)).resolves.toMatchObject({
        id,
        channel: { type: "dingtalk", appId: "dt-1", appSecret: "dt-sec" }
      });
    } finally {
      if (prev === undefined) {
        delete process.env.OPENCLAW_ROOT_DIR;
      } else {
        process.env.OPENCLAW_ROOT_DIR = prev;
      }
    }
  });

  it("createDigitalHuman binds dingtalk channel when type is dingtalk", async () => {
    const stateDir = join(fakeHome, ".openclaw");
    mkdirSync(stateDir, { recursive: true });
    const cfg = join(stateDir, "openclaw.json");
    writeFileSync(cfg, "{}\n", "utf8");
    const prevState = process.env.OPENCLAW_ROOT_DIR;
    process.env.OPENCLAW_ROOT_DIR = stateDir;

    const createAgent = vi.fn().mockResolvedValue({ ok: true });
    const getConfig = vi.fn().mockResolvedValue({ raw: "{}", hash: "base-hash-3" });
    const patchConfig = vi.fn().mockResolvedValue({ ok: true });
    const logic = new DefaultDigitalHumanLogic({
      openClawAgentsAdapter: {
        listAgents: vi.fn(),
        createAgent,
        deleteAgent: vi.fn(),
        getAgentFile: vi.fn(),
        setAgentFile: vi.fn().mockResolvedValue({ ok: true }),
        listAgentFiles: vi.fn().mockResolvedValue({ agentId: "", files: [] }),
        getConfig,
        patchConfig
      } as never,
      openClawCronAdapter: stubCronAdapter(),
      agentSkillsLogic: stubAgentSkills()
    });

    const result = await logic.createDigitalHuman({
      name: "E",
      channel: { type: "dingtalk", appId: "dta", appSecret: "dts" }
    });

    const patch = JSON.parse(
      (patchConfig.mock.calls[0][0] as { raw: string }).raw
    ) as {
      bindings: Array<{
        agentId: string;
        match: { channel: string; accountId?: string };
      }>;
      channels: {
        dingtalk: { accounts: Record<string, { appId: string; appSecret: string }> };
      };
    };
    const accDta = normalizeOpenClawAccountIdFromAppId("dta");
    expect(patch.channels.dingtalk.accounts[accDta].appId).toBe("dta");
    expect(patch.bindings.some((b) => b.match.channel === "dingtalk")).toBe(true);
    expect(
      patch.bindings.find((b) => b.agentId === result.id)?.match.accountId
    ).toBe(accDta);
    expect(result.channel).toEqual({
      type: "dingtalk",
      appId: "dta",
      appSecret: "dts"
    });

    process.env.OPENCLAW_ROOT_DIR = prevState;
  });

  it("createDigitalHuman replaces prior agent binding when two digital humans use the same Feishu app id", async () => {
    const stateDir = join(fakeHome, ".openclaw");
    mkdirSync(stateDir, { recursive: true });
    const cfg = join(stateDir, "openclaw.json");
    writeFileSync(cfg, "{}\n", "utf8");
    const prevState = process.env.OPENCLAW_ROOT_DIR;
    process.env.OPENCLAW_ROOT_DIR = stateDir;

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const patchConfig = vi.fn().mockRejectedValue(new Error("use file"));
    const createAgent = vi.fn().mockResolvedValue({ ok: true });
    const logic = new DefaultDigitalHumanLogic({
      openClawAgentsAdapter: {
        listAgents: vi.fn(),
        createAgent,
        deleteAgent: vi.fn(),
        getAgentFile: vi.fn(),
        setAgentFile: vi.fn().mockResolvedValue({ ok: true }),
        listAgentFiles: vi.fn().mockResolvedValue({ agentId: "", files: [] }),
        getConfig: vi.fn().mockResolvedValue({ raw: "{}", hash: "h" }),
        patchConfig
      } as never,
      openClawCronAdapter: stubCronAdapter(),
      agentSkillsLogic: stubAgentSkills()
    });

    const acc = normalizeOpenClawAccountIdFromAppId("cli_shared_app");
    const first = await logic.createDigitalHuman({
      name: "First",
      channel: { appId: "cli_shared_app", appSecret: "s1" }
    });
    const second = await logic.createDigitalHuman({
      name: "Second",
      channel: { appId: "cli_shared_app", appSecret: "s2" }
    });

    const parsed = JSON.parse(readFileSync(cfg, "utf8")) as {
      bindings: Array<{ agentId: string; match: { channel: string; accountId?: string } }>;
    };
    const feishuBindings = parsed.bindings.filter((b) => b.match.channel === "feishu");
    expect(feishuBindings.some((b) => b.agentId === first.id)).toBe(false);
    expect(
      feishuBindings.find((b) => b.agentId === second.id)?.match.accountId
    ).toBe(acc);

    warnSpy.mockRestore();
    process.env.OPENCLAW_ROOT_DIR = prevState;
  });

  it("createDigitalHuman replaces prior agent binding when two digital humans use the same DingTalk app id", async () => {
    const stateDir = join(fakeHome, ".openclaw");
    mkdirSync(stateDir, { recursive: true });
    const cfg = join(stateDir, "openclaw.json");
    writeFileSync(cfg, "{}\n", "utf8");
    const prevState = process.env.OPENCLAW_ROOT_DIR;
    process.env.OPENCLAW_ROOT_DIR = stateDir;

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const patchConfig = vi.fn().mockRejectedValue(new Error("use file"));
    const createAgent = vi.fn().mockResolvedValue({ ok: true });
    const logic = new DefaultDigitalHumanLogic({
      openClawAgentsAdapter: {
        listAgents: vi.fn(),
        createAgent,
        deleteAgent: vi.fn(),
        getAgentFile: vi.fn(),
        setAgentFile: vi.fn().mockResolvedValue({ ok: true }),
        listAgentFiles: vi.fn().mockResolvedValue({ agentId: "", files: [] }),
        getConfig: vi.fn().mockResolvedValue({ raw: "{}", hash: "h" }),
        patchConfig
      } as never,
      openClawCronAdapter: stubCronAdapter(),
      agentSkillsLogic: stubAgentSkills()
    });

    const acc = normalizeOpenClawAccountIdFromAppId("ding_shared_app");
    const first = await logic.createDigitalHuman({
      name: "First",
      channel: { type: "dingtalk", appId: "ding_shared_app", appSecret: "s1" }
    });
    const second = await logic.createDigitalHuman({
      name: "Second",
      channel: { type: "dingtalk", appId: "ding_shared_app", appSecret: "s2" }
    });

    const parsed = JSON.parse(readFileSync(cfg, "utf8")) as {
      bindings: Array<{ agentId: string; match: { channel: string; accountId?: string } }>;
    };
    const dingBindings = parsed.bindings.filter((b) => b.match.channel === "dingtalk");
    expect(dingBindings.some((b) => b.agentId === first.id)).toBe(false);
    expect(
      dingBindings.find((b) => b.agentId === second.id)?.match.accountId
    ).toBe(acc);

    warnSpy.mockRestore();
    process.env.OPENCLAW_ROOT_DIR = prevState;
  });

  it("createDigitalHuman writes openclaw.json when config.patch fails", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const stateDir = join(fakeHome, ".openclaw");
    mkdirSync(stateDir, { recursive: true });
    const cfg = join(stateDir, "openclaw.json");
    writeFileSync(cfg, "{}\n", "utf8");
    const prevState = process.env.OPENCLAW_ROOT_DIR;
    process.env.OPENCLAW_ROOT_DIR = stateDir;

    const createAgent = vi.fn().mockResolvedValue({ ok: true });
    const getConfig = vi.fn().mockResolvedValue({ raw: "{}", hash: "h" });
    const patchConfig = vi.fn().mockRejectedValue(new Error("validation failed"));
    const logic = new DefaultDigitalHumanLogic({
      openClawAgentsAdapter: {
        listAgents: vi.fn(),
        createAgent,
        deleteAgent: vi.fn(),
        getAgentFile: vi.fn(),
        setAgentFile: vi.fn().mockResolvedValue({ ok: true }),
        listAgentFiles: vi.fn().mockResolvedValue({ agentId: "", files: [] }),
        getConfig,
        patchConfig
      } as never,
      openClawCronAdapter: stubCronAdapter(),
      agentSkillsLogic: stubAgentSkills()
    });

    const result = await logic.createDigitalHuman({
      name: "F",
      channel: { appId: "fb", appSecret: "sec" }
    });

    const parsed = JSON.parse(readFileSync(cfg, "utf8")) as {
      channels: { feishu: { accounts: Record<string, { appId: string }> } };
      bindings: Array<{ agentId: string }>;
    };
    const accFb = normalizeOpenClawAccountIdFromAppId("fb");
    expect(parsed.channels.feishu.accounts[accFb]).toMatchObject({
      appId: "fb",
      dmPolicy: "open",
      allowFrom: ["*"]
    });
    expect(parsed.bindings.some((b) => b.agentId === result.id)).toBe(true);

    warnSpy.mockRestore();
    process.env.OPENCLAW_ROOT_DIR = prevState;
  });
});
