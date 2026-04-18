import { Hono } from "hono";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppError } from "../lib/errors";

/**
 * Integration testleri /p/:username/:slug/images... endpoint'leri.
 * Auth ve project ownership middleware'leri mock edilir; servis mock'lanir.
 */

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
    const slug = c.req.param("slug");
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

vi.mock("../services/storage.service", () => ({
  createStorageService: vi.fn(() => ({
    upload: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
    getPublicUrl: (k: string) => `https://api.test.com/files/${k}`,
    extractKeyFromUrl: (u: string) => {
      const p = "https://api.test.com/files/";
      return u.startsWith(p) ? u.slice(p.length) : null;
    },
  })),
}));

vi.mock("../services/project-media.service", () => ({
  uploadProjectImage: vi.fn(),
  deleteProjectImage: vi.fn(),
  reorderProjectImages: vi.fn(),
  deleteProjectLogo: vi.fn(),
  listProjectImages: vi.fn(),
}));

import { projectsRoutes } from "./projects";
import {
  uploadProjectImage,
  deleteProjectImage,
  reorderProjectImages,
  deleteProjectLogo,
} from "../services/project-media.service";
import {
  FileTooLargeError,
  MediaLimitExceededError,
  UnsupportedMediaTypeError,
} from "../lib/errors";

function createApp(): Hono {
  const app = new Hono();
  app.onError((err, c) => {
    if (err instanceof AppError) {
      return c.json(
        { error: { message: err.message, code: err.code } },
        err.statusCode as 400
      );
    }
    return c.json({ error: "Internal" }, 500);
  });
  app.use("*", async (c, next) => {
    c.set("db" as never, {} as never);
    // env mock
    (c as unknown as { env: Record<string, unknown> }).env = {
      FILES: {} as never,
      API_URL: "https://api.test.com",
    };
    await next();
  });
  app.route("/", projectsRoutes);
  return app;
}

function makeFormData(opts: {
  file?: { name: string; type: string; bytes?: number };
  kind?: string;
  caption?: string;
}): FormData {
  const fd = new FormData();
  if (opts.file) {
    const blob = new Blob([new Uint8Array(opts.file.bytes ?? 100)], {
      type: opts.file.type,
    });
    fd.set("file", blob, opts.file.name);
  }
  if (opts.kind !== undefined) fd.set("kind", opts.kind);
  if (opts.caption !== undefined) fd.set("caption", opts.caption);
  return fd;
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("POST /p/:u/:s/images - auth & ownership", () => {
  it("auth yok => 401", async () => {
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/images", {
      method: "POST",
      body: makeFormData({ file: { name: "a.png", type: "image/png" }, kind: "gallery" }),
    });
    expect(res.status).toBe(401);
  });

  it("baskasi => 403", async () => {
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/images?as=stranger", {
      method: "POST",
      body: makeFormData({ file: { name: "a.png", type: "image/png" }, kind: "gallery" }),
    });
    expect(res.status).toBe(403);
  });
});

describe("POST /p/:u/:s/images - validation", () => {
  it("file yoksa 400", async () => {
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/images?as=owner-1", {
      method: "POST",
      body: makeFormData({ kind: "gallery" }),
    });
    expect(res.status).toBe(400);
  });

  it("kind yoksa 400", async () => {
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/images?as=owner-1", {
      method: "POST",
      body: makeFormData({ file: { name: "a.png", type: "image/png" } }),
    });
    expect(res.status).toBe(400);
  });

  it("yanlis kind 400", async () => {
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/images?as=owner-1", {
      method: "POST",
      body: makeFormData({
        file: { name: "a.png", type: "image/png" },
        kind: "banner",
      }),
    });
    expect(res.status).toBe(400);
  });
});

