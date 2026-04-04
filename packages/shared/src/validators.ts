import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  githubId: z.string().nullable(),
  googleId: z.string().nullable(),
  email: z.string().email(),
  name: z.string().min(1),
  avatarUrl: z.string().url().nullable(),
  createdAt: z.coerce.date(),
});

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export type UserSchema = z.infer<typeof userSchema>;
export type CreateProjectSchema = z.infer<typeof createProjectSchema>;
