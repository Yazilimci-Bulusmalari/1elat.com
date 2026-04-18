import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { categories, projectTypes, projectStages, technologies } from "./lookups";

export const projects = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    tagline: text("tagline"),
    description: text("description"),
    launchStory: text("launch_story"),
    categoryId: text("category_id").references(() => categories.id),
    typeId: text("type_id").references(() => projectTypes.id),
    stageId: text("stage_id").references(() => projectStages.id),
    websiteUrl: text("website_url"),
    repoUrl: text("repo_url"),
    demoUrl: text("demo_url"),
    thumbnailUrl: text("thumbnail_url"),
    pricingModel: text("pricing_model", {
      enum: ["free", "freemium", "paid", "open_source"],
    }),
    status: text("status", { enum: ["draft", "published", "archived"] })
      .notNull()
      .default("draft"),
    isPublic: integer("is_public", { mode: "boolean" }).default(true),
    isOpenSource: integer("is_open_source", { mode: "boolean" }).default(false),
    isSeekingInvestment: integer("is_seeking_investment", { mode: "boolean" }).default(false),
    isSeekingTeammates: integer("is_seeking_teammates", { mode: "boolean" }).default(false),
    likesCount: integer("likes_count").default(0),
    upvotesCount: integer("upvotes_count").default(0),
    viewsCount: integer("views_count").default(0),
    commentsCount: integer("comments_count").default(0),
    followersCount: integer("followers_count").default(0),
    startDate: integer("start_date", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    launchedAt: integer("launched_at", { mode: "timestamp" }),
  },
  (table) => [
    index("projects_owner_idx").on(table.ownerId),
    index("projects_slug_idx").on(table.slug),
    uniqueIndex("projects_owner_slug_unique").on(table.ownerId, table.slug),
    index("projects_status_idx").on(table.status),
    index("projects_category_idx").on(table.categoryId),
    index("projects_stage_idx").on(table.stageId),
    index("projects_created_idx").on(table.createdAt),
  ],
);

export const projectTags = sqliteTable(
  "project_tags",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("project_tags_project_idx").on(table.projectId),
    uniqueIndex("project_tags_project_label_unique").on(table.projectId, table.label),
  ],
);

export const projectTechnologies = sqliteTable(
  "project_technologies",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    technologyId: text("technology_id")
      .notNull()
      .references(() => technologies.id),
  },
  (table) => [index("project_tech_project_idx").on(table.projectId)],
);

export const projectImages = sqliteTable(
  "project_images",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    caption: text("caption"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [index("project_images_project_idx").on(table.projectId)],
);

export const projectMembers = sqliteTable(
  "project_members",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    joinedAt: integer("joined_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("project_members_project_idx").on(table.projectId),
    index("project_members_user_idx").on(table.userId),
  ],
);

export const projectLikes = sqliteTable(
  "project_likes",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("project_likes_project_idx").on(table.projectId),
    index("project_likes_user_idx").on(table.userId),
  ],
);

export const projectUpvotes = sqliteTable(
  "project_upvotes",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("project_upvotes_project_idx").on(table.projectId),
    index("project_upvotes_user_idx").on(table.userId),
  ],
);

export const projectFollowers = sqliteTable(
  "project_followers",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("project_followers_project_idx").on(table.projectId),
    index("project_followers_user_idx").on(table.userId),
    uniqueIndex("project_followers_project_user_unique").on(table.projectId, table.userId),
  ],
);

export const projectInvitations = sqliteTable(
  "project_invitations",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    inviteeId: text("invitee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    status: text("status", {
      enum: ["pending", "accepted", "declined", "cancelled"],
    })
      .notNull()
      .default("pending"),
    message: text("message"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    respondedAt: integer("responded_at", { mode: "timestamp" }),
  },
  (table) => [
    index("project_invitations_project_idx").on(table.projectId),
    index("project_invitations_invitee_idx").on(table.inviteeId),
    index("project_invitations_status_idx").on(table.status),
  ],
);

export const comments = sqliteTable(
  "comments",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    parentId: text("parent_id"),
    content: text("content").notNull(),
    likesCount: integer("likes_count").default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("comments_project_idx").on(table.projectId),
    index("comments_author_idx").on(table.authorId),
    index("comments_parent_idx").on(table.parentId),
  ],
);

export const commentLikes = sqliteTable(
  "comment_likes",
  {
    id: text("id").primaryKey(),
    commentId: text("comment_id")
      .notNull()
      .references(() => comments.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("comment_likes_comment_idx").on(table.commentId),
    index("comment_likes_user_idx").on(table.userId),
    uniqueIndex("comment_likes_comment_user_unique").on(table.commentId, table.userId),
  ],
);
