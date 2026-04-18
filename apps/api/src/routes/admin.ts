import { Hono } from "hono";
import { authRequired } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";
import { getAdminStats } from "../services/admin-stats.service";
import {
  assertCanModify,
  countAdmins,
  getUserForAdmin,
  listUsers,
  updateUserAdmin,
} from "../services/admin-users.service";
import {
  listAdminUsersQuerySchema,
  updateAdminUserSchema,
} from "@1elat/shared";
import { NotFoundError, ValidationError } from "../lib/errors";
import type { AppEnv } from "../types";

export const adminRoutes = new Hono<AppEnv>();

// Tum admin route'lari authRequired + requireAdmin zinciri ile korunur (Decorator/Chain pattern).
adminRoutes.use("*", authRequired, requireAdmin);

adminRoutes.get("/stats", async (c) => {
  const db = c.get("db");
  const stats = await getAdminStats(db);
  return c.json({ data: stats, error: null });
});

/**
 * GET /admin/users
 * Filtreli ve sayfali kullanici listesi.
 */
adminRoutes.get("/users", async (c) => {
  const parsed = listAdminUsersQuerySchema.safeParse({
    search: c.req.query("search"),
    role: c.req.query("role") ?? "all",
    status: c.req.query("status") ?? "all",
    page: c.req.query("page") ?? "1",
    limit: c.req.query("limit") ?? "20",
  });

  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Gecersiz parametre");
  }

  const db = c.get("db");
  const result = await listUsers(db, parsed.data);

  return c.json({
    data: {
      users: result.users,
      total: result.total,
      page: parsed.data.page,
      limit: parsed.data.limit,
    },
    error: null,
  });
});

/**
 * PATCH /admin/users/:id
 * Kullanici rolu / statusu guncelleme.
 * Self-protection ve last-admin korumasi assertCanModify icinde.
 */
adminRoutes.patch("/users/:id", async (c) => {
  const targetId = c.req.param("id");
  const actorId = c.get("userId");

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    throw new ValidationError("Gecersiz JSON govdesi");
  }

  const parsed = updateAdminUserSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Gecersiz govde");
  }

  const db = c.get("db");
  const target = await getUserForAdmin(db, targetId);
  if (!target) {
    throw new NotFoundError("Kullanici");
  }

  // Yalnizca rol degisikligi varsa admin sayimini cek
  const totalAdmins =
    parsed.data.role === "user" && target.role === "admin"
      ? await countAdmins(db)
      : Number.POSITIVE_INFINITY;

  const guard = assertCanModify({
    actorId,
    target: { id: target.id, role: target.role, status: target.status },
    patch: parsed.data,
    totalAdmins,
  });

  if (!guard.ok) {
    throw new ValidationError(guard.reason);
  }

  const updated = await updateUserAdmin(db, targetId, parsed.data);
  if (!updated) {
    throw new NotFoundError("Kullanici");
  }

  return c.json({ data: updated, error: null });
});
