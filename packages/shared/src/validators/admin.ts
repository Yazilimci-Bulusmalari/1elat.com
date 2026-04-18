import { z } from "zod";

/**
 * Admin tarafindan kullanici guncelleme sema'si.
 * En az bir alan zorunlu (refine ile dogrulanir).
 */
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
