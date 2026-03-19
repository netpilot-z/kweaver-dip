import type { NextFunction, Request, Response } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

/**
 * Creates a minimal response double with chainable methods.
 *
 * @returns The mocked response object.
 */
function createResponseDouble(): Response {
  const response = {
    status: vi.fn(),
    json: vi.fn()
  } as unknown as Response;

  vi.mocked(response.status).mockReturnValue(response);

  return response;
}

/**
 * Loads the router module with a mocked digital human logic result.
 *
 * @param listDigitalHumans Mocked route logic implementation.
 * @returns The imported router factory.
 */
async function importRouterWithLogicMock(
  listDigitalHumans: () => Promise<unknown>
): Promise<typeof import("./digital-human")> {
  vi.doMock("../logic/digital-human", () => ({
    DefaultDigitalHumanLogic: vi.fn().mockImplementation(() => ({
      listDigitalHumans
    }))
  }));

  return import("./digital-human");
}

describe("createDigitalHumanRouter", () => {
  it("registers GET /api/dip-studio/v1/digital-human", async () => {
    const { createDigitalHumanRouter } = await importRouterWithLogicMock(
      async () => []
    );
    const router = createDigitalHumanRouter() as {
      stack: Array<{
        route?: {
          path: string;
          stack: Array<{
            handle: (
              request: Request,
              response: Response,
              next: NextFunction
            ) => Promise<void>;
          }>;
        };
      }>;
    };
    const layer = router.stack.find(
      (entry) => entry.route?.path === "/api/dip-studio/v1/digital-human"
    );

    expect(layer).toBeDefined();
  });

  it("returns the digital human list on success", async () => {
    const { createDigitalHumanRouter } = await importRouterWithLogicMock(async () => [
      {
        id: "main",
        name: "Main Agent",
        avatar: "https://example.com/main.png"
      }
    ]);
    const router = createDigitalHumanRouter() as {
      stack: Array<{
        route?: {
          path: string;
          stack: Array<{
            handle: (
              request: Request,
              response: Response,
              next: NextFunction
            ) => Promise<void>;
          }>;
        };
      }>;
    };
    const layer = router.stack.find(
      (entry) => entry.route?.path === "/api/dip-studio/v1/digital-human"
    );
    const handler = layer?.route?.stack[0]?.handle;
    const response = createResponseDouble();
    const next = vi.fn<NextFunction>();

    await handler?.({} as Request, response, next);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith([
      {
        id: "main",
        name: "Main Agent",
        avatar: "https://example.com/main.png"
      }
    ]);
    expect(next).not.toHaveBeenCalled();
  });

  it("forwards HttpError instances without wrapping them", async () => {
    const { HttpError } = await import("../errors/http-error");
    const error = new HttpError(503, "Gateway unavailable");
    const { createDigitalHumanRouter } = await importRouterWithLogicMock(
      async () => {
        throw error;
      }
    );
    const router = createDigitalHumanRouter() as {
      stack: Array<{
        route?: {
          path: string;
          stack: Array<{
            handle: (
              request: Request,
              response: Response,
              next: NextFunction
            ) => Promise<void>;
          }>;
        };
      }>;
    };
    const layer = router.stack.find(
      (entry) => entry.route?.path === "/api/dip-studio/v1/digital-human"
    );
    const handler = layer?.route?.stack[0]?.handle;
    const response = createResponseDouble();
    const next = vi.fn<NextFunction>();

    await handler?.({} as Request, response, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(response.status).not.toHaveBeenCalled();
  });

  it("wraps unexpected errors with a gateway failure HttpError", async () => {
    const { createDigitalHumanRouter } = await importRouterWithLogicMock(
      async () => {
        throw new Error("boom");
      }
    );
    const router = createDigitalHumanRouter() as {
      stack: Array<{
        route?: {
          path: string;
          stack: Array<{
            handle: (
              request: Request,
              response: Response,
              next: NextFunction
            ) => Promise<void>;
          }>;
        };
      }>;
    };
    const layer = router.stack.find(
      (entry) => entry.route?.path === "/api/dip-studio/v1/digital-human"
    );
    const handler = layer?.route?.stack[0]?.handle;
    const response = createResponseDouble();
    const next = vi.fn<NextFunction>();

    await handler?.({} as Request, response, next);

    expect(next).toHaveBeenCalledOnce();
    expect(vi.mocked(next).mock.calls[0]?.[0]).toMatchObject({
      statusCode: 502,
      message: "Failed to query digital humans"
    });
    expect(response.status).not.toHaveBeenCalled();
  });
});
