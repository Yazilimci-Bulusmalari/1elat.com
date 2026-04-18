import { Hono } from "hono";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { requireAdmin } from "./admin";
import { ForbiddenError, UnauthorizedError, AppError } from "../lib/errors";

vi.mock("../services/user.service", () => ({
  getUserById: vi.fn(),
}));

import { getUserById } from "../services/user.service";

function createTestApp(): Hono {
  const app = new Hono();
  app.onError((err, c) => {
    if (err instanceof AppError) {
      return c.json({ error: err.message }, err.statusCode as 401 | 403);
    }
    return c.json({ error: "Internal" }, 500);
  });
  return app;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("requireAdmin", () => {
  it("admin rolundeki kullanici icin next() cagirilir", async () => {
    vi.mocked(getUserById).mockResolvedValueOnce({
      id: "u1",
      email: "a@x.com",
      role: "admin",
    } as never);

    const app = createTestApp();
    app.get(
      "/admin/x",
      async (c, next) => {
        c.set("userId", "u1");
        c.set("db", {} as never);
        await next();
      },
      requireAdmin,
      (c) => c.json({ ok: true })
    );

    const res = await app.request("/admin/x");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it("user rolundeki kullanici icin 403 doner", async () => {
    vi.mocked(getUserById).mockResolvedValueOnce({
      id: "u2",
      email: "b@x.com",
      role: "user",
    } as never);

    const app = createTestApp();
    app.get(
      "/admin/x",
      async (c, next) => {
        c.set("userId", "u2");
        c.set("db", {} as never);
        await next();
      },
      requireAdmin,
      (c) => c.json({ ok: true })
    );

    const res = await app.request("/admin/x");
    expect(res.status).toBe(403);
  });

  it("userId yoksa 401 doner", async () => {
    const app = createTestApp();
    app.get(
      "/admin/x",
      async (c, next) => {
        c.set("db", {} as never);
        await next();
      },
      requireAdmin,
      (c) => c.json({ ok: true })
    );

    const res = await app.request("/admin/x");
    expect(res.status).toBe(401);
  });

  it("kullanici DB'de yoksa 401 doner", async () => {
    vi.mocked(getUserById).mockResolvedValueOnce(undefined);

    const app = createTestApp();
    app.get(
      "/admin/x",
      async (c, next) => {
        c.set("userId", "ghost");
        c.set("db", {} as never);
        await next();
      },
      requireAdmin,
      (c) => c.json({ ok: true })
    );

    const res = await app.request("/admin/x");
    expect(res.status).toBe(401);
  });

  it("ForbiddenError ve UnauthorizedError dogru tipte firlatilir", () => {
    expect(new ForbiddenError().statusCode).toBe(403);
    expect(new UnauthorizedError().statusCode).toBe(401);
  });
});
