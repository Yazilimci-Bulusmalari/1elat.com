import { and, asc, eq, sql } from "drizzle-orm";
import { schema, type Database } from "@1elat/db";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  PROJECT_GALLERY_MAX_COUNT,
  PROJECT_IMAGE_MAX_BYTES,
  type AllowedImageMime,
  type ImageKind,
  type ProjectImage,
} from "@1elat/shared";
import { generateId } from "../lib/id";
import {
  FileTooLargeError,
  ForbiddenError,
  MediaLimitExceededError,
  NotFoundError,
  UnsupportedMediaTypeError,
} from "../lib/errors";
import type { StorageService } from "./storage.service";

/**
 * ProjectMediaService - DB (project_images, projects.thumbnailUrl) + Storage kompozisyonu.
 *
 * SRP: Sadece proje gorselleri (galeri + logo). Slug/state/etc DEGIL.
 * DIP: deps = { db, storage } - testlerde fake storage gecilebilir.
 * Strategy Pattern: `kind: 'gallery' | 'logo'` upload davranisini secer.
 * Compensation Pattern: DB write fail olursa upload edilen R2 nesnesi temizlenir.
 *
 * Not: D1 transaction destegi sinirli; best-effort tutarlilik.
 */

export interface MediaDeps {
  db: Database;
  storage: StorageService;
}

export interface UploadFileInput {
  /** Orijinal dosya adi (uzanti icin). */
  name: string;
  /** MIME tip. */
  type: string;
  /** Byte cinsinden boyut. */
  size: number;
  /** Dosya icerigi. */
  body: ArrayBuffer;
}

export interface UploadOptions {
  kind: ImageKind;
  caption?: string;
}

export type UploadResult =
  | { kind: "gallery"; image: ProjectImage }
  | { kind: "logo"; thumbnailUrl: string };

/** MIME -> uzanti haritasi (key icin guvenli). */
const MIME_TO_EXT: Record<AllowedImageMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function assertValidImageFile(file: UploadFileInput): asserts file is UploadFileInput & { type: AllowedImageMime } {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as AllowedImageMime)) {
    throw new UnsupportedMediaTypeError(
      `Sadece ${ALLOWED_IMAGE_MIME_TYPES.join(", ")} desteklenir`
    );
  }
  if (file.size > PROJECT_IMAGE_MAX_BYTES) {
    throw new FileTooLargeError(
      `Maksimum dosya boyutu ${PROJECT_IMAGE_MAX_BYTES / (1024 * 1024)} MB`
    );
  }
}

function buildKey(projectId: string, kind: ImageKind, ext: string): string {
  const id = generateId();
  const folder = kind === "logo" ? "logo" : "images";
  return `projects/${projectId}/${folder}/${id}.${ext}`;
}

function rowToImage(row: typeof schema.projectImages.$inferSelect): ProjectImage {
  return {
    id: row.id,
    url: row.url,
    caption: row.caption,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
  };
}

/**
 * Yeni gorsel yukler. Strategy: kind === 'gallery' veya 'logo'.
 */
export async function uploadProjectImage(
  deps: MediaDeps,
  projectId: string,
  file: UploadFileInput,
  options: UploadOptions
): Promise<UploadResult> {
  // Defense in depth: servis seviyesinde de validate.
  assertValidImageFile(file);

  const ext = MIME_TO_EXT[file.type as AllowedImageMime];
  const key = buildKey(projectId, options.kind, ext);

  if (options.kind === "gallery") {
    return uploadGallery(deps, projectId, key, file, options.caption);
  }
  return uploadLogo(deps, projectId, key, file);
}

async function uploadGallery(
  deps: MediaDeps,
  projectId: string,
  key: string,
  file: UploadFileInput,
  caption?: string
): Promise<UploadResult> {
  // Galeri limit kontrolu (race condition mumkun ama best-effort).
  const countRow = await deps.db
    .select({ value: sql<number>`count(*)` })
    .from(schema.projectImages)
    .where(eq(schema.projectImages.projectId, projectId))
    .get();
  const current = countRow?.value ?? 0;
  if (current + 1 > PROJECT_GALLERY_MAX_COUNT) {
    throw new MediaLimitExceededError(
      `Bir projeye en fazla ${PROJECT_GALLERY_MAX_COUNT} gorsel eklenebilir`
    );
  }

  // 1) R2 upload
  await deps.storage.upload(key, file.body, file.type);
  const url = deps.storage.getPublicUrl(key);

  // 2) DB write (compensation: fail olursa R2 sil)
  const id = generateId();
  const sortOrder = current; // 0-tabanli; current = mevcut sayi.
  try {
    await deps.db.insert(schema.projectImages).values({
      id,
      projectId,
      url,
      caption: caption ?? null,
      sortOrder,
      createdAt: new Date(),
    });
  } catch (err) {
    // Compensation: R2'deki yetim nesneyi temizle.
    await safeDelete(deps.storage, key);
    throw err;
  }

  const inserted = await deps.db
    .select()
    .from(schema.projectImages)
    .where(eq(schema.projectImages.id, id))
    .get();
  if (!inserted) throw new NotFoundError("ProjectImage");

  return { kind: "gallery", image: rowToImage(inserted) };
}

