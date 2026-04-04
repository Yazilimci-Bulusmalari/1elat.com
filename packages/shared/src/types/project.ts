import type { Technology, ProjectStage, Category, ProjectType } from "./lookups";
import type { UserCard } from "./user";

export interface Project {
  id: string;
  ownerId: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  categoryId: string;
  typeId: string;
  stageId: string;
  websiteUrl: string | null;
  repoUrl: string | null;
  demoUrl: string | null;
  thumbnailUrl: string | null;
  isPublic: boolean;
  isOpenSource: boolean;
  isSeekingInvestment: boolean;
  isSeekingTeammates: boolean;
  likesCount: number;
  upvotesCount: number;
  viewsCount: number;
  commentsCount: number;
  startDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  launchedAt: Date | null;
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
  category: { id: string; nameEn: string; nameTr: string };
  stage: { id: string; nameEn: string; nameTr: string; color: string | null };
  technologies: { id: string; name: string; iconUrl: string | null }[];
  likesCount: number;
  upvotesCount: number;
  commentsCount: number;
  isSeekingTeammates: boolean;
  createdAt: Date;
}

export interface ProjectDetail extends Project {
  owner: UserCard;
  category: Category;
  type: ProjectType;
  stage: ProjectStage;
  technologies: Technology[];
  images: ProjectImage[];
  members: ProjectMember[];
  isLiked?: boolean;
  isUpvoted?: boolean;
}

export interface ProjectImage {
  id: string;
  url: string;
  caption: string | null;
  sortOrder: number;
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
