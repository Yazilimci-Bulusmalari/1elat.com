import { Hono, type Context } from "hono";
import {
  createProjectSchema,
  updateProjectSchema,
  listProjectsQuerySchema,
  listMyProjectsQuerySchema,
  createCommentSchema,
  createInvitationSchema,
} from "@1elat/shared";
import type { CommentSort, InvitationStatus } from "@1elat/shared";
import { authOptional, authRequired } from "../middleware/auth";
import { requireProjectOwner } from "../middleware/project";
import {
  CannotFollowOwnProjectError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../lib/errors";
import {
  createDraft,
  deleteProject,
  getBySlug,
  getProjectAndOwnerByUsernameSlug,
  listByOwner,
  listPublic,
  updateProject,
} from "../services/project.service";
import { toggleEngagement } from "../services/engagement.service";
import {
  createComment,
  listComments,
} from "../services/comment.service";
import {
  createInvitation,
  listProjectInvitations,
  listProjectMembers,
  removeProjectMember,
} from "../services/project-member.service";
import { getUserById } from "../services/user.service";
import {
  archiveProject,
  publishProject,
  restoreProject,
  unpublishProject,
} from "../services/project-state.service";
import {
  deleteProjectImage,
  deleteProjectLogo,
  listProjectImages,
  reorderProjectImages,
  uploadProjectImage,
} from "../services/project-media.service";
import { createStorageService } from "../services/storage.service";
import {
  imageUploadOptionsSchema,
  reorderImagesSchema,
} from "@1elat/shared";
import type { AppEnv } from "../types";

export const projectsRoutes = new Hono<AppEnv>();

/**
 * POST /projects - taslak olustur. Body: { name }.
 */
projectsRoutes.post("/projects", authRequired, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Gecersiz parametre");
  }
  const userId = c.get("userId");
  const db = c.get("db");
  const project = await createDraft(db, userId, parsed.data.name);
  c.header("Location", `/p/${userId}/${project.slug}`);
  return c.json({ data: project, error: null }, 201);
});

/**
 * GET /projects - public listeleme.
 */
projectsRoutes.get("/projects", authOptional, async (c) => {
  const parsed = listProjectsQuerySchema.safeParse({
    category: c.req.query("category"),
    stage: c.req.query("stage"),
    tag: c.req.query("tag"),
    technology: c.req.query("technology"),
    search: c.req.query("search"),
    sort: c.req.query("sort") ?? undefined,
    page: c.req.query("page") ?? undefined,
    limit: c.req.query("limit") ?? undefined,
  });
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Gecersiz parametre");
  }
  const db = c.get("db");
  const result = await listPublic(db, parsed.data);
  return c.json({
    data: {
      items: result.items,
      total: result.total,
      page: parsed.data.page,
      limit: parsed.data.limit,
    },
    error: null,
  });
});

/**
 * GET /me/projects - kendi tum projelerim.
 */
projectsRoutes.get("/me/projects", authRequired, async (c) => {
  const parsed = listMyProjectsQuerySchema.safeParse({
    status: c.req.query("status") ?? undefined,
    search: c.req.query("search"),
    page: c.req.query("page") ?? undefined,
    limit: c.req.query("limit") ?? undefined,
  });
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Gecersiz parametre");
  }
  const userId = c.get("userId");
  const db = c.get("db");
  const result = await listByOwner(db, userId, parsed.data);
  return c.json({
    data: {
      items: result.items,
      total: result.total,
      page: parsed.data.page,
      limit: parsed.data.limit,
    },
    error: null,
  });
});

/**
 * GET /p/:username/:slug - detay.
 */
projectsRoutes.get("/p/:username/:slug", authOptional, async (c) => {
  const username = c.req.param("username");
  const slug = c.req.param("slug");
  const db = c.get("db");
  const viewerId = c.get("userId") as string | undefined;
  const project = await getBySlug(db, username, slug, viewerId);
  if (!project) throw new NotFoundError("Project");
  return c.json({ data: project, error: null });
});

