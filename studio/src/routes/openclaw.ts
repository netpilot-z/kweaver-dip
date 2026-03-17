import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../errors/http-error";
import type { OpenClawAgentsReader } from "../services/openclaw-gateway-client";

/**
 * Creates the OpenClaw HTTP route handlers.
 *
 * @param client The OpenClaw gateway reader used by the route.
 * @returns The route handlers bound to the supplied client.
 */
export function createOpenClawHandlers(client: OpenClawAgentsReader): {
  getAgents: (
    request: Request,
    response: Response,
    next: NextFunction
  ) => Promise<void>;
} {
  return {
    /**
     * Returns the OpenClaw agent list over HTTP.
     *
     * @param _request The incoming HTTP request.
     * @param response The outgoing HTTP response.
     * @param next The next middleware callback.
     * @returns Nothing. The response is written directly.
     */
    async getAgents(
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
  };
}
