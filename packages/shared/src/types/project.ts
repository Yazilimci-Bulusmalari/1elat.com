import type { Technology, ProjectStage, Category, ProjectType } from "./lookups";
import type { UserCard } from "./user";

export type ProjectStatus = "draft" | "published" | "archived";
export type PricingModel = "free" | "freemium" | "paid" | "open_source";

export interface Project {
  id: string;
  ownerId: string;
  ownerUsername?: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  launchStory: string | null;
  status: ProjectStatus;
  categoryId: string | null;
  typeId: string | null;
  stageId: string | null;
  websiteUrl: string | null;
  repoUrl: string | null;
  demoUrl: string | null;
  thumbnailUrl: string | null;
  pricingModel: PricingModel | null;
  isPublic: boolean;
  isOpenSource: boolean;
  isSeekingInvestment: boolean;
  isSeekingTeammates: boolean;
  likesCount: number;
  upvotesCount: number;
  viewsCount: number;
  commentsCount: number;
  followersCount: number;
  startDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  launchedAt: Date | null;
  tags?: string[];
  technologyIds?: string[];
}

export interface ProjectListItem {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  thumbnailUrl: string | null;
  status: ProjectStatus;
  ownerUsername: string;
  ownerAvatarUrl: string | null;
  upvotesCount: number;
  likesCount: number;
  commentsCount?: number;
  launchedAt: Date | null;
  createdAt?: Date;
}

export interface ProjectCard {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  thumbnailUrl: string | null;
  owner: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  category: { id: string; nameEn: string; nameTr: string } | null;
  stage: { id: string; nameEn: string; nameTr: string; color: string | null } | null;
  technologies: { id: string; name: string; iconUrl: string | null }[];
  likesCount: number;
  upvotesCount: number;
  commentsCount: number;
  isSeekingTeammates: boolean;
  createdAt: Date;
}

export interface ProjectDetail extends Project {
  owner: UserCard;
  category: Category | null;
  type: ProjectType | null;
  stage: ProjectStage | null;
  technologies: Technology[];
  images: ProjectImage[];
  members: ProjectMember[];
  isLiked?: boolean;
  isUpvoted?: boolean;
  isFollowed?: boolean;
}

export interface ProjectImage {
  id: string;
  url: string;
  caption: string | null;
  sortOrder: number;
  createdAt?: Date;
}

export interface ProjectMember {
  id: string;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: string;
  joinedAt: Date;
}

export interface Comment {
  id: string;
  projectId: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  parentId: string | null;
  content: string;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
  replies?: Comment[];
}