/**
 * PATCH /p/:username/:slug - kismi update.
 */
projectsRoutes.patch(
  "/p/:username/:slug",
  authRequired,
  requireProjectOwner,
  async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? "Gecersiz parametre");
    }
    const project = c.get("project");
    if (parsed.data.slug && parsed.data.slug !== project.slug && project.status === "published") {
      throw new ConflictError("Yayindaki projenin slug'i degistirilemez");
    }
    const db = c.get("db");
    const updated = await updateProject(db, project.id, {
      ...parsed.data,
      startDate: parsed.data.startDate
        ? new Date(parsed.data.startDate)
        : (parsed.data.startDate as null | undefined),
    });
    return c.json({ data: updated, error: null });
  }
);

/**
 * State machine endpoint'leri.
 */
projectsRoutes.post(
  "/p/:username/:slug/publish",
  authRequired,
  requireProjectOwner,
  async (c) => {
    const project = c.get("project");
    const db = c.get("db");
    const updated = await publishProject(db, project.id);
    return c.json({ data: updated, error: null });
  }
);

projectsRoutes.post(
  "/p/:username/:slug/unpublish",
  authRequired,
  requireProjectOwner,
  async (c) => {
    const project = c.get("project");
    const db = c.get("db");
    const updated = await unpublishProject(db, project.id);
    return c.json({ data: updated, error: null });
  }
);

projectsRoutes.post(
  "/p/:username/:slug/archive",
  authRequired,
  requireProjectOwner,
  async (c) => {
    const project = c.get("project");
    const db = c.get("db");
    const updated = await archiveProject(db, project.id);
    return c.json({ data: updated, error: null });
  }
);

projectsRoutes.post(
  "/p/:username/:slug/restore",
  authRequired,
  requireProjectOwner,
  async (c) => {
    const project = c.get("project");
    const db = c.get("db");
    const updated = await restoreProject(db, project.id);
    return c.json({ data: updated, error: null });
  }
);

projectsRoutes.delete(
  "/p/:username/:slug",
  authRequired,
  requireProjectOwner,
  async (c) => {
    const project = c.get("project");
    const db = c.get("db");
    await deleteProject(db, project.id);
    return c.json({ data: { success: true }, error: null });
  }
);

/**
 * Medya endpoint'leri.
 * Decorator chain: authRequired -> requireProjectOwner -> handler.
 */

/** POST /p/:username/:slug/images - multipart upload (file, kind, caption?). */
projectsRoutes.post(
  "/p/:username/:slug/images",
  authRequired,
  requireProjectOwner,
  async (c) => {
    const form = await c.req.parseBody().catch(() => ({}) as Record<string, unknown>);
    const file = form.file as File | undefined;
    if (!file || typeof (file as File).arrayBuffer !== "function") {
      throw new ValidationError("file alani gerekli (multipart/form-data)");
    }

    const optsParsed = imageUploadOptionsSchema.safeParse({
      kind: form.kind,
      caption: form.caption,
    });
    if (!optsParsed.success) {
      throw new ValidationError(
        optsParsed.error.issues[0]?.message ?? "Gecersiz parametre"
      );
    }

    const project = c.get("project");
    const db = c.get("db");
    const storage = createStorageService({
      bucket: c.env.FILES,
      baseUrl: c.env.API_URL,
    });

    const buf = await file.arrayBuffer();
    const result = await uploadProjectImage(
      { db, storage },
      project.id,
      {
        name: file.name,
        type: file.type,
        size: file.size,
        body: buf,
      },
      optsParsed.data
    );

    if (result.kind === "logo") {
      return c.json({ data: { thumbnailUrl: result.thumbnailUrl }, error: null }, 201);
    }
    return c.json({ data: result.image, error: null }, 201);
  }
);

