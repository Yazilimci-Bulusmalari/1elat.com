import { and, count, desc, eq, like, or, sql } from "drizzle-orm";
import { schema, type Database } from "@1elat/db";
import type {
  AdminUserListItem,
  UserRole,
  UserStatus,
} from "@1elat/shared";

/**
 * Admin kullanici yonetimi servisi.
 * SRP: yalnizca admin'in kullanici listeleme/guncelleme sorgularini yurutur.
 * Repository / Service Layer pattern - route handler DB'ye dogrudan gitmez.
 * DIP: Database instance disaridan inject edilir.
 */

export interface ListUsersFilters {
  search?: string;
  role: "all" | UserRole;
  status: "all" | UserStatus;
  page: number;
  limit: number;
}

export interface ListUsersResult {
  users: AdminUserListItem[];
  total: number;
}

type UserRow = typeof schema.users.$inferSelect;

function rowToListItem(row: UserRow): AdminUserListItem {
  return {
    id: row.id,
    username: row.username,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    avatarUrl: row.avatarUrl,
    role: row.role,
    status: row.status,
    lastLoginAt: row.lastLoginAt ? row.lastLoginAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * OCP: yeni filter eklemek icin sadece koşul listesine ekle - mevcut sorgular bozulmaz.
 */
function buildFilterConditions(filters: ListUsersFilters) {
  const conditions = [];

  if (filters.search) {
    // SQLite LIKE varsayilan olarak case-insensitive (NOCASE collation degil ama
    // ASCII karakterler icin LIKE 'foo%' eslesir). Lower karsilastirma ile garanti.
    const term = `%${filters.search.toLowerCase()}%`;
    conditions.push(
      or(
        like(sql`lower(${schema.users.username})`, term),
        like(sql`lower(${schema.users.firstName})`, term),
        like(sql`lower(${schema.users.lastName})`, term),
        like(sql`lower(${schema.users.email})`, term)
      )
    );
  }

  if (filters.role !== "all") {
    conditions.push(eq(schema.users.role, filters.role));
  }

  if (filters.status !== "all") {
    conditions.push(eq(schema.users.status, filters.status));
  }

  return conditions;
}

export async function listUsers(
  db: Database,
  filters: ListUsersFilters
): Promise<ListUsersResult> {
  const conditions = buildFilterConditions(filters);
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

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

  return {
    users: rows.map(rowToListItem),
    total: totalRow?.value ?? 0,
  };
}

export async function countAdmins(db: Database): Promise<number> {
  const row = await db
    .select({ value: count() })
    .from(schema.users)
    .where(eq(schema.users.role, "admin"))
    .get();
  return row?.value ?? 0;
}

/**
 * Self-protection ve last-admin guard.
 * Mantiksal olarak route handler'dan ayri tutulur (SRP).
 * Hata firlatmak yerine sebep doner: handler hata mesajini ve status'u secer.
 */
export interface ModifyGuardInput {
  actorId: string;
  target: { id: string; role: UserRole; status: UserStatus };
  patch: { role?: UserRole; status?: UserStatus };
  totalAdmins: number;
}

export type ModifyGuardResult =
  | { ok: true }
  | { ok: false; reason: string };

export function assertCanModify(input: ModifyGuardInput): ModifyGuardResult {
  const { actorId, target, patch, totalAdmins } = input;

  // Guard 1: Self-protection - rol degisikligi
  if (
    actorId === target.id &&
    patch.role !== undefined &&
    patch.role !== target.role
  ) {
    return { ok: false, reason: "Kendi rolunuzu degistiremezsiniz" };
  }

  // Guard 2: Self-protection - status degisikligi
  if (
    actorId === target.id &&
    patch.status === "suspended" &&
    target.status !== "suspended"
  ) {
    return { ok: false, reason: "Kendi hesabinizi askiya alamazsiniz" };
  }

  // Guard 3: Last-admin protection - admin'i user'a dusurmek
  if (
    target.role === "admin" &&
    patch.role === "user" &&
    totalAdmins <= 1
  ) {
    return { ok: false, reason: "Sistemde en az bir admin olmali" };
  }

  return { ok: true };
}

export async function updateUserAdmin(
  db: Database,
  userId: string,
  patch: { role?: UserRole; status?: UserStatus }
): Promise<AdminUserListItem | null> {
  const updateData: { role?: UserRole; status?: UserStatus; updatedAt: Date } = {
    updatedAt: new Date(),
  };
  if (patch.role !== undefined) updateData.role = patch.role;
  if (patch.status !== undefined) updateData.status = patch.status;

  await db
    .update(schema.users)
    .set(updateData)
    .where(eq(schema.users.id, userId));

  const row = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .get();

  return row ? rowToListItem(row) : null;
}

export async function getUserForAdmin(
  db: Database,
  userId: string
): Promise<UserRow | undefined> {
  return db.select().from(schema.users).where(eq(schema.users.id, userId)).get();
}
