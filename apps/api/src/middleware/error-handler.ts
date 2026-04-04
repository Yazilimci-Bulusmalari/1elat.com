import type { ErrorHandler } from "hono";
import { AppError } from "../lib/errors";
import type { AppEnv } from "../types";

export const errorHandler: ErrorHandler<AppEnv> = (err, c) => {
  if (err instanceof AppError) {
    return c.json(
      { data: null, error: { message: err.message, code: err.code } },
      err.statusCode as 400 | 401 | 403 | 404 | 409 | 429
    );
  }

  console.error("Unhandled error:", err);

  return c.json(
    { data: null, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
    500
  );
};
