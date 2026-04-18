import { count, eq, gt } from "drizzle-orm";
import { schema, type Database } from "@1elat/db";
import type { AdminStats } from "@1elat/shared";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Admin dashboard istatistik servisi.
 * SRP: yalnizca sayim sorgularini yurutur.
 * Repository / Service Layer pattern - route handler DB'ye dogrudan gitmez.
 */
export async function getAdminStats(db: Database): Promise<AdminStats> {
  const now = Date.now();
  const sevenDaysAgo = new Date(now - 7 * DAY_MS);
  const thirtyDaysAgo = new Date(now - 30 * DAY_MS);

  const [
    totalUsersRow,
    totalProjectsRow,
    totalAdminsRow,
    signups7Row,
    signups30Row,
    projects7Row,
  ] = await Promise.all([
    db.select({ value: count() }).from(schema.users).get(),
    db.select({ value: count() }).from(schema.projects).get(),
    db
      .select({ value: count() })
      .from(schema.users)
      .where(eq(schema.users.role, "admin"))
      .get(),
    db
      .select({ value: count() })
      .from(schema.users)
      .where(gt(schema.users.createdAt, sevenDaysAgo))
      .get(),
    db
      .select({ value: count() })
      .from(schema.users)
      .where(gt(schema.users.createdAt, thirtyDaysAgo))
      .get(),
    db
      .select({ value: count() })
      .from(schema.projects)
      .where(gt(schema.projects.createdAt, sevenDaysAgo))
      .get(),
  ]);

  return {
    totalUsers: totalUsersRow?.value ?? 0,
    totalProjects: totalProjectsRow?.value ?? 0,
    totalAdmins: totalAdminsRow?.value ?? 0,
    signupsLast7Days: signups7Row?.value ?? 0,
    signupsLast30Days: signups30Row?.value ?? 0,
    projectsLast7Days: projects7Row?.value ?? 0,
  };
}
