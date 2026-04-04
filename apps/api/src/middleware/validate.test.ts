import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { z } from "zod";
import { validate } from "./validate";

const testSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().positive(),
});

function createTestApp(): Hono {
  const app = new Hono();

  app.post("/test", validate(testSchema), (c) => {
    const body = c.get("validatedBody");
    return c.json({ data: body, error: null });
  });

  return app;
}

describe("validate middleware", () => {
  const app = createTestApp();

  it("passes valid body through and calls next", async () => {
    const res = await app.request("/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "John", age: 25 }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual({ name: "John", age: 25 });
  });

  it("returns 400 for invalid body", async () => {
    const res = await app.request("/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", age: -1 }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.data).toBeNull();
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("error message includes field path and issue", async () => {
    const res = await app.request("/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", age: 25 }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.message).toContain("name");
  });

  it("returns 400 for missing required fields", async () => {
    const res = await app.request("/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });
});
