import { EventEmitter } from "node:events";

import { describe, expect, it, vi } from "vitest";

import {
  attachAbortSignal,
  DefaultOpenClawChatAgentClient,
  createChatSendRequest,
  createFunctionCallItem,
  createFunctionCallItemId,
  createOutputItemId,
  createOutputMessageItem,
  createSessionPatchParams,
  createSessionsPatchRequest,
  createResponseResource,
  enqueueSseEvent,
  isChatEventFrame,
  isTextAgentEventFrame,
  isToolAgentEventFrame,
  mergeOutputItems,
  readAssistantText,
  readChatEventPayload,
  readChatSendAckPayload,
  readTextAgentEventPayload,
  readToolAgentEventPayload
} from "./openclaw-chat-agent-client";
import {
  loadDeviceIdentityFromAssets,
  type OpenClawWebSocket
} from "./openclaw-gateway-client";

/**
 * Minimal fake WebSocket used for chat agent protocol tests.
 */
class FakeWebSocket extends EventEmitter implements OpenClawWebSocket {
  /**
   * Captures outbound messages.
   */
  public readonly sentMessages: string[] = [];

  /**
   * Indicates whether the socket has been closed.
   */
  public closed = false;

  /**
   * Sends one serialized frame.
   *
   * @param data The serialized payload.
   */
  public send(data: string): void {
    this.sentMessages.push(data);
  }

  /**
   * Closes the fake socket.
   */
  public close(): void {
    this.closed = true;
  }
}

/**
 * Completes connect challenge, sessions.patch ack, and chat.send ack.
 *
 * @param socket The fake socket backing the client.
 * @param runId Run id returned by chat.send.
 */
function completeHandshake(socket: FakeWebSocket, runId = "run-1"): void {
  socket.emit("message", JSON.stringify({
    type: "event",
    event: "connect.challenge",
    payload: {
      nonce: "abc123"
    }
  }));

  const connectFrame = JSON.parse(socket.sentMessages[0] ?? "{}") as { id: string };

  socket.emit("message", JSON.stringify({
    type: "res",
    id: connectFrame.id,
    ok: true,
    payload: {}
  }));

  const patchFrame = JSON.parse(socket.sentMessages[1] ?? "{}") as { id: string };

  socket.emit("message", JSON.stringify({
    type: "res",
    id: patchFrame.id,
    ok: true,
    payload: {
      ok: true
    }
  }));

  const chatSendFrame = JSON.parse(socket.sentMessages[2] ?? "{}") as { id: string };

  socket.emit("message", JSON.stringify({
    type: "res",
    id: chatSendFrame.id,
    ok: true,
    payload: {
      runId,
      status: "started"
    }
  }));
}

