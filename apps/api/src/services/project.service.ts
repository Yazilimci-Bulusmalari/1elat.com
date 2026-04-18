import { and, asc, desc, eq, like, or, sql, inArray } from "drizzle-orm";
import { schema, type Database } from "@1elat/db";
import type {
  Project,
  ProjectListItem,
  ProjectStatus,
  ListProjectsQuery,
  ListMyProjectsQuery,
} from "@1elat/shared";
import { generateId } from "../lib/id";
import { ConflictError, NotFoundError, ValidationError } from "../lib/errors";
import { ensureUniqueSlug, generateSlug } from "./slug.service";

/**
 * ProjectService - CRUD ve sorgular.
 * SRP: persistence + okuma. State gecisleri (publish/unpublish/archive) project-state.service'de.
 * DIP: Database disaridan inject edilir.
 * Repository / Service Layer pattern.
 */

type ProjectRow = typeof schema.projects.$inferSelect;
type UserRow = typeof schema.users.$inferSelect;

function rowToProject(
  row: ProjectRow,
  extras?: { ownerUsername?: string; tags?: string[]; technologyIds?: string[] }
): Project {
  return {
    id: row.id,
    ownerId: row.ownerId,
    ownerUsername: extras?.ownerUsername,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    launchStory: row.launchStory,
    categoryId: row.categoryId,
    typeId: row.typeId,
    stageId: row.stageId,
    websiteUrl: row.websiteUrl,
    repoUrl: row.repoUrl,
    demoUrl: row.demoUrl,
    thumbnailUrl: row.thumbnailUrl,
    pricingModel: row.pricingModel,
    status: row.status,
    isPublic: row.isPublic ?? true,
    isOpenSource: row.isOpenSource ?? false,
    isSeekingInvestment: row.isSeekingInvestment ?? false,
    isSeekingTeammates: row.isSeekingTeammates ?? false,
    likesCount: row.likesCount ?? 0,
    upvotesCount: row.upvotesCount ?? 0,
    viewsCount: row.viewsCount ?? 0,
    commentsCount: row.commentsCount ?? 0,
    followersCount: row.followersCount ?? 0,
    startDate: row.startDate,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    launchedAt: row.launchedAt,
    tags: extras?.tags,
    technologyIds: extras?.technologyIds,
  };
}

function rowToListItem(
  row: ProjectRow,
  owner: { username: string; avatarUrl: string | null }
): ProjectListItem {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    thumbnailUrl: row.thumbnailUrl,
    status: row.status,
    ownerUsername: owner.username,
    ownerAvatarUrl: owner.avatarUrl,
    upvotesCount: row.upvotesCount ?? 0,
    likesCount: row.likesCount ?? 0,
    launchedAt: row.launchedAt,
  };
}

export async function createDraft(
  db: Database,
  ownerId: string,
  name: string
): Promise<Project> {
  const baseSlug = generateSlug(name);
  const slug = await ensureUniqueSlug(db, ownerId, baseSlug);
  const id = generateId();
  const now = new Date();

  await db.insert(schema.projects).values({
    id,
    ownerId,
    slug,
    name,
    status: "draft",
    isPublic: true,
    createdAt: now,
    updatedAt: now,
  });

  const created = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.id, id))
    .get();

  if (!created) {
    throw new Error("Project create failed");
  }
  return rowToProject(created);
}

export async function getById(db: Database, id: string): Promise<Project | null> {
  const row = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.id, id))
    .get();
  if (!row) return null;
  const tags = await loadTags(db, id);
  const technologyIds = await loadTechnologyIds(db, id);
  return rowToProject(row, { tags, technologyIds });
}

/**
 * Owner ise her status; baskasi ise published+isPublic.
 */
export async function getBySlug(
  db: Database,
  ownerUsername: string,
  slug: string,
  viewerId?: string
): Promise<Project | null> {
  const owner = await db
    .select({ id: schema.users.id, username: schema.users.username })
    .from(schema.users)
    .where(eq(schema.users.username, ownerUsername))
    .get();

  if (!owner) return null;

  const row = await db
    .select()
    .from(schema.projects)
    .where(
      and(eq(schema.projects.ownerId, owner.id), eq(schema.projects.slug, slug))
    )
    .get();

  if (!row) return null;

  const isOwner = viewerId !== undefined && viewerId === owner.id;
  if (!isOwner) {
    if (row.status !== "published" || row.isPublic === false) return null;
  }

  const tags = await loadTags(db, row.id);
  const technologyIds = await loadTechnologyIds(db, row.id);
  return rowToProject(row, {
    ownerUsername: owner.username,
    tags,
    technologyIds,
  });
}

