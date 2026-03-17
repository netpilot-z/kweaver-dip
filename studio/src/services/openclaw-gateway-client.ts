import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  createHash,
  createPrivateKey,
  createPublicKey,
  randomUUID,
  sign
} from "node:crypto";

import { HttpError } from "../errors/http-error";
import type {
  OpenClawAgentsListResult,
  OpenClawEventFrame,
  OpenClawGatewayFrame,
  OpenClawRequestFrame,
  OpenClawResponseFrame
} from "../types/openclaw";

const OPENCLAW_PROTOCOL_VERSION = 3;
const DEFAULT_DEVICE_PUBLIC_KEY_PATH = "assets/public.pem";
const DEFAULT_DEVICE_PRIVATE_KEY_PATH = "assets/private.pem";
const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");
const OPENCLAW_CLIENT_ID = "gateway-client";
const OPENCLAW_CLIENT_MODE = "backend";
const OPENCLAW_ROLE = "operator";
const OPENCLAW_SCOPES = ["operator.read"];
const OPENCLAW_PLATFORM = "linux";
const OPENCLAW_DEVICE_FAMILY = "";

/**
 * Describes the OpenClaw device identity used during gateway connect.
 */
export interface OpenClawDeviceIdentity {
  /**
   * Stable device identifier derived from the public key.
   */
  id: string;

  /**
   * Base64url-encoded raw Ed25519 public key.
   */
  publicKey: string;

  /**
   * PEM-encoded Ed25519 private key.
   */
  privateKeyPem: string;
}

/**
 * Describes the file paths used to load the OpenClaw device keys.
 */
export interface OpenClawDeviceKeyPaths {
  /**
   * Path to the PEM-encoded Ed25519 public key.
   */
  publicKeyPath: string;

  /**
   * Path to the PEM-encoded Ed25519 private key.
   */
  privateKeyPath: string;
}

/**
 * Defines the runtime configuration needed to reach the OpenClaw gateway.
 */
export interface OpenClawGatewayClientOptions {
  /**
   * WebSocket endpoint of the OpenClaw gateway.
   */
  url: string;

  /**
   * Optional gateway bearer token.
   */
  token?: string;

  /**
   * Timeout for the full gateway exchange in milliseconds.
   */
  timeoutMs?: number;

  /**
   * Preloaded device identity used during connect.
   */
  deviceIdentity?: OpenClawDeviceIdentity;

  /**
   * Supplies the current time in milliseconds.
   */
  now?: () => number;
}

/**
 * Minimal WebSocket shape used by the gateway client.
 */
export interface OpenClawWebSocket {
  /**
   * Registers an event listener.
   *
   * @param eventName The WebSocket event name.
   * @param listener The callback invoked for each event.
   * @returns The WebSocket instance for chaining.
   */
  on(eventName: string, listener: (...args: unknown[]) => void): this;

  /**
   * Sends a UTF-8 message through the socket.
   *
   * @param data The serialized payload.
   */
  send(data: string): void;

  /**
   * Closes the socket.
   */
  close(): void;
}

/**
 * Creates a WebSocket connection for the OpenClaw gateway client.
 */
export type OpenClawWebSocketFactory = (url: string) => OpenClawWebSocket;

/**
 * Declares the contract used by the HTTP route.
 */
export interface OpenClawAgentsReader {
  /**
   * Fetches the current OpenClaw agent list.
   *
   * @returns The OpenClaw `AgentsListResult` payload.
   */
  listAgents(): Promise<OpenClawAgentsListResult>;
}

/**
 * Queries OpenClaw over its gateway WebSocket protocol.
 */
export class OpenClawGatewayClient implements OpenClawAgentsReader {
  private readonly timeoutMs: number;
  private readonly deviceIdentity: OpenClawDeviceIdentity;
  private readonly now: () => number;

  /**
   * Creates the gateway client.
   *
   * @param options Static connection options.
   * @param createWebSocket Optional factory for dependency injection in tests.
   */
  public constructor(
    private readonly options: OpenClawGatewayClientOptions,
    private readonly createWebSocket: OpenClawWebSocketFactory = createDefaultWebSocket
  ) {
    this.timeoutMs = options.timeoutMs ?? 5_000;
    this.deviceIdentity =
      options.deviceIdentity ?? loadDeviceIdentityFromAssets();
    this.now = options.now ?? Date.now;
  }

