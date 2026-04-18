export type InvitationStatus = "pending" | "accepted" | "declined" | "cancelled";

export interface ProjectInvitation {
  id: string;
  projectId: string;
  inviterId: string;
  inviteeId: string;
  role: string;
  status: InvitationStatus;
  message: string | null;
  createdAt: Date;
  respondedAt: Date | null;
}

export interface ProjectInvitationWithDetails extends ProjectInvitation {
  project: {
    id: string;
    slug: string;
    name: string;
    thumbnailUrl: string | null;
  };
  inviter: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  invitee: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

export interface ProjectMemberWithUser {
  id: string;
  projectId: string;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: string;
  joinedAt: Date;
  isOwner: boolean;
}

export interface EngagementToggleResult {
  active: boolean;
  count: number;
}

export type EngagementKind =
  | "project_upvote"
  | "project_like"
  | "project_follow"
  | "comment_like";