async function uploadLogo(
  deps: MediaDeps,
  projectId: string,
  key: string,
  file: UploadFileInput
): Promise<UploadResult> {
  const project = await deps.db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.id, projectId))
    .get();
  if (!project) throw new NotFoundError("Project");

  const oldUrl = project.thumbnailUrl;

  // 1) R2 upload
  await deps.storage.upload(key, file.body, file.type);
  const url = deps.storage.getPublicUrl(key);

  // 2) DB update (compensation: fail olursa yeni R2 sil)
  try {
    await deps.db
      .update(schema.projects)
      .set({ thumbnailUrl: url, updatedAt: new Date() })
      .where(eq(schema.projects.id, projectId));
  } catch (err) {
    await safeDelete(deps.storage, key);
    throw err;
  }

  // 3) Eski logoyu best-effort temizle
  if (oldUrl) {
    const oldKey = deps.storage.extractKeyFromUrl(oldUrl);
    if (oldKey) await safeDelete(deps.storage, oldKey);
  }

  return { kind: "logo", thumbnailUrl: url };
}

/**
 * Galeri gorseli sil. Once DB, sonra R2 (best-effort).
 */
export async function deleteProjectImage(
  deps: MediaDeps,
  projectId: string,
  imageId: string
): Promise<void> {
  const row = await deps.db
    .select()
    .from(schema.projectImages)
    .where(eq(schema.projectImages.id, imageId))
    .get();
  if (!row) throw new NotFoundError("ProjectImage");
  if (row.projectId !== projectId) {
    throw new ForbiddenError("Bu gorsel bu projeye ait degil");
  }

  await deps.db
    .delete(schema.projectImages)
    .where(eq(schema.projectImages.id, imageId));

  const key = deps.storage.extractKeyFromUrl(row.url);
  if (key) await safeDelete(deps.storage, key);
}

/**
 * Galeri sirasini guncelle. Tum id'lerin projeye ait oldugunu dogrular.
 */
export async function reorderProjectImages(
  deps: MediaDeps,
  projectId: string,
  order: Array<{ id: string; sortOrder: number }>
): Promise<ProjectImage[]> {
  const ids = order.map((o) => o.id);
  const existing = await deps.db
    .select()
    .from(schema.projectImages)
    .where(eq(schema.projectImages.projectId, projectId))
    .all();
  const existingIds = new Set(existing.map((r) => r.id));

  for (const id of ids) {
    if (!existingIds.has(id)) {
      throw new ForbiddenError("Gorsel bu projeye ait degil veya bulunamadi");
    }
  }

  // Sirali update'ler. D1 batch yok, sirayli yapariz.
  for (const item of order) {
    await deps.db
      .update(schema.projectImages)
      .set({ sortOrder: item.sortOrder })
      .where(
        and(
          eq(schema.projectImages.id, item.id),
          eq(schema.projectImages.projectId, projectId)
        )
      );
  }

  const refreshed = await deps.db
    .select()
    .from(schema.projectImages)
    .where(eq(schema.projectImages.projectId, projectId))
    .orderBy(asc(schema.projectImages.sortOrder))
    .all();
  return refreshed.map(rowToImage);
}

/**
 * Logoyu temizle: thumbnailUrl = NULL + R2 delete.
 */
export async function deleteProjectLogo(
  deps: MediaDeps,
  projectId: string
): Promise<void> {
  const project = await deps.db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.id, projectId))
    .get();
  if (!project) throw new NotFoundError("Project");

  const oldUrl = project.thumbnailUrl;
  await deps.db
    .update(schema.projects)
    .set({ thumbnailUrl: null, updatedAt: new Date() })
    .where(eq(schema.projects.id, projectId));

  if (oldUrl) {
    const key = deps.storage.extractKeyFromUrl(oldUrl);
    if (key) await safeDelete(deps.storage, key);
  }
}

/**
 * Galeri listele (sortOrder asc).
 */
export async function listProjectImages(
  deps: MediaDeps,
  projectId: string
): Promise<ProjectImage[]> {
  const rows = await deps.db
    .select()
    .from(schema.projectImages)
    .where(eq(schema.projectImages.projectId, projectId))
    .orderBy(asc(schema.projectImages.sortOrder))
    .all();
  return rows.map(rowToImage);
}

async function safeDelete(storage: StorageService, key: string): Promise<void> {
  try {
    await storage.delete(key);
  } catch (err) {
    console.error("storage.delete failed (best-effort):", key, err);
  }
}
