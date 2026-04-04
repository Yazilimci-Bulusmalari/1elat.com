import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAuthorizationUrl, exchangeCodeForToken, getUserProfile } from "./github";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const config = {
  clientId: "test-client-id",
  clientSecret: "test-client-secret",
  redirectUri: "https://example.com/callback",
};

beforeEach(() => {
  mockFetch.mockReset();
});

describe("getAuthorizationUrl", () => {
  it("returns a URL containing github.com/login/oauth/authorize", () => {
    const url = getAuthorizationUrl(config, "test-state");
    expect(url).toContain("github.com/login/oauth/authorize");
  });

  it("includes client_id parameter", () => {
    const url = getAuthorizationUrl(config, "test-state");
    expect(url).toContain("client_id=test-client-id");
  });

  it("includes redirect_uri parameter", () => {
    const url = getAuthorizationUrl(config, "test-state");
    expect(url).toContain("redirect_uri=");
    expect(url).toContain(encodeURIComponent(config.redirectUri));
  });

  it("includes scope parameter with read:user and user:email", () => {
    const url = getAuthorizationUrl(config, "test-state");
    const parsed = new URL(url);
    const scope = parsed.searchParams.get("scope");
    expect(scope).toContain("read:user");
    expect(scope).toContain("user:email");
  });

  it("includes state parameter", () => {
    const url = getAuthorizationUrl(config, "my-random-state");
    expect(url).toContain("state=my-random-state");
  });
});

describe("exchangeCodeForToken", () => {
  it("calls GitHub token endpoint with correct body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: "gho_abc123" }),
    });

    await exchangeCodeForToken("auth-code", config);

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("https://github.com/login/oauth/access_token");
    expect(options.method).toBe("POST");

    const body = JSON.parse(options.body);
    expect(body.client_id).toBe("test-client-id");
    expect(body.client_secret).toBe("test-client-secret");
    expect(body.code).toBe("auth-code");
    expect(body.redirect_uri).toBe(config.redirectUri);
  });

  it("returns access_token on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: "gho_abc123" }),
    });

    const token = await exchangeCodeForToken("auth-code", config);
    expect(token).toBe("gho_abc123");
  });

  it("throws when HTTP response is not ok", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(exchangeCodeForToken("auth-code", config)).rejects.toThrow(
      "GitHub token exchange failed with status 500"
    );
  });

  it("throws when response contains error field", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        error: "bad_verification_code",
        error_description: "The code passed is incorrect or expired.",
      }),
    });

    await expect(exchangeCodeForToken("bad-code", config)).rejects.toThrow(
      "The code passed is incorrect or expired."
    );
  });

  it("throws when no access_token is returned", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await expect(exchangeCodeForToken("auth-code", config)).rejects.toThrow(
      "no access_token returned"
    );
  });
});

describe("getUserProfile", () => {
  const mockUser = {
    id: 12345,
    login: "testuser",
    name: "Test User",
    avatar_url: "https://avatars.githubusercontent.com/u/12345",
    html_url: "https://github.com/testuser",
    bio: "A developer",
    location: "Istanbul",
    email: null,
  };

  const mockEmails = [
    { email: "unverified@example.com", primary: false, verified: false },
    { email: "primary@example.com", primary: true, verified: true },
  ];

  it("calls /user and /user/emails endpoints", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmails,
      });

    await getUserProfile("test-token");

    expect(mockFetch).toHaveBeenCalledTimes(2);
    const urls = mockFetch.mock.calls.map((call: unknown[]) => call[0]);
    expect(urls).toContain("https://api.github.com/user");
    expect(urls).toContain("https://api.github.com/user/emails");
  });

  it("returns correct profile shape", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmails,
      });

    const profile = await getUserProfile("test-token");

    expect(profile).toEqual({
      githubId: "12345",
      email: "primary@example.com",
      name: "Test User",
      avatarUrl: "https://avatars.githubusercontent.com/u/12345",
      githubUrl: "https://github.com/testuser",
      login: "testuser",
      bio: "A developer",
      location: "Istanbul",
    });
  });

  it("uses primary verified email over user.email", async () => {
    const userWithEmail = { ...mockUser, email: "fallback@example.com" };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => userWithEmail,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmails,
      });

    const profile = await getUserProfile("test-token");
    expect(profile.email).toBe("primary@example.com");
  });

  it("falls back to user.email when no verified primary email exists", async () => {
    const userWithEmail = { ...mockUser, email: "fallback@example.com" };
    const noVerifiedEmails = [
      { email: "unverified@example.com", primary: true, verified: false },
    ];

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => userWithEmail,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => noVerifiedEmails,
      });

    const profile = await getUserProfile("test-token");
    expect(profile.email).toBe("fallback@example.com");
  });

  it("throws when no verified email is found", async () => {
    const noEmailUser = { ...mockUser, email: null };
    const noVerifiedEmails = [
      { email: "unverified@example.com", primary: true, verified: false },
    ];

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => noEmailUser,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => noVerifiedEmails,
      });

    await expect(getUserProfile("test-token")).rejects.toThrow(
      "no verified primary email"
    );
  });

  it("throws when user endpoint fails", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 401 })
      .mockResolvedValueOnce({ ok: true, json: async () => mockEmails });

    await expect(getUserProfile("bad-token")).rejects.toThrow(
      "GitHub user fetch failed with status 401"
    );
  });

  it("uses login as name when name is null", async () => {
    const noNameUser = { ...mockUser, name: null };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => noNameUser,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmails,
      });

    const profile = await getUserProfile("test-token");
    expect(profile.name).toBe("testuser");
  });
});
