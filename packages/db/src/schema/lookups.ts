import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const professions = sqliteTable("professions", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  nameEn: text("name_en").notNull(),
  nameTr: text("name_tr").notNull(),
  icon: text("icon"),
  group: text("group"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  nameEn: text("name_en").notNull(),
  nameTr: text("name_tr").notNull(),
  icon: text("icon"),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const projectTypes = sqliteTable("project_types", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  nameEn: text("name_en").notNull(),
  nameTr: text("name_tr").notNull(),
  icon: text("icon"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const projectStages = sqliteTable("project_stages", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  nameEn: text("name_en").notNull(),
  nameTr: text("name_tr").notNull(),
  color: text("color"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const technologies = sqliteTable("technologies", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  iconUrl: text("icon_url"),
  group: text("group"),
  websiteUrl: text("website_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
