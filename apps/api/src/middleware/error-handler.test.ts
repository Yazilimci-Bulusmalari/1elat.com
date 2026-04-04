import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { errorHandler } from "./error-handler";
import { AppError, NotFoundError, ValidationError } from "../lib/errors";

function createTestApp(): Hono {
  const app = new Hono();

  app.get("/app-error", () => {
    throw new AppError(418, "I am a teapot", "TEAPOT");
  });

  app.get("/not-found", () => {
    throw new NotFoundError("User");
  });

  app.get("/validation-error", () => {
    throw new ValidationError("Name is required");
  });

  app.get("/unknown-error", () => {
    throw new Error("Something unexpected");
  });

  app.onError(errorHandler);

  return app;
}

describe("errorHandler", () => {
  const app = createTestApp();

  it("returns correct status and JSON for AppError", async () => {
    const res = await app.request("/app-error");
    expect(res.status).toBe(418);
    const body = await res.json();
    expect(body).toEqual({
      data: null,
      error: { message: "I am a teapot", code: "TEAPOT" },
    });
  });

  it("returns 404 for NotFoundError with resource name in message", async () => {
    const res = await app.request("/not-found");
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.data).toBeNull();
    expect(body.error.code).toBe("NOT_FOUND");
    expect(body.error.message).toContain("User");
  });

  it("returns 400 for ValidationError", async () => {
    const res = await app.request("/validation-error");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.data).toBeNull();
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toBe("Name is required");
  });

  it("returns 500 for unknown errors", async () => {
    const res = await app.request("/unknown-error");
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({
      data: null,
      error: { message: "Internal server error", code: "INTERNAL_ERROR" },
    });
  });
});
