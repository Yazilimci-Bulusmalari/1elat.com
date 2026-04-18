import { Hono } from "hono";
import { authRequired } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";
import { getAdminStats } from "../services/admin-stats.service";
import type { AppEnv } from "../types";

export const adminRoutes = new Hono<AppEnv>();

// Tum admin route'lari authRequired + requireAdmin zinciri ile korunur (Decorator/Chain pattern).
adminRoutes.use("*", authRequired, requireAdmin);

adminRoutes.get("/stats", async (c) => {
  const db = c.get("db");
  const stats = await getAdminStats(db);
  return c.json({ data: stats, error: null });
});
