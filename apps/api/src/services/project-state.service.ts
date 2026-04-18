import { eq } from "drizzle-orm";
import { schema, type Database } from "@1elat/db";
import type { Project, ProjectStatus } from "@1elat/shared";
import { publishProjectSchema } from "@1elat/shared";
import {
  ConflictError,
  NotFoundError,
  ProjectValidationError,
} from "../lib/errors";
import { getById } from "./project.service";

/**
 * ProjectStateService - State Pattern.
 * SRP: yalnizca durum gecisleri ve yan etkileri (launchedAt set vs.).
 * OCP: yeni status eklemek = TRANSITIONS guncellemesi + yeni gecis fonksiyonu.
 * Route handler'lar degismez.
 */

const TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  draft: ["published"],
  published: ["draft", "archived"],
  archived: ["published"],
};

export function canTransition(from: ProjectStatus, to: ProjectStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

function ensureTransition(from: ProjectStatus, to: ProjectStatus): void {
  if (!canTransition(from, to)) {
    throw new ConflictError(`Gecersiz durum gecisi: ${from} -> ${to}`);
  }
}

async function loadProjectRow(db: Database, projectId: string) {
  const row = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.id, projectId))
    .get();
  if (!row) throw new NotFoundError("Project");
  return row;
}

/**
 * draft -> published. publishProjectSchema ile validate; eksik alanlari firlat.
 * launchedAt sadece ilk yayinda set edilir.
 */
export async function publishProject(
  db: Database,
  projectId: string
): Promise<Project> {
  const row = await loadProjectRow(db, projectId);
  ensureTransition(row.status, "published");

  const candidate = {
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    categoryId: row.categoryId,
    typeId: row.typeId,
    stageId: row.stageId,
    websiteUrl: row.websiteUrl,
    repoUrl: row.repoUrl,
    demoUrl: row.demoUrl,
  };
  const parsed = publishProjectSchema.safeParse(candidate);
  if (!parsed.success) {
    const missing = Array.from(
      new Set(parsed.error.issues.map((i) => i.path[0]?.toString() ?? "unknown"))
    );
    throw new ProjectValidationError(missing);
  }

  const now = new Date();
  const updateData: Record<string, unknown> = {
    status: "published",
    updatedAt: now,
  };
  if (row.launchedAt === null) {
    updateData.launchedAt = now;
  }
  await db.update(schema.projects).set(updateData).where(eq(schema.projects.id, projectId));

  const updated = await getById(db, projectId);
  if (!updated) throw new NotFoundError("Project");
  return updated;
}

/**
 * published -> draft. launchedAt korunur.
 */
export async function unpublishProject(
  db: Database,
  projectId: string
): Promise<Project> {
  const row = await loadProjectRow(db, projectId);
  ensureTransition(row.status, "draft");

  await db
    .update(schema.projects)
    .set({ status: "draft", updatedAt: new Date() })
    .where(eq(schema.projects.id, projectId));

  const updated = await getById(db, projectId);
  if (!updated) throw new NotFoundError("Project");
  return updated;
}

/**
 * published -> archived.
 */
export async function archiveProject(
  db: Database,
  projectId: string
): Promise<Project> {
  const row = await loadProjectRow(db, projectId);
  ensureTransition(row.status, "archived");

  await db
    .update(schema.projects)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(schema.projects.id, projectId));

  const updated = await getById(db, projectId);
  if (!updated) throw new NotFoundError("Project");
  return updated;
}

/**
 * archived -> published. launchedAt zaten vardi, dokunmuyoruz.
 */
export async function restoreProject(
  db: Database,
  projectId: string
): Promise<Project> {
  const row = await loadProjectRow(db, projectId);
  ensureTransition(row.status, "published");

  await db
    .update(schema.projects)
    .set({ status: "published", updatedAt: new Date() })
    .where(eq(schema.projects.id, projectId));

  const updated = await getById(db, projectId);
  if (!updated) throw new NotFoundError("Project");
  return updated;
}
