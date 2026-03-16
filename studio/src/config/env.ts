/**
 * Resolves the HTTP port from an environment variable.
 *
 * @param value The raw environment variable value.
 * @returns A validated TCP port number.
 * @throws {Error} Thrown when the port is not a positive integer.
 */
export function resolvePort(value: string | undefined): number {
  if (value === undefined || value.trim() === "") {
    return 3000;
  }

  const port = Number.parseInt(value, 10);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid PORT value: ${value}`);
  }

  return port;
}

/**
 * Reads and validates runtime environment variables.
 *
 * @returns The normalized runtime configuration.
 */
export function getEnv(): { port: number } {
  return {
    port: resolvePort(process.env.PORT)
  };
}
