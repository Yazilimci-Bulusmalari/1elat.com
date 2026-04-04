import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(
      /^[a-z0-9_-]+$/,
      "Username must be lowercase alphanumeric with hyphens or underscores"
    ),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  twitterUrl: z.string().url().optional(),
  location: z.string().max(100).optional(),
  professionIds: z.array(z.string()).min(1).max(5),
  primaryProfessionId: z.string(),
});

export const updateUserSchema = createUserSchema.partial().omit({ email: true });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
