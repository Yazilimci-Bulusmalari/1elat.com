/**
 * StorageService - R2 erisim katmani.
 *
 * SRP: Sadece R2 nesne islemleri (upload/delete/get/url). DB veya is mantigi BILMEZ.
 * DIP: R2Bucket ve baseUrl parametre olarak alinir; testlerde fake binding gecilebilir.
 *
 * Public erisim: Worker proxy yaklasimi. `getPublicUrl(key)` => `${baseUrl}/files/${key}`.
 * Bu sayede bucket public olmasa da `GET /files/*` route'u uzerinden servis edilir.
 */

export interface StorageObject {
  body: ArrayBuffer;
  contentType: string;
  size: number;
}

export interface StorageService {
  upload(key: string, body: ArrayBuffer, contentType: string): Promise<void>;
  delete(key: string): Promise<void>;
  get(key: string): Promise<StorageObject | null>;
  getPublicUrl(key: string): string;
  /** Public URL'den anahtari cikarir; bizim domainimize ait degilse null. */
  extractKeyFromUrl(url: string): string | null;
}

export interface StorageDeps {
  bucket: R2Bucket;
  baseUrl: string; // ornek: "https://api.1elat.com"
}

/**
 * Factory: deps ile StorageService uretir.
 * Pattern: Dependency Injection + Adapter (R2 -> domain).
 */
export function createStorageService(deps: StorageDeps): StorageService {
  const baseUrl = (deps.baseUrl ?? "").replace(/\/$/, "");

  return {
    async upload(key, body, contentType) {
      await deps.bucket.put(key, body, {
        httpMetadata: { contentType },
      });
    },

    async delete(key) {
      await deps.bucket.delete(key);
    },

    async get(key) {
      const obj = await deps.bucket.get(key);
      if (!obj) return null;
      const buf = await obj.arrayBuffer();
      const contentType =
        obj.httpMetadata?.contentType ?? "application/octet-stream";
      return { body: buf, contentType, size: buf.byteLength };
    },

    getPublicUrl(key) {
      return `${baseUrl}/files/${key}`;
    },

    extractKeyFromUrl(url) {
      const prefix = `${baseUrl}/files/`;
      if (!url.startsWith(prefix)) return null;
      const key = url.slice(prefix.length);
      return key.length > 0 ? key : null;
    },
  };
}
