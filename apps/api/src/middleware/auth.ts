import type { MiddlewareHandler } from "hono";
import { getSession } from "@1elat/auth";
import { UnauthorizedError } from "../lib/errors";
import type { AppEnv } from "../types";

const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days

// Required auth - throws if not authenticated
export const authRequired: MiddlewareHandler<AppEnv> = async (c, next) => {
  const token = getTokenFromCookie(c);
  if (!token) {
    throw new UnauthorizedError();
  }

  const userId = await getSession(c.env.SESSION, token);
  if (!userId) {
    throw new UnauthorizedError("Session expired");
  }

  // Sliding window - refresh session TTL by re-putting the key
  await c.env.SESSION.put(`session:${token}`, userId, {
    expirationTtl: SESSION_TTL,
  });

  c.set("userId", userId);
  await next();
};

// Optional auth - sets userId if authenticated, continues either way
export const authOptional: MiddlewareHandler<AppEnv> = async (c, next) => {
  const token = getTokenFromCookie(c);
  if (token) {
    const userId = await getSession(c.env.SESSION, token);
    if (userId) {
      c.set("userId", userId);
      // Sliding window refresh
      await c.env.SESSION.put(`session:${token}`, userId, {
        expirationTtl: SESSION_TTL,
      });
    }
  }
  await next();
};

function getTokenFromCookie(c: { req: { header: (name: string) => string | undefined } }): string | null {
  const cookie = c.req.header("cookie") || "";
  const match = cookie.match(/session=([^;]+)/);
  return match ? match[1] : null;
}
