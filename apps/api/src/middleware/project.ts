import type { MiddlewareHandler } from "hono";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../lib/errors";
import { getProjectAndOwnerByUsernameSlug } from "../services/project.service";
import { getUserById } from "../services/user.service";
import type { AppEnv } from "../types";

/**
 * Project ownership middleware.
 * Decorator / Middleware Chain: authRequired -> requireProjectOwner -> handler.
 * SRP: yetki kontrolu + projeyi context'e koymak.
 * DIP: route handler tekrar fetch yapmaz; c.get("project") ile alir.
 *
 * Path param'larin adi: :username, :slug.
 */
export const requireProjectOwner: MiddlewareHandler<AppEnv> = async (c, next) => {
  const userId = c.get("userId");
  if (!userId) throw new UnauthorizedError();

  const username = c.req.param("username");
  const slug = c.req.param("slug");
  if (!username || !slug) throw new NotFoundError("Project");

  const db = c.get("db");
  const found = await getProjectAndOwnerByUsernameSlug(db, username, slug);
  if (!found) throw new NotFoundError("Project");

  const isOwner = found.project.ownerId === userId;
  if (!isOwner) {
    // Admin escape hatch
    const me = await getUserById(db, userId);
    if (!me || me.role !== "admin") {
      throw new ForbiddenError("Bu projeye erisim yetkiniz yok");
    }
  }

  c.set("project", found.project);
  c.set("projectOwner", found.owner);
  await next();
};
