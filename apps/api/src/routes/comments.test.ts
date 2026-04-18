import { Hono } from "hono";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppError, NotFoundError } from "../lib/errors";

vi.mock("../middleware/auth", () => ({
  authRequired: async (
    c: { req: { query: (k: string) => string | undefined }; set: (k: string, v: unknown) => void },
    next: () => Promise<void>
  ) => {
    const as = c.req.query("as");
    if (!as) {
      const { UnauthorizedError } = await import("../lib/errors");
      throw new UnauthorizedError();
    }
    c.set("userId", as);
    await next();
  },
  authOptional: async (
    c: { req: { query: (k: string) => string | undefined }; set: (k: string, v: unknown) => void },
    next: () => Promise<void>
  ) => {
    const as = c.req.query("as");
    if (as) c.set("userId", as);
    await next();
  },
}));

vi.mock("../services/comment.service", () => ({
  updateComment: vi.fn(),
  deleteComment: vi.fn(),
  getCommentById: vi.fn(),
}));

vi.mock("../services/engagement.service", () => ({
  toggleEngagement: vi.fn(),
}));

vi.mock("../services/user.service", () => ({
  getUserById: vi.fn().mockResolvedValue({ id: "u1", role: "user" }),
}));

import { commentsRoutes } from "./comments";
import {
  deleteComment,
  getCommentById,
  updateComment,
} from "../services/comment.service";
import { toggleEngagement } from "../services/engagement.service";

function createApp(): Hono {
  const app = new Hono();
  app.onError((err, c) => {
    if (err instanceof AppError) {
      return c.json({ error: err.message, code: err.code }, err.statusCode as 400);
    }
    return c.json({ error: "Internal" }, 500);
  });
  app.use("*", async (c, next) => {
    c.set("db" as never, {} as never);
    await next();
  });
  app.route("/comments", commentsRoutes);
  return app;
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("PATCH /comments/:id", () => {
  it("auth yoksa 401", async () => {
    const app = createApp();
    const res = await app.request("/comments/c1", {
      method: "PATCH",
      body: JSON.stringify({ content: "yeni" }),
      headers: { "content-type": "application/json" },
    });
    expect(res.status).toBe(401);
  });

  it("happy path 200", async () => {
    vi.mocked(updateComment).mockResolvedValueOnce({ id: "c1" } as never);
    const app = createApp();
    const res = await app.request("/comments/c1?as=u1", {
      method: "PATCH",
      body: JSON.stringify({ content: "yeni" }),
      headers: { "content-type": "application/json" },
    });
    expect(res.status).toBe(200);
  });

  it("gecersiz body 400", async () => {
    const app = createApp();
    const res = await app.request("/comments/c1?as=u1", {
      method: "PATCH",
      body: JSON.stringify({ content: "" }),
      headers: { "content-type": "application/json" },
    });
    expect(res.status).toBe(400);
  });
});

describe("DELETE /comments/:id", () => {
  it("auth yoksa 401", async () => {
    const app = createApp();
    const res = await app.request("/comments/c1", { method: "DELETE" });
    expect(res.status).toBe(401);
  });

  it("happy path 200", async () => {
    vi.mocked(deleteComment).mockResolvedValueOnce(undefined);
    const app = createApp();
    const res = await app.request("/comments/c1?as=u1", { method: "DELETE" });
    expect(res.status).toBe(200);
  });
});

describe("POST /comments/:id/like", () => {
  it("auth yoksa 401", async () => {
    const app = createApp();
    const res = await app.request("/comments/c1/like", { method: "POST" });
    expect(res.status).toBe(401);
  });

  it("yorum yok -> 404", async () => {
    vi.mocked(getCommentById).mockResolvedValueOnce(null);
    const app = createApp();
    const res = await app.request("/comments/c1/like?as=u1", { method: "POST" });
    expect(res.status).toBe(404);
  });

  it("toggle on -> 200", async () => {
    vi.mocked(getCommentById).mockResolvedValueOnce({ id: "c1" } as never);
    vi.mocked(toggleEngagement).mockResolvedValueOnce({ active: true, count: 1 });
    const app = createApp();
    const res = await app.request("/comments/c1/like?as=u1", { method: "POST" });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { active: boolean; count: number } };
    expect(body.data.active).toBe(true);
    expect(body.data.count).toBe(1);
  });
});

// silinmeyen tip uyarisi icin
void NotFoundError;
