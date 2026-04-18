import { and, eq } from "drizzle-orm";
import { schema, type Database } from "@1elat/db";
import type {
  InvitationStatus,
  ProjectInvitation,
  ProjectInvitationWithDetails,
  ProjectMemberWithUser,
} from "@1elat/shared";
import { generateId } from "../lib/id";
import {
  AlreadyMemberError,
  CannotInviteSelfError,
  DuplicateInvitationError,
  ForbiddenError,
  InvitationNotPendingError,
  NotFoundError,
  OwnerCannotLeaveError,
} from "../lib/errors";

/**
 * Project member & invitation service.
 * SRP: davet akisi (state machine: pending -> accepted|declined|cancelled) + uyelik.
 *
 * State machine kurallari:
 *  - Sadece owner invite/cancel.
 *  - Sadece invitee accept/decline.
 *  - Hepsi yalniz pending iken yapilabilir.
 *  - Owner kendini davet edemez.
 *  - Mevcut uye yeniden davet edilemez.
 *  - Aktif pending davet duplicate engeli.
 */

type InvitationRow = typeof schema.projectInvitations.$inferSelect;

function rowToInvitation(row: InvitationRow): ProjectInvitation {
  return {
    id: row.id,
    projectId: row.projectId,
    inviterId: row.inviterId,
    inviteeId: row.inviteeId,
    role: row.role,
    status: row.status,
    message: row.message,
    createdAt: row.createdAt,
    respondedAt: row.respondedAt,
  };
}

export async function createInvitation(
  db: Database,
  projectId: string,
  inviterId: string,
  inviteeUsername: string,
  role: string,
  message?: string
): Promise<ProjectInvitation> {
  const invitee = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.username, inviteeUsername))
    .get();
  if (!invitee) throw new NotFoundError("User");

  if (invitee.id === inviterId) throw new CannotInviteSelfError();

  // Owner invitee olamaz (zaten owner)
  const project = await db
    .select({ ownerId: schema.projects.ownerId })
    .from(schema.projects)
    .where(eq(schema.projects.id, projectId))
    .get();
  if (!project) throw new NotFoundError("Project");
  if (project.ownerId === invitee.id) throw new AlreadyMemberError();

  // Mevcut uye?
  const existingMember = await db
    .select({ id: schema.projectMembers.id })
    .from(schema.projectMembers)
    .where(
      and(
        eq(schema.projectMembers.projectId, projectId),
        eq(schema.projectMembers.userId, invitee.id)
      )
    )
    .get();
  if (existingMember) throw new AlreadyMemberError();

  // Aktif pending?
  const pending = await db
    .select({ id: schema.projectInvitations.id })
    .from(schema.projectInvitations)
    .where(
      and(
        eq(schema.projectInvitations.projectId, projectId),
        eq(schema.projectInvitations.inviteeId, invitee.id),
        eq(schema.projectInvitations.status, "pending")
      )
    )
    .get();
  if (pending) throw new DuplicateInvitationError();

  const id = generateId();
  const now = new Date();
  await db.insert(schema.projectInvitations).values({
    id,
    projectId,
    inviterId,
    inviteeId: invitee.id,
    role,
    status: "pending",
    message: message ?? null,
    createdAt: now,
    respondedAt: null,
  });

  const created = await db
    .select()
    .from(schema.projectInvitations)
    .where(eq(schema.projectInvitations.id, id))
    .get();
  if (!created) throw new Error("Invitation create failed");
  return rowToInvitation(created);
}

export async function acceptInvitation(
  db: Database,
  invitationId: string,
  userId: string
): Promise<void> {
  const inv = await db
    .select()
    .from(schema.projectInvitations)
    .where(eq(schema.projectInvitations.id, invitationId))
    .get();
  if (!inv) throw new NotFoundError("Invitation");
  if (inv.inviteeId !== userId) throw new ForbiddenError("Bu davet size ait degil");
  if (inv.status !== "pending") throw new InvitationNotPendingError();

  const now = new Date();
  await db
    .update(schema.projectInvitations)
    .set({ status: "accepted", respondedAt: now })
    .where(eq(schema.projectInvitations.id, invitationId));

  await db.insert(schema.projectMembers).values({
    id: generateId(),
    projectId: inv.projectId,
    userId: inv.inviteeId,
    role: inv.role,
    joinedAt: now,
  });
}