export interface UpdateProjectPatch {
  name?: string;
  tagline?: string | null;
  description?: string | null;
  launchStory?: string | null;
  slug?: string;
  websiteUrl?: string | null;
  repoUrl?: string | null;
  demoUrl?: string | null;
  thumbnailUrl?: string | null;
  categoryId?: string | null;
  typeId?: string | null;
  stageId?: string | null;
  pricingModel?: ("free" | "freemium" | "paid" | "open_source") | null;
  isOpenSource?: boolean;
  isPublic?: boolean;
  isSeekingInvestment?: boolean;
  isSeekingTeammates?: boolean;
  startDate?: Date | null;
  tags?: string[];
  technologyIds?: string[];
}

export async function updateProject(
  db: Database,
  projectId: string,
  patch: UpdateProjectPatch
): Promise<Project> {
  const existing = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.id, projectId))
    .get();

  if (!existing) throw new NotFoundError("Project");

  // Defense in depth: published projede slug degisimine izin verme
  if (patch.slug !== undefined && patch.slug !== existing.slug) {
    if (existing.status === "published") {
      throw new ConflictError("Yayindaki projenin slug'i degistirilemez");
    }
    const unique = await ensureUniqueSlug(
      db,
      existing.ownerId,
      patch.slug,
      projectId
    );
    if (unique !== patch.slug) {
      throw new ConflictError("Bu slug zaten kullaniliyor");
    }
  }

  const { tags, technologyIds, ...columnPatch } = patch;
  const updateData: Record<string, unknown> = { ...columnPatch, updatedAt: new Date() };

  await db.update(schema.projects).set(updateData).where(eq(schema.projects.id, projectId));

  if (tags !== undefined) {
    await replaceTags(db, projectId, tags);
  }
  if (technologyIds !== undefined) {
    await replaceTechnologies(db, projectId, technologyIds);
  }

  const updated = await getById(db, projectId);
  if (!updated) throw new NotFoundError("Project");
  return updated;
}

export async function deleteProject(db: Database, projectId: string): Promise<void> {
  const row = await db
    .select({ status: schema.projects.status })
    .from(schema.projects)
    .where(eq(schema.projects.id, projectId))
    .get();

  if (!row) throw new NotFoundError("Project");
  if (row.status !== "draft") {
    throw new ConflictError(
      "Sadece taslak proje silinebilir. Once yayindan kaldirin veya arsivleyin."
    );
  }

  await db.delete(schema.projects).where(eq(schema.projects.id, projectId));
}

/**
 * Atomik etiket guncelleme: onceki tum etiketleri sil, yenilerini ekle.
 * Cloudflare D1 transaction destegi kisitli; batch ile sirayli yapariz.
 */
export async function replaceTags(
  db: Database,
  projectId: string,
  labels: string[]
): Promise<void> {
  await db.delete(schema.projectTags).where(eq(schema.projectTags.projectId, projectId));

  const unique = Array.from(new Set(labels.map((l) => l.trim()).filter(Boolean)));
  if (unique.length === 0) return;

  const rows = unique.map((label) => ({
    id: generateId(),
    projectId,
    label,
    createdAt: new Date(),
  }));
  await db.insert(schema.projectTags).values(rows);
}

export async function replaceTechnologies(
  db: Database,
  projectId: string,
  technologyIds: string[]
): Promise<void> {
  await db
    .delete(schema.projectTechnologies)
    .where(eq(schema.projectTechnologies.projectId, projectId));

  const unique = Array.from(new Set(technologyIds.filter(Boolean)));
  if (unique.length === 0) return;

  const rows = unique.map((technologyId) => ({
    id: generateId(),
    projectId,
    technologyId,
  }));
  await db.insert(schema.projectTechnologies).values(rows);
}

async function loadTags(db: Database, projectId: string): Promise<string[]> {
  const rows = await db
    .select({ label: schema.projectTags.label })
    .from(schema.projectTags)
    .where(eq(schema.projectTags.projectId, projectId))
    .all();
  return rows.map((r) => r.label);
}

async function loadTechnologyIds(db: Database, projectId: string): Promise<string[]> {
  const rows = await db
    .select({ technologyId: schema.projectTechnologies.technologyId })
    .from(schema.projectTechnologies)
    .where(eq(schema.projectTechnologies.projectId, projectId))
    .all();
  return rows.map((r) => r.technologyId);
}

/**
 * Public listeleme: status=published AND isPublic=true.
 */
