import { z } from "zod";

const optionalUrl = z
  .union([z.string(), z.undefined()])
  .transform((v) => (v === "" || v === undefined ? undefined : v))
  .pipe(z.string().url().optional());

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
  avatarUrl: optionalUrl,
  website: optionalUrl,
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  twitterUrl: optionalUrl,
  location: z.string().max(100).optional(),
  professionIds: z.array(z.string()).min(1).max(5),
  primaryProfessionId: z.string(),
});

export const updateUserSchema = createUserSchema.partial().omit({ email: true });

export const updateUserSkillsSchema = z.object({
  skillIds: z.array(z.string()).min(1).max(15),
});

export const updateOpenToWorkSchema = z.object({
  isOpenToWork: z.boolean(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserSkillsInput = z.infer<typeof updateUserSkillsSchema>;
export type UpdateOpenToWorkInput = z.infer<typeof updateOpenToWorkSchema>;