  /**
   * Performs the WebSocket handshake and fetches the OpenClaw agent list.
   *
   * @returns The OpenClaw `AgentsListResult` payload.
   */
  public async listAgents(): Promise<OpenClawAgentsListResult> {
    return new Promise<OpenClawAgentsListResult>((resolve, reject) => {
      const socket = this.createWebSocket(this.options.url);
      const connectRequestId = randomUUID();
      const agentsRequestId = randomUUID();
      let settled = false;

      const timer = setTimeout(() => {
        finish(
          new HttpError(
            504,
            `Timed out while querying OpenClaw gateway at ${this.options.url}`
          )
        );
      }, this.timeoutMs);

      /**
       * Completes the gateway exchange once.
       *
       * @param error Optional failure returned to the caller.
       * @param result Optional agent list payload.
       */
      const finish = (
        error?: Error,
        result?: OpenClawAgentsListResult
      ): void => {
        if (settled) {
          return;
        }

        settled = true;
        clearTimeout(timer);
        socket.close();

        if (error !== undefined) {
          reject(error);
          return;
        }

        resolve(result as OpenClawAgentsListResult);
      };

      socket.on("message", (rawMessage: unknown) => {
        try {
          const frame = parseGatewayFrame(rawMessage);

          if (isConnectChallenge(frame)) {
            socket.send(
              JSON.stringify(
                createConnectRequest(
                  connectRequestId,
                  frame,
                  this.options.token,
                  this.deviceIdentity,
                  this.now
                )
              )
            );
            return;
          }

          if (isGatewayResponse(frame, connectRequestId)) {
            const connectResponse = frame as OpenClawResponseFrame;

            if (connectResponse.ok !== true) {
              finish(createGatewayError(connectResponse, "OpenClaw connect failed"));
              return;
            }

            socket.send(
              JSON.stringify(
                createAgentsListRequest(agentsRequestId)
              )
            );
            return;
          }

          if (isGatewayResponse(frame, agentsRequestId)) {
            const agentsResponse = frame as OpenClawResponseFrame;

            if (agentsResponse.ok !== true) {
              finish(createGatewayError(agentsResponse, "OpenClaw agents.list failed"));
              return;
            }

            finish(undefined, agentsResponse.payload as OpenClawAgentsListResult);
          }
        } catch (error) {
          finish(asError(error));
        }
      });

      socket.on("error", (error: unknown) => {
        finish(
          new HttpError(
            502,
            `Failed to communicate with OpenClaw gateway: ${asError(error).message}`
          )
        );
      });

      socket.on("close", () => {
        if (!settled) {
          finish(
            new HttpError(502, "OpenClaw gateway closed the connection unexpectedly")
          );
        }
      });
    });
  }
}

/**
 * Creates the default WebSocket implementation.
 *
 * @param url The gateway WebSocket endpoint.
 * @returns A connected WebSocket client wrapper.
 */
export function createDefaultWebSocket(url: string): OpenClawWebSocket {
  if (typeof globalThis.WebSocket !== "function") {
    throw new HttpError(
      500,
      "Global WebSocket client is not available in this Node.js runtime"
    );
  }

  const socket = new globalThis.WebSocket(url);

  return {
    on(eventName: string, listener: (...args: unknown[]) => void): OpenClawWebSocket {
      if (eventName === "message") {
        socket.addEventListener("message", (event: MessageEvent) => {
          listener(event.data);
        });
      } else if (eventName === "error") {
        socket.addEventListener("error", (event: Event) => {
          listener(event);
        });
      } else if (eventName === "close") {
        socket.addEventListener("close", () => {
          listener();
        });
      } else if (eventName === "open") {
        socket.addEventListener("open", () => {
          listener();
        });
      }

      return this;
    },
    send(data: string): void {
      socket.send(data);
    },
    close(): void {
      socket.close();
    }
  };
}

/**
 * Parses an incoming gateway frame.
 *
 * @param rawMessage The raw message emitted by the WebSocket library.
 * @returns A deserialized gateway frame.
 */
