import { and, count, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { schema, type Database } from "@1elat/db";
import type { UserCard, Skill } from "@1elat/shared";
import { getUserSkills } from "./skill.service";

export interface ListDevelopersFilters {
  search?: string;
  skillIds?: string[];
  openToWork?: boolean;
  page: number;
  limit: number;
}

export interface ListDevelopersResult {
  developers: UserCard[];
  total: number;
}

export async function listDevelopers(
  db: Database,
  filters: ListDevelopersFilters
): Promise<ListDevelopersResult> {
  const conditions = [
    eq(schema.users.isPublic, true),
    eq(schema.users.status, "active"),
  ];

  if (filters.openToWork) {
    conditions.push(eq(schema.users.isOpenToWork, true));
  }

  if (filters.search) {
    const term = `%${filters.search.toLowerCase()}%`;
    conditions.push(
      or(
        like(sql`lower(${schema.users.username})`, term),
        like(sql`lower(${schema.users.firstName})`, term),
        like(sql`lower(${schema.users.lastName})`, term)
      )!
    );
  }

  let userIdsFromSkills: string[] | null = null;
  if (filters.skillIds && filters.skillIds.length > 0) {
    const skillRows = await db
      .select({ userId: schema.userSkills.userId })
      .from(schema.userSkills)
      .where(inArray(schema.userSkills.skillId, filters.skillIds))
      .all();

    userIdsFromSkills = [...new Set(skillRows.map((r) => r.userId))];

    if (userIdsFromSkills.length === 0) {
      return { developers: [], total: 0 };
    }

    conditions.push(inArray(schema.users.id, userIdsFromSkills));
  }

  const whereClause = and(...conditions);
  const offset = (filters.page - 1) * filters.limit;

  const [rows, totalRow] = await Promise.all([
    db
      .select()
      .from(schema.users)
      .where(whereClause)
      .orderBy(desc(schema.users.createdAt))
      .limit(filters.limit)
      .offset(offset)
      .all(),
    db
      .select({ value: count() })
      .from(schema.users)
      .where(whereClause)
      .get(),
  ]);

  const developers: UserCard[] = await Promise.all(
    rows.map(async (row) => {
      const skills = await getUserSkills(db, row.id);

      const projectCountRow = await db
        .select({ value: count() })
        .from(schema.projects)
        .where(eq(schema.projects.ownerId, row.id))
        .get();

      const followerCountRow = await db
        .select({ value: count() })
        .from(schema.follows)
        .where(eq(schema.follows.followingId, row.id))
        .get();

      return {
        id: row.id,
        username: row.username,
        firstName: row.firstName,
        lastName: row.lastName,
        avatarUrl: row.avatarUrl,
        bio: row.bio,
        location: row.location,
        rating: row.rating ?? 0,
        isOpenToWork: row.isOpenToWork ?? false,
        professions: [],
        skills,
        projectCount: projectCountRow?.value ?? 0,
        followerCount: followerCountRow?.value ?? 0,
      };
    })
  );

  return {
    developers,
    total: totalRow?.value ?? 0,
  };
}
