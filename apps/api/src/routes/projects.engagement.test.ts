import { Hono } from "hono";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  AppError,
  CannotFollowOwnProjectError,
  ProjectValidationError,
} from "../lib/errors";

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

vi.mock("../middleware/project", () => ({
  requireProjectOwner: async (
    c: {
      req: { param: (k: string) => string | undefined };
      get: (k: string) => unknown;
      set: (k: string, v: unknown) => void;
    },
    next: () => Promise<void>
  ) => {
    const userId = c.get("userId") as string | undefined;
    if (!userId) {
      const { UnauthorizedError } = await import("../lib/errors");
      throw new UnauthorizedError();
    }
    if (userId !== "owner-1") {
      const { ForbiddenError } = await import("../lib/errors");
      throw new ForbiddenError();
    }
    c.set("project", { id: "p1", ownerId: "owner-1", slug: "todo-app", status: "published" });
    c.set("projectOwner", { id: "owner-1", username: "alice" });
    await next();
  },
}));

vi.mock("../services/project.service", () => ({
  createDraft: vi.fn(),
  updateProject: vi.fn(),
  getBySlug: vi.fn(),
  listPublic: vi.fn(),
  listByOwner: vi.fn(),
  deleteProject: vi.fn(),
  getProjectAndOwnerByUsernameSlug: vi.fn(),
}));

vi.mock("../services/project-state.service", () => ({
  publishProject: vi.fn(),
  unpublishProject: vi.fn(),
  archiveProject: vi.fn(),
  restoreProject: vi.fn(),
}));

vi.mock("../services/engagement.service", () => ({
  toggleEngagement: vi.fn(),
}));

vi.mock("../services/comment.service", () => ({
  createComment: vi.fn(),
  listComments: vi.fn(),
}));

vi.mock("../services/project-member.service", () => ({
  createInvitation: vi.fn(),
  listProjectInvitations: vi.fn(),
  listProjectMembers: vi.fn(),
  removeProjectMember: vi.fn(),
}));

vi.mock("../services/user.service", () => ({
  getUserById: vi.fn().mockResolvedValue({ id: "u1", role: "user" }),
}));

import { projectsRoutes } from "./projects";
import { getProjectAndOwnerByUsernameSlug } from "../services/project.service";
import { toggleEngagement } from "../services/engagement.service";
import { createComment, listComments } from "../services/comment.service";
import {
  createInvitation,
  listProjectInvitations,
  listProjectMembers,
  removeProjectMember,
} from "../services/project-member.service";

function createApp(): Hono {
  const app = new Hono();
  app.onError((err, c) => {
    if (err instanceof ProjectValidationError) {
      return c.json(
        { data: null, error: { code: err.code, missingFields: err.missingFields } },
        err.statusCode as 422
      );
    }
    if (err instanceof AppError) {
      return c.json({ error: err.message, code: err.code }, err.statusCode as 400);
    }
    return c.json({ error: "Internal" }, 500);
  });
  app.use("*", async (c, next) => {
    c.set("db" as never, {} as never);
    await next();
  });
  app.route("/", projectsRoutes);
  return app;
}

const PUBLISHED = {
  project: {
    id: "p1",
    ownerId: "owner-1",
    status: "published",
    isPublic: true,
    slug: "todo-app",
  },
  owner: { id: "owner-1", username: "alice" },
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getProjectAndOwnerByUsernameSlug).mockResolvedValue(PUBLISHED as never);
});

describe("POST /p/:username/:slug/upvote", () => {
  it("auth yoksa 401", async () => {
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/upvote", { method: "POST" });
    expect(res.status).toBe(401);
  });
  it("toggle 200", async () => {
    vi.mocked(toggleEngagement).mockResolvedValueOnce({ active: true, count: 1 });
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/upvote?as=u9", { method: "POST" });
    expect(res.status).toBe(200);
    expect(toggleEngagement).toHaveBeenCalledWith({}, "project_upvote", "p1", "u9");
  });
  it("draft proje 403", async () => {
    vi.mocked(getProjectAndOwnerByUsernameSlug).mockResolvedValueOnce({
      project: { ...PUBLISHED.project, status: "draft" },
      owner: PUBLISHED.owner,
    } as never);
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/upvote?as=u9", { method: "POST" });
    expect(res.status).toBe(403);
  });
});

describe("POST /p/:username/:slug/like", () => {
  it("toggle 200", async () => {
    vi.mocked(toggleEngagement).mockResolvedValueOnce({ active: false, count: 0 });
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/like?as=u9", { method: "POST" });
    expect(res.status).toBe(200);
  });
});

