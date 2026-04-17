import { afterEach, describe, expect, it, vi } from "vitest";

import {
  OpenClawGatewayClient,
  createDeviceSignaturePayload,
  createGatewayError
} from "./openclaw-gateway-client";
import type { OpenClawWebSocket } from "./openclaw-gateway-client";

class MockOpenClawWebSocket implements OpenClawWebSocket {
  public readonly sentFrames: string[] = [];
  private readonly listeners = new Map<string, Array<(...args: unknown[]) => void>>();

  public on(eventName: string, listener: (...args: unknown[]) => void): this {
    const existing = this.listeners.get(eventName) ?? [];
    existing.push(listener);
    this.listeners.set(eventName, existing);
    return this;
  }

  public send(data: string): void {
    this.sentFrames.push(data);
  }

  public close(): void {
    return;
  }

  public emit(eventName: string, ...args: unknown[]): void {
    for (const listener of this.listeners.get(eventName) ?? []) {
      listener(...args);
    }
  }
}

afterEach(() => {
  OpenClawGatewayClient.resetInstanceForTests();
  vi.restoreAllMocks();
  vi.resetModules();
  vi.doUnmock("node:crypto");
});

/**
 * Imports the gateway client with a mocked `createPublicKey` implementation.
 *
 * @param exportedKey The fake key object returned by `createPublicKey`.
 * @returns The `extractRawEd25519PublicKey` helper from a fresh module instance.
 */
async function importGatewayClientWithPublicKeyMock(exportedKey: Buffer) {
  vi.doMock("node:crypto", async () => {
    const actual = await vi.importActual<typeof import("node:crypto")>(
      "node:crypto"
    );

    return {
      ...actual,
      createPublicKey: vi.fn().mockReturnValue({
        export: vi.fn().mockReturnValue(exportedKey)
      })
    };
  });

  return import("./openclaw-gateway-client");
}

describe("createGatewayError", () => {
  it("falls back when the gateway omits an error message", () => {
    expect(
      createGatewayError(
        {
          type: "res",
          id: "req-1",
          ok: false
        },
        "OpenClaw agents.list failed"
      )
    ).toMatchObject({
      statusCode: 502,
      message: "OpenClaw agents.list failed"
    });
  });
});

describe("extractRawEd25519PublicKey", () => {
  it("rejects unexpected key lengths", async () => {
    const { extractRawEd25519PublicKey } =
      await importGatewayClientWithPublicKeyMock(Buffer.alloc(10));

    expect(() => extractRawEd25519PublicKey("public-key")).toThrow(
      "Unexpected Ed25519 public key length"
    );
  });

  it("rejects unexpected key prefixes", async () => {
    const { extractRawEd25519PublicKey } =
      await importGatewayClientWithPublicKeyMock(Buffer.alloc(44, 1));

    expect(() => extractRawEd25519PublicKey("public-key")).toThrow(
      "Unexpected Ed25519 public key prefix"
    );
  });
});

describe("createDeviceSignaturePayload", () => {
  it("normalizes optional token, platform and device family fields", () => {
    expect(
      createDeviceSignaturePayload({
        deviceId: "device-1",
        clientId: "gateway-client",
        clientMode: "backend",
        role: "operator",
        scopes: ["operator.read", "agents.read"],
        signedAtMs: 1_737_264_000_000,
        nonce: "nonce-1",
        platform: "  LINUX  ",
        deviceFamily: "  DESKTOP  "
      })
    ).toBe(
      "v3|device-1|gateway-client|backend|operator|operator.read,agents.read|1737264000000||nonce-1|linux|desktop"
    );
  });
});

describe("OpenClawGatewayClient singleton", () => {
  it("returns the same instance for repeated calls", () => {
    const first = OpenClawGatewayClient.getInstance({
      url: "ws://127.0.0.1:19001"
    });
    const second = OpenClawGatewayClient.getInstance({
      url: "ws://127.0.0.1:19002"
    });

    expect(first).toBe(second);
  });
});

describe("OpenClawGatewayClient dynamic config", () => {
  it("refreshes OpenClaw settings before reconnecting", async () => {
    const sockets: MockOpenClawWebSocket[] = [];
    const configReader = vi
      .fn()
      .mockReturnValueOnce({
        url: "ws://gateway-1.example.com",
        httpUrl: "http://gateway-1.example.com",
        token: "token-1",
        timeoutMs: 5_000
      })
      .mockReturnValueOnce({
        url: "ws://gateway-2.example.com",
        httpUrl: "http://gateway-2.example.com",
        token: "token-2",
        timeoutMs: 5_000
      });
    const createWebSocket = vi.fn((url: string) => {
      const socket = new MockOpenClawWebSocket();
      sockets.push(socket);
      expect(url).toBe(
        sockets.length === 1
          ? "ws://gateway-1.example.com"
          : "ws://gateway-2.example.com"
      );
      return socket;
    });
    const client = new OpenClawGatewayClient(
      {
        url: "ws://stale.example.com",
        token: "stale-token",
        timeoutMs: 5_000,
        reconnectDelayMs: 0,
        configReader
      },
      createWebSocket
    );

    const firstConnect = client.connect();
    const firstSocket = sockets[0];
    expect(firstSocket).toBeDefined();
    firstSocket.emit(
      "message",
      JSON.stringify({
        type: "event",
        event: "connect.challenge",
        payload: { nonce: "nonce-1" }
      })
    );

    const firstConnectFrame = JSON.parse(firstSocket.sentFrames[0] ?? "{}") as {
      id: string;
      params?: { auth?: { token?: string } };
    };
    expect(firstConnectFrame.params?.auth?.token).toBe("token-1");
    firstSocket.emit(
      "message",
      JSON.stringify({
        type: "res",
        id: firstConnectFrame.id,
        ok: true,
        payload: {}
      })
    );
    await firstConnect;

    firstSocket.emit("close");
    await vi.waitFor(() => {
      expect(createWebSocket).toHaveBeenCalledTimes(2);
    });

    const secondSocket = sockets[1];
    secondSocket.emit(
      "message",
      JSON.stringify({
        type: "event",
        event: "connect.challenge",
        payload: { nonce: "nonce-2" }
      })
    );

    const secondConnectFrame = JSON.parse(secondSocket.sentFrames[0] ?? "{}") as {
      id: string;
      params?: { auth?: { token?: string } };
    };
    expect(secondConnectFrame.params?.auth?.token).toBe("token-2");
  });
});
