import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const optionalUrl = z.string().url().nullable().optional().or(z.literal(""));

export const createProjectSchema = z.object({
  name: z.string().min(2).max(80),
});

export const updateProjectSchema = z
  .object({
    name: z.string().min(2).max(80).optional(),
    tagline: z.string().max(80).nullable().optional(),
    description: z.string().max(10000).nullable().optional(),
    launchStory: z.string().max(20000).nullable().optional(),
    slug: z.string().regex(slugRegex).min(2).max(60).optional(),
    websiteUrl: optionalUrl,
    repoUrl: optionalUrl,
    demoUrl: optionalUrl,
    categoryId: z.string().nullable().optional(),
    typeId: z.string().nullable().optional(),
    stageId: z.string().nullable().optional(),
    technologyIds: z.array(z.string()).max(20).optional(),
    tags: z.array(z.string().min(1).max(30)).max(5).optional(),
    pricingModel: z
      .enum(["free", "freemium", "paid", "open_source"])
      .nullable()
      .optional(),
    isPublic: z.boolean().optional(),
    isOpenSource: z.boolean().optional(),
    isSeekingInvestment: z.boolean().optional(),
    isSeekingTeammates: z.boolean().optional(),
    startDate: z.string().datetime().nullable().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, {
    message: "En az bir alan gönderilmeli",
  });

export const publishProjectSchema = z
  .object({
    name: z.string().min(2).max(80),
    tagline: z.string().min(1).max(80),
    description: z.string().min(120).max(10000),
    categoryId: z.string().min(1),
    typeId: z.string().min(1),
    stageId: z.string().min(1),
    websiteUrl: z.string().url().nullable().optional(),
    repoUrl: z.string().url().nullable().optional(),
    demoUrl: z.string().url().nullable().optional(),
  })
  .refine((o) => Boolean(o.websiteUrl || o.repoUrl || o.demoUrl), {
    message: "En az bir bağlantı (websiteUrl, repoUrl veya demoUrl) zorunlu",
    path: ["websiteUrl"],
  });

export const listProjectsQuerySchema = z.object({
  category: z.string().optional(),
  stage: z.string().optional(),
  tag: z.string().optional(),
  technology: z.string().optional(),
  search: z.string().min(1).max(100).optional(),
  sort: z.enum(["newest", "popular", "launched"]).default("newest"),
  status: z.enum(["draft", "published", "archived", "all"]).default("published"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const listMyProjectsQuerySchema = z.object({
  status: z.enum(["draft", "published", "archived", "all"]).default("all"),
  sort: z.enum(["newest", "popular", "launched"]).default("newest"),
  search: z.string().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type PublishProjectInput = z.infer<typeof publishProjectSchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
export type ListMyProjectsQuery = z.infer<typeof listMyProjectsQuerySchema>;
