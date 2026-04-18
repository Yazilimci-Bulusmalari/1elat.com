export type UserRole = "user" | "admin";
export type UserStatus = "active" | "suspended";

export interface Skill {
  id: string;
  slug: string;
  nameEn: string;
  nameTr: string;
  icon: string | null;
  parentId: string | null;
}

export interface User {
  id: string;
  githubId: string | null;
  googleId: string | null;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: Date | null;
  username: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  website: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  location: string | null;
  rating: number;
  ratingCount: number;
  isPublic: boolean;
  isOpenToWork: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCard {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  rating: number;
  isOpenToWork: boolean;
  professions: {
    id: string;
    nameEn: string;
    nameTr: string;
    isPrimary: boolean;
  }[];
  skills: Skill[];
  projectCount: number;
  followerCount: number;
}

export interface UserProfile extends User {
  professions: {
    id: string;
    nameEn: string;
    nameTr: string;
    isPrimary: boolean;
  }[];
  skills: Skill[];
  projectCount: number;
  followerCount: number;
  followingCount: number;
  isFollowing?: boolean;
}