export function parseGatewayFrame(rawMessage: unknown): OpenClawGatewayFrame {
  if (typeof rawMessage === "string") {
    return JSON.parse(rawMessage) as OpenClawGatewayFrame;
  }

  if (Buffer.isBuffer(rawMessage)) {
    return JSON.parse(rawMessage.toString("utf8")) as OpenClawGatewayFrame;
  }

  throw new HttpError(502, "Received an unsupported frame from OpenClaw gateway");
}

/**
 * Creates the OpenClaw `connect` request.
 *
 * @param requestId The frame correlation id.
 * @param challengeFrame The received challenge event.
 * @param token Optional gateway token.
 * @returns A serialized OpenClaw request frame.
 */
export function createConnectRequest(
  requestId: string,
  challengeFrame: OpenClawEventFrame,
  token: string | undefined,
  deviceIdentity: OpenClawDeviceIdentity = loadDeviceIdentityFromAssets(),
  now: () => number = Date.now
): OpenClawRequestFrame {
  const nonce = readChallengeNonce(challengeFrame);
  const signedAtMs = now();
  const signaturePayload = createDeviceSignaturePayload({
    deviceId: deviceIdentity.id,
    clientId: OPENCLAW_CLIENT_ID,
    clientMode: OPENCLAW_CLIENT_MODE,
    role: OPENCLAW_ROLE,
    scopes: OPENCLAW_SCOPES,
    signedAtMs,
    token,
    nonce,
    platform: OPENCLAW_PLATFORM,
    deviceFamily: OPENCLAW_DEVICE_FAMILY
  });

  return {
    type: "req",
    id: requestId,
    method: "connect",
    params: {
      minProtocol: OPENCLAW_PROTOCOL_VERSION,
      maxProtocol: OPENCLAW_PROTOCOL_VERSION,
      client: {
        id: OPENCLAW_CLIENT_ID,
        version: "0.1.0",
        platform: OPENCLAW_PLATFORM,
        mode: OPENCLAW_CLIENT_MODE
      },
      role: OPENCLAW_ROLE,
      scopes: OPENCLAW_SCOPES,
      caps: [],
      commands: [],
      permissions: {},
      auth: token === undefined ? {} : { token },
      device: {
        id: deviceIdentity.id,
        publicKey: deviceIdentity.publicKey,
        signature: signDeviceSignature(signaturePayload, deviceIdentity.privateKeyPem),
        signedAt: signedAtMs,
        nonce
      }
    }
  };
}

/**
 * Creates the OpenClaw `agents.list` request.
 *
 * @param requestId The frame correlation id.
 * @returns A serialized OpenClaw request frame.
 */
export function createAgentsListRequest(
  requestId: string
): OpenClawRequestFrame {
  return {
    type: "req",
    id: requestId,
    method: "agents.list",
    params: {}
  };
}

/**
 * Identifies `connect.challenge` frames.
 *
 * @param frame The parsed gateway frame.
 * @returns Whether the frame is the expected pre-connect challenge.
 */
export function isConnectChallenge(
  frame: OpenClawGatewayFrame
): frame is OpenClawEventFrame {
  return frame.type === "event" && frame.event === "connect.challenge";
}

/**
 * Identifies gateway responses matching a request id.
 *
 * @param frame The parsed gateway frame.
 * @param requestId The expected correlation id.
 * @returns Whether the frame is the matching response.
 */
export function isGatewayResponse(
  frame: OpenClawGatewayFrame,
  requestId: string
): frame is OpenClawResponseFrame {
  return "type" in frame && frame.type === "res" && frame.id === requestId;
}

/**
 * Reads the nonce from a challenge event.
 *
 * @param frame The challenge frame.
 * @returns The nonce provided by the gateway.
 */
export function readChallengeNonce(frame: OpenClawEventFrame): string {
  const payload =
    typeof frame.payload === "object" && frame.payload !== null
      ? (frame.payload as Record<string, unknown>)
      : undefined;
  const nonce = payload?.nonce;

  if (typeof nonce !== "string" || nonce.length === 0) {
    throw new HttpError(502, "OpenClaw connect.challenge payload is missing nonce");
  }

  return nonce;
}

/**
 * Converts a failed gateway response into an HTTP-friendly error.
 *
 * @param frame The failed gateway response.
 * @param fallbackMessage The message used when the gateway omits one.
 * @returns A normalized HTTP error.
 */
export function createGatewayError(
  frame: OpenClawResponseFrame,
  fallbackMessage: string
): HttpError {
  const message = frame.error?.message ?? fallbackMessage;

  return new HttpError(502, message);
}

