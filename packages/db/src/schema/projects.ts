import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
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
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id),
    typeId: text("type_id")
      .notNull()
      .references(() => projectTypes.id),
    stageId: text("stage_id")
      .notNull()
      .references(() => projectStages.id),
    websiteUrl: text("website_url"),
    repoUrl: text("repo_url"),
    demoUrl: text("demo_url"),
    thumbnailUrl: text("thumbnail_url"),
    isPublic: integer("is_public", { mode: "boolean" }).default(true),
    isOpenSource: integer("is_open_source", { mode: "boolean" }).default(false),
    isSeekingInvestment: integer("is_seeking_investment", { mode: "boolean" }).default(false),
    isSeekingTeammates: integer("is_seeking_teammates", { mode: "boolean" }).default(false),
    likesCount: integer("likes_count").default(0),
    upvotesCount: integer("upvotes_count").default(0),
    viewsCount: integer("views_count").default(0),
    commentsCount: integer("comments_count").default(0),
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
    index("projects_category_idx").on(table.categoryId),
    index("projects_stage_idx").on(table.stageId),
    index("projects_created_idx").on(table.createdAt),
  ]
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
  (table) => [index("project_tech_project_idx").on(table.projectId)]
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
  (table) => [index("project_images_project_idx").on(table.projectId)]
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
  ]
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
  ]
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
  ]
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
  ]
);
