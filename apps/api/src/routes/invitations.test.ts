import { Hono } from "hono";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppError, ForbiddenError } from "../lib/errors";

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
  authOptional: async () => undefined,
}));

vi.mock("../services/project-member.service", () => ({
  acceptInvitation: vi.fn(),
  cancelInvitation: vi.fn(),
  declineInvitation: vi.fn(),
  listMyInvitations: vi.fn(),
}));

vi.mock("../services/user.service", () => ({
  getUserById: vi.fn().mockResolvedValue({ id: "u1", role: "user" }),
}));

import { invitationsRoutes } from "./invitations";
import {
  acceptInvitation,
  cancelInvitation,
  declineInvitation,
  listMyInvitations,
} from "../services/project-member.service";

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
  app.route("/", invitationsRoutes);
  return app;
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("GET /me/invitations", () => {
  it("auth yoksa 401", async () => {
    const app = createApp();
    const res = await app.request("/me/invitations");
    expect(res.status).toBe(401);
  });

  it("varsayilan pending listeler", async () => {
    vi.mocked(listMyInvitations).mockResolvedValueOnce([]);
    const app = createApp();
    const res = await app.request("/me/invitations?as=u1");
    expect(res.status).toBe(200);
    expect(listMyInvitations).toHaveBeenCalledWith({}, "u1", "pending");
  });

  it("gecersiz status 400", async () => {
    const app = createApp();
    const res = await app.request("/me/invitations?as=u1&status=foo");
    expect(res.status).toBe(400);
  });
});

describe("POST /invitations/:id/accept", () => {
  it("auth yoksa 401", async () => {
    const app = createApp();
    const res = await app.request("/invitations/inv1/accept", { method: "POST" });
    expect(res.status).toBe(401);
  });

  it("happy path 200", async () => {
    vi.mocked(acceptInvitation).mockResolvedValueOnce(undefined);
    const app = createApp();
    const res = await app.request("/invitations/inv1/accept?as=u2", { method: "POST" });
    expect(res.status).toBe(200);
    expect(acceptInvitation).toHaveBeenCalledWith({}, "inv1", "u2");
  });

  it("baska kullanici 403 (service hatasi)", async () => {
    vi.mocked(acceptInvitation).mockRejectedValueOnce(new ForbiddenError());
    const app = createApp();
    const res = await app.request("/invitations/inv1/accept?as=stranger", { method: "POST" });
    expect(res.status).toBe(403);
  });
});

describe("POST /invitations/:id/decline", () => {
  it("happy path 200", async () => {
    vi.mocked(declineInvitation).mockResolvedValueOnce(undefined);
    const app = createApp();
    const res = await app.request("/invitations/inv1/decline?as=u2", { method: "POST" });
    expect(res.status).toBe(200);
  });

  it("auth yoksa 401", async () => {
    const app = createApp();
    const res = await app.request("/invitations/inv1/decline", { method: "POST" });
    expect(res.status).toBe(401);
  });
});

describe("POST /invitations/:id/cancel", () => {
  it("happy path 200", async () => {
    vi.mocked(cancelInvitation).mockResolvedValueOnce(undefined);
    const app = createApp();
    const res = await app.request("/invitations/inv1/cancel?as=owner", { method: "POST" });
    expect(res.status).toBe(200);
  });

  it("yetkisi yok 403 (service)", async () => {
    vi.mocked(cancelInvitation).mockRejectedValueOnce(new ForbiddenError());
    const app = createApp();
    const res = await app.request("/invitations/inv1/cancel?as=stranger", { method: "POST" });
    expect(res.status).toBe(403);
  });
});
