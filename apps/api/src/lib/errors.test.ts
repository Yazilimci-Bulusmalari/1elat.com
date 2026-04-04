import { describe, it, expect } from "vitest";
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  ConflictError,
  RateLimitError,
} from "./errors";

describe("AppError", () => {
  it("has statusCode, message, and code", () => {
    const err = new AppError(418, "I am a teapot", "TEAPOT");
    expect(err.statusCode).toBe(418);
    expect(err.message).toBe("I am a teapot");
    expect(err.code).toBe("TEAPOT");
  });

  it("extends Error", () => {
    const err = new AppError(500, "test", "TEST");
    expect(err).toBeInstanceOf(Error);
  });
});

describe("NotFoundError", () => {
  it("has statusCode 404", () => {
    const err = new NotFoundError("User");
    expect(err.statusCode).toBe(404);
  });

  it("has code NOT_FOUND", () => {
    const err = new NotFoundError("User");
    expect(err.code).toBe("NOT_FOUND");
  });

  it("includes resource name in message", () => {
    const err = new NotFoundError("Project");
    expect(err.message).toContain("Project");
  });

  it("extends AppError", () => {
    const err = new NotFoundError("User");
    expect(err).toBeInstanceOf(AppError);
  });
});

describe("UnauthorizedError", () => {
  it("has statusCode 401", () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
  });

  it("has default message", () => {
    const err = new UnauthorizedError();
    expect(err.message).toBe("Authentication required");
  });

  it("accepts custom message", () => {
    const err = new UnauthorizedError("Token expired");
    expect(err.message).toBe("Token expired");
  });

  it("extends AppError", () => {
    expect(new UnauthorizedError()).toBeInstanceOf(AppError);
  });
});

describe("ForbiddenError", () => {
  it("has statusCode 403", () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
  });

  it("extends AppError", () => {
    expect(new ForbiddenError()).toBeInstanceOf(AppError);
  });
});

describe("ValidationError", () => {
  it("has statusCode 400", () => {
    const err = new ValidationError("Invalid input");
    expect(err.statusCode).toBe(400);
  });

  it("has code VALIDATION_ERROR", () => {
    const err = new ValidationError("Bad data");
    expect(err.code).toBe("VALIDATION_ERROR");
  });

  it("extends AppError", () => {
    expect(new ValidationError("test")).toBeInstanceOf(AppError);
  });
});

describe("ConflictError", () => {
  it("has statusCode 409", () => {
    const err = new ConflictError("Already exists");
    expect(err.statusCode).toBe(409);
  });

  it("extends AppError", () => {
    expect(new ConflictError("test")).toBeInstanceOf(AppError);
  });
});

describe("RateLimitError", () => {
  it("has statusCode 429", () => {
    const err = new RateLimitError();
    expect(err.statusCode).toBe(429);
  });

  it("has message about too many requests", () => {
    const err = new RateLimitError();
    expect(err.message).toBe("Too many requests");
  });

  it("extends AppError", () => {
    expect(new RateLimitError()).toBeInstanceOf(AppError);
  });
});