export async function declineInvitation(
  db: Database,
  invitationId: string,
  userId: string
): Promise<void> {
  const inv = await db
    .select()
    .from(schema.projectInvitations)
    .where(eq(schema.projectInvitations.id, invitationId))
    .get();
  if (!inv) throw new NotFoundError("Invitation");
  if (inv.inviteeId !== userId) throw new ForbiddenError("Bu davet size ait degil");
  if (inv.status !== "pending") throw new InvitationNotPendingError();

  await db
    .update(schema.projectInvitations)
    .set({ status: "declined", respondedAt: new Date() })
    .where(eq(schema.projectInvitations.id, invitationId));
}

export async function cancelInvitation(
  db: Database,
  invitationId: string,
  ownerId: string,
  isAdmin: boolean
): Promise<void> {
  const inv = await db
    .select({
      inv: schema.projectInvitations,
      ownerId: schema.projects.ownerId,
    })
    .from(schema.projectInvitations)
    .innerJoin(
      schema.projects,
      eq(schema.projects.id, schema.projectInvitations.projectId)
    )
    .where(eq(schema.projectInvitations.id, invitationId))
    .get();
  if (!inv) throw new NotFoundError("Invitation");
  if (inv.ownerId !== ownerId && !isAdmin) {
    throw new ForbiddenError("Bu daveti iptal edemezsiniz");
  }
  if (inv.inv.status !== "pending") throw new InvitationNotPendingError();

  await db
    .update(schema.projectInvitations)
    .set({ status: "cancelled", respondedAt: new Date() })
    .where(eq(schema.projectInvitations.id, invitationId));
}

export async function listProjectMembers(
  db: Database,
  projectId: string
): Promise<ProjectMemberWithUser[]> {
  const project = await db
    .select({
      ownerId: schema.projects.ownerId,
      ownerUsername: schema.users.username,
      ownerFirstName: schema.users.firstName,
      ownerLastName: schema.users.lastName,
      ownerAvatarUrl: schema.users.avatarUrl,
      ownerCreatedAt: schema.projects.createdAt,
    })
    .from(schema.projects)
    .innerJoin(schema.users, eq(schema.users.id, schema.projects.ownerId))
    .where(eq(schema.projects.id, projectId))
    .get();
  if (!project) throw new NotFoundError("Project");

  const memberRows = await db
    .select({
      member: schema.projectMembers,
      user: schema.users,
    })
    .from(schema.projectMembers)
    .innerJoin(schema.users, eq(schema.users.id, schema.projectMembers.userId))
    .where(eq(schema.projectMembers.projectId, projectId))
    .all();

  const owner: ProjectMemberWithUser = {
    id: `owner-${project.ownerId}`,
    projectId,
    userId: project.ownerId,
    username: project.ownerUsername,
    firstName: project.ownerFirstName,
    lastName: project.ownerLastName,
    avatarUrl: project.ownerAvatarUrl,
    role: "owner",
    joinedAt: project.ownerCreatedAt,
    isOwner: true,
  };

  const members: ProjectMemberWithUser[] = memberRows.map((r) => ({
    id: r.member.id,
    projectId,
    userId: r.user.id,
    username: r.user.username,
    firstName: r.user.firstName,
    lastName: r.user.lastName,
    avatarUrl: r.user.avatarUrl,
    role: r.member.role,
    joinedAt: r.member.joinedAt,
    isOwner: false,
  }));

  return [owner, ...members];
}

