import { z } from "zod";

export const createInvitationSchema = z.object({
  inviteeUsername: z.string().min(2).max(60),
  role: z.string().min(1).max(60),
  message: z.string().max(500).optional(),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