describe("chat agent helpers", () => {
  it("creates chat agent request frames", () => {
    expect(
      createSessionsPatchRequest(
        "req-patch-1",
        createSessionPatchParams("main", "hello_ab12cd34")
      )
    ).toEqual({
      type: "req",
      id: "req-patch-1",
      method: "sessions.patch",
      params: {
        key: "main",
        verboseLevel: "full",
        thinkingLevel: "off",
        label: "hello_ab12cd34"
      }
    });
    expect(
      createChatSendRequest("req-1", {
        sessionKey: "main",
        message: "hello",
        idempotencyKey: "run-1"
      })
    ).toEqual({
      type: "req",
      id: "req-1",
      method: "chat.send",
      params: {
        sessionKey: "main",
        message: "hello",
        idempotencyKey: "run-1"
      }
    });
  });

  it("normalizes acknowledgement and chat event payloads", () => {
    expect(
      readChatSendAckPayload({
        type: "res",
        id: "req-1",
        ok: true,
        payload: {
          runId: "run-1",
          status: "started"
        }
      })
    ).toEqual({
      runId: "run-1",
      status: "started"
    });
    expect(
      readChatEventPayload({
        type: "event",
        event: "chat",
        payload: {
          runId: "run-1",
          sessionKey: "main",
          seq: 1,
          state: "delta",
          message: {
            role: "assistant",
            content: [
              {
                type: "text",
                text: "hi"
              }
            ]
          }
        }
      })
    ).toMatchObject({
      runId: "run-1",
      sessionKey: "main",
      seq: 1,
      state: "delta"
    });
    expect(
      isToolAgentEventFrame({
        type: "event",
        event: "agent",
        payload: {
          runId: "run-1",
          seq: 2,
          stream: "tool",
          ts: 1710000000100,
          data: {
            phase: "start",
            name: "web_search",
            toolCallId: "tool-1"
          }
        }
      })
    ).toBe(true);
    expect(
      readToolAgentEventPayload({
        type: "event",
        event: "agent",
        payload: {
          runId: "run-1",
          seq: 2,
          stream: "tool",
          ts: 1710000000100,
          data: {
            phase: "result",
            name: "web_search",
            toolCallId: "tool-1",
            result: {
              content: [
                {
                  type: "text",
                  text: "搜索结果内容"
                }
              ]
            }
          }
        }
      })
    ).toMatchObject({
      runId: "run-1",
      stream: "tool",
      data: {
        phase: "result",
        name: "web_search",
        toolCallId: "tool-1"
      }
    });
    expect(
      readToolAgentEventPayload({
        type: "event",
        event: "agent",
        payload: {
          runId: "run-1",
          seq: 3,
          stream: "tool",
          ts: 1710000000150,
          data: {
            phase: "update",
            name: "web_search",
            toolCallId: "tool-1",
            partialResult: {
              content: [
                {
                  type: "text",
                  text: "部分结果"
                }
              ]
            }
          }
        }
      })
    ).toMatchObject({
      runId: "run-1",
      stream: "tool",
      data: {
        phase: "update",
        name: "web_search",
        toolCallId: "tool-1"
      }
    });
    expect(
      isTextAgentEventFrame({
        type: "event",
        event: "agent",
        payload: {
          runId: "run-1",
          seq: 4,
          stream: "assistant",
          ts: 1710000000300,
          data: {
            text: "Hello",
            delta: "lo"
          }
        }
      })
    ).toBe(true);
    expect(
      readTextAgentEventPayload({
        type: "event",
        event: "agent",
        payload: {
          runId: "run-1",
          seq: 4,
          stream: "assistant",
          ts: 1710000000300,
          data: {
            text: "Hello",
            delta: "lo"
          }
        }
      })
    ).toMatchObject({
      runId: "run-1",
      stream: "assistant",
      data: {
        text: "Hello",
        delta: "lo"
      }
    });
  });

  it("builds OpenResponse-style SSE payloads", () => {
    expect(readAssistantText({
      role: "assistant",
      content: [
        {
          type: "text",
          text: "Hel"
        },
        {
          type: "text",
          text: "lo"
        }
      ]
    })).toBe("Hello");
    expect(createOutputItemId("run-1")).toBe("msg_run-1");
    expect(createFunctionCallItemId("tool-1")).toBe("fc_tool-1");
    expect(createOutputMessageItem("msg_run-1", "hello", "completed")).toEqual({
      type: "message",
      id: "msg_run-1",
      role: "assistant",
      status: "completed",
      content: [
        {
          type: "output_text",
          text: "hello"
        }
      ]
    });
    expect(
      createFunctionCallItem("fc_tool-1", "tool-1", "web_search", "completed", {
        result: {
          ok: true
        }
      })
    ).toEqual({
      type: "function_call",
      id: "fc_tool-1",
      call_id: "tool-1",
      name: "web_search",
      arguments: "",
      status: "completed",
      result: {
        ok: true
      }
    });
    expect(
      createResponseResource({
        runId: "run-1",
        agentId: "agent-1",
        createdAtMs: 1_710_000_000_500,
        status: "completed",
        outputItems: [
          createOutputMessageItem("msg_run-1", "hello", "completed")
        ]
      })
    ).toMatchObject({
      id: "run-1",
      status: "completed",
      model: "agent:agent-1"
    });
    expect(
      mergeOutputItems(
        [
          createFunctionCallItem("fc_tool-1", "tool-1", "web_search", "completed")
        ],
        "hello",
        "run-1"
      )
    ).toHaveLength(2);

    const events: string[] = [];

    enqueueSseEvent((value) => {
      events.push(value);
    }, {
      type: "response.created",
      response: {
        id: "run-1"
      }
    });

    expect(events[0]).toContain("event: response.created");
  });

  it("covers helper fallbacks and update branches", () => {
    expect(readAssistantText()).toBe("");
    expect(readAssistantText({
      role: "assistant",
      content: [
        {
          type: "text"
        },
        {
          type: "image"
        }
      ]
    })).toBe("");
    expect(isChatEventFrame(null)).toBe(false);
    expect(isChatEventFrame({
      type: "event",
      event: "chat"
    })).toBe(true);
    expect(isToolAgentEventFrame(null)).toBe(false);
    expect(isTextAgentEventFrame(null)).toBe(false);
    expect(
      createResponseResource({
        runId: "run-1",
        agentId: "agent-1",
        createdAtMs: 1_710_000_000_500,
        status: "failed",
        outputItems: [],
        error: {
          code: "bad_request",
          message: "broken"
        }
      })
    ).toMatchObject({
      error: {
        code: "bad_request",
        message: "broken"
      }
    });
    expect(
      mergeOutputItems(
        [
          createOutputMessageItem("msg_run-1", "old", "in_progress"),
          createFunctionCallItem("fc_tool-1", "tool-1", "web_search", "completed")
        ],
        "new",
        "run-1"
      )
    ).toEqual([
      createOutputMessageItem("msg_run-1", "new", "completed"),
      createFunctionCallItem("fc_tool-1", "tool-1", "web_search", "completed")
    ]);
    expect(
      mergeOutputItems(
        [
          createFunctionCallItem("fc_tool-1", "tool-1", "web_search", "completed")
        ],
        "",
        "run-1"
      )
    ).toHaveLength(1);
  });

  it("validates malformed chat, text, and tool event payloads", () => {
    expect(() =>
      readChatSendAckPayload({
        type: "res",
        id: "req-1",
        ok: true,
        payload: {
          status: "started"
        }
      })
    ).toThrow("OpenClaw chat.send acknowledgement is missing runId");
    expect(() =>
      readChatEventPayload({
        type: "event",
        event: "chat",
        payload: {
          runId: "run-1",
          sessionKey: "main",
          seq: 1,
          state: "weird"
        }
      })
    ).toThrow("OpenClaw chat event is missing state");
    expect(() =>
      readTextAgentEventPayload({
        type: "event",
        event: "agent",
        payload: {
          runId: "run-1",
          seq: 1,
          stream: "assistant",
          ts: 1,
          data: {
            text: "hello",
            delta: 1
          }
        }
      })
    ).toThrow("OpenClaw assistant text event delta must be a string");
    expect(() =>
      readToolAgentEventPayload({
        type: "event",
        event: "agent",
        payload: {
          runId: "run-1",
          seq: 1,
          stream: "tool",
          ts: 1,
          data: {
            phase: "weird"
          }
        }
      })
    ).toThrow("OpenClaw tool event is missing phase");
    expect(() =>
      readTextAgentEventPayload({
        type: "event",
        event: "agent",
        payload: {
          seq: 1,
          stream: "assistant",
          ts: 1,
          data: { text: "hello" }
        }
      })
    ).toThrow("OpenClaw assistant text event is missing runId");
    expect(() =>
      readTextAgentEventPayload({
        type: "event",
        event: "agent",
        payload: {
          runId: "run-1",
          seq: -1,
          stream: "assistant",
          ts: 1,
          data: { text: "hello" }
        }
      })
    ).toThrow("OpenClaw assistant text event is missing seq");
    expect(() =>
      readTextAgentEventPayload({
        type: "event",
        event: "agent",
        payload: {
          runId: "run-1",
          seq: 1,
          stream: "tool",
          ts: 1,
          data: { text: "hello" }
        }
      })
    ).toThrow("OpenClaw assistant text event is missing stream");
    expect(() =>
      readTextAgentEventPayload({
        type: "event",
        event: "agent",
        payload: {
          runId: "run-1",
          seq: 1,
          stream: "assistant",
          ts: -1,
          data: { text: "hello" }
        }
      })
    ).toThrow("OpenClaw assistant text event is missing ts");
    expect(() =>
      readTextAgentEventPayload({
        type: "event",
        event: "agent",
        payload: {
          runId: "run-1",
          seq: 1,
          stream: "assistant",
          ts: 1,
          data: {}
        }
      })
    ).toThrow("OpenClaw assistant text event is missing text");
    expect(() =>
      readToolAgentEventPayload({
        type: "event",
        event: "agent",
        payload: {
          seq: 1,
          stream: "tool",
          ts: 1,
          data: { phase: "start" }
        }
      })
    ).toThrow("OpenClaw tool event is missing runId");
    expect(() =>
      readToolAgentEventPayload({
        type: "event",
        event: "agent",
        payload: {
          runId: "run-1",
          seq: -1,
          stream: "tool",
          ts: 1,
          data: { phase: "start" }
        }
      })
    ).toThrow("OpenClaw tool event is missing seq");
    expect(() =>
      readToolAgentEventPayload({
        type: "event",
        event: "agent",
        payload: {
          runId: "run-1",
          seq: 1,
          stream: "assistant",
          ts: 1,
          data: { phase: "start" }
        }
      })
    ).toThrow("OpenClaw tool event is missing stream");
    expect(() =>
      readToolAgentEventPayload({
        type: "event",
        event: "agent",
        payload: {
          runId: "run-1",
          seq: 1,
          stream: "tool",
          ts: -1,
          data: { phase: "start" }
        }
      })
    ).toThrow("OpenClaw tool event is missing ts");
  });

  it("attaches and detaches abort listeners safely", () => {
    const listener = vi.fn();

    const cleanupWithoutSignal = attachAbortSignal(undefined, listener);
    cleanupWithoutSignal();
    expect(listener).not.toHaveBeenCalled();

    const controller = new AbortController();
    const cleanup = attachAbortSignal(controller.signal, listener);
    controller.abort();
    expect(listener).toHaveBeenCalledTimes(1);
    cleanup();

    const abortedController = new AbortController();
    abortedController.abort();
    const immediateListener = vi.fn();
    const immediateCleanup = attachAbortSignal(abortedController.signal, immediateListener);
    expect(immediateListener).toHaveBeenCalledTimes(1);
    immediateCleanup();
  });
});