export async function removeProjectMember(
  db: Database,
  projectId: string,
  targetUserId: string,
  requesterId: string,
  isAdmin: boolean
): Promise<void> {
  const project = await db
    .select({ ownerId: schema.projects.ownerId })
    .from(schema.projects)
    .where(eq(schema.projects.id, projectId))
    .get();
  if (!project) throw new NotFoundError("Project");

  if (targetUserId === project.ownerId) throw new OwnerCannotLeaveError();

  const isOwner = project.ownerId === requesterId;
  const isSelf = targetUserId === requesterId;
  if (!isOwner && !isSelf && !isAdmin) {
    throw new ForbiddenError("Bu uyeyi cikartamazsiniz");
  }

  const member = await db
    .select({ id: schema.projectMembers.id })
    .from(schema.projectMembers)
    .where(
      and(
        eq(schema.projectMembers.projectId, projectId),
        eq(schema.projectMembers.userId, targetUserId)
      )
    )
    .get();
  if (!member) throw new NotFoundError("Member");

  await db
    .delete(schema.projectMembers)
    .where(eq(schema.projectMembers.id, member.id));
}

export async function listMyInvitations(
  db: Database,
  userId: string,
  status: InvitationStatus = "pending"
): Promise<ProjectInvitationWithDetails[]> {
  const rows = await db
    .select({
      inv: schema.projectInvitations,
      project: {
        id: schema.projects.id,
        slug: schema.projects.slug,
        name: schema.projects.name,
        thumbnailUrl: schema.projects.thumbnailUrl,
      },
    })
    .from(schema.projectInvitations)
    .innerJoin(schema.projects, eq(schema.projects.id, schema.projectInvitations.projectId))
    .where(
      and(
        eq(schema.projectInvitations.inviteeId, userId),
        eq(schema.projectInvitations.status, status)
      )
    )
    .all();

  return await hydrateInvitations(db, rows);
}

export async function listProjectInvitations(
  db: Database,
  projectId: string,
  status?: InvitationStatus
): Promise<ProjectInvitationWithDetails[]> {
  const conditions = [eq(schema.projectInvitations.projectId, projectId)];
  if (status) conditions.push(eq(schema.projectInvitations.status, status));

  const rows = await db
    .select({
      inv: schema.projectInvitations,
      project: {
        id: schema.projects.id,
        slug: schema.projects.slug,
        name: schema.projects.name,
        thumbnailUrl: schema.projects.thumbnailUrl,
      },
    })
    .from(schema.projectInvitations)
    .innerJoin(schema.projects, eq(schema.projects.id, schema.projectInvitations.projectId))
    .where(and(...conditions))
    .all();

  return await hydrateInvitations(db, rows);
}

async function hydrateInvitations(
  db: Database,
  rows: Array<{
    inv: InvitationRow;
    project: { id: string; slug: string; name: string; thumbnailUrl: string | null };
  }>
): Promise<ProjectInvitationWithDetails[]> {
  if (rows.length === 0) return [];
  const userIds = Array.from(
    new Set(rows.flatMap((r) => [r.inv.inviterId, r.inv.inviteeId]))
  );
  const users = await db
    .select({
      id: schema.users.id,
      username: schema.users.username,
      firstName: schema.users.firstName,
      lastName: schema.users.lastName,
      avatarUrl: schema.users.avatarUrl,
    })
    .from(schema.users)
    .all();
  const userMap = new Map(users.filter((u) => userIds.includes(u.id)).map((u) => [u.id, u]));

  return rows
    .map((r) => {
      const inviter = userMap.get(r.inv.inviterId);
      const invitee = userMap.get(r.inv.inviteeId);
      if (!inviter || !invitee) return null;
      return {
        ...rowToInvitation(r.inv),
        project: r.project,
        inviter,
        invitee,
      };
    })
    .filter((x): x is ProjectInvitationWithDetails => x !== null);
}

export async function getInvitationById(
  db: Database,
  id: string
): Promise<InvitationRow | null> {
  const row = await db
    .select()
    .from(schema.projectInvitations)
    .where(eq(schema.projectInvitations.id, id))
    .get();
  return row ?? null;
}
