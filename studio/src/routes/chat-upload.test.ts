import type { NextFunction, Request, Response, Router } from "express";
import { describe, expect, it, vi } from "vitest";

import { createChatUploadRouter } from "./chat-upload";

/**
 * Creates a minimal json-capable response double.
 *
 * @returns Mocked response.
 */
function createJsonResponseDouble(): Response {
  const response = {
    status: vi.fn(),
    json: vi.fn()
  } as unknown as Response;

  vi.mocked(response.status).mockReturnValue(response);
  vi.mocked(response.json).mockReturnValue(response);

  return response;
}

/**
 * Finds the first and second handlers registered on the upload route.
 *
 * @param router The Express router instance.
 * @returns Multipart middleware and final async handler.
 */
function findUploadHandlers(router: Router): {
  multipart?: (request: Request, response: Response, next: NextFunction) => void;
  handler?: (
    request: Request,
    response: Response,
    next: NextFunction
  ) => Promise<void>;
} {
  const layer = (router as Router & {
    stack: Array<{
      route?: {
        path: string;
        stack: Array<{
          handle: (
            request: Request,
            response: Response,
            next: NextFunction
          ) => void | Promise<void>;
        }>;
      };
    }>;
  }).stack.find(
    (entry) => entry.route?.path === "/api/dip-studio/v1/chat/upload"
  );

  return {
    multipart: layer?.route?.stack[0]?.handle as (
      request: Request,
      response: Response,
      next: NextFunction
    ) => void,
    handler: layer?.route?.stack[1]?.handle as (
      request: Request,
      response: Response,
      next: NextFunction
    ) => Promise<void>
  };
}

describe("createChatUploadRouter", () => {
  it("uploads file and returns workspace temp path", async () => {
    const response = createJsonResponseDouble();
    const next = vi.fn<NextFunction>();
    const uploadTempFile = vi.fn().mockResolvedValue({
      path: "tmp/chat-1/a.txt"
    });
    const { handler } = findUploadHandlers(
      createChatUploadRouter({
        uploadTempFile
      }) as Router
    );
    const request = {
      file: {
        fieldname: "file",
        originalname: "a.txt",
        encoding: "7bit",
        mimetype: "text/plain",
        buffer: Buffer.from("hello"),
        size: 5,
        destination: "",
        filename: "",
        path: "",
        stream: null as never
      },
      body: {},
      headers: {
        "x-openclaw-session-key": "agent:agent-1:user:user-1:direct:chat-1"
      }
    } as unknown as Request;

    await handler?.(request, response, next);

    expect(uploadTempFile).toHaveBeenCalledWith({
      agentId: "agent-1",
      sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
      filename: "a.txt",
      body: expect.any(Buffer)
    });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      name: "a.txt",
      path: "tmp/chat-1/a.txt"
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("repairs mojibake filenames before forwarding upstream", async () => {
    const response = createJsonResponseDouble();
    const next = vi.fn<NextFunction>();
    const uploadTempFile = vi.fn().mockResolvedValue({
      path: "tmp/chat-1/测试.txt"
    });
    const { handler } = findUploadHandlers(
      createChatUploadRouter({
        uploadTempFile
      }) as Router
    );
    const request = {
      file: {
        fieldname: "file",
        originalname: "æµ\x8Bè¯\x95.txt",
        encoding: "7bit",
        mimetype: "text/plain",
        buffer: Buffer.from("hello"),
        size: 5,
        destination: "",
        filename: "",
        path: "",
        stream: null as never
      },
      body: {},
      headers: {
        "x-openclaw-session-key": "agent:agent-1:user:user-1:direct:chat-1"
      }
    } as unknown as Request;

    await handler?.(request, response, next);

    expect(uploadTempFile).toHaveBeenCalledWith({
      agentId: "agent-1",
      sessionKey: "agent:agent-1:user:user-1:direct:chat-1",
      filename: "测试.txt",
      body: expect.any(Buffer)
    });
    expect(response.json).toHaveBeenCalledWith({
      name: "测试.txt",
      path: "tmp/chat-1/测试.txt"
    });
  });

  it("fails when multipart file is missing", async () => {
    const response = createJsonResponseDouble();
    const next = vi.fn<NextFunction>();
    const { handler } = findUploadHandlers(
      createChatUploadRouter({
        uploadTempFile: vi.fn()
      }) as Router
    );

    await handler?.(
      {
        file: undefined,
        body: {},
        headers: {
          "x-openclaw-session-key": "agent:agent-1:user:user-1:direct:chat-1"
        }
      } as unknown as Request,
      response,
      next
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: "Multipart field `file` is required"
      })
    );
  });

  it("fails when uploaded file buffer is empty", async () => {
    const response = createJsonResponseDouble();
    const next = vi.fn<NextFunction>();
    const { handler } = findUploadHandlers(
      createChatUploadRouter({
        uploadTempFile: vi.fn()
      }) as Router
    );

    await handler?.(
      {
        file: {
          fieldname: "file",
          originalname: "a.txt",
          encoding: "7bit",
          mimetype: "text/plain",
          buffer: Buffer.alloc(0),
          size: 0,
          destination: "",
          filename: "",
          path: "",
          stream: null as never
        },
        headers: {
          "x-openclaw-session-key": "agent:agent-1:user:user-1:direct:chat-1"
        }
      } as unknown as Request,
      response,
      next
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: "Multipart field `file` is required"
      })
    );
  });

  it("wraps unexpected upstream upload failures", async () => {
    const response = createJsonResponseDouble();
    const next = vi.fn<NextFunction>();
    const uploadTempFile = vi.fn().mockRejectedValue(new Error("boom"));
    const { handler } = findUploadHandlers(
      createChatUploadRouter({
        uploadTempFile
      }) as Router
    );

    await handler?.(
      {
        file: {
          fieldname: "file",
          originalname: "a.txt",
          encoding: "7bit",
          mimetype: "text/plain",
          buffer: Buffer.from("hello"),
          size: 5,
          destination: "",
          filename: "",
          path: "",
          stream: null as never
        },
        headers: {
          "x-openclaw-session-key": "agent:agent-1:user:user-1:direct:chat-1"
        }
      } as unknown as Request,
      response,
      next
    );

    expect(uploadTempFile).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 502,
        message: "Failed to upload chat attachment"
      })
    );
  });
});
