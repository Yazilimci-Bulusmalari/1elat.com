import { Hono } from "hono";
import type { Context } from "hono";
import { deleteCookie, getCookie } from "hono/cookie";
import {
  getGitHubAuthUrl,
  exchangeGitHubCode,
  getGitHubProfile,
  getGoogleAuthUrl,
  exchangeGoogleCode,
  getGoogleProfile,
  createSession,
  deleteSession,
} from "@1elat/auth";
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

  const authUrl = getGitHubAuthUrl(config, state);
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

  const accessToken = await exchangeGitHubCode(code, config);
  const profile = await getGitHubProfile(accessToken);

  const db = c.get("db");
  const { user } = await findOrCreateUserByGitHub(db, profile);

  const sessionToken = await createSession(c.env.SESSION, user.id);
  setSessionCookie(c, sessionToken);

  const origin = c.env.CORS_ORIGIN || "http://localhost:5173";
  return c.redirect(`${origin}/`);
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

  const authUrl = getGoogleAuthUrl(config, state);
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

  const accessToken = await exchangeGoogleCode(code, config);
  const profile = await getGoogleProfile(accessToken);

  const db = c.get("db");
  const { user } = await findOrCreateUserByGoogle(db, profile);

  const sessionToken = await createSession(c.env.SESSION, user.id);
  setSessionCookie(c, sessionToken);

  const origin = c.env.CORS_ORIGIN || "http://localhost:5173";
  return c.redirect(`${origin}/`);
});

// --- Logout ---

async function performLogout(c: Context<AppEnv>): Promise<void> {
  const token = getCookie(c, "session");
  if (token) {
    await deleteSession(c.env.SESSION, token);
  }

  const origin = c.env.CORS_ORIGIN || "http://localhost:5173";
  const hostname = new URL(origin).hostname;
  const isLocalDev = hostname === "localhost" || hostname === "127.0.0.1";
  const domain = isLocalDev ? undefined : hostname.split(".").slice(-2).join(".");

  deleteCookie(c, "session", { path: "/", domain });
}

authRoutes.get("/logout", async (c) => {
  await performLogout(c);
  const origin = c.env.CORS_ORIGIN || "http://localhost:5173";
  return c.redirect(`${origin}/auth/login`);
});

authRoutes.post("/logout", async (c) => {
  await performLogout(c);
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
  const hostname = new URL(origin).hostname;
  const isLocalDev = hostname === "localhost" || hostname === "127.0.0.1";

  const parts = [
    `session=${token}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${SESSION_MAX_AGE}`,
  ];

  if (!isLocalDev) {
    // Share across subdomains (e.g. 1elat.com and api.1elat.com).
    const parent = hostname.split(".").slice(-2).join(".");
    parts.push(`Domain=${parent}`);
    parts.push("Secure");
  }

  c.header("Set-Cookie", parts.join("; "));
}
