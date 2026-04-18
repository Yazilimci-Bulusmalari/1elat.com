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

// Sadece I/O fonksiyonlarini mockla; assertCanModify gercek implementasyonu route
// icinden cagirilir cunku factory icindeki spread bazen ESM namespace'inden
// fonksiyonlari yutuyor. Bunun yerine importOriginal helper'i ile guvenli sekilde re-export.
vi.mock("../services/admin-users.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/admin-users.service")>();
  return {
    listUsers: vi.fn(),
    countAdmins: vi.fn(),
    getUserForAdmin: vi.fn(),
    updateUserAdmin: vi.fn(),
    assertCanModify: actual.assertCanModify,
  };
});

import { adminRoutes } from "./admin";
import {
  countAdmins,
  getUserForAdmin,
  updateUserAdmin,
} from "../services/admin-users.service";

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
  // resetAllMocks queue'lari (mockResolvedValueOnce) temizler — testler arasi sızıntıyı engeller
  vi.resetAllMocks();
});

const TARGET_USER = {
  id: "u2",
  username: "bob",
  firstName: "Bob",
  lastName: "Smith",
  email: "bob@x.com",
  avatarUrl: null,
  role: "user" as const,
  status: "active" as const,
  lastLoginAt: null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
};

const TARGET_ADMIN = {
  ...TARGET_USER,
  id: "u3",
  role: "admin" as const,
};

const SELF_ADMIN = {
  ...TARGET_USER,
  id: "admin-1",
  role: "admin" as const,
};

function jsonReq(path: string, body: unknown): Request {
  return new Request(`http://localhost${path}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PATCH /admin/users/:id", () => {
  it("happy path: role degisikligi basarili", async () => {
    vi.mocked(getUserForAdmin).mockResolvedValueOnce(TARGET_USER as never);
    vi.mocked(updateUserAdmin).mockResolvedValueOnce({
      ...TARGET_USER,
      role: "admin",
      lastLoginAt: null,
      createdAt: TARGET_USER.createdAt.toISOString(),
    } as never);

    const app = createApp();
    const res = await app.request(jsonReq("/admin/users/u2", { role: "admin" }));

    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { id: string; role: string } };
    expect(body.data.role).toBe("admin");
    expect(updateUserAdmin).toHaveBeenCalledWith(
      expect.anything(),
      "u2",
      { role: "admin" }
    );
  });

  it("happy path: status degisikligi basarili", async () => {
    vi.mocked(getUserForAdmin).mockResolvedValueOnce(TARGET_USER as never);
    vi.mocked(updateUserAdmin).mockResolvedValueOnce({
      ...TARGET_USER,
      status: "suspended",
      lastLoginAt: null,
      createdAt: TARGET_USER.createdAt.toISOString(),
    } as never);

    const app = createApp();
    const res = await app.request(jsonReq("/admin/users/u2", { status: "suspended" }));

    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { status: string } };
    expect(body.data.status).toBe("suspended");
  });

  it("bos govde 400 doner (en az bir alan zorunlu)", async () => {
    vi.mocked(getUserForAdmin).mockResolvedValueOnce(TARGET_USER as never);
    const app = createApp();
    const res = await app.request(jsonReq("/admin/users/u2", {}));
    expect(res.status).toBe(400);
  });

  it("kullanici bulunamazsa 404 doner", async () => {
    vi.mocked(getUserForAdmin).mockResolvedValueOnce(undefined);
    const app = createApp();
    const res = await app.request(jsonReq("/admin/users/ghost", { role: "admin" }));
    expect(res.status).toBe(404);
  });

  it("self-protection: admin kendi rolunu degistiremez (400)", async () => {
    vi.mocked(getUserForAdmin).mockResolvedValueOnce(SELF_ADMIN as never);
    vi.mocked(countAdmins).mockResolvedValueOnce(5); // last-admin degil
    const app = createApp();
    const res = await app.request(jsonReq("/admin/users/admin-1", { role: "user" }));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain("Kendi rolunuzu");
    expect(updateUserAdmin).not.toHaveBeenCalled();
  });

  it("self-protection: admin kendi hesabini suspended yapamaz (400)", async () => {
    vi.mocked(getUserForAdmin).mockResolvedValueOnce(SELF_ADMIN as never);
    const app = createApp();
    const res = await app.request(
      jsonReq("/admin/users/admin-1", { status: "suspended" })
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain("askiya");
    expect(updateUserAdmin).not.toHaveBeenCalled();
  });

  it("last-admin protection: tek admin'i user'a dusurmek 400 doner", async () => {
    vi.mocked(getUserForAdmin).mockResolvedValueOnce(TARGET_ADMIN as never);
    vi.mocked(countAdmins).mockResolvedValueOnce(1);

    const app = createApp();
    const res = await app.request(jsonReq("/admin/users/u3", { role: "user" }));

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain("en az bir admin");
    expect(updateUserAdmin).not.toHaveBeenCalled();
  });

  it("birden fazla admin varsa downgrade serbesttir", async () => {
    vi.mocked(getUserForAdmin).mockResolvedValueOnce(TARGET_ADMIN as never);
    vi.mocked(countAdmins).mockResolvedValueOnce(3);
    vi.mocked(updateUserAdmin).mockResolvedValueOnce({
      ...TARGET_ADMIN,
      role: "user",
      lastLoginAt: null,
      createdAt: TARGET_ADMIN.createdAt.toISOString(),
    } as never);

    const app = createApp();
    const res = await app.request(jsonReq("/admin/users/u3", { role: "user" }));

    expect(res.status).toBe(200);
    expect(updateUserAdmin).toHaveBeenCalled();
  });

  it("gecersiz role degeri 400 doner", async () => {
    vi.mocked(getUserForAdmin).mockResolvedValueOnce(TARGET_USER as never);
    const app = createApp();
    const res = await app.request(jsonReq("/admin/users/u2", { role: "superuser" }));
    expect(res.status).toBe(400);
  });
});

describe("assertCanModify guard", () => {
  it("ayri test: tum koşullar kapsanir", async () => {
    const { assertCanModify } = await vi.importActual<
      typeof import("../services/admin-users.service")
    >("../services/admin-users.service");

    // Self role change
    expect(
      assertCanModify({
        actorId: "a",
        target: { id: "a", role: "admin", status: "active" },
        patch: { role: "user" },
        totalAdmins: 5,
      })
    ).toEqual({ ok: false, reason: expect.stringContaining("rolunuzu") });

    // Self suspend
    expect(
      assertCanModify({
        actorId: "a",
        target: { id: "a", role: "admin", status: "active" },
        patch: { status: "suspended" },
        totalAdmins: 5,
      })
    ).toEqual({ ok: false, reason: expect.stringContaining("askiya") });

    // Last admin downgrade
    expect(
      assertCanModify({
        actorId: "a",
        target: { id: "b", role: "admin", status: "active" },
        patch: { role: "user" },
        totalAdmins: 1,
      })
    ).toEqual({ ok: false, reason: expect.stringContaining("en az bir admin") });

    // Happy path
    expect(
      assertCanModify({
        actorId: "a",
        target: { id: "b", role: "user", status: "active" },
        patch: { role: "admin" },
        totalAdmins: 5,
      })
    ).toEqual({ ok: true });
  });
});
