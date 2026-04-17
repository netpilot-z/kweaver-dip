import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  asMessage,
  getOpenClawGatewayRuntimeConfig,
  isDevelopmentMode,
  readOptionalString,
  resolveBknBackendUrl,
  resolveHydraAdminUrl
} from "./env";

describe("env helpers", () => {
  it("converts non-Error values to strings", () => {
    expect(asMessage("boom")).toBe("boom");
    expect(asMessage(503)).toBe("503");
  });

  it("returns undefined for missing optional strings", () => {
    expect(readOptionalString(undefined)).toBeUndefined();
  });

  it("normalizes the BKN backend URL", () => {
    expect(resolveBknBackendUrl(undefined)).toBe("http://127.0.0.1:13014/");
    expect(resolveBknBackendUrl("https://example.com/api?x=1")).toBe(
      "https://example.com/"
    );
  });

  it("normalizes the Hydra admin URL", () => {
    expect(resolveHydraAdminUrl(undefined)).toBe("http://127.0.0.1:4445/");
    expect(resolveHydraAdminUrl("https://example.com/admin?x=1")).toBe(
      "https://example.com/"
    );
  });

  it("detects development mode from NODE_ENV", () => {
    expect(isDevelopmentMode("development")).toBe(true);
    expect(isDevelopmentMode("test")).toBe(false);
    expect(isDevelopmentMode(undefined)).toBe(false);
  });

  it("reloads the latest OpenClaw gateway config from a specific env file", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "dip-studio-env-"));
    const envPath = join(tempDir, ".env");

    writeFileSync(
      envPath,
      [
        "OPENCLAW_GATEWAY_PROTOCOL=wss",
        "OPENCLAW_GATEWAY_HOST=gateway.example.com",
        "OPENCLAW_GATEWAY_PORT=29001",
        "OPENCLAW_GATEWAY_TOKEN=latest-token",
        "OPENCLAW_GATEWAY_TIMEOUT_MS=9000"
      ].join("\n"),
      "utf8"
    );

    try {
      const config = getOpenClawGatewayRuntimeConfig({
        path: envPath
      });

      expect(config).toEqual({
        url: "wss://gateway.example.com:29001/",
        httpUrl: "https://gateway.example.com:29001/",
        token: "latest-token",
        timeoutMs: 9000
      });
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
