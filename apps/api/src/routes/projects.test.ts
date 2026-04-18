import { Hono } from "hono";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppError, ProjectValidationError } from "../lib/errors";

// Auth mocks: ?as=user1 query param ile authenticated user simule edilir.
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

// Project ownership mock
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
    const slug = c.req.param("slug");
    // Test sozlesmesi: owner her zaman 'owner-1'
    if (userId !== "owner-1") {
      const { ForbiddenError } = await import("../lib/errors");
      throw new ForbiddenError();
    }
    c.set("project", { id: "p1", ownerId: "owner-1", slug, status: "draft" });
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
}));

vi.mock("../services/project-state.service", () => ({
  publishProject: vi.fn(),
  unpublishProject: vi.fn(),
  archiveProject: vi.fn(),
  restoreProject: vi.fn(),
}));

import { projectsRoutes } from "./projects";
import {
  createDraft,
  updateProject,
  getBySlug,
  listPublic,
  listByOwner,
  deleteProject,
} from "../services/project.service";
import {
  publishProject,
  unpublishProject,
  archiveProject,
  restoreProject,
} from "../services/project-state.service";

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

const SAMPLE = {
  id: "p1",
  ownerId: "owner-1",
  slug: "todo-app",
  name: "Todo App",
  status: "draft" as const,
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("POST /projects", () => {
  it("auth yoksa 401", async () => {
    const app = createApp();
    const res = await app.request("/projects", {
      method: "POST",
      body: JSON.stringify({ name: "X" }),
      headers: { "content-type": "application/json" },
    });
    expect(res.status).toBe(401);
  });

  it("auth varsa 201 ve draft olusturur", async () => {
    vi.mocked(createDraft).mockResolvedValueOnce(SAMPLE as never);
    const app = createApp();
    const res = await app.request("/projects?as=owner-1", {
      method: "POST",
      body: JSON.stringify({ name: "Todo App" }),
      headers: { "content-type": "application/json" },
    });
    expect(res.status).toBe(201);
    expect(createDraft).toHaveBeenCalledWith({}, "owner-1", "Todo App");
  });

  it("gecersiz body 400", async () => {
    const app = createApp();
    const res = await app.request("/projects?as=owner-1", {
      method: "POST",
      body: JSON.stringify({ name: "a" }),
      headers: { "content-type": "application/json" },
    });
    expect(res.status).toBe(400);
  });
});

describe("GET /projects", () => {
  it("public liste doner", async () => {
    vi.mocked(listPublic).mockResolvedValueOnce({ items: [], total: 0 });
    const app = createApp();
    const res = await app.request("/projects");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { total: number; page: number } };
    expect(body.data.total).toBe(0);
    expect(body.data.page).toBe(1);
  });
});

describe("GET /me/projects", () => {
  it("auth yoksa 401", async () => {
    const app = createApp();
    const res = await app.request("/me/projects");
    expect(res.status).toBe(401);
  });
  it("auth varsa kendi liste", async () => {
    vi.mocked(listByOwner).mockResolvedValueOnce({ items: [], total: 3 });
    const app = createApp();
    const res = await app.request("/me/projects?as=owner-1");
    expect(res.status).toBe(200);
    expect(listByOwner).toHaveBeenCalledWith({}, "owner-1", expect.any(Object));
  });
});

describe("GET /p/:username/:slug", () => {
  it("bulunamazsa 404", async () => {
    vi.mocked(getBySlug).mockResolvedValueOnce(null);
    const app = createApp();
    const res = await app.request("/p/alice/x");
    expect(res.status).toBe(404);
  });
  it("bulunursa 200", async () => {
    vi.mocked(getBySlug).mockResolvedValueOnce({ ...SAMPLE, status: "published" } as never);
    const app = createApp();
    const res = await app.request("/p/alice/todo-app");
    expect(res.status).toBe(200);
  });
});

describe("PATCH /p/:username/:slug", () => {
  it("baskasi 403", async () => {
    const app = createApp();
    const res = await app.request("/p/alice/todo-app?as=stranger", {
      method: "PATCH",
      body: JSON.stringify({ name: "Yeni" }),
      headers: { "content-type": "application/json" },
    });
    expect(res.status).toBe(403);
  });

  it("owner update gecer", async () => {
    vi.mocked(updateProject).mockResolvedValueOnce({ ...SAMPLE, name: "Yeni" } as never);
    const app = createApp();
    const res = await app.request("/p/alice/todo-app?as=owner-1", {
      method: "PATCH",
      body: JSON.stringify({ name: "Yeni" }),
      headers: { "content-type": "application/json" },
    });
    expect(res.status).toBe(200);
  });

  it("bos body 400", async () => {
    const app = createApp();
    const res = await app.request("/p/alice/todo-app?as=owner-1", {
      method: "PATCH",
      body: JSON.stringify({}),
      headers: { "content-type": "application/json" },
    });
    expect(res.status).toBe(400);
  });
});

describe("State transitions", () => {
  it("publish: 200", async () => {
    vi.mocked(publishProject).mockResolvedValueOnce({
      ...SAMPLE,
      status: "published",
    } as never);
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/publish?as=owner-1", {
      method: "POST",
    });
    expect(res.status).toBe(200);
  });

  it("publish: eksik alan 422 + missingFields", async () => {
    vi.mocked(publishProject).mockRejectedValueOnce(
      new ProjectValidationError(["tagline", "description"])
    );
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/publish?as=owner-1", {
      method: "POST",
    });
    expect(res.status).toBe(422);
    const body = (await res.json()) as {
      error: { code: string; missingFields: string[] };
    };
    expect(body.error.code).toBe("PROJECT_PUBLISH_INVALID");
    expect(body.error.missingFields).toEqual(["tagline", "description"]);
  });

  it("unpublish: 200", async () => {
    vi.mocked(unpublishProject).mockResolvedValueOnce({
      ...SAMPLE,
      status: "draft",
    } as never);
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/unpublish?as=owner-1", {
      method: "POST",
    });
    expect(res.status).toBe(200);
  });

  it("archive: 200", async () => {
    vi.mocked(archiveProject).mockResolvedValueOnce({
      ...SAMPLE,
      status: "archived",
    } as never);
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/archive?as=owner-1", {
      method: "POST",
    });
    expect(res.status).toBe(200);
  });

  it("restore: 200", async () => {
    vi.mocked(restoreProject).mockResolvedValueOnce({
      ...SAMPLE,
      status: "published",
    } as never);
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/restore?as=owner-1", {
      method: "POST",
    });
    expect(res.status).toBe(200);
  });

  it("archive: baskasi 403", async () => {
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/archive?as=stranger", {
      method: "POST",
    });
    expect(res.status).toBe(403);
  });
});

describe("DELETE /p/:username/:slug", () => {
  it("draft silinir, 200", async () => {
    vi.mocked(deleteProject).mockResolvedValueOnce(undefined);
    const app = createApp();
    const res = await app.request("/p/alice/todo-app?as=owner-1", {
      method: "DELETE",
    });
    expect(res.status).toBe(200);
  });

  it("auth yoksa 401", async () => {
    const app = createApp();
    const res = await app.request("/p/alice/todo-app", { method: "DELETE" });
    expect(res.status).toBe(401);
  });
});
