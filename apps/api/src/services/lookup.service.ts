import { eq } from "drizzle-orm";
import { schema, type Database } from "@1elat/db";

export interface LookupItem {
  id: string;
  slug: string;
  nameEn: string;
  nameTr: string;
  icon: string | null;
}

export async function listActiveCategories(db: Database): Promise<LookupItem[]> {
  const rows = await db
    .select()
    .from(schema.categories)
    .where(eq(schema.categories.isActive, true))
    .orderBy(schema.categories.sortOrder)
    .all();
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    nameEn: r.nameEn,
    nameTr: r.nameTr,
    icon: r.icon,
  }));
}

export async function listActiveProjectTypes(db: Database): Promise<LookupItem[]> {
  const rows = await db
    .select()
    .from(schema.projectTypes)
    .where(eq(schema.projectTypes.isActive, true))
    .orderBy(schema.projectTypes.sortOrder)
    .all();
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    nameEn: r.nameEn,
    nameTr: r.nameTr,
    icon: r.icon,
  }));
}

export async function listActiveProjectStages(db: Database): Promise<LookupItem[]> {
  const rows = await db
    .select()
    .from(schema.projectStages)
    .where(eq(schema.projectStages.isActive, true))
    .orderBy(schema.projectStages.sortOrder)
    .all();
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    nameEn: r.nameEn,
    nameTr: r.nameTr,
    icon: null,
  }));
}
