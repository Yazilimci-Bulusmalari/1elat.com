import { and, eq, sql } from "drizzle-orm";
import { schema, type Database } from "@1elat/db";
import type { EngagementKind, EngagementToggleResult } from "@1elat/shared";
import { generateId } from "../lib/id";

/**
 * EngagementService - Strategy Pattern.
 * Tek toggle implementasyonu, 4 farkli engagement turu (project upvote/like/follow + comment like).
 *
 * Yeni engagement eklemek = STRATEGIES dictionary'e bir entry. Toggle mantigi degismez.
 * SRP: sadece toggle/isEngaged. Yetki ve domain kurallari (kendi projene follow vb.) route'ta.
 * Atomik degil (D1 transaction kisitli) ama idempotent: counter SELECT COUNT(*) ile resync edilir.
 */

interface EngagementStrategy {
  table:
    | typeof schema.projectUpvotes
    | typeof schema.projectLikes
    | typeof schema.projectFollowers
    | typeof schema.commentLikes;
  parentTable: typeof schema.projects | typeof schema.comments;
  parentIdColumn:
    | typeof schema.projectUpvotes.projectId
    | typeof schema.projectLikes.projectId
    | typeof schema.projectFollowers.projectId
    | typeof schema.commentLikes.commentId;
  parentPkColumn: typeof schema.projects.id | typeof schema.comments.id;
  userColumn:
    | typeof schema.projectUpvotes.userId
    | typeof schema.projectLikes.userId
    | typeof schema.projectFollowers.userId
    | typeof schema.commentLikes.userId;
  pkColumn:
    | typeof schema.projectUpvotes.id
    | typeof schema.projectLikes.id
    | typeof schema.projectFollowers.id
    | typeof schema.commentLikes.id;
  counterColumn:
    | typeof schema.projects.upvotesCount
    | typeof schema.projects.likesCount
    | typeof schema.projects.followersCount
    | typeof schema.comments.likesCount;
}

const STRATEGIES: Record<EngagementKind, EngagementStrategy> = {
  project_upvote: {
    table: schema.projectUpvotes,
    parentTable: schema.projects,
    parentIdColumn: schema.projectUpvotes.projectId,
    parentPkColumn: schema.projects.id,
    userColumn: schema.projectUpvotes.userId,
    pkColumn: schema.projectUpvotes.id,
    counterColumn: schema.projects.upvotesCount,
  },
  project_like: {
    table: schema.projectLikes,
    parentTable: schema.projects,
    parentIdColumn: schema.projectLikes.projectId,
    parentPkColumn: schema.projects.id,
    userColumn: schema.projectLikes.userId,
    pkColumn: schema.projectLikes.id,
    counterColumn: schema.projects.likesCount,
  },
  project_follow: {
    table: schema.projectFollowers,
    parentTable: schema.projects,
    parentIdColumn: schema.projectFollowers.projectId,
    parentPkColumn: schema.projects.id,
    userColumn: schema.projectFollowers.userId,
    pkColumn: schema.projectFollowers.id,
    counterColumn: schema.projects.followersCount,
  },
  comment_like: {
    table: schema.commentLikes,
    parentTable: schema.comments,
    parentIdColumn: schema.commentLikes.commentId,
    parentPkColumn: schema.comments.id,
    userColumn: schema.commentLikes.userId,
    pkColumn: schema.commentLikes.id,
    counterColumn: schema.comments.likesCount,
  },
};

/**
 * Toggle engagement: in -> out -> in.
 * Counter parent tabloda sql increment/decrement ile guncellenir.
 * Donus: { active: yeni durum, count: guncel counter }.
 */
export async function toggleEngagement(
  db: Database,
  kind: EngagementKind,
  parentId: string,
  userId: string
): Promise<EngagementToggleResult> {
  const s = STRATEGIES[kind];

  // Var mi?
  const existing = await db
    .select({ id: s.pkColumn })
    .from(s.table as never)
    .where(and(eq(s.parentIdColumn, parentId), eq(s.userColumn, userId)))
    .get();

  let active: boolean;
  if (existing) {
    await db
      .delete(s.table as never)
      .where(and(eq(s.parentIdColumn, parentId), eq(s.userColumn, userId)));
    await db
      .update(s.parentTable as never)
      .set({ [s.counterColumn.name]: sql`max(${s.counterColumn} - 1, 0)` } as never)
      .where(eq(s.parentPkColumn, parentId));
    active = false;
  } else {
    await db.insert(s.table as never).values({
      id: generateId(),
      [s.parentIdColumn.name]: parentId,
      [s.userColumn.name]: userId,
      createdAt: new Date(),
    } as never);
    await db
      .update(s.parentTable as never)
      .set({ [s.counterColumn.name]: sql`${s.counterColumn} + 1` } as never)
      .where(eq(s.parentPkColumn, parentId));
    active = true;
  }

  // Guncel counter
  const parentRow = (await db
    .select({ count: s.counterColumn })
    .from(s.parentTable as never)
    .where(eq(s.parentPkColumn, parentId))
    .get()) as { count: number | null } | undefined;

  return { active, count: parentRow?.count ?? 0 };
}

/**
 * Viewer icin durum sorgusu (detay sayfasinda lazim).
 */
export async function isEngaged(
  db: Database,
  kind: EngagementKind,
  parentId: string,
  userId: string
): Promise<boolean> {
  const s = STRATEGIES[kind];
  const row = await db
    .select({ id: s.pkColumn })
    .from(s.table as never)
    .where(and(eq(s.parentIdColumn, parentId), eq(s.userColumn, userId)))
    .get();
  return Boolean(row);
}
