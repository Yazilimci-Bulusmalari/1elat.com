import { describe, it, expect, beforeEach } from "vitest";
import { createStorageService, type StorageService } from "./storage.service";

/**
 * Fake R2Bucket - in-memory Map. Production R2 binding'in subset'ini implement eder.
 */
function createFakeBucket(): R2Bucket {
  const store = new Map<string, { body: ArrayBuffer; contentType: string }>();
  // R2Bucket type'inin tam shape'i yerine sadece kullanilan metodlari sunuyoruz.
  const bucket = {
    async put(
      key: string,
      body: ArrayBuffer,
      opts?: { httpMetadata?: { contentType?: string } }
    ) {
      store.set(key, {
        body,
        contentType: opts?.httpMetadata?.contentType ?? "application/octet-stream",
      });
      return {} as never;
    },
    async delete(key: string) {
      store.delete(key);
    },
    async get(key: string) {
      const obj = store.get(key);
      if (!obj) return null;
      return {
        arrayBuffer: async () => obj.body,
        httpMetadata: { contentType: obj.contentType },
      } as never;
    },
  } as unknown as R2Bucket;
  return bucket;
}

describe("StorageService", () => {
  let svc: StorageService;
  let bucket: R2Bucket;

  beforeEach(() => {
    bucket = createFakeBucket();
    svc = createStorageService({ bucket, baseUrl: "https://api.test.com" });
  });

  it("upload + get round-trip", async () => {
    const buf = new TextEncoder().encode("hello").buffer;
    await svc.upload("foo/bar.png", buf, "image/png");
    const got = await svc.get("foo/bar.png");
    expect(got).not.toBeNull();
    expect(got?.contentType).toBe("image/png");
    expect(new TextDecoder().decode(got!.body)).toBe("hello");
  });

  it("get bilinmeyen key icin null", async () => {
    const got = await svc.get("yok");
    expect(got).toBeNull();
  });

  it("delete sonrasi get null", async () => {
    const buf = new TextEncoder().encode("x").buffer;
    await svc.upload("a.txt", buf, "text/plain");
    await svc.delete("a.txt");
    expect(await svc.get("a.txt")).toBeNull();
  });

  it("getPublicUrl beklenen formatta", () => {
    expect(svc.getPublicUrl("projects/p1/images/abc.png")).toBe(
      "https://api.test.com/files/projects/p1/images/abc.png"
    );
  });

  it("getPublicUrl trailing slash temizler", () => {
    const s2 = createStorageService({ bucket, baseUrl: "https://x.com/" });
    expect(s2.getPublicUrl("k")).toBe("https://x.com/files/k");
  });

  it("extractKeyFromUrl: kendi domain", () => {
    expect(svc.extractKeyFromUrl("https://api.test.com/files/projects/p1/x.png")).toBe(
      "projects/p1/x.png"
    );
  });

  it("extractKeyFromUrl: yabanci domain null", () => {
    expect(svc.extractKeyFromUrl("https://other.com/files/x")).toBeNull();
  });
});