/** DELETE /p/:username/:slug/images/:imageId */
projectsRoutes.delete(
  "/p/:username/:slug/images/:imageId",
  authRequired,
  requireProjectOwner,
  async (c) => {
    const imageId = c.req.param("imageId");
    if (!imageId) throw new NotFoundError("Image");
    const project = c.get("project");
    const db = c.get("db");
    const storage = createStorageService({
      bucket: c.env.FILES,
      baseUrl: c.env.API_URL,
    });
    await deleteProjectImage({ db, storage }, project.id, imageId);
    return c.body(null, 204);
  }
);

/** PATCH /p/:username/:slug/images/reorder */
projectsRoutes.patch(
  "/p/:username/:slug/images/reorder",
  authRequired,
  requireProjectOwner,
  async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const parsed = reorderImagesSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? "Gecersiz parametre");
    }
    const project = c.get("project");
    const db = c.get("db");
    const storage = createStorageService({
      bucket: c.env.FILES,
      baseUrl: c.env.API_URL,
    });
    const list = await reorderProjectImages(
      { db, storage },
      project.id,
      parsed.data.order
    );
    return c.json({ data: list, error: null });
  }
);

/** GET /p/:username/:slug/images - basit listeleme (owner ve admin disinda public ise herkes okuyabilir;
 * bu fazda owner-gated tutuyoruz cunku detay endpoint zaten images iceriyor olacak ileride). */
projectsRoutes.get(
  "/p/:username/:slug/images",
  authRequired,
  requireProjectOwner,
  async (c) => {
    const project = c.get("project");
    const db = c.get("db");
    const storage = createStorageService({
      bucket: c.env.FILES,
      baseUrl: c.env.API_URL,
    });
    const list = await listProjectImages({ db, storage }, project.id);
    return c.json({ data: list, error: null });
  }
);

/** DELETE /p/:username/:slug/logo */
projectsRoutes.delete(
  "/p/:username/:slug/logo",
  authRequired,
  requireProjectOwner,
  async (c) => {
    const project = c.get("project");
    const db = c.get("db");
    const storage = createStorageService({
      bucket: c.env.FILES,
      baseUrl: c.env.API_URL,
    });
    await deleteProjectLogo({ db, storage }, project.id);
    return c.body(null, 204);
  }
);

/**
 * Engagement & members helper - publik erisim icin proje cozumler.
 */
async function resolveProject(
  c: Context<AppEnv>
): Promise<{ id: string; ownerId: string; status: string; isPublic: boolean }> {
  const username = c.req.param("username");
  const slug = c.req.param("slug");
  if (!username || !slug) throw new NotFoundError("Project");
  const db = c.get("db");
  const found = await getProjectAndOwnerByUsernameSlug(db, username, slug);
  if (!found) throw new NotFoundError("Project");
  return {
    id: found.project.id,
    ownerId: found.project.ownerId,
    status: found.project.status,
    isPublic: found.project.isPublic ?? true,
  };
}

/** POST /p/:username/:slug/upvote - toggle (auth) */
projectsRoutes.post("/p/:username/:slug/upvote", authRequired, async (c) => {
  const project = await resolveProject(c);
  if (project.status !== "published" || !project.isPublic) {
    throw new ForbiddenError("Bu projeye oy veremezsiniz");
  }
  const userId = c.get("userId");
  const db = c.get("db");
  const result = await toggleEngagement(db, "project_upvote", project.id, userId);
  return c.json({ data: result, error: null });
});

/** POST /p/:username/:slug/like - toggle (auth) */
projectsRoutes.post("/p/:username/:slug/like", authRequired, async (c) => {
  const project = await resolveProject(c);
  if (project.status !== "published" || !project.isPublic) {
    throw new ForbiddenError("Bu projeyi begenemezsiniz");
  }
  const userId = c.get("userId");
  const db = c.get("db");
  const result = await toggleEngagement(db, "project_like", project.id, userId);
  return c.json({ data: result, error: null });
});

