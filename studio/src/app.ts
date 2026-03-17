import express, { type Express, type Request, type Response } from "express";

import { getEnv } from "./config/env";
import { HttpError } from "./errors/http-error";
import { errorHandler } from "./middleware/error-handler";
import { notFoundHandler } from "./middleware/not-found";
import { createHealthRouter } from "./routes/health";
import { createOpenClawHandlers } from "./routes/openclaw";
import {
  OpenClawGatewayClient,
  type OpenClawAgentsReader
} from "./services/openclaw-gateway-client";

/**
 * Options for creating the Express application.
 */
export interface AppOptions {
  /**
   * Enables diagnostic routes that are only useful in tests.
   */
  enableDiagnostics?: boolean;

  /**
   * Overrides the OpenClaw gateway reader.
   */
  openClawAgentsReader?: OpenClawAgentsReader;
}

/**
 * Raises a predictable error for middleware testing.
 *
 * @param _request The incoming HTTP request.
 * @param _response The outgoing HTTP response.
 * @returns Nothing. An error is thrown synchronously.
 */
export function raiseDiagnosticError(
  _request: Request,
  _response: Response
): never {
  throw new HttpError(418, "Diagnostic failure");
}

/**
 * Creates the Express application with the default middleware stack.
 *
 * @param options Optional application construction flags.
 * @returns A configured Express application.
 */
export function createApp(options: AppOptions = {}): Express {
  const env = getEnv();
  const app = express();
  const openClawAgentsReader =
    options.openClawAgentsReader ??
    new OpenClawGatewayClient({
      url: env.openClawGatewayUrl,
      token: env.openClawGatewayToken,
      timeoutMs: env.openClawGatewayTimeoutMs
    });
  const openClawHandlers = createOpenClawHandlers(openClawAgentsReader);

  app.disable("x-powered-by");
  app.use(express.json());
  app.use(createHealthRouter());
  app.get("/api/openclaw/agents", openClawHandlers.getAgents);

  if (options.enableDiagnostics === true) {
    app.get("/__diagnostics/error", raiseDiagnosticError);
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
