import { Hono } from "hono";
import { createStorageService } from "../services/storage.service";
import type { AppEnv } from "../types";

/**
 * Public dosya proxy.
 * GET /files/* => R2'den nesneyi okur, content-type ile dondurur.
 *
 * Cache: nesne anahtari benzersiz (nanoid icerir) => immutable cache guvenli.
 */
export const filesRoutes = new Hono<AppEnv>();

filesRoutes.get("/*", async (c) => {
  // /files/foo/bar.png icindeki "foo/bar.png" kismi
  const url = new URL(c.req.url);
  const prefix = "/files/";
  const idx = url.pathname.indexOf(prefix);
  if (idx === -1) return c.notFound();
  const key = url.pathname.slice(idx + prefix.length);
  if (!key) return c.notFound();

  const storage = createStorageService({
    bucket: c.env.FILES,
    baseUrl: c.env.API_URL,
  });
  const obj = await storage.get(key);
  if (!obj) return c.notFound();

  return new Response(obj.body, {
    status: 200,
    headers: {
      "Content-Type": obj.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
      "Content-Length": String(obj.size),
    },
  });
});
