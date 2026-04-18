import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { schema, type Database } from "@1elat/db";
import type { CommentSort, CommentWithAuthor } from "@1elat/shared";
import { generateId } from "../lib/id";
import {
  ForbiddenError,
  NestingTooDeepError,
  NotFoundError,
} from "../lib/errors";

/**
 * CommentService - SRP: yorum CRUD + 1 seviye nesting kurali.
 * HARD DELETE (kullanici karari); replies cascade ile silinir.
 * Project published+isPublic kontrolu listele/yarat akisinda.
 */

type CommentRow = typeof schema.comments.$inferSelect;
type UserRow = typeof schema.users.$inferSelect;

function rowToComment(
  row: CommentRow,
  author: Pick<UserRow, "id" | "username" | "firstName" | "lastName" | "avatarUrl">,
  likedByViewer?: boolean
): CommentWithAuthor {
  return {
    id: row.id,
    projectId: row.projectId,
    authorId: row.authorId,
    author: {
      id: author.id,
      username: author.username,
      firstName: author.firstName,
      lastName: author.lastName,
      avatarUrl: author.avatarUrl,
    },
    parentId: row.parentId,
    content: row.content,
    likesCount: row.likesCount ?? 0,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    likedByViewer,
  };
}

/**
 * Hierarchical liste: top-level + replies (max 1 derinlik).
 */
export async function listComments(
  db: Database,
  projectId: string,
  opts: { sort: CommentSort; viewerId?: string }
): Promise<CommentWithAuthor[]> {
  const orderBy =
    opts.sort === "oldest"
      ? asc(schema.comments.createdAt)
      : opts.sort === "mostLiked"
        ? desc(schema.comments.likesCount)
        : desc(schema.comments.createdAt);

  const rows = await db
    .select({
      comment: schema.comments,
      author: {
        id: schema.users.id,
        username: schema.users.username,
        firstName: schema.users.firstName,
        lastName: schema.users.lastName,
        avatarUrl: schema.users.avatarUrl,
      },
    })
    .from(schema.comments)
    .innerJoin(schema.users, eq(schema.users.id, schema.comments.authorId))
    .where(eq(schema.comments.projectId, projectId))
    .orderBy(orderBy)
    .all();

  // Viewer like seti
  let likedSet = new Set<string>();
  if (opts.viewerId && rows.length > 0) {
    const ids = rows.map((r) => r.comment.id);
    const liked = await db
      .select({ commentId: schema.commentLikes.commentId })
      .from(schema.commentLikes)
      .where(
        and(
          eq(schema.commentLikes.userId, opts.viewerId),
          inArray(schema.commentLikes.commentId, ids)
        )
      )
      .all();
    likedSet = new Set(liked.map((l) => l.commentId));
  }

  const all: CommentWithAuthor[] = rows.map((r) =>
    rowToComment(r.comment, r.author, opts.viewerId ? likedSet.has(r.comment.id) : undefined)
  );

  // Hiyerarsi: top-level + replies (max 1 derinlik garantili).
  const topLevel: CommentWithAuthor[] = [];
  const repliesByParent = new Map<string, CommentWithAuthor[]>();
  for (const c of all) {
    if (c.parentId === null) {
      topLevel.push(c);
    } else {
      const list = repliesByParent.get(c.parentId) ?? [];
      list.push(c);
      repliesByParent.set(c.parentId, list);
    }
  }
  for (const tl of topLevel) {
    tl.replies = repliesByParent.get(tl.id) ?? [];
  }
  return topLevel;
}

