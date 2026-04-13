import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { executeArchiveCommand, formatArchiveResponseOutput } from "./archive-command.js";

describe("archive-command", () => {
  let workspaceDir: string;

  beforeEach(async () => {
    workspaceDir = await fs.mkdtemp(path.join(tmpdir(), "archive-command-"));
  });

  afterEach(async () => {
    await fs.rm(workspaceDir, { recursive: true, force: true });
  });

  it("archives plan documents into the PLAN.md slot", async () => {
    const source = path.join(workspaceDir, "drafts", "PLAN.md");
    await fs.mkdir(path.dirname(source), { recursive: true });
    await fs.writeFile(source, "# plan");

    const result = await executeArchiveCommand({
      kind: "plan",
      workspaceDir,
      archiveId: "chat-1",
      sourcePath: "drafts/PLAN.md"
    });

    expect(result.archiveId).toBe("chat-1");
    expect(result.relativePath).toBe("archives/chat-1/PLAN.md");
    const archived = await fs.readFile(path.join(workspaceDir, "archives", "chat-1", "PLAN.md"), "utf8");
    expect(archived).toBe("# plan");

    // Verify source is moved (deleted from original location)
    const sourceExists = await fs.access(source).then(() => true).catch(() => false);
    expect(sourceExists).toBe(false);
  });

  it("archives normal files with sanitized names and timestamp buckets", async () => {
    const source = path.join(workspaceDir, "output", "My Report #%?.MD");
    await fs.mkdir(path.dirname(source), { recursive: true });
    await fs.writeFile(source, "report body");

    const timestamp = "2026-03-25-03-04-05";
    const result = await executeArchiveCommand({
      kind: "file",
      workspaceDir,
      archiveId: "chat-1",
      sourcePath: "output/My Report #%?.MD",
      displayName: "Quarterly Report",
      timestamp
    });

    expect(result.timestamp).toBe(timestamp);
    expect(result.subpath).toBe(`${timestamp}/my_report.md`);
    const archived = await fs.readFile(
      path.join(workspaceDir, "archives", "chat-1", timestamp, "my_report.md"),
      "utf8"
    );
    expect(archived).toBe("report body");
    expect(result.displayName).toBe("Quarterly Report");

    // Verify source is moved (deleted from original location)
    const sourceExists = await fs.access(source).then(() => true).catch(() => false);
    expect(sourceExists).toBe(false);
  });

  it("writes cron run file archives to the run archive and mirrors to canonical archive", async () => {
    const agentWorkspaceDir = path.join(workspaceDir, "agent-1");
    const source = path.join(agentWorkspaceDir, "output", "daily report.md");
    await fs.mkdir(path.dirname(source), { recursive: true });
    await fs.writeFile(source, "report body");

    const result = await executeArchiveCommand({
      kind: "file",
      workspaceDir: agentWorkspaceDir,
      archiveId: "plan-chat",
      runId: "run-1",
      sourcePath: "output/daily report.md",
      timestamp: "2026-03-25-03-04-05"
    });

    expect(result.archiveId).toBe("run-1");
    expect(result.relativePath).toBe("archives/run-1/2026-03-25-03-04-05/daily_report.md");
    expect(result.mirroredRelativePath).toBe(
      "archives/plan-chat/2026-03-25-03-04-05/daily_report.md"
    );

    const runArchived = await fs.readFile(
      path.join(
        agentWorkspaceDir,
        "archives",
        "run-1",
        "2026-03-25-03-04-05",
        "daily_report.md"
      ),
      "utf8"
    );
    const canonicalArchived = await fs.readFile(
      path.join(
        agentWorkspaceDir,
        "archives",
        "plan-chat",
        "2026-03-25-03-04-05",
        "daily_report.md"
      ),
      "utf8"
    );

    expect(runArchived).toBe("report body");
    expect(canonicalArchived).toBe("report body");
  });

  it("mirrors cron run directory archives into the canonical archive", async () => {
    const agentWorkspaceDir = path.join(workspaceDir, "agent-2");
    const sourceDir = path.join(agentWorkspaceDir, "output");
    await fs.mkdir(sourceDir, { recursive: true });
    await fs.writeFile(path.join(sourceDir, "a.md"), "A");
    await fs.writeFile(path.join(sourceDir, "b.md"), "B");

    const result = await executeArchiveCommand({
      kind: "file",
      workspaceDir: agentWorkspaceDir,
      archiveId: "plan-chat",
      runId: "run-2",
      sourcePath: "output",
      timestamp: "2026-03-25-03-04-05"
    });

    expect(result.relativePath).toBe("archives/run-2/2026-03-25-03-04-05/output");
    expect(result.mirroredRelativePath).toBe("archives/plan-chat/2026-03-25-03-04-05/output");

    const runA = await fs.readFile(
      path.join(
        agentWorkspaceDir,
        "archives",
        "run-2",
        "2026-03-25-03-04-05",
        "output",
        "a.md"
      ),
      "utf8"
    );
    const canonicalB = await fs.readFile(
      path.join(
        agentWorkspaceDir,
        "archives",
        "plan-chat",
        "2026-03-25-03-04-05",
        "output",
        "b.md"
      ),
      "utf8"
    );

    expect(runA).toBe("A");
    expect(canonicalB).toBe("B");
  });

  it("does not mirror plan archives into the run archive", async () => {
    const source = path.join(workspaceDir, "drafts", "PLAN.md");
    await fs.mkdir(path.dirname(source), { recursive: true });
    await fs.writeFile(source, "# plan");

    const result = await executeArchiveCommand({
      kind: "plan",
      workspaceDir,
      archiveId: "chat-1",
      runId: "run-1",
      sourcePath: "drafts/PLAN.md"
    });

    expect(result.mirroredRelativePath).toBeUndefined();
    await expect(
      fs.access(path.join(workspaceDir, "archives", "run-1", "PLAN.md"))
    ).rejects.toMatchObject({
      code: "ENOENT"
    });
  });

  it("falls back to a generated timestamp when the provided timestamp is invalid", async () => {
    const source = path.join(workspaceDir, "output", "report.md");
    await fs.mkdir(path.dirname(source), { recursive: true });
    await fs.writeFile(source, "body");

    const result = await executeArchiveCommand({
      kind: "file",
      workspaceDir,
      archiveId: "chat-1",
      sourcePath: "output/report.md",
      timestamp: "2026-03-25"
    });

    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}$/);
    expect(result.timestamp).not.toBe("2026-03-25");
    expect(result.subpath).toBe(`${result.timestamp}/report.md`);
    const archived = await fs.readFile(
      path.join(workspaceDir, "archives", "chat-1", result.timestamp!, "report.md"),
      "utf8"
    );
    expect(archived).toBe("body");
  });

  it("formats archive response output with json code fence", () => {
    const payload = formatArchiveResponseOutput({
      kind: "file",
      archiveId: "chat-1",
      archiveRoot: "archives/chat-1",
      archiveRootWithSlash: "archives/chat-1/",
      relativePath: "archives/chat-1/2026-03-25-03-04-05/result.json",
      subpath: "2026-03-25-03-04-05/result.json",
      displayName: "result.json",
      timestamp: "2026-03-25-03-04-05",
      fileName: "result.json"
    });

    expect(payload).not.toContain("ARCHIVE_STATUS");
    expect(payload).toContain("```json");
    expect(payload).toContain("\"archive_root\"");
  });
});
