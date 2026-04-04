import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAuthorizationUrl, exchangeCodeForToken, getUserProfile } from "./google";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const config = {
  clientId: "test-google-client-id",
  clientSecret: "test-google-client-secret",
  redirectUri: "https://example.com/google/callback",
};

beforeEach(() => {
  mockFetch.mockReset();
});

describe("getAuthorizationUrl", () => {
  it("returns a URL containing accounts.google.com", () => {
    const url = getAuthorizationUrl(config, "test-state");
    expect(url).toContain("accounts.google.com");
  });

  it("includes client_id parameter", () => {
    const url = getAuthorizationUrl(config, "test-state");
    expect(url).toContain("client_id=test-google-client-id");
  });

  it("includes redirect_uri parameter", () => {
    const url = getAuthorizationUrl(config, "test-state");
    expect(url).toContain("redirect_uri=");
    expect(url).toContain(encodeURIComponent(config.redirectUri));
  });

  it("includes scope parameter with openid, email, and profile", () => {
    const url = getAuthorizationUrl(config, "test-state");
    const parsed = new URL(url);
    const scope = parsed.searchParams.get("scope");
    expect(scope).toContain("openid");
    expect(scope).toContain("email");
    expect(scope).toContain("profile");
  });

  it("includes state parameter", () => {
    const url = getAuthorizationUrl(config, "some-state-value");
    expect(url).toContain("state=some-state-value");
  });

  it("includes response_type=code", () => {
    const url = getAuthorizationUrl(config, "test-state");
    expect(url).toContain("response_type=code");
  });
});

describe("exchangeCodeForToken", () => {
  it("uses form-encoded body, not JSON", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: "ya29.test-token" }),
    });

    await exchangeCodeForToken("auth-code", config);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("https://oauth2.googleapis.com/token");
    expect(options.headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
    expect(options.body).toBeInstanceOf(URLSearchParams);
  });

  it("sends correct parameters in body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: "ya29.test-token" }),
    });

    await exchangeCodeForToken("auth-code", config);

    const body = mockFetch.mock.calls[0][1].body as URLSearchParams;
    expect(body.get("code")).toBe("auth-code");
    expect(body.get("client_id")).toBe("test-google-client-id");
    expect(body.get("client_secret")).toBe("test-google-client-secret");
    expect(body.get("redirect_uri")).toBe(config.redirectUri);
    expect(body.get("grant_type")).toBe("authorization_code");
  });

  it("returns access_token on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: "ya29.test-token" }),
    });

    const token = await exchangeCodeForToken("auth-code", config);
    expect(token).toBe("ya29.test-token");
  });

  it("throws when HTTP response is not ok", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
    });

    await expect(exchangeCodeForToken("auth-code", config)).rejects.toThrow(
      "Google token exchange failed with status 400"
    );
  });

  it("throws when response contains error field", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        error: "invalid_grant",
        error_description: "Code was already redeemed.",
      }),
    });

    await expect(exchangeCodeForToken("used-code", config)).rejects.toThrow(
      "Code was already redeemed."
    );
  });
});

describe("getUserProfile", () => {
  const mockUserInfo = {
    id: "google-id-123",
    email: "user@gmail.com",
    name: "Test User",
    given_name: "Test",
    family_name: "User",
    picture: "https://lh3.googleusercontent.com/photo.jpg",
  };

  it("calls /oauth2/v2/userinfo endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserInfo,
    });

    await getUserProfile("test-token");

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe("https://www.googleapis.com/oauth2/v2/userinfo");
  });

  it("sends authorization header with bearer token", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserInfo,
    });

    await getUserProfile("my-access-token");

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers.Authorization).toBe("Bearer my-access-token");
  });

  it("returns correct profile shape", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserInfo,
    });

    const profile = await getUserProfile("test-token");

    expect(profile).toEqual({
      googleId: "google-id-123",
      email: "user@gmail.com",
      name: "Test User",
      avatarUrl: "https://lh3.googleusercontent.com/photo.jpg",
      firstName: "Test",
      lastName: "User",
    });
  });

  it("handles null picture", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockUserInfo, picture: null }),
    });

    const profile = await getUserProfile("test-token");
    expect(profile.avatarUrl).toBeNull();
  });

  it("throws when userinfo endpoint fails", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 403 });

    await expect(getUserProfile("bad-token")).rejects.toThrow(
      "Google userinfo fetch failed with status 403"
    );
  });

  it("throws when email is missing", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockUserInfo, email: "" }),
    });

    await expect(getUserProfile("test-token")).rejects.toThrow(
      "no email"
    );
  });

  it("constructs name from given_name and family_name when name is missing", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockUserInfo, name: "" }),
    });

    const profile = await getUserProfile("test-token");
    expect(profile.name).toBe("Test User");
  });
});