export async function createComment(
  db: Database,
  projectId: string,
  authorId: string,
  input: { content: string; parentId?: string | null }
): Promise<CommentWithAuthor> {
  // Project published + isPublic kontrolu
  const project = await db
    .select({
      status: schema.projects.status,
      isPublic: schema.projects.isPublic,
    })
    .from(schema.projects)
    .where(eq(schema.projects.id, projectId))
    .get();
  if (!project) throw new NotFoundError("Project");
  if (project.status !== "published" || project.isPublic === false) {
    throw new ForbiddenError("Bu projeye yorum yapamazsiniz");
  }

  // Nesting kurali: parentId varsa parent.parentId NULL olmali (1 seviye).
  const parentId = input.parentId ?? null;
  if (parentId) {
    const parent = await db
      .select({
        id: schema.comments.id,
        parentId: schema.comments.parentId,
        projectId: schema.comments.projectId,
      })
      .from(schema.comments)
      .where(eq(schema.comments.id, parentId))
      .get();
    if (!parent) throw new NotFoundError("Parent comment");
    if (parent.projectId !== projectId) throw new NotFoundError("Parent comment");
    if (parent.parentId !== null) throw new NestingTooDeepError();
  }

  const id = generateId();
  const now = new Date();
  await db.insert(schema.comments).values({
    id,
    projectId,
    authorId,
    parentId,
    content: input.content,
    likesCount: 0,
    createdAt: now,
    updatedAt: now,
  });

  // commentsCount +1
  await db
    .update(schema.projects)
    .set({ commentsCount: sql`${schema.projects.commentsCount} + 1` })
    .where(eq(schema.projects.id, projectId));

  const created = await db
    .select({
      comment: schema.comments,
      author: {
        id: schema.users.id,
        username: schema.users.username,
        firstName: schema.users.firstName,
        lastName: schema.users.lastName,
        avatarUrl: schema.users.avatarUrl,
      },
    })
    .from(schema.comments)
    .innerJoin(schema.users, eq(schema.users.id, schema.comments.authorId))
    .where(eq(schema.comments.id, id))
    .get();
  if (!created) throw new Error("Comment create failed");
  return rowToComment(created.comment, created.author);
}

export async function updateComment(
  db: Database,
  commentId: string,
  requesterId: string,
  isAdmin: boolean,
  content: string
): Promise<CommentWithAuthor> {
  const row = await db
    .select()
    .from(schema.comments)
    .where(eq(schema.comments.id, commentId))
    .get();
  if (!row) throw new NotFoundError("Comment");
  if (row.authorId !== requesterId && !isAdmin) {
    throw new ForbiddenError("Bu yorumu duzenleyemezsiniz");
  }
  await db
    .update(schema.comments)
    .set({ content, updatedAt: new Date() })
    .where(eq(schema.comments.id, commentId));

  const updated = await db
    .select({
      comment: schema.comments,
      author: {
        id: schema.users.id,
        username: schema.users.username,
        firstName: schema.users.firstName,
        lastName: schema.users.lastName,
        avatarUrl: schema.users.avatarUrl,
      },
    })
    .from(schema.comments)
    .innerJoin(schema.users, eq(schema.users.id, schema.comments.authorId))
    .where(eq(schema.comments.id, commentId))
    .get();
  if (!updated) throw new NotFoundError("Comment");
  return rowToComment(updated.comment, updated.author);
}

/**
 * HARD DELETE. Cascade ile reply'lar otomatik silinir.
 * commentsCount projeden duser (silinen + reply sayisi).
 */
export async function deleteComment(
  db: Database,
  commentId: string,
  requesterId: string,
  isAdmin: boolean
): Promise<void> {
  const row = await db
    .select()
    .from(schema.comments)
    .where(eq(schema.comments.id, commentId))
    .get();
  if (!row) throw new NotFoundError("Comment");
  if (row.authorId !== requesterId && !isAdmin) {
    throw new ForbiddenError("Bu yorumu silemezsiniz");
  }

  // Reply sayisini bul (top-level ise) - counter senkronu icin
  let toRemove = 1;
  if (row.parentId === null) {
    const replies = await db
      .select({ value: sql<number>`count(*)` })
      .from(schema.comments)
      .where(eq(schema.comments.parentId, commentId))
      .get();
    toRemove += replies?.value ?? 0;
  }

  await db.delete(schema.comments).where(eq(schema.comments.id, commentId));

  await db
    .update(schema.projects)
    .set({
      commentsCount: sql`max(${schema.projects.commentsCount} - ${toRemove}, 0)`,
    })
    .where(eq(schema.projects.id, row.projectId));
}

export async function getCommentById(
  db: Database,
  commentId: string
): Promise<CommentRow | null> {
  const row = await db
    .select()
    .from(schema.comments)
    .where(eq(schema.comments.id, commentId))
    .get();
  return row ?? null;
}
