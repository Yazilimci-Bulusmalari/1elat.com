import { Hono } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import { github, google, createSession, deleteSession } from "@1elat/auth";
import { UnauthorizedError, ValidationError } from "../lib/errors";
import { authRequired } from "../middleware/auth";
import {
  findOrCreateUserByGitHub,
  findOrCreateUserByGoogle,
  getUserById,
} from "../services/user.service";
import type { AppEnv } from "../types";

const OAUTH_STATE_TTL = 600; // 10 minutes
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export const authRoutes = new Hono<AppEnv>();

// --- GitHub OAuth ---

authRoutes.get("/github", async (c) => {
  const state = crypto.randomUUID();
  await c.env.SESSION.put(`oauth_state:${state}`, "1", {
    expirationTtl: OAUTH_STATE_TTL,
  });

  const config = {
    clientId: c.env.GITHUB_CLIENT_ID,
    clientSecret: c.env.GITHUB_CLIENT_SECRET,
    redirectUri: c.env.GITHUB_REDIRECT_URI,
  };

  const authUrl = github.getAuthorizationUrl(config, state);
  return c.redirect(authUrl);
});

authRoutes.get("/github/callback", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");

  if (!code || !state) {
    throw new ValidationError("Missing code or state parameter");
  }

  // Verify and consume the state to prevent CSRF
  const storedState = await c.env.SESSION.get(`oauth_state:${state}`);
  if (!storedState) {
    throw new ValidationError("Invalid or expired OAuth state");
  }
  await c.env.SESSION.delete(`oauth_state:${state}`);

  const config = {
    clientId: c.env.GITHUB_CLIENT_ID,
    clientSecret: c.env.GITHUB_CLIENT_SECRET,
    redirectUri: c.env.GITHUB_REDIRECT_URI,
  };

  const accessToken = await github.exchangeCodeForToken(code, config);
  const profile = await github.getUserProfile(accessToken);

  const db = c.get("db");
  const { user, isNew } = await findOrCreateUserByGitHub(db, profile);

  const sessionToken = await createSession(c.env.SESSION, user.id);
  setSessionCookie(c, sessionToken);

  const origin = c.env.CORS_ORIGIN || "http://localhost:5173";
  const redirectPath = isNew ? "/onboarding" : "/dashboard";
  return c.redirect(`${origin}${redirectPath}`);
});

// --- Google OAuth ---

authRoutes.get("/google", async (c) => {
  const state = crypto.randomUUID();
  await c.env.SESSION.put(`oauth_state:${state}`, "1", {
    expirationTtl: OAUTH_STATE_TTL,
  });

  const config = {
    clientId: c.env.GOOGLE_CLIENT_ID,
    clientSecret: c.env.GOOGLE_CLIENT_SECRET,
    redirectUri: c.env.GOOGLE_REDIRECT_URI,
  };

  const authUrl = google.getAuthorizationUrl(config, state);
  return c.redirect(authUrl);
});

authRoutes.get("/google/callback", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");

  if (!code || !state) {
    throw new ValidationError("Missing code or state parameter");
  }

  const storedState = await c.env.SESSION.get(`oauth_state:${state}`);
  if (!storedState) {
    throw new ValidationError("Invalid or expired OAuth state");
  }
  await c.env.SESSION.delete(`oauth_state:${state}`);

  const config = {
    clientId: c.env.GOOGLE_CLIENT_ID,
    clientSecret: c.env.GOOGLE_CLIENT_SECRET,
    redirectUri: c.env.GOOGLE_REDIRECT_URI,
  };

  const accessToken = await google.exchangeCodeForToken(code, config);
  const profile = await google.getUserProfile(accessToken);

  const db = c.get("db");
  const { user, isNew } = await findOrCreateUserByGoogle(db, profile);

  const sessionToken = await createSession(c.env.SESSION, user.id);
  setSessionCookie(c, sessionToken);

  const origin = c.env.CORS_ORIGIN || "http://localhost:5173";
  const redirectPath = isNew ? "/onboarding" : "/dashboard";
  return c.redirect(`${origin}${redirectPath}`);
});

// --- Logout ---

authRoutes.post("/logout", async (c) => {
  const cookie = c.req.header("cookie") || "";
  const match = cookie.match(/session=([^;]+)/);
  const token = match ? match[1] : null;

  if (token) {
    await deleteSession(c.env.SESSION, token);
  }

  deleteCookie(c, "session", { path: "/" });

  return c.json({ data: { message: "Logged out" }, error: null });
});

// --- Current user ---

authRoutes.get("/me", authRequired, async (c) => {
  const userId = c.get("userId");
  const db = c.get("db");
  const user = await getUserById(db, userId);

  if (!user) {
    throw new UnauthorizedError("User not found");
  }

  return c.json({ data: user, error: null });
});

// --- Helpers ---

function setSessionCookie(
  c: { header: (name: string, value: string) => void; env: { CORS_ORIGIN: string } },
  token: string
): void {
  const origin = c.env.CORS_ORIGIN || "http://localhost:5173";
  const isLocalDev = origin.includes("localhost") || origin.includes("127.0.0.1");

  const parts = [
    `session=${token}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${SESSION_MAX_AGE}`,
  ];

  if (!isLocalDev) {
    parts.push("Secure");
  }

  c.header("Set-Cookie", parts.join("; "));
}
