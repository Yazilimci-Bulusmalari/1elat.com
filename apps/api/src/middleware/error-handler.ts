import type { ErrorHandler } from "hono";
import { AppError, ProjectValidationError } from "../lib/errors";
import type { AppEnv } from "../types";

type AppStatusCode = 400 | 401 | 403 | 404 | 409 | 413 | 415 | 422 | 429;

export const errorHandler: ErrorHandler<AppEnv> = (err, c) => {
  if (err instanceof ProjectValidationError) {
    return c.json(
      {
        data: null,
        error: {
          message: err.message,
          code: err.code,
          missingFields: err.missingFields,
        },
      },
      err.statusCode as AppStatusCode,
    );
  }

  if (err instanceof AppError) {
    return c.json(
      { data: null, error: { message: err.message, code: err.code } },
      err.statusCode as AppStatusCode,
    );
  }

  console.error("Unhandled error:", err);

  return c.json(
    { data: null, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
    500,
  );
};
