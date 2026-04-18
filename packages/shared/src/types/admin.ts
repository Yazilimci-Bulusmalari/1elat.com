import type { UserRole, UserStatus } from "./user";

export interface AdminUserListItem {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminUserListResponse {
  users: AdminUserListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalAdmins: number;
  signupsLast7Days: number;
  signupsLast30Days: number;
  projectsLast7Days: number;
}
