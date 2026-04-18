import { z } from "zod";

export const updateAdminUserSchema = z
  .object({
    role: z.enum(["user", "admin"]).optional(),
    status: z.enum(["active", "suspended"]).optional(),
  })
  .refine((data) => data.role !== undefined || data.status !== undefined, {
    message: "En az bir alan (role veya status) gonderilmelidir",
  });

export type UpdateAdminUserInput = z.infer<typeof updateAdminUserSchema>;

export const listAdminUsersQuerySchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  role: z.enum(["all", "admin", "user"]).default("all"),
  status: z.enum(["all", "active", "suspended"]).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListAdminUsersQuery = z.infer<typeof listAdminUsersQuerySchema>;

export const createSkillSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  nameEn: z.string().min(1).max(100),
  nameTr: z.string().min(1).max(100),
  icon: z.string().max(50).optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateSkillSchema = createSkillSchema.partial();

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;
