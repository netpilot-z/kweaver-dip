import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../errors/http-error";

/**
 * Handles uncaught application errors and returns a stable JSON payload.
 *
 * @param error The thrown application error.
 * @param _request The incoming HTTP request.
 * @param response The outgoing HTTP response.
 * @param _next The next middleware callback required by Express.
 * @returns Nothing. The response is written directly.
 */
export function errorHandler(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction
): void {
  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  const message =
    error instanceof HttpError ? error.message : "Internal Server Error";

  response.status(statusCode).json({
    error: {
      message
    }
  });
}
