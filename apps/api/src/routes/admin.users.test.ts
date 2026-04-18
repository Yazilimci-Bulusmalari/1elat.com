import { Hono } from "hono";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppError } from "../lib/errors";

vi.mock("../middleware/auth", () => ({
  authRequired: async (c: { set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set("userId", "admin-1");
    await next();
  },
}));

vi.mock("../middleware/admin", () => ({
  requireAdmin: async (_c: unknown, next: () => Promise<void>) => {
    await next();
  },
}));

vi.mock("../services/admin-stats.service", () => ({
  getAdminStats: vi.fn(),
}));

vi.mock("../services/admin-users.service", () => ({
  listUsers: vi.fn(),
  countAdmins: vi.fn(),
  getUserForAdmin: vi.fn(),
  updateUserAdmin: vi.fn(),
  assertCanModify: vi.fn(),
}));

import { adminRoutes } from "./admin";
import { listUsers } from "../services/admin-users.service";

function createApp(): Hono {
  const app = new Hono();
  app.onError((err, c) => {
    if (err instanceof AppError) {
      return c.json({ error: err.message }, err.statusCode as 400);
    }
    return c.json({ error: "Internal" }, 500);
  });
  app.use("*", async (c, next) => {
    c.set("db" as never, {} as never);
    await next();
  });
  app.route("/admin", adminRoutes);
  return app;
}

beforeEach(() => {
  vi.resetAllMocks();
});

const SAMPLE_USER = {
  id: "u1",
  username: "alice",
  firstName: "Alice",
  lastName: "Doe",
  email: "alice@x.com",
  avatarUrl: null,
  role: "user" as const,
  status: "active" as const,
  lastLoginAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("GET /admin/users", () => {
  it("varsayilan parametrelerle listeler", async () => {
    vi.mocked(listUsers).mockResolvedValueOnce({ users: [SAMPLE_USER], total: 1 });

    const app = createApp();
    const res = await app.request("/admin/users");

    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { users: unknown[]; total: number; page: number; limit: number } };
    expect(body.data.users).toHaveLength(1);
    expect(body.data.total).toBe(1);
    expect(body.data.page).toBe(1);
    expect(body.data.limit).toBe(20);

    expect(listUsers).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ role: "all", status: "all", page: 1, limit: 20 })
    );
  });

  it("search parametresini servise iletir", async () => {
    vi.mocked(listUsers).mockResolvedValueOnce({ users: [], total: 0 });
    const app = createApp();
    await app.request("/admin/users?search=alice");
    expect(listUsers).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ search: "alice" })
    );
  });

  it("role ve status filtrelerini iletir", async () => {
    vi.mocked(listUsers).mockResolvedValueOnce({ users: [], total: 0 });
    const app = createApp();
    await app.request("/admin/users?role=admin&status=suspended");
    expect(listUsers).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ role: "admin", status: "suspended" })
    );
  });

  it("page ve limit kabul eder", async () => {
    vi.mocked(listUsers).mockResolvedValueOnce({ users: [], total: 100 });
    const app = createApp();
    await app.request("/admin/users?page=3&limit=10");
    expect(listUsers).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ page: 3, limit: 10 })
    );
  });

  it("limit > 100 ise 400 doner", async () => {
    const app = createApp();
    const res = await app.request("/admin/users?limit=500");
    expect(res.status).toBe(400);
  });

  it("page < 1 ise 400 doner", async () => {
    const app = createApp();
    const res = await app.request("/admin/users?page=0");
    expect(res.status).toBe(400);
  });

  it("gecersiz role degeri 400 doner", async () => {
    const app = createApp();
    const res = await app.request("/admin/users?role=superadmin");
    expect(res.status).toBe(400);
  });
});
