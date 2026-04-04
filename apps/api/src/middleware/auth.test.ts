import { Hono } from "hono";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { authRequired, authOptional } from "./auth";

// Mock @1elat/auth
vi.mock("@1elat/auth", () => ({
  getSession: vi.fn(),
}));

import { getSession } from "@1elat/auth";

const mockKV = {
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
} as unknown as KVNamespace;

function createTestApp(): Hono {
  const app = new Hono();

  // Error handler must be registered before routes
  app.onError((err, c) => {
    if ("statusCode" in err) {
      return c.json(
        { error: (err as Error).message },
        (err as { statusCode: number }).statusCode as 401
      );
    }
    return c.json({ error: "Internal error" }, 500);
  });

  return app;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("authRequired", () => {
  it("returns 401 when no session cookie is present", async () => {
    const app = createTestApp();
    app.get("/protected/data", authRequired, (c) => c.json({ data: "secret" }));

    const res = await app.request("/protected/data", {}, { SESSION: mockKV });
    expect(res.status).toBe(401);
  });

  it("returns 401 when session is expired or invalid (KV returns null)", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const app = createTestApp();
    app.get("/protected/data", authRequired, (c) => c.json({ data: "secret" }));

    const res = await app.request(
      "/protected/data",
      { headers: { cookie: "session=expired-token" } },
      { SESSION: mockKV }
    );
    expect(res.status).toBe(401);
  });

  it("sets userId in context when session is valid", async () => {
    vi.mocked(getSession).mockResolvedValueOnce("user-abc");

    const app = createTestApp();
    app.get("/protected/data", authRequired, (c) => {
      const userId = c.get("userId");
      return c.json({ userId });
    });

    const res = await app.request(
      "/protected/data",
      { headers: { cookie: "session=valid-token" } },
      { SESSION: mockKV }
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.userId).toBe("user-abc");
  });

  it("refreshes session TTL by re-putting to KV", async () => {
    vi.mocked(getSession).mockResolvedValueOnce("user-abc");

    const app = createTestApp();
    app.get("/protected/data", authRequired, (c) => c.json({ ok: true }));

    await app.request(
      "/protected/data",
      { headers: { cookie: "session=valid-token" } },
      { SESSION: mockKV }
    );

    expect(mockKV.put).toHaveBeenCalledWith(
      "session:valid-token",
      "user-abc",
      { expirationTtl: 604800 }
    );
  });
});

describe("authOptional", () => {
  it("continues without error when no cookie is present", async () => {
    const app = createTestApp();
    app.get("/public/data", authOptional, (c) => c.json({ data: "public" }));

    const res = await app.request("/public/data", {}, { SESSION: mockKV });
    expect(res.status).toBe(200);
  });

  it("sets userId when valid session exists", async () => {
    vi.mocked(getSession).mockResolvedValueOnce("user-xyz");

    const app = createTestApp();
    app.get("/public/data", authOptional, (c) => {
      const userId = c.get("userId");
      return c.json({ userId: userId || null });
    });

    const res = await app.request(
      "/public/data",
      { headers: { cookie: "session=valid-token" } },
      { SESSION: mockKV }
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.userId).toBe("user-xyz");
  });

  it("does not set userId when session is invalid", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const app = createTestApp();
    app.get("/public/data", authOptional, (c) => {
      const userId = c.get("userId");
      return c.json({ userId: userId || null });
    });

    const res = await app.request(
      "/public/data",
      { headers: { cookie: "session=bad-token" } },
      { SESSION: mockKV }
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.userId).toBeNull();
  });

  it("refreshes session TTL when valid session exists", async () => {
    vi.mocked(getSession).mockResolvedValueOnce("user-xyz");

    const app = createTestApp();
    app.get("/public/data", authOptional, (c) => c.json({ ok: true }));

    await app.request(
      "/public/data",
      { headers: { cookie: "session=valid-token" } },
      { SESSION: mockKV }
    );

    expect(mockKV.put).toHaveBeenCalledWith(
      "session:valid-token",
      "user-xyz",
      { expirationTtl: 604800 }
    );
  });
});