describe("POST /p/:u/:s/images - happy + servis hatalari", () => {
  it("gallery happy 201 + image dondurur", async () => {
    vi.mocked(uploadProjectImage).mockResolvedValueOnce({
      kind: "gallery",
      image: {
        id: "img1",
        url: "https://api.test.com/files/projects/p1/images/x.png",
        caption: null,
        sortOrder: 0,
      },
    } as never);
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/images?as=owner-1", {
      method: "POST",
      body: makeFormData({
        file: { name: "a.png", type: "image/png" },
        kind: "gallery",
      }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { data: { id: string } };
    expect(body.data.id).toBe("img1");
  });

  it("logo happy 201 + thumbnailUrl dondurur", async () => {
    vi.mocked(uploadProjectImage).mockResolvedValueOnce({
      kind: "logo",
      thumbnailUrl: "https://api.test.com/files/projects/p1/logo/x.png",
    } as never);
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/images?as=owner-1", {
      method: "POST",
      body: makeFormData({
        file: { name: "a.png", type: "image/png" },
        kind: "logo",
      }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { data: { thumbnailUrl: string } };
    expect(body.data.thumbnailUrl).toContain("/logo/");
  });

  it("FileTooLargeError => 413", async () => {
    vi.mocked(uploadProjectImage).mockRejectedValueOnce(new FileTooLargeError());
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/images?as=owner-1", {
      method: "POST",
      body: makeFormData({
        file: { name: "a.png", type: "image/png" },
        kind: "gallery",
      }),
    });
    expect(res.status).toBe(413);
  });

  it("UnsupportedMediaTypeError => 415", async () => {
    vi.mocked(uploadProjectImage).mockRejectedValueOnce(new UnsupportedMediaTypeError());
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/images?as=owner-1", {
      method: "POST",
      body: makeFormData({
        file: { name: "a.png", type: "image/png" },
        kind: "gallery",
      }),
    });
    expect(res.status).toBe(415);
  });

  it("MediaLimitExceededError => 409", async () => {
    vi.mocked(uploadProjectImage).mockRejectedValueOnce(new MediaLimitExceededError());
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/images?as=owner-1", {
      method: "POST",
      body: makeFormData({
        file: { name: "a.png", type: "image/png" },
        kind: "gallery",
      }),
    });
    expect(res.status).toBe(409);
  });
});

describe("DELETE /p/:u/:s/images/:imageId", () => {
  it("auth yok => 401", async () => {
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/images/img1", {
      method: "DELETE",
    });
    expect(res.status).toBe(401);
  });

  it("baskasi => 403", async () => {
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/images/img1?as=stranger", {
      method: "DELETE",
    });
    expect(res.status).toBe(403);
  });

  it("happy => 204", async () => {
    vi.mocked(deleteProjectImage).mockResolvedValueOnce(undefined);
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/images/img1?as=owner-1", {
      method: "DELETE",
    });
    expect(res.status).toBe(204);
  });
});

describe("PATCH /p/:u/:s/images/reorder", () => {
  it("bos body 400", async () => {
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/images/reorder?as=owner-1", {
      method: "PATCH",
      body: JSON.stringify({}),
      headers: { "content-type": "application/json" },
    });
    expect(res.status).toBe(400);
  });

  it("happy 200", async () => {
    vi.mocked(reorderProjectImages).mockResolvedValueOnce([
      { id: "a", url: "u", caption: null, sortOrder: 0 },
    ] as never);
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/images/reorder?as=owner-1", {
      method: "PATCH",
      body: JSON.stringify({ order: [{ id: "a", sortOrder: 0 }] }),
      headers: { "content-type": "application/json" },
    });
    expect(res.status).toBe(200);
  });
});

describe("DELETE /p/:u/:s/logo", () => {
  it("auth yok => 401", async () => {
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/logo", { method: "DELETE" });
    expect(res.status).toBe(401);
  });
  it("happy => 204", async () => {
    vi.mocked(deleteProjectLogo).mockResolvedValueOnce(undefined);
    const app = createApp();
    const res = await app.request("/p/alice/todo-app/logo?as=owner-1", {
      method: "DELETE",
    });
    expect(res.status).toBe(204);
  });
});
