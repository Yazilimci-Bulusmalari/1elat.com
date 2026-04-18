import type { MiddlewareHandler } from "hono";
import { ForbiddenError, UnauthorizedError } from "../lib/errors";
import { getUserById } from "../services/user.service";
import type { AppEnv } from "../types";

/**
 * Admin role middleware. Single Responsibility: yalnizca rol kontrolu yapar.
 * Onceden `authRequired` middleware'i tarafindan `userId` set edilmis olmalidir.
 *
 * Pattern: Decorator / Middleware Chain.
 * Kullanim: route.use(authRequired, requireAdmin, handler)
 */
export const requireAdmin: MiddlewareHandler<AppEnv> = async (c, next) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new UnauthorizedError();
  }

  const db = c.get("db");
  const user = await getUserById(db, userId);

  if (!user) {
    throw new UnauthorizedError("User not found");
  }

  if (user.role !== "admin") {
    throw new ForbiddenError("Admin yetkisi gerekli");
  }

  await next();
};
