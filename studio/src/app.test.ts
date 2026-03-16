import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { createApp, raiseDiagnosticError } from "./app";
import { getEnv, resolvePort } from "./config/env";
import { HttpError } from "./errors/http-error";
import { errorHandler } from "./middleware/error-handler";
import { notFoundHandler } from "./middleware/not-found";
import { getHealth } from "./routes/health";

/**
 * Creates a minimal mock response object for handler tests.
 *
 * @returns A response double with chainable status and json methods.
 */
function createResponseDouble(): Response {
  const response = {
    status: vi.fn(),
    json: vi.fn()
  } as unknown as Response;

  vi.mocked(response.status).mockReturnValue(response);

  return response;
}

describe("createApp", () => {
  it("disables the x-powered-by header", () => {
    const app = createApp();

    expect(app.get("x-powered-by")).toBe(false);
  });

  it("creates the app when diagnostics are enabled", () => {
    expect(createApp({ enableDiagnostics: true })).toBeDefined();
  });
});

describe("getHealth", () => {
  it("writes the standard health payload", () => {
    const response = createResponseDouble();

    getHealth({} as Request, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      status: "ok",
      service: "dip-studio-backend"
    });
  });
});

describe("notFoundHandler", () => {
  it("forwards a 404 error for unmatched routes", () => {
    const next = vi.fn<NextFunction>();

    notFoundHandler(
      { method: "GET", path: "/missing" } as Request,
      {} as Response,
      next
    );

    expect(next).toHaveBeenCalledOnce();

    const [error] = vi.mocked(next).mock.calls[0] ?? [];
    expect(error).toBeInstanceOf(HttpError);
    expect((error as HttpError).statusCode).toBe(404);
    expect((error as HttpError).message).toBe("Route not found: GET /missing");
  });
});

describe("errorHandler", () => {
  it("returns a typed application error payload", () => {
    const response = createResponseDouble();

    errorHandler(
      new HttpError(418, "Diagnostic failure"),
      {} as Request,
      response,
      vi.fn()
    );

    expect(response.status).toHaveBeenCalledWith(418);
    expect(response.json).toHaveBeenCalledWith({
      error: {
        message: "Diagnostic failure"
      }
    });
  });

  it("returns a generic 500 payload for unknown errors", () => {
    const response = createResponseDouble();

    errorHandler(new Error("boom"), {} as Request, response, vi.fn());

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      error: {
        message: "Internal Server Error"
      }
    });
  });
});

describe("createApp diagnostics", () => {
  it("builds an app instance without throwing", () => {
    const app = createApp();

    expect(typeof app.use).toBe("function");
  });
});

describe("raiseDiagnosticError", () => {
  it("throws the expected diagnostic HttpError", () => {
    expect(() => {
      raiseDiagnosticError({} as Request, {} as Response);
    }).toThrowError(new HttpError(418, "Diagnostic failure"));
  });
});

describe("resolvePort", () => {
  it("uses the default port when the value is missing", () => {
    expect(resolvePort(undefined)).toBe(3000);
    expect(resolvePort("")).toBe(3000);
  });

  it("parses a valid integer port", () => {
    expect(resolvePort("8080")).toBe(8080);
  });

  it("throws for invalid values", () => {
    expect(() => resolvePort("0")).toThrow("Invalid PORT value: 0");
    expect(() => resolvePort("abc")).toThrow("Invalid PORT value: abc");
  });
});

describe("getEnv", () => {
  it("reads PORT from process.env", () => {
    process.env.PORT = "4321";

    expect(getEnv()).toEqual({ port: 4321 });
  });
});

describe("HttpError", () => {
  it("captures the status code and name", () => {
    const error = new HttpError(400, "Bad Request");

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Bad Request");
    expect(error.name).toBe("HttpError");
  });
});
