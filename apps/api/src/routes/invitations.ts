import { Hono } from "hono";
import { authRequired } from "../middleware/auth";
import { NotFoundError, ValidationError } from "../lib/errors";
import {
  acceptInvitation,
  cancelInvitation,
  declineInvitation,
  listMyInvitations,
} from "../services/project-member.service";
import { getUserById } from "../services/user.service";
import type { AppEnv } from "../types";
import type { InvitationStatus } from "@1elat/shared";

export const invitationsRoutes = new Hono<AppEnv>();

const VALID_STATUSES: InvitationStatus[] = [
  "pending",
  "accepted",
  "declined",
  "cancelled",
];

/**
 * GET /me/invitations?status=pending - kendime gelen davetler.
 */
invitationsRoutes.get("/me/invitations", authRequired, async (c) => {
  const statusParam = c.req.query("status") ?? "pending";
  if (!VALID_STATUSES.includes(statusParam as InvitationStatus)) {
    throw new ValidationError("Gecersiz status parametresi");
  }
  const userId = c.get("userId");
  const db = c.get("db");
  const items = await listMyInvitations(db, userId, statusParam as InvitationStatus);
  return c.json({ data: { items, total: items.length }, error: null });
});

/**
 * POST /invitations/:id/accept - sadece invitee.
 */
invitationsRoutes.post("/invitations/:id/accept", authRequired, async (c) => {
  const id = c.req.param("id");
  if (!id) throw new NotFoundError("Invitation");
  const userId = c.get("userId");
  const db = c.get("db");
  await acceptInvitation(db, id, userId);
  return c.json({ data: { success: true }, error: null });
});

/**
 * POST /invitations/:id/decline - sadece invitee.
 */
invitationsRoutes.post("/invitations/:id/decline", authRequired, async (c) => {
  const id = c.req.param("id");
  if (!id) throw new NotFoundError("Invitation");
  const userId = c.get("userId");
  const db = c.get("db");
  await declineInvitation(db, id, userId);
  return c.json({ data: { success: true }, error: null });
});

/**
 * POST /invitations/:id/cancel - sadece owner veya admin.
 */
invitationsRoutes.post("/invitations/:id/cancel", authRequired, async (c) => {
  const id = c.req.param("id");
  if (!id) throw new NotFoundError("Invitation");
  const userId = c.get("userId");
  const db = c.get("db");
  const me = await getUserById(db, userId);
  const isAdmin = me?.role === "admin";
  await cancelInvitation(db, id, userId, isAdmin);
  return c.json({ data: { success: true }, error: null });
});
