import { z } from "zod";

/**
 * Project medya validatorleri.
 * Single Source of Truth: client + server ayni semayi kullanir.
 */

export const PROJECT_IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const PROJECT_GALLERY_MAX_COUNT = 8;
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;
export type AllowedImageMime = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export const IMAGE_KINDS = ["gallery", "logo"] as const;
export type ImageKind = (typeof IMAGE_KINDS)[number];

export const imageUploadOptionsSchema = z.object({
  kind: z.enum(IMAGE_KINDS),
  caption: z.string().max(200).optional(),
});
export type ImageUploadOptions = z.infer<typeof imageUploadOptionsSchema>;

export const reorderImagesSchema = z.object({
  order: z
    .array(
      z.object({
        id: z.string().min(1),
        sortOrder: z.number().int().min(0),
      })
    )
    .min(1)
    .max(PROJECT_GALLERY_MAX_COUNT),
});
export type ReorderImagesInput = z.infer<typeof reorderImagesSchema>;
