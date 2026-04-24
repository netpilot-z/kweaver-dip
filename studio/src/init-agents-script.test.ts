import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { afterEach, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

/**
 * Creates one minimal built-in agent fixture for the init script.
 *
 * @param builtInDir Temporary built-in root directory.
 */
async function seedBuiltInAgent(builtInDir: string): Promise<void> {
  const agentDir = join(builtInDir, "skill-agent");
  await mkdir(agentDir, { recursive: true });
  await writeFile(
    join(agentDir, "metadata.json"),
    JSON.stringify({
      type: "agent",
      id: "__internal_skill_agent__",
      name: "SkillAgent",
      is_builtin: true
    }),
    "utf8"
  );
  await writeFile(join(agentDir, "SOUL.md"), "Soul\n", "utf8");
  await writeFile(join(agentDir, "IDENTITY.md"), "Identity\n", "utf8");
}

/**
 * Runs the init-agents script with a temporary HOME and built-in directory.
 *
 * @param homeDir Temporary HOME directory.
 * @param builtInDir Temporary built-in directory.
 */
async function runInitAgentsScript(homeDir: string, builtInDir: string): Promise<void> {
  await execFileAsync(
    process.execPath,
    [join(process.cwd(), "scripts", "init_agents", "index.mjs")],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        HOME: homeDir,
        OPENCLAW_BUILT_IN_DIR: builtInDir,
        OPENCLAW_WORKSPACE_DIR: join(homeDir, ".openclaw", "workspace")
      }
    }
  );
}

describe("scripts/init_agents/index.mjs", () => {
  const originalEnv = { ...process.env };
  let rootDir: string | undefined;

  afterEach(async () => {
    process.env = { ...originalEnv };
    if (rootDir !== undefined) {
      await rm(rootDir, { recursive: true, force: true });
    }
  });

  it("writes agents.defaults.maxConcurrent as 8 when missing", async () => {
    rootDir = await mkdtemp(join(tmpdir(), "dip-init-agents-script-"));
    const homeDir = join(rootDir, "home");
    const builtInDir = join(rootDir, "built-in");
    await mkdir(join(homeDir, ".openclaw", "agents", "main", "agent"), {
      recursive: true
    });
    await seedBuiltInAgent(builtInDir);
    await writeFile(
      join(homeDir, ".openclaw", "openclaw.json"),
      JSON.stringify({ agents: { list: [] } }),
      "utf8"
    );
    await writeFile(
      join(homeDir, ".openclaw", "agents", "main", "agent", "auth-profiles.json"),
      JSON.stringify({}),
      "utf8"
    );

    await runInitAgentsScript(homeDir, builtInDir);

    const cfg = JSON.parse(
      await readFile(join(homeDir, ".openclaw", "openclaw.json"), "utf8")
    ) as {
      agents?: { defaults?: { maxConcurrent?: number } };
    };

    expect(cfg.agents?.defaults?.maxConcurrent).toBe(8);
  });

  it("keeps an existing agents.defaults.maxConcurrent value", async () => {
    rootDir = await mkdtemp(join(tmpdir(), "dip-init-agents-script-existing-"));
    const homeDir = join(rootDir, "home");
    const builtInDir = join(rootDir, "built-in");
    await mkdir(join(homeDir, ".openclaw", "agents", "main", "agent"), {
      recursive: true
    });
    await seedBuiltInAgent(builtInDir);
    await writeFile(
      join(homeDir, ".openclaw", "openclaw.json"),
      JSON.stringify({ agents: { defaults: { maxConcurrent: 3 }, list: [] } }),
      "utf8"
    );
    await writeFile(
      join(homeDir, ".openclaw", "agents", "main", "agent", "auth-profiles.json"),
      JSON.stringify({}),
      "utf8"
    );

    await runInitAgentsScript(homeDir, builtInDir);

    const cfg = JSON.parse(
      await readFile(join(homeDir, ".openclaw", "openclaw.json"), "utf8")
    ) as {
      agents?: { defaults?: { maxConcurrent?: number } };
    };

    expect(cfg.agents?.defaults?.maxConcurrent).toBe(3);
  });
});
