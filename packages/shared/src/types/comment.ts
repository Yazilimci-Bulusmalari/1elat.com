export interface CommentAuthor {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface CommentWithAuthor {
  id: string;
  projectId: string;
  authorId: string;
  author: CommentAuthor;
  parentId: string | null;
  content: string;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
  likedByViewer?: boolean;
  replies?: CommentWithAuthor[];
}

export type CommentSort = "newest" | "oldest" | "mostLiked";
