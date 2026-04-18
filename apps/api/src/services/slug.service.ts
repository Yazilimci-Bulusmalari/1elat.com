import { and, eq, like, ne } from "drizzle-orm";
import { schema, type Database } from "@1elat/db";

/**
 * Slug uretimi ve teklik garantisi.
 * SRP: yalnizca slug isleri. Persistence/CRUD baska serviste.
 */

const TR_MAP: Record<string, string> = {
  "ç": "c", "Ç": "c",
  "ğ": "g", "Ğ": "g",
  "ı": "i", "İ": "i",
  "ö": "o", "Ö": "o",
  "ş": "s", "Ş": "s",
  "ü": "u", "Ü": "u",
};

function transliterateTr(input: string): string {
  let out = "";
  for (const ch of input) {
    out += TR_MAP[ch] ?? ch;
  }
  return out;
}

/**
 * Pure function: name -> slug. Test edilebilir, yan etkisiz.
 */
export function generateSlug(name: string): string {
  const transliterated = transliterateTr(name).toLowerCase();
  // unicode normalizasyon ile aksanli latin harfleri ayir
  const normalized = transliterated.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  const replaced = normalized.replace(/[^a-z0-9]+/g, "-");
  const trimmed = replaced.replace(/^-+|-+$/g, "");
  return trimmed.length > 0 ? trimmed : "proje";
}

/**
 * (ownerId, slug) ciftinde teklik saglar. Cakisirsa -2, -3, ... ekler.
 * excludeProjectId verilirse o satir sayilmaz (update senaryosu).
 *
 * DB UNIQUE index zaten var; bu fonksiyon kullaniciya temiz slug uretmek icin.
 */
export async function ensureUniqueSlug(
  db: Database,
  ownerId: string,
  baseSlug: string,
  excludeProjectId?: string
): Promise<string> {
  const conditions = [
    eq(schema.projects.ownerId, ownerId),
    like(schema.projects.slug, `${baseSlug}%`),
  ];
  if (excludeProjectId) {
    conditions.push(ne(schema.projects.id, excludeProjectId));
  }

  const rows = await db
    .select({ slug: schema.projects.slug })
    .from(schema.projects)
    .where(and(...conditions))
    .all();

  const taken = new Set(rows.map((r) => r.slug));
  if (!taken.has(baseSlug)) return baseSlug;

  let n = 2;
  while (taken.has(`${baseSlug}-${n}`)) {
    n += 1;
  }
  return `${baseSlug}-${n}`;
}