/**
 * Normalizes unknown thrown values to `Error`.
 *
 * @param error The unknown thrown value.
 * @returns A standard `Error` instance.
 */
export function asError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

/**
 * Loads the OpenClaw device identity from the default assets directory.
 *
 * @returns The derived device identity.
 */
export function loadDeviceIdentityFromAssets(): OpenClawDeviceIdentity {
  return loadDeviceIdentity({
    publicKeyPath: resolve(process.cwd(), DEFAULT_DEVICE_PUBLIC_KEY_PATH),
    privateKeyPath: resolve(process.cwd(), DEFAULT_DEVICE_PRIVATE_KEY_PATH)
  });
}

/**
 * Loads the OpenClaw device identity from PEM files.
 *
 * @param keyPaths The file paths containing the device key pair.
 * @returns The derived device identity.
 */
export function loadDeviceIdentity(
  keyPaths: OpenClawDeviceKeyPaths
): OpenClawDeviceIdentity {
  const publicKeyPem = readFileSync(keyPaths.publicKeyPath, "utf8");
  const privateKeyPem = readFileSync(keyPaths.privateKeyPath, "utf8");
  const rawPublicKey = extractRawEd25519PublicKey(publicKeyPem);

  return {
    id: deriveDeviceIdFromPublicKey(rawPublicKey),
    publicKey: toBase64Url(rawPublicKey),
    privateKeyPem
  };
}

/**
 * Extracts the raw 32-byte Ed25519 public key from an SPKI PEM string.
 *
 * @param publicKeyPem The PEM-encoded public key.
 * @returns The raw Ed25519 public key bytes.
 */
export function extractRawEd25519PublicKey(publicKeyPem: string): Buffer {
  const publicKey = createPublicKey(publicKeyPem);
  const der = publicKey.export({
    format: "der",
    type: "spki"
  }) as Buffer;

  if (der.length !== ED25519_SPKI_PREFIX.length + 32) {
    throw new Error("Unexpected Ed25519 public key length");
  }

  if (!der.subarray(0, ED25519_SPKI_PREFIX.length).equals(ED25519_SPKI_PREFIX)) {
    throw new Error("Unexpected Ed25519 public key prefix");
  }

  return der.subarray(ED25519_SPKI_PREFIX.length);
}

/**
 * Derives the OpenClaw device id from a raw public key.
 *
 * @param rawPublicKey The raw 32-byte Ed25519 public key.
 * @returns The stable device id as a SHA-256 hex digest.
 */
export function deriveDeviceIdFromPublicKey(rawPublicKey: Buffer): string {
  return createHash("sha256").update(rawPublicKey).digest("hex");
}

/**
 * Builds the canonical payload string used for the device signature.
 *
 * @param input The signature payload fields required by the gateway.
 * @returns The canonical payload string.
 */
export function createDeviceSignaturePayload(input: {
  deviceId: string;
  clientId: string;
  clientMode: string;
  role: string;
  scopes: string[];
  signedAtMs: number;
  token?: string;
  nonce: string;
  platform: string;
  deviceFamily: string;
}): string {
  const scopes = input.scopes.join(",");
  const token = input.token ?? "";
  const platform = input.platform.trim().toLowerCase();
  const deviceFamily = input.deviceFamily.trim().toLowerCase();

  return [
    "v3",
    input.deviceId,
    input.clientId,
    input.clientMode,
    input.role,
    scopes,
    String(input.signedAtMs),
    token,
    input.nonce,
    platform,
    deviceFamily
  ].join("|");
}

/**
 * Signs the canonical device payload with the Ed25519 private key.
 *
 * @param payload The canonical payload string.
 * @param privateKeyPem The PEM-encoded Ed25519 private key.
 * @returns The base64url-encoded signature.
 */
export function signDeviceSignature(
  payload: string,
  privateKeyPem: string
): string {
  const privateKey = createPrivateKey(privateKeyPem);
  const signature = sign(null, Buffer.from(payload, "utf8"), privateKey);

  return toBase64Url(signature);
}

/**
 * Encodes binary data using base64url without padding.
 *
 * @param value The binary payload to encode.
 * @returns The base64url-encoded string.
 */
export function toBase64Url(value: Buffer): string {
  return value
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}