describe("POST /p/:username/:slug/follow", () => {
  it("baska kullanici toggle 200", async () => {
    vi.mocked(toggleEngagement).mockResolvedValueOnce({ active: true, count: 1 });
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/follow?as=u9", { method: "POST" });
    expect(res.status).toBe(200);
  });

  it("kendi projesine follow -> 422", async () => {
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/follow?as=owner-1", { method: "POST" });
    expect(res.status).toBe(422);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("CANNOT_FOLLOW_OWN_PROJECT");
  });

  it("auth yoksa 401", async () => {
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/follow", { method: "POST" });
    expect(res.status).toBe(401);
  });
});

describe("GET /p/:username/:slug/comments", () => {
  it("listele 200", async () => {
    vi.mocked(listComments).mockResolvedValueOnce([]);
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/comments");
    expect(res.status).toBe(200);
  });

  it("sort=mostLiked iletilir", async () => {
    vi.mocked(listComments).mockResolvedValueOnce([]);
    const app = createApp();
    await app.request("/p/alice/todo-app/comments?sort=mostLiked");
    expect(listComments).toHaveBeenCalledWith({}, "p1", expect.objectContaining({ sort: "mostLiked" }));
  });
});

describe("POST /p/:username/:slug/comments", () => {
  it("auth yoksa 401", async () => {
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/comments", {
      method: "POST",
      body: JSON.stringify({ content: "hi" }),
      headers: { "content-type": "application/json" },
    });
    expect(res.status).toBe(401);
  });

  it("happy path 201", async () => {
    vi.mocked(createComment).mockResolvedValueOnce({ id: "c1" } as never);
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/comments?as=u9", {
      method: "POST",
      body: JSON.stringify({ content: "hi" }),
      headers: { "content-type": "application/json" },
    });
    expect(res.status).toBe(201);
  });

  it("bos content 400", async () => {
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/comments?as=u9", {
      method: "POST",
      body: JSON.stringify({ content: "" }),
      headers: { "content-type": "application/json" },
    });
    expect(res.status).toBe(400);
  });

  it("ikinci seviye reply 422 (service hatasi)", async () => {
    const { NestingTooDeepError } = await import("../lib/errors");
    vi.mocked(createComment).mockRejectedValueOnce(new NestingTooDeepError());
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/comments?as=u9", {
      method: "POST",
      body: JSON.stringify({ content: "x", parentId: "c2" }),
      headers: { "content-type": "application/json" },
    });
    expect(res.status).toBe(422);
  });
});

describe("GET /p/:username/:slug/members", () => {
  it("publik liste 200", async () => {
    vi.mocked(listProjectMembers).mockResolvedValueOnce([]);
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/members");
    expect(res.status).toBe(200);
  });
});

describe("GET /p/:username/:slug/invitations", () => {
  it("auth yoksa 401", async () => {
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/invitations");
    expect(res.status).toBe(401);
  });
  it("baskasi 403", async () => {
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/invitations?as=stranger");
    expect(res.status).toBe(403);
  });
  it("owner 200", async () => {
    vi.mocked(listProjectInvitations).mockResolvedValueOnce([]);
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/invitations?as=owner-1");
    expect(res.status).toBe(200);
  });
});

describe("POST /p/:username/:slug/invitations", () => {
  it("baskasi 403", async () => {
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/invitations?as=stranger", {
      method: "POST",
      body: JSON.stringify({ inviteeUsername: "bob", role: "dev" }),
      headers: { "content-type": "application/json" },
    });
    expect(res.status).toBe(403);
  });

  it("owner 201", async () => {
    vi.mocked(createInvitation).mockResolvedValueOnce({ id: "inv1" } as never);
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/invitations?as=owner-1", {
      method: "POST",
      body: JSON.stringify({ inviteeUsername: "bob", role: "dev" }),
      headers: { "content-type": "application/json" },
    });
    expect(res.status).toBe(201);
  });

  it("eksik body 400", async () => {
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/invitations?as=owner-1", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "content-type": "application/json" },
    });
    expect(res.status).toBe(400);
  });
});

describe("DELETE /p/:username/:slug/members/:userId", () => {
  it("auth yoksa 401", async () => {
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/members/u9", { method: "DELETE" });
    expect(res.status).toBe(401);
  });

  it("owner cikarir 200", async () => {
    vi.mocked(removeProjectMember).mockResolvedValueOnce(undefined);
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/members/u9?as=owner-1", {
      method: "DELETE",
    });
    expect(res.status).toBe(200);
  });

  it("member kendini cikarabilir 200", async () => {
    vi.mocked(removeProjectMember).mockResolvedValueOnce(undefined);
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/members/u9?as=u9", {
      method: "DELETE",
    });
    expect(res.status).toBe(200);
  });
});

void CannotFollowOwnProjectError;
