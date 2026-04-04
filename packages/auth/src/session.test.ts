import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSession, getSession, deleteSession, refreshSession } from "./session";

// Mock crypto.randomUUID globally
vi.stubGlobal("crypto", {
  randomUUID: vi.fn(() => "mock-uuid-1234-5678-9012"),
});

const mockKV = {
  put: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
} as unknown as KVNamespace;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createSession", () => {
  it("stores session in KV with correct key format", async () => {
    await createSession(mockKV, "user-123");

    expect(mockKV.put).toHaveBeenCalledWith(
      "session:mock-uuid-1234-5678-9012",
      "user-123",
      { expirationTtl: 604800 }
    );
  });

  it("uses 7-day TTL (604800 seconds)", async () => {
    await createSession(mockKV, "user-123");

    const putCall = vi.mocked(mockKV.put).mock.calls[0];
    expect(putCall[2]).toEqual({ expirationTtl: 60 * 60 * 24 * 7 });
  });

  it("returns the generated token", async () => {
    const token = await createSession(mockKV, "user-123");
    expect(token).toBe("mock-uuid-1234-5678-9012");
  });
});

describe("getSession", () => {
  it("returns userId for valid token", async () => {
    vi.mocked(mockKV.get).mockResolvedValueOnce("user-456");

    const userId = await getSession(mockKV, "valid-token");
    expect(userId).toBe("user-456");
    expect(mockKV.get).toHaveBeenCalledWith("session:valid-token");
  });

  it("returns null for invalid or expired token", async () => {
    vi.mocked(mockKV.get).mockResolvedValueOnce(null);

    const userId = await getSession(mockKV, "expired-token");
    expect(userId).toBeNull();
  });
});

describe("deleteSession", () => {
  it("deletes the correct key from KV", async () => {
    await deleteSession(mockKV, "token-to-delete");

    expect(mockKV.delete).toHaveBeenCalledWith("session:token-to-delete");
  });
});

describe("refreshSession", () => {
  it("re-puts existing session with full TTL", async () => {
    vi.mocked(mockKV.get).mockResolvedValueOnce("user-789");

    const result = await refreshSession(mockKV, "active-token");

    expect(result).toBe(true);
    expect(mockKV.get).toHaveBeenCalledWith("session:active-token");
    expect(mockKV.put).toHaveBeenCalledWith(
      "session:active-token",
      "user-789",
      { expirationTtl: 604800 }
    );
  });

  it("returns false if session does not exist", async () => {
    vi.mocked(mockKV.get).mockResolvedValueOnce(null);

    const result = await refreshSession(mockKV, "nonexistent-token");

    expect(result).toBe(false);
    expect(mockKV.put).not.toHaveBeenCalled();
  });
});