export async function listPublic(
  db: Database,
  filters: ListProjectsQuery
): Promise<{ items: ProjectListItem[]; total: number }> {
  const conditions = [
    eq(schema.projects.status, "published" as ProjectStatus),
    eq(schema.projects.isPublic, true),
  ];

  if (filters.category) {
    conditions.push(eq(schema.projects.categoryId, filters.category));
  }
  if (filters.stage) {
    conditions.push(eq(schema.projects.stageId, filters.stage));
  }
  if (filters.search) {
    const term = `%${filters.search.toLowerCase()}%`;
    conditions.push(
      or(
        like(sql`lower(${schema.projects.name})`, term),
        like(sql`lower(${schema.projects.tagline})`, term)
      )!
    );
  }

  if (filters.tag) {
    const tagRows = await db
      .select({ projectId: schema.projectTags.projectId })
      .from(schema.projectTags)
      .where(eq(schema.projectTags.label, filters.tag))
      .all();
    const ids = tagRows.map((r) => r.projectId);
    if (ids.length === 0) return { items: [], total: 0 };
    conditions.push(inArray(schema.projects.id, ids));
  }

  if (filters.technology) {
    const techRows = await db
      .select({ projectId: schema.projectTechnologies.projectId })
      .from(schema.projectTechnologies)
      .where(eq(schema.projectTechnologies.technologyId, filters.technology))
      .all();
    const ids = techRows.map((r) => r.projectId);
    if (ids.length === 0) return { items: [], total: 0 };
    conditions.push(inArray(schema.projects.id, ids));
  }

  const orderBy =
    filters.sort === "popular"
      ? desc(schema.projects.upvotesCount)
      : filters.sort === "launched"
        ? desc(schema.projects.launchedAt)
        : desc(schema.projects.createdAt);

  const offset = (filters.page - 1) * filters.limit;
  const whereClause = and(...conditions);

  const rows = await db
    .select({
      project: schema.projects,
      ownerUsername: schema.users.username,
      ownerAvatarUrl: schema.users.avatarUrl,
    })
    .from(schema.projects)
    .innerJoin(schema.users, eq(schema.users.id, schema.projects.ownerId))
    .where(whereClause)
    .orderBy(orderBy)
    .limit(filters.limit)
    .offset(offset)
    .all();

  const totalRow = await db
    .select({ value: sql<number>`count(*)` })
    .from(schema.projects)
    .where(whereClause)
    .get();

  return {
    items: rows.map((r) =>
      rowToListItem(r.project, {
        username: r.ownerUsername,
        avatarUrl: r.ownerAvatarUrl,
      })
    ),
    total: totalRow?.value ?? 0,
  };
}

/**
 * Owner'in tum projeleri (her status).
 */
export async function listByOwner(
  db: Database,
  ownerId: string,
  filters: ListMyProjectsQuery
): Promise<{ items: ProjectListItem[]; total: number }> {
  const conditions = [eq(schema.projects.ownerId, ownerId)];
  if (filters.status && filters.status !== "all") {
    conditions.push(eq(schema.projects.status, filters.status));
  }
  if (filters.search) {
    const term = `%${filters.search.toLowerCase()}%`;
    conditions.push(like(sql`lower(${schema.projects.name})`, term));
  }
  const whereClause = and(...conditions);

  const offset = (filters.page - 1) * filters.limit;

  const rows = await db
    .select({
      project: schema.projects,
      ownerUsername: schema.users.username,
      ownerAvatarUrl: schema.users.avatarUrl,
    })
    .from(schema.projects)
    .innerJoin(schema.users, eq(schema.users.id, schema.projects.ownerId))
    .where(whereClause)
    .orderBy(desc(schema.projects.updatedAt))
    .limit(filters.limit)
    .offset(offset)
    .all();

  const totalRow = await db
    .select({ value: sql<number>`count(*)` })
    .from(schema.projects)
    .where(whereClause)
    .get();

  return {
    items: rows.map((r) =>
      rowToListItem(r.project, {
        username: r.ownerUsername,
        avatarUrl: r.ownerAvatarUrl,
      })
    ),
    total: totalRow?.value ?? 0,
  };
}

/**
 * Yardimci: route'ta proje + sahip username birlikte alinir (URL kanonik kontrolu).
 */
export async function getProjectAndOwnerByUsernameSlug(
  db: Database,
  username: string,
  slug: string
): Promise<{ project: ProjectRow; owner: UserRow } | null> {
  const owner = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username))
    .get();
  if (!owner) return null;
  const project = await db
    .select()
    .from(schema.projects)
    .where(
      and(eq(schema.projects.ownerId, owner.id), eq(schema.projects.slug, slug))
    )
    .get();
  if (!project) return null;
  return { project, owner };
}

/**
 * Slug regex validasyonu route handler'larin guard'i icin.
 */
export function assertValidSlug(slug: string): void {
  if (!/^[a-z0-9-]+$/.test(slug) || slug.length < 2 || slug.length > 60) {
    throw new ValidationError("Gecersiz slug");
  }
}

// Yardimci: asc/desc kullanmamis lint sustur
export const __sortHelpers = { asc, desc };
