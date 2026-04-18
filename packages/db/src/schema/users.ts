import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { professions, skills } from "./lookups";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    githubId: text("github_id"),
    googleId: text("google_id"),
    email: text("email").notNull(),
    username: text("username").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    coverUrl: text("cover_url"),
    website: text("website"),
    githubUrl: text("github_url"),
    linkedinUrl: text("linkedin_url"),
    twitterUrl: text("twitter_url"),
    location: text("location"),
    rating: integer("rating").default(0),
    ratingCount: integer("rating_count").default(0),
    isPublic: integer("is_public", { mode: "boolean" }).default(true),
    isOpenToWork: integer("is_open_to_work", { mode: "boolean" }).default(false),
    role: text("role", { enum: ["user", "admin"] })
      .notNull()
      .default("user"),
    status: text("status", { enum: ["active", "suspended"] })
      .notNull()
      .default("active"),
    lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("users_email_idx").on(table.email),
    index("users_username_idx").on(table.username),
    index("users_github_id_idx").on(table.githubId),
    index("users_google_id_idx").on(table.googleId),
  ]
);

export const userProfessions = sqliteTable(
  "user_professions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    professionId: text("profession_id")
      .notNull()
      .references(() => professions.id),
    isPrimary: integer("is_primary", { mode: "boolean" }).default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [index("user_professions_user_idx").on(table.userId)]
);

export const userSkills = sqliteTable(
  "user_skills",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    skillId: text("skill_id")
      .notNull()
      .references(() => skills.id),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("user_skills_user_idx").on(table.userId),
    index("user_skills_skill_idx").on(table.skillId),
  ]
);

export const follows = sqliteTable(
  "follows",
  {
    id: text("id").primaryKey(),
    followerId: text("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: text("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("follows_follower_idx").on(table.followerId),
    index("follows_following_idx").on(table.followingId),
  ]
);
