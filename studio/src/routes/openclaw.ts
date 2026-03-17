import { Router, type NextFunction, type Request, type Response } from "express";

import { HttpError } from "../errors/http-error";
import type { OpenClawAgentsReader } from "../services/openclaw-gateway-client";

/**
 * Returns the OpenClaw agent list over HTTP.
 *
 * @param client The OpenClaw gateway reader used by the route.
 * @param _request The incoming HTTP request.
 * @param response The outgoing HTTP response.
 * @param next The next middleware callback.
 * @returns Nothing. The response is written directly.
 */
export async function getOpenClawAgents(
  client: OpenClawAgentsReader,
  _request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await client.listAgents();

    response.status(200).json(result);
  } catch (error) {
    next(
      error instanceof HttpError
        ? error
        : new HttpError(502, "Failed to query OpenClaw agents")
    );
  }
}

/**
 * Builds the OpenClaw router.
 *
 * @param client The OpenClaw gateway reader used by the route.
 * @returns The router exposing OpenClaw endpoints.
 */
export function createOpenClawRouter(client: OpenClawAgentsReader): Router {
  const router = Router();

  router.get("/api/openclaw/agents", (request, response, next) => {
    return getOpenClawAgents(client, request, response, next);
  });

  return router;
}
