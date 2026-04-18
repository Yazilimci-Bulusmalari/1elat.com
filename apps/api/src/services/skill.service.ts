import { eq, and, count } from "drizzle-orm";
import { schema, type Database } from "@1elat/db";
import { generateId } from "../lib/id";
import type { Skill } from "@1elat/shared";

type SkillRow = typeof schema.skills.$inferSelect;

function rowToSkill(row: SkillRow): Skill {
  return {
    id: row.id,
    slug: row.slug,
    nameEn: row.nameEn,
    nameTr: row.nameTr,
    icon: row.icon,
    parentId: row.parentId,
  };
}

export async function listActiveSkills(db: Database): Promise<Skill[]> {
  const rows = await db
    .select()
    .from(schema.skills)
    .where(eq(schema.skills.isActive, true))
    .orderBy(schema.skills.sortOrder)
    .all();

  return rows.map(rowToSkill);
}

export async function listAllSkills(db: Database): Promise<SkillRow[]> {
  return db
    .select()
    .from(schema.skills)
    .orderBy(schema.skills.sortOrder)
    .all();
}

export async function createSkill(
  db: Database,
  data: {
    slug: string;
    nameEn: string;
    nameTr: string;
    icon?: string;
    parentId?: string;
    sortOrder?: number;
  }
): Promise<SkillRow> {
  const id = generateId();
  await db.insert(schema.skills).values({
    id,
    slug: data.slug,
    nameEn: data.nameEn,
    nameTr: data.nameTr,
    icon: data.icon ?? null,
    parentId: data.parentId ?? null,
    sortOrder: data.sortOrder ?? 0,
    isActive: true,
  });

  const row = await db
    .select()
    .from(schema.skills)
    .where(eq(schema.skills.id, id))
    .get();

  return row!;
}

export async function updateSkill(
  db: Database,
  skillId: string,
  data: Partial<{
    slug: string;
    nameEn: string;
    nameTr: string;
    icon: string;
    parentId: string;
    sortOrder: number;
  }>
): Promise<SkillRow | undefined> {
  await db
    .update(schema.skills)
    .set(data)
    .where(eq(schema.skills.id, skillId));

  return db
    .select()
    .from(schema.skills)
    .where(eq(schema.skills.id, skillId))
    .get();
}

export async function deleteSkill(
  db: Database,
  skillId: string
): Promise<void> {
  await db
    .update(schema.skills)
    .set({ isActive: false })
    .where(eq(schema.skills.id, skillId));
}

export async function getSkillById(
  db: Database,
  skillId: string
): Promise<SkillRow | undefined> {
  return db
    .select()
    .from(schema.skills)
    .where(eq(schema.skills.id, skillId))
    .get();
}

export async function replaceUserSkills(
  db: Database,
  userId: string,
  skillIds: string[]
): Promise<void> {
  await db
    .delete(schema.userSkills)
    .where(eq(schema.userSkills.userId, userId));

  if (skillIds.length > 0) {
    const values = skillIds.map((skillId) => ({
      id: generateId(),
      userId,
      skillId,
    }));
    await db.insert(schema.userSkills).values(values);
  }
}

export async function getUserSkills(
  db: Database,
  userId: string
): Promise<Skill[]> {
  const rows = await db
    .select({
      id: schema.skills.id,
      slug: schema.skills.slug,
      nameEn: schema.skills.nameEn,
      nameTr: schema.skills.nameTr,
      icon: schema.skills.icon,
      parentId: schema.skills.parentId,
    })
    .from(schema.userSkills)
    .innerJoin(schema.skills, eq(schema.userSkills.skillId, schema.skills.id))
    .where(eq(schema.userSkills.userId, userId))
    .all();

  return rows;
}

export async function getUserSkillCount(
  db: Database,
  userId: string
): Promise<number> {
  const row = await db
    .select({ value: count() })
    .from(schema.userSkills)
    .where(eq(schema.userSkills.userId, userId))
    .get();

  return row?.value ?? 0;
}

export async function updateOpenToWork(
  db: Database,
  userId: string,
  isOpenToWork: boolean
): Promise<void> {
  await db
    .update(schema.users)
    .set({ isOpenToWork, updatedAt: new Date() })
    .where(eq(schema.users.id, userId));
}
