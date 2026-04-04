import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  tagline: z.string().max(120).optional(),
  description: z.string().max(10000).optional(),
  categoryId: z.string(),
  typeId: z.string(),
  stageId: z.string(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  repoUrl: z.string().url().optional().or(z.literal("")),
  demoUrl: z.string().url().optional().or(z.literal("")),
  isPublic: z.boolean().default(true),
  isOpenSource: z.boolean().default(false),
  isSeekingInvestment: z.boolean().default(false),
  isSeekingTeammates: z.boolean().default(false),
  technologyIds: z.array(z.string()).max(20).optional(),
  startDate: z.string().datetime().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