describe("DefaultOpenClawChatAgentClient", () => {
  it("forwards attachments and session label into the upstream chat request", async () => {
    const socket = new FakeWebSocket();
    const client = new DefaultOpenClawChatAgentClient(
      {
        url: "ws://127.0.0.1:18789",
        token: "secret-token",
        timeoutMs: 1_000,
        deviceIdentity: loadDeviceIdentityFromAssets()
      },
      () => socket
    );

    const pending = client.createResponseStream(
      {
        sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
        message: "hello",
        idempotencyKey: "run-1",
        sessionLabel: "welcome",
        attachments: [
          {
            type: "workspace_file",
            path: "tmp/a.txt",
            name: "a.txt"
          }
        ]
      },
      "agent-1"
    );

    completeHandshake(socket);
    const result = await pending;

    const patchFrame = JSON.parse(socket.sentMessages[1] ?? "{}") as {
      params?: Record<string, unknown>;
    };
    const chatSendFrame = JSON.parse(socket.sentMessages[2] ?? "{}") as {
      params?: Record<string, unknown>;
    };

    expect(patchFrame.params?.label).toBe("welcome");
    expect(chatSendFrame.params?.attachments).toEqual([
      {
        type: "workspace_file",
        path: "tmp/a.txt",
        name: "a.txt"
      }
    ]);

    result.body.cancel();
  });

  it("maps chat frames to OpenResponse SSE events", async () => {
    const socket = new FakeWebSocket();
    const client = new DefaultOpenClawChatAgentClient(
      {
        url: "ws://127.0.0.1:18789",
        token: "secret-token",
        timeoutMs: 1_000,
        deviceIdentity: loadDeviceIdentityFromAssets(),
        now: () => 1_710_000_000_500
      },
      () => socket
    );

    const pending = client.createResponseStream(
      {
        sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
        message: "hello",
        idempotencyKey: "run-1"
      },
      "agent-1"
    );

    socket.emit("message", JSON.stringify({
      type: "event",
      event: "connect.challenge",
      payload: {
        nonce: "abc123"
      }
    }));

    const connectFrame = JSON.parse(socket.sentMessages[0] ?? "{}") as { id: string };

    socket.emit("message", JSON.stringify({
      type: "res",
      id: connectFrame.id,
      ok: true,
      payload: {}
    }));

    const patchFrame = JSON.parse(socket.sentMessages[1] ?? "{}") as { id: string };

    expect(patchFrame.method).toBe("sessions.patch");
    expect(patchFrame.params).toEqual({
      key: "agent:agent-1:user:user-1:direct:chat-1",
      verboseLevel: "full",
      thinkingLevel: "off"
    });

    socket.emit("message", JSON.stringify({
      type: "res",
      id: patchFrame.id,
      ok: true,
      payload: {
        ok: true
      }
    }));

    const chatSendFrame = JSON.parse(socket.sentMessages[2] ?? "{}") as { id: string };

    expect(chatSendFrame).toMatchObject({
      method: "chat.send",
      params: {
        sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
        message: "hello",
        idempotencyKey: "run-1"
      }
    });
    expect((chatSendFrame as { params?: Record<string, unknown> }).params?.sessionLabel).toBeUndefined();

    socket.emit("message", JSON.stringify({
      type: "res",
      id: chatSendFrame.id,
      ok: true,
      payload: {
        runId: "run-1",
        status: "started"
      }
    }));

    const result = await pending;
    const reader = result.body.getReader();

    socket.emit("message", JSON.stringify({
      type: "event",
      event: "agent",
      payload: {
        runId: "run-1",
        sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
        seq: 1,
        stream: "tool",
        ts: 1710000000100,
        data: {
          phase: "start",
          name: "web_search",
          toolCallId: "tool-1"
        }
      }
    }));

    socket.emit("message", JSON.stringify({
      type: "event",
      event: "agent",
      payload: {
        runId: "run-1",
        sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
        seq: 2,
        stream: "tool",
        ts: 1710000000150,
        data: {
          phase: "update",
          name: "web_search",
          toolCallId: "tool-1",
          partialResult: {
            content: [
              {
                type: "text",
                text: "部分结果"
              }
            ]
          }
        }
      }
    }));

    socket.emit("message", JSON.stringify({
      type: "event",
      event: "agent",
      payload: {
        runId: "run-1",
        sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
        seq: 3,
        stream: "tool",
        ts: 1710000000200,
        data: {
          phase: "result",
          name: "web_search",
          toolCallId: "tool-1",
          result: {
            content: [
              {
                type: "text",
                text: "搜索结果内容"
              }
            ]
          }
        }
      }
    }));

    socket.emit("message", JSON.stringify({
      type: "event",
      event: "chat",
      payload: {
        runId: "run-1",
        sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
        seq: 1,
        state: "delta",
        message: {
          role: "assistant",
          content: [
            {
              type: "text",
              text: "Hel"
            }
          ],
          timestamp: 1710000000000
        }
      }
    }));

    socket.emit("message", JSON.stringify({
      type: "event",
      event: "chat",
      payload: {
        runId: "run-1",
        sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
        seq: 2,
        state: "final",
        message: {
          role: "assistant",
          content: [
            {
              type: "text",
              text: "Hello"
            }
          ],
          timestamp: 1710000000500
        }
      }
    }));

    let body = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      body += new TextDecoder().decode(value);
    }

    expect(result.status).toBe(200);
    expect(result.headers.get("content-type")).toContain("text/event-stream");
    expect(body).toContain("event: response.created");
    expect(body).toContain("\"type\":\"function_call\"");
    expect(body).toContain("\"tool-1\"");
    expect(body).toContain("\"partial\":true");
    expect(body).toContain("\"partialResult\"");
    expect(body).toContain("event: response.output_text.delta");
    expect(body).toContain("event: response.completed");
    expect(body).toContain("\"status\":\"completed\"");
  });

  it("maps assistant agent text frames to OpenResponse SSE events", async () => {
    const socket = new FakeWebSocket();
    const client = new DefaultOpenClawChatAgentClient(
      {
        url: "ws://127.0.0.1:18789",
        token: "secret-token",
        timeoutMs: 1_000,
        deviceIdentity: loadDeviceIdentityFromAssets(),
        now: () => 1_710_000_000_500
      },
      () => socket
    );

    const pending = client.createResponseStream(
      {
        sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
        message: "hello",
        idempotencyKey: "run-1"
      },
      "agent-1"
    );

    socket.emit("message", JSON.stringify({
      type: "event",
      event: "connect.challenge",
      payload: {
        nonce: "abc123"
      }
    }));

    const connectFrame = JSON.parse(socket.sentMessages[0] ?? "{}") as { id: string };

    socket.emit("message", JSON.stringify({
      type: "res",
      id: connectFrame.id,
      ok: true,
      payload: {}
    }));

    const patchFrame = JSON.parse(socket.sentMessages[1] ?? "{}") as { id: string };

    socket.emit("message", JSON.stringify({
      type: "res",
      id: patchFrame.id,
      ok: true,
      payload: {
        ok: true
      }
    }));

    const chatSendFrame = JSON.parse(socket.sentMessages[2] ?? "{}") as { id: string };

    socket.emit("message", JSON.stringify({
      type: "res",
      id: chatSendFrame.id,
      ok: true,
      payload: {
        runId: "run-1",
        status: "started"
      }
    }));

    const result = await pending;
    const reader = result.body.getReader();

    socket.emit("message", JSON.stringify({
      type: "event",
      event: "agent",
      payload: {
        runId: "run-1",
        sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
        seq: 1,
        stream: "assistant",
        ts: 1710000000100,
        data: {
          text: "Hel",
          delta: "Hel"
        }
      }
    }));

    socket.emit("message", JSON.stringify({
      type: "event",
      event: "agent",
      payload: {
        runId: "run-1",
        sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
        seq: 2,
        stream: "assistant",
        ts: 1710000000200,
        data: {
          text: "Hello",
          delta: "lo"
        }
      }
    }));

    socket.emit("message", JSON.stringify({
      type: "event",
      event: "chat",
      payload: {
        runId: "run-1",
        sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
        seq: 3,
        state: "final",
        message: {
          role: "assistant",
          content: [
            {
              type: "text",
              text: "ignored final"
            }
          ],
          timestamp: 1710000000300
        }
      }
    }));

    let body = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      body += new TextDecoder().decode(value);
    }

    expect(body).toContain("event: response.output_text.delta");
    expect(body).toContain("\"delta\":\"Hel\"");
    expect(body).toContain("\"delta\":\"lo\"");
    expect(body).toContain("event: response.completed");
    expect(body).toContain("\"text\":\"Hello\"");
    expect(body).not.toContain("ignored final");
  });

  it("fails before streaming when chat.send acknowledgement is invalid", async () => {
    const socket = new FakeWebSocket();
    const client = new DefaultOpenClawChatAgentClient(
      {
        url: "ws://127.0.0.1:18789",
        timeoutMs: 1_000,
        deviceIdentity: loadDeviceIdentityFromAssets()
      },
      () => socket
    );

    const pending = client.createResponseStream(
      {
        sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
        message: "hello"
      },
      "agent-1"
    );

    socket.emit("message", JSON.stringify({
      type: "event",
      event: "connect.challenge",
      payload: {
        nonce: "abc123"
      }
    }));

    const connectFrame = JSON.parse(socket.sentMessages[0] ?? "{}") as { id: string };

    socket.emit("message", JSON.stringify({
      type: "res",
      id: connectFrame.id,
      ok: true,
      payload: {}
    }));

    const patchFrame = JSON.parse(socket.sentMessages[1] ?? "{}") as { id: string };

    socket.emit("message", JSON.stringify({
      type: "res",
      id: patchFrame.id,
      ok: true,
      payload: {
        ok: true
      }
    }));

    const chatSendFrame = JSON.parse(socket.sentMessages[2] ?? "{}") as { id: string };

    socket.emit("message", JSON.stringify({
      type: "res",
      id: chatSendFrame.id,
      ok: false,
      error: {
        code: "MODEL_UNAVAILABLE",
        message: "model unavailable"
      }
    }));

    await expect(pending).rejects.toMatchObject({
      statusCode: 502,
      message: "model unavailable"
    });
  });

  it("fails before stream resolution when the socket closes during handshake", async () => {
    const socket = new FakeWebSocket();
    const client = new DefaultOpenClawChatAgentClient(
      {
        url: "ws://127.0.0.1:18789",
        timeoutMs: 1_000,
        deviceIdentity: loadDeviceIdentityFromAssets()
      },
      () => socket
    );

    const pending = client.createResponseStream(
      {
        sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
        message: "hello"
      },
      "agent-1"
    );

    socket.emit("close");

    await expect(pending).rejects.toMatchObject({
      statusCode: 502,
      message: "OpenClaw gateway closed the connection unexpectedly"
    });
  });

  it("converts post-ack chat error events into response.failed SSE", async () => {
    const socket = new FakeWebSocket();
    const client = new DefaultOpenClawChatAgentClient(
      {
        url: "ws://127.0.0.1:18789",
        timeoutMs: 1_000,
        deviceIdentity: loadDeviceIdentityFromAssets(),
        now: () => 1_710_000_000_500
      },
      () => socket
    );

    const pending = client.createResponseStream(
      {
        sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
        message: "hello"
      },
      "agent-1"
    );

    completeHandshake(socket);
    const result = await pending;
    const reader = result.body.getReader();

    socket.emit("message", JSON.stringify({
      type: "event",
      event: "chat",
      payload: {
        runId: "run-1",
        sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
        seq: 1,
        state: "error",
        errorMessage: "chat failed"
      }
    }));

    let body = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      body += new TextDecoder().decode(value);
    }

    expect(body).toContain("event: response.failed");
    expect(body).toContain("\"message\":\"chat failed\"");
  });

  it("marks aborted chat terminal events as cancelled", async () => {
    const socket = new FakeWebSocket();
    const client = new DefaultOpenClawChatAgentClient(
      {
        url: "ws://127.0.0.1:18789",
        timeoutMs: 1_000,
        deviceIdentity: loadDeviceIdentityFromAssets(),
        now: () => 1_710_000_000_500
      },
      () => socket
    );

    const pending = client.createResponseStream(
      {
        sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
        message: "hello"
      },
      "agent-1"
    );

    completeHandshake(socket);
    const result = await pending;
    const reader = result.body.getReader();

    socket.emit("message", JSON.stringify({
      type: "event",
      event: "chat",
      payload: {
        runId: "run-1",
        sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
        seq: 1,
        state: "aborted",
        message: {
          role: "assistant",
          content: [
            {
              type: "text",
              text: "bye"
            }
          ]
        }
      }
    }));

    let body = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      body += new TextDecoder().decode(value);
    }

    expect(body).toContain("event: response.completed");
    expect(body).toContain("\"status\":\"cancelled\"");
  });

  it("ignores chat deltas after assistant-text source is established", async () => {
    const socket = new FakeWebSocket();
    const client = new DefaultOpenClawChatAgentClient(
      {
        url: "ws://127.0.0.1:18789",
        timeoutMs: 1_000,
        deviceIdentity: loadDeviceIdentityFromAssets()
      },
      () => socket
    );

    const pending = client.createResponseStream(
      {
        sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
        message: "hello"
      },
      "agent-1"
    );

    completeHandshake(socket);
    const result = await pending;
    const reader = result.body.getReader();

    socket.emit("message", JSON.stringify({
      type: "event",
      event: "agent",
      payload: {
        runId: "run-1",
        seq: 1,
        stream: "assistant",
        ts: 1,
        data: {
          text: "Hello",
          delta: "Hello"
        }
      }
    }));

    socket.emit("message", JSON.stringify({
      type: "event",
      event: "chat",
      payload: {
        runId: "run-1",
        sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
        seq: 2,
        state: "delta",
        message: {
          role: "assistant",
          content: [{ type: "text", text: "ignored" }]
        }
      }
    }));

    socket.emit("message", JSON.stringify({
      type: "event",
      event: "chat",
      payload: {
        runId: "run-1",
        sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
        seq: 3,
        state: "final",
        message: {
          role: "assistant",
          content: [{ type: "text", text: "ignored final" }]
        }
      }
    }));

    let body = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      body += new TextDecoder().decode(value);
    }

    expect(body).toContain("\"delta\":\"Hello\"");
    expect(body).not.toContain("ignored final");
  });

  it("falls back to nextText when assistant delta is empty", async () => {
    const socket = new FakeWebSocket();
    const client = new DefaultOpenClawChatAgentClient(
      {
        url: "ws://127.0.0.1:18789",
        timeoutMs: 1_000,
        deviceIdentity: loadDeviceIdentityFromAssets()
      },
      () => socket
    );

    const pending = client.createResponseStream(
      {
        sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
        message: "hello"
      },
      "agent-1"
    );

    completeHandshake(socket);
    const result = await pending;
    const reader = result.body.getReader();

    socket.emit("message", JSON.stringify({
      type: "event",
      event: "agent",
      payload: {
        runId: "run-1",
        seq: 1,
        stream: "assistant",
        ts: 1,
        data: {
          text: "Hello",
          delta: ""
        }
      }
    }));

    socket.emit("message", JSON.stringify({
      type: "event",
      event: "chat",
      payload: {
        runId: "run-1",
        sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
        seq: 2,
        state: "final",
        message: {
          role: "assistant",
          content: [{ type: "text", text: "ignored final" }]
        }
      }
    }));

    let body = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      body += new TextDecoder().decode(value);
    }

    expect(body).toContain("\"text\":\"Hello\"");
    expect(body).not.toContain("\"delta\":\"\"");
  });

  it("ignores mismatched run ids across chat, assistant, and tool streams", async () => {
    const socket = new FakeWebSocket();
    const client = new DefaultOpenClawChatAgentClient(
      {
        url: "ws://127.0.0.1:18789",
        timeoutMs: 1_000,
        deviceIdentity: loadDeviceIdentityFromAssets()
      },
      () => socket
    );

    const pending = client.createResponseStream(
      {
        sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
        message: "hello"
      },
      "agent-1"
    );

    completeHandshake(socket);
    const result = await pending;
    const reader = result.body.getReader();

    socket.emit("message", JSON.stringify({
      type: "event",
      event: "chat",
      payload: {
        runId: "other-run",
        sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
        seq: 1,
        state: "delta",
        message: {
          role: "assistant",
          content: [{ type: "text", text: "ignored chat" }]
        }
      }
    }));

    socket.emit("message", JSON.stringify({
      type: "event",
      event: "agent",
      payload: {
        runId: "other-run",
        seq: 2,
        stream: "assistant",
        ts: 2,
        data: {
          text: "ignored text",
          delta: "ignored text"
        }
      }
    }));

    socket.emit("message", JSON.stringify({
      type: "event",
      event: "agent",
      payload: {
        runId: "other-run",
        seq: 3,
        stream: "tool",
        ts: 3,
        data: {
          phase: "start",
          name: "web_search",
          toolCallId: "tool-1"
        }
      }
    }));

    socket.emit("message", JSON.stringify({
      type: "event",
      event: "chat",
      payload: {
        runId: "run-1",
        sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
        seq: 4,
        state: "final",
        message: {
          role: "assistant",
          content: [{ type: "text", text: "done" }]
        }
      }
    }));

    let body = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      body += new TextDecoder().decode(value);
    }

    expect(body).toContain("\"text\":\"done\"");
    expect(body).not.toContain("ignored chat");
    expect(body).not.toContain("ignored text");
    expect(body).not.toContain("\"tool-1\"");
  });

  it("converts post-ack tool errors into completed tool items and failure on socket error", async () => {
    const socket = new FakeWebSocket();
    const client = new DefaultOpenClawChatAgentClient(
      {
        url: "ws://127.0.0.1:18789",
        timeoutMs: 1_000,
        deviceIdentity: loadDeviceIdentityFromAssets(),
        now: () => 1_710_000_000_500
      },
      () => socket
    );

    const pending = client.createResponseStream(
      {
        sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
        message: "hello"
      },
      "agent-1"
    );

    completeHandshake(socket);
    const result = await pending;
    const reader = result.body.getReader();

    socket.emit("message", JSON.stringify({
      type: "event",
      event: "agent",
      payload: {
        runId: "run-1",
        seq: 1,
        stream: "tool",
        ts: 1710000000100,
        data: {
          phase: "progress",
          name: "web_search",
          toolCallId: "tool-1"
        }
      }
    }));

    socket.emit("message", JSON.stringify({
      type: "event",
      event: "agent",
      payload: {
        runId: "run-1",
        seq: 2,
        stream: "tool",
        ts: 1710000000200,
        data: {
          phase: "error",
          name: "web_search",
          toolCallId: "tool-1",
          error: {
            message: "tool failed"
          }
        }
      }
    }));

    socket.emit("error", new Error("socket failed"));

    let body = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      body += new TextDecoder().decode(value);
    }

    expect(body).toContain("\"type\":\"function_call\"");
    expect(body).toContain("\"status\":\"completed\"");
    expect(body).toContain("\"tool failed\"");
    expect(body).toContain("event: response.failed");
    expect(body).toContain("socket failed");
  });

  it("aborts before resolution with downstream abort status", async () => {
    const socket = new FakeWebSocket();
    const client = new DefaultOpenClawChatAgentClient(
      {
        url: "ws://127.0.0.1:18789",
        timeoutMs: 1_000,
        deviceIdentity: loadDeviceIdentityFromAssets()
      },
      () => socket
    );
    const abortController = new AbortController();

    const pending = client.createResponseStream(
      {
        sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
        message: "hello"
      },
      "agent-1",
      abortController.signal
    );

    abortController.abort();

    await expect(pending).rejects.toMatchObject({
      statusCode: 499,
      message: "Chat agent request was aborted"
    });
    expect(socket.closed).toBe(true);
  });
});