/** POST /p/:username/:slug/follow - toggle (auth, kendi projesine 422) */
projectsRoutes.post("/p/:username/:slug/follow", authRequired, async (c) => {
  const project = await resolveProject(c);
  if (project.status !== "published" || !project.isPublic) {
    throw new ForbiddenError("Bu projeyi takip edemezsiniz");
  }
  const userId = c.get("userId");
  if (project.ownerId === userId) throw new CannotFollowOwnProjectError();
  const db = c.get("db");
  const result = await toggleEngagement(db, "project_follow", project.id, userId);
  return c.json({ data: result, error: null });
});

/** GET /p/:username/:slug/comments?sort=newest|oldest|mostLiked */
projectsRoutes.get("/p/:username/:slug/comments", authOptional, async (c) => {
  const project = await resolveProject(c);
  const sortQuery = c.req.query("sort");
  const sort: CommentSort =
    sortQuery === "oldest" || sortQuery === "mostLiked" ? sortQuery : "newest";
  const viewerId = c.get("userId") as string | undefined;
  const db = c.get("db");
  const items = await listComments(db, project.id, { sort, viewerId });
  return c.json({ data: { items, total: items.length }, error: null });
});

/** POST /p/:username/:slug/comments */
projectsRoutes.post("/p/:username/:slug/comments", authRequired, async (c) => {
  const project = await resolveProject(c);
  const body = await c.req.json().catch(() => ({}));
  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Gecersiz parametre");
  }
  const userId = c.get("userId");
  const db = c.get("db");
  const created = await createComment(db, project.id, userId, {
    content: parsed.data.content,
    parentId: parsed.data.parentId ?? null,
  });
  return c.json({ data: created, error: null }, 201);
});

/** GET /p/:username/:slug/members - publik */
projectsRoutes.get("/p/:username/:slug/members", authOptional, async (c) => {
  const project = await resolveProject(c);
  const db = c.get("db");
  const items = await listProjectMembers(db, project.id);
  return c.json({ data: { items, total: items.length }, error: null });
});

/** GET /p/:username/:slug/invitations - sadece owner/admin */
projectsRoutes.get(
  "/p/:username/:slug/invitations",
  authRequired,
  requireProjectOwner,
  async (c) => {
    const project = c.get("project");
    const db = c.get("db");
    const statusQ = c.req.query("status");
    const status =
      statusQ === "accepted" ||
      statusQ === "declined" ||
      statusQ === "cancelled" ||
      statusQ === "pending"
        ? (statusQ as InvitationStatus)
        : undefined;
    const items = await listProjectInvitations(db, project.id, status);
    return c.json({ data: { items, total: items.length }, error: null });
  }
);

/** POST /p/:username/:slug/invitations - sadece owner */
projectsRoutes.post(
  "/p/:username/:slug/invitations",
  authRequired,
  requireProjectOwner,
  async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const parsed = createInvitationSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? "Gecersiz parametre");
    }
    const project = c.get("project");
    const userId = c.get("userId");
    const db = c.get("db");
    const created = await createInvitation(
      db,
      project.id,
      userId,
      parsed.data.inviteeUsername,
      parsed.data.role,
      parsed.data.message
    );
    return c.json({ data: created, error: null }, 201);
  }
);

/** DELETE /p/:username/:slug/members/:userId - owner herkesi cikarir, member kendini cikarir */
projectsRoutes.delete(
  "/p/:username/:slug/members/:userId",
  authRequired,
  async (c) => {
    const project = await resolveProject(c);
    const targetUserId = c.req.param("userId");
    if (!targetUserId) throw new NotFoundError("Member");
    const requesterId = c.get("userId");
    const db = c.get("db");
    const me = await getUserById(db, requesterId);
    const isAdmin = me?.role === "admin";
    await removeProjectMember(db, project.id, targetUserId, requesterId, isAdmin);
    return c.json({ data: { success: true }, error: null });
  }
);
