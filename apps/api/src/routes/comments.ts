import { Hono } from "hono";
import { updateCommentSchema } from "@1elat/shared";
import { authRequired } from "../middleware/auth";
import { NotFoundError, ValidationError } from "../lib/errors";
import {
  deleteComment,
  getCommentById,
  updateComment,
} from "../services/comment.service";
import { toggleEngagement } from "../services/engagement.service";
import { getUserById } from "../services/user.service";
import type { AppEnv } from "../types";

export const commentsRoutes = new Hono<AppEnv>();

/**
 * PATCH /comments/:id - sadece yazar veya admin.
 */
commentsRoutes.patch("/:id", authRequired, async (c) => {
  const id = c.req.param("id");
  if (!id) throw new NotFoundError("Comment");
  const body = await c.req.json().catch(() => ({}));
  const parsed = updateCommentSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Gecersiz parametre");
  }
  const userId = c.get("userId");
  const db = c.get("db");
  const me = await getUserById(db, userId);
  const isAdmin = me?.role === "admin";
  const updated = await updateComment(db, id, userId, isAdmin, parsed.data.content);
  return c.json({ data: updated, error: null });
});

/**
 * DELETE /comments/:id - hard delete (cascade).
 */
commentsRoutes.delete("/:id", authRequired, async (c) => {
  const id = c.req.param("id");
  if (!id) throw new NotFoundError("Comment");
  const userId = c.get("userId");
  const db = c.get("db");
  const me = await getUserById(db, userId);
  const isAdmin = me?.role === "admin";
  await deleteComment(db, id, userId, isAdmin);
  return c.json({ data: { success: true }, error: null });
});

/**
 * POST /comments/:id/like - toggle.
 */
commentsRoutes.post("/:id/like", authRequired, async (c) => {
  const id = c.req.param("id");
  if (!id) throw new NotFoundError("Comment");
  const userId = c.get("userId");
  const db = c.get("db");
  const existing = await getCommentById(db, id);
  if (!existing) throw new NotFoundError("Comment");
  const result = await toggleEngagement(db, "comment_like", id, userId);
  return c.json({ data: result, error: null });
});
