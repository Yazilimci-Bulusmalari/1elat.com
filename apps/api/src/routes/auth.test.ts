import { Hono } from "hono";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @1elat/auth before importing routes
vi.mock("@1elat/auth", () => ({
  github: {
    getAuthorizationUrl: vi.fn(
      () => "https://github.com/login/oauth/authorize?client_id=test"
    ),
    exchangeCodeForToken: vi.fn(() => Promise.resolve("gho_mock_token")),
    getUserProfile: vi.fn(() =>
      Promise.resolve({
        githubId: "12345",
        email: "test@example.com",
        name: "Test User",
        avatarUrl: null,
        githubUrl: "https://github.com/testuser",
        login: "testuser",
        bio: null,
        location: null,
      })
    ),
  },
  google: {
    getAuthorizationUrl: vi.fn(
      () => "https://accounts.google.com/o/oauth2/v2/auth?client_id=test"
    ),
    exchangeCodeForToken: vi.fn(() => Promise.resolve("ya29.mock_token")),
    getUserProfile: vi.fn(() =>
      Promise.resolve({
        googleId: "google-123",
        email: "test@gmail.com",
        name: "Test User",
        avatarUrl: null,
        firstName: "Test",
        lastName: "User",
      })
    ),
  },
  createSession: vi.fn(() => Promise.resolve("test-session-token")),
  deleteSession: vi.fn(() => Promise.resolve()),
  getSession: vi.fn(),
}));

vi.mock("../services/user.service", () => ({
  findOrCreateUserByGitHub: vi.fn(() =>
    Promise.resolve({ user: { id: "user-1" }, isNew: false })
  ),
  findOrCreateUserByGoogle: vi.fn(() =>
    Promise.resolve({ user: { id: "user-2" }, isNew: false })
  ),
  getUserById: vi.fn(() => Promise.resolve(null)),
}));

import { authRoutes } from "./auth";
import { getSession, deleteSession } from "@1elat/auth";

const mockKV = {
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
} as unknown as KVNamespace;

// Stub crypto.randomUUID for state generation
const originalCrypto = globalThis.crypto;
vi.stubGlobal("crypto", {
  ...originalCrypto,
  randomUUID: vi.fn(() => "mock-state-uuid"),
});

const mockEnv = {
  SESSION: mockKV,
  GITHUB_CLIENT_ID: "gh-client-id",
  GITHUB_CLIENT_SECRET: "gh-client-secret",
  GITHUB_REDIRECT_URI: "http://localhost/auth/github/callback",
  GOOGLE_CLIENT_ID: "google-client-id",
  GOOGLE_CLIENT_SECRET: "google-client-secret",
  GOOGLE_REDIRECT_URI: "http://localhost/auth/google/callback",
  CORS_ORIGIN: "http://localhost:5173",
};

function createTestApp(): Hono {
  const app = new Hono();

  // Error handler
  app.onError((err, c) => {
    if ("statusCode" in err) {
      return c.json(
        { error: (err as Error).message },
        (err as { statusCode: number }).statusCode as 401
      );
    }
    return c.json({ error: "Internal error" }, 500);
  });

  // Inject mock db into variables
  app.use("*", async (c, next) => {
    c.set("db" as never, {} as never);
    await next();
  });

  app.route("/auth", authRoutes);
  return app;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(mockKV.put).mockResolvedValue(undefined);
  vi.mocked(mockKV.delete).mockResolvedValue(undefined);
});

describe("GET /auth/github", () => {
  it("returns a redirect (302) to GitHub", async () => {
    const app = createTestApp();
    const res = await app.request("/auth/github", { redirect: "manual" }, mockEnv);

    expect(res.status).toBe(302);
    const location = res.headers.get("location");
    expect(location).toContain("github.com/login/oauth/authorize");
  });

  it("stores OAuth state in KV", async () => {
    const app = createTestApp();
    await app.request("/auth/github", { redirect: "manual" }, mockEnv);

    expect(mockKV.put).toHaveBeenCalledWith(
      expect.stringContaining("oauth_state:"),
      "1",
      { expirationTtl: 600 }
    );
  });
});

describe("GET /auth/google", () => {
  it("returns a redirect (302) to Google", async () => {
    const app = createTestApp();
    const res = await app.request("/auth/google", { redirect: "manual" }, mockEnv);

    expect(res.status).toBe(302);
    const location = res.headers.get("location");
    expect(location).toContain("accounts.google.com");
  });
});

describe("POST /auth/logout", () => {
  it("returns success response", async () => {
    const app = createTestApp();
    const res = await app.request(
      "/auth/logout",
      { method: "POST", headers: { cookie: "session=active-token" } },
      mockEnv
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.message).toBe("Logged out");
  });

  it("clears session cookie", async () => {
    const app = createTestApp();
    const res = await app.request(
      "/auth/logout",
      { method: "POST", headers: { cookie: "session=active-token" } },
      mockEnv
    );

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toBeTruthy();
    expect(setCookie).toContain("session=");
  });

  it("deletes session from KV when token exists", async () => {
    const app = createTestApp();
    await app.request(
      "/auth/logout",
      { method: "POST", headers: { cookie: "session=active-token" } },
      mockEnv
    );

    expect(deleteSession).toHaveBeenCalledWith(mockKV, "active-token");
  });
});

describe("GET /auth/me", () => {
  it("returns 401 without session cookie", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const app = createTestApp();
    const res = await app.request("/auth/me", {}, mockEnv);

    expect(res.status).toBe(401);
  });
});
