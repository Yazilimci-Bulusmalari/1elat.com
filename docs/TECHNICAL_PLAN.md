# 1elat.com - Teknik Mimari Plani

> Gelistirici Sosyal Platformu | Tarih: 2026-04-04

---

## Icindekiler

1. [Veritabani Semasi](#1-veritabani-semasi)
2. [API Endpoint Listesi](#2-api-endpoint-listesi)
3. [Dosya/Klasor Yapisi](#3-dosyaklasor-yapisi)
4. [Kimlik Dogrulama Akisi](#4-kimlik-dogrulama-akisi)
5. [Dosya Yukleme Stratejisi](#5-dosya-yukleme-stratejisi-r2)
6. [Bildirim Sistemi](#6-bildirim-sistemi)
7. [Performans Stratejisi](#7-performans-stratejisi)
8. [Guvenlik Onlemleri](#8-guvenlik-onlemleri)
9. [Uygulama Fazlari](#9-uygulama-fazlari)

---

## 1. Veritabani Semasi

Drizzle ORM + Cloudflare D1 (SQLite) uyumlu tam sema.

### 1.1 Kullanici Sistemi

```typescript
// packages/db/src/schema/users.ts
import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// =============================================
// KULLANICILAR
// =============================================
export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // nanoid
  githubId: text("github_id"),
  googleId: text("google_id"),
  email: text("email").notNull(),
  username: text("username").notNull(), // benzersiz kullanici adi
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  profession: text("profession").notNull(), // sabit listeden secim
  bio: text("bio"), // max 500 karakter
  avatarUrl: text("avatar_url"),
  coverUrl: text("cover_url"),
  website: text("website"),
  githubUrl: text("github_url"),
  linkedinUrl: text("linkedin_url"),
  twitterUrl: text("twitter_url"),
  location: text("location"),
  rating: integer("rating").default(0), // 0-100 arasi (10 uzerinden * 10)
  ratingCount: integer("rating_count").default(0),
  isPublic: integer("is_public", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  uniqueIndex("users_email_idx").on(table.email),
  uniqueIndex("users_username_idx").on(table.username),
  uniqueIndex("users_github_id_idx").on(table.githubId),
  uniqueIndex("users_google_id_idx").on(table.googleId),
  index("users_profession_idx").on(table.profession),
]);

// =============================================
// MESLEKLER (sabit liste)
// =============================================
export const PROFESSIONS = [
  "frontend-developer",
  "backend-developer",
  "fullstack-developer",
  "mobile-developer",
  "devops-engineer",
  "data-scientist",
  "ml-engineer",
  "ui-designer",
  "ux-designer",
  "product-manager",
  "project-manager",
  "qa-engineer",
  "security-engineer",
  "cloud-architect",
  "game-developer",
  "blockchain-developer",
  "embedded-engineer",
  "technical-writer",
  "other",
] as const;

export type Profession = typeof PROFESSIONS[number];

// =============================================
// TAKIP SISTEMI (follow/unfollow)
// =============================================
export const follows = sqliteTable("follows", {
  id: text("id").primaryKey(),
  followerId: text("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  followingId: text("following_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  uniqueIndex("follows_unique_idx").on(table.followerId, table.followingId),
  index("follows_follower_idx").on(table.followerId),
  index("follows_following_idx").on(table.followingId),
]);

// =============================================
// BAGLANTI SISTEMI (LinkedIn tarzi)
// =============================================
export const connections = sqliteTable("connections", {
  id: text("id").primaryKey(),
  requesterId: text("requester_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  receiverId: text("receiver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["pending", "accepted", "rejected"] }).notNull().default("pending"),
  message: text("message"), // istege ekli mesaj
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  uniqueIndex("connections_unique_idx").on(table.requesterId, table.receiverId),
  index("connections_requester_idx").on(table.requesterId),
  index("connections_receiver_idx").on(table.receiverId),
  index("connections_status_idx").on(table.status),
]);

// =============================================
// REFERANS SISTEMI
// =============================================
export const references = sqliteTable("references", {
  id: text("id").primaryKey(),
  authorId: text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  targetId: text("target_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(), // referans metni
  rating: integer("rating").notNull(), // 1-10
  relationship: text("relationship", {
    enum: ["colleague", "manager", "direct-report", "collaborator", "mentor", "mentee", "other"]
  }).notNull(),
  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
  isPublic: integer("is_public", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  uniqueIndex("references_author_target_idx").on(table.authorId, table.targetId),
  index("references_target_idx").on(table.targetId),
  index("references_author_idx").on(table.authorId),
]);
```

### 1.2 Proje Sistemi

```typescript
// packages/db/src/schema/projects.ts
import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { users } from "./users";

// =============================================
// PROJELER
// =============================================
export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(), // URL-friendly isim
  name: text("name").notNull(),
  tagline: text("tagline"), // kisa aciklama (max 120)
  description: text("description"), // detayli aciklama (markdown destekli)
  category: text("category").notNull(), // ana kategori
  type: text("type", {
    enum: ["web-app", "mobile-app", "desktop-app", "api", "library", "cli-tool",
           "browser-extension", "saas", "open-source", "hardware", "other"]
  }).notNull(),
  stage: text("stage", {
    enum: ["idea", "development", "beta", "launched", "maintained", "archived", "exit"]
  }).notNull().default("idea"),
  websiteUrl: text("website_url"),
  repoUrl: text("repo_url"),
  demoUrl: text("demo_url"),
  thumbnailUrl: text("thumbnail_url"), // R2'de ana gorsel
  isPublic: integer("is_public", { mode: "boolean" }).default(true),
  isOpenSource: integer("is_open_source", { mode: "boolean" }).default(false),
  likesCount: integer("likes_count").default(0),
  upvotesCount: integer("upvotes_count").default(0),
  viewsCount: integer("views_count").default(0),
  commentsCount: integer("comments_count").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  launchedAt: integer("launched_at", { mode: "timestamp" }),
}, (table) => [
  uniqueIndex("projects_slug_idx").on(table.slug),
  index("projects_owner_idx").on(table.ownerId),
  index("projects_category_idx").on(table.category),
  index("projects_type_idx").on(table.type),
  index("projects_stage_idx").on(table.stage),
  index("projects_created_idx").on(table.createdAt),
  index("projects_likes_idx").on(table.likesCount),
  index("projects_upvotes_idx").on(table.upvotesCount),
]);

// =============================================
// PROJE KATEGORILERI
// =============================================
export const PROJECT_CATEGORIES = [
  "developer-tools",
  "productivity",
  "education",
  "social",
  "e-commerce",
  "fintech",
  "health",
  "entertainment",
  "ai-ml",
  "blockchain-web3",
  "iot",
  "cybersecurity",
  "data-analytics",
  "communication",
  "design-tools",
  "devops-infra",
  "gaming",
  "other",
] as const;

// =============================================
// PROJE TEKNOLOJI STACK
// =============================================
export const projectTechnologies = sqliteTable("project_technologies", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // "React", "Node.js", "PostgreSQL" vb.
  category: text("category", {
    enum: ["language", "framework", "database", "cloud", "tool", "library", "other"]
  }).notNull(),
}, (table) => [
  index("project_tech_project_idx").on(table.projectId),
  index("project_tech_name_idx").on(table.name),
]);

// =============================================
// PROJE GORSELLERI
// =============================================
export const projectImages = sqliteTable("project_images", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  url: text("url").notNull(), // R2 URL
  key: text("key").notNull(), // R2 object key
  alt: text("alt"),
  order: integer("order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  index("project_images_project_idx").on(table.projectId),
]);

// =============================================
// TAKIM UYELERI
// =============================================
export const projectMembers = sqliteTable("project_members", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role", {
    enum: ["owner", "admin", "member", "contributor"]
  }).notNull().default("member"),
  title: text("title"), // "Frontend Lead", "Designer" vb.
  joinedAt: integer("joined_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  uniqueIndex("project_members_unique_idx").on(table.projectId, table.userId),
  index("project_members_project_idx").on(table.projectId),
  index("project_members_user_idx").on(table.userId),
]);

// =============================================
// BEGENI (LIKE) ve UPVOTE
// =============================================
export const projectLikes = sqliteTable("project_likes", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  uniqueIndex("project_likes_unique_idx").on(table.projectId, table.userId),
  index("project_likes_project_idx").on(table.projectId),
]);

export const projectUpvotes = sqliteTable("project_upvotes", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  uniqueIndex("project_upvotes_unique_idx").on(table.projectId, table.userId),
  index("project_upvotes_project_idx").on(table.projectId),
]);

// =============================================
// YORUMLAR
// =============================================
export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  authorId: text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  parentId: text("parent_id"), // yanit icin (self-reference)
  content: text("content").notNull(),
  isEdited: integer("is_edited", { mode: "boolean" }).default(false),
  likesCount: integer("likes_count").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  index("comments_project_idx").on(table.projectId),
  index("comments_author_idx").on(table.authorId),
  index("comments_parent_idx").on(table.parentId),
  index("comments_created_idx").on(table.createdAt),
]);

export const commentLikes = sqliteTable("comment_likes", {
  id: text("id").primaryKey(),
  commentId: text("comment_id").notNull().references(() => comments.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  uniqueIndex("comment_likes_unique_idx").on(table.commentId, table.userId),
]);

// =============================================
// CHANGELOG
// =============================================
export const changelogs = sqliteTable("changelogs", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  authorId: text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(), // markdown
  version: text("version"), // semver
  type: text("type", {
    enum: ["feature", "bugfix", "improvement", "breaking", "security", "other"]
  }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  index("changelogs_project_idx").on(table.projectId),
  index("changelogs_created_idx").on(table.createdAt),
]);

// =============================================
// ACIK POZISYONLAR (calisma arkadasi arama)
// =============================================
export const openPositions = sqliteTable("open_positions", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(), // "Frontend Developer", "UI Designer" vb.
  description: text("description").notNull(),
  skills: text("skills").notNull(), // JSON array: ["React", "TypeScript"]
  type: text("type", {
    enum: ["full-time", "part-time", "freelance", "volunteer", "co-founder"]
  }).notNull(),
  isPaid: integer("is_paid", { mode: "boolean" }).default(false),
  isOpen: integer("is_open", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  index("positions_project_idx").on(table.projectId),
  index("positions_open_idx").on(table.isOpen),
]);

// =============================================
// POZISYON BASVURULARI
// =============================================
export const positionApplications = sqliteTable("position_applications", {
  id: text("id").primaryKey(),
  positionId: text("position_id").notNull().references(() => openPositions.id, { onDelete: "cascade" }),
  applicantId: text("applicant_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  status: text("status", {
    enum: ["pending", "accepted", "rejected", "withdrawn"]
  }).notNull().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  uniqueIndex("applications_unique_idx").on(table.positionId, table.applicantId),
  index("applications_position_idx").on(table.positionId),
  index("applications_applicant_idx").on(table.applicantId),
]);
```

### 1.3 Bildirim ve Aktivite Sistemi

```typescript
// packages/db/src/schema/notifications.ts
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { users } from "./users";

// =============================================
// BILDIRIMLER
// =============================================
export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  actorId: text("actor_id").references(() => users.id, { onDelete: "set null" }),
  type: text("type", {
    enum: [
      "follow",
      "connection_request",
      "connection_accepted",
      "project_like",
      "project_upvote",
      "project_comment",
      "comment_reply",
      "comment_like",
      "reference_received",
      "team_invite",
      "position_application",
      "application_accepted",
      "application_rejected",
      "changelog_posted",
    ]
  }).notNull(),
  resourceType: text("resource_type", {
    enum: ["user", "project", "comment", "reference", "position", "changelog"]
  }),
  resourceId: text("resource_id"),
  message: text("message").notNull(),
  isRead: integer("is_read", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  index("notifications_user_idx").on(table.userId),
  index("notifications_read_idx").on(table.userId, table.isRead),
  index("notifications_created_idx").on(table.createdAt),
]);

// =============================================
// AKTIVITE FEED
// =============================================
export const activities = sqliteTable("activities", {
  id: text("id").primaryKey(),
  actorId: text("actor_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type", {
    enum: [
      "project_created",
      "project_updated",
      "project_launched",
      "project_liked",
      "project_upvoted",
      "comment_posted",
      "changelog_posted",
      "followed_user",
      "connected_with",
      "reference_given",
      "position_opened",
      "joined_project",
    ]
  }).notNull(),
  resourceType: text("resource_type", {
    enum: ["user", "project", "comment", "reference", "position", "changelog"]
  }).notNull(),
  resourceId: text("resource_id").notNull(),
  metadata: text("metadata"), // JSON: ek bilgiler (proje adi, kullanici adi vb.)
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  index("activities_actor_idx").on(table.actorId),
  index("activities_type_idx").on(table.type),
  index("activities_created_idx").on(table.createdAt),
  index("activities_resource_idx").on(table.resourceType, table.resourceId),
]);
```

### 1.4 Iliskiler Diyagrami (Ozet)

```
users
  |-- follows (follower_id, following_id)
  |-- connections (requester_id, receiver_id)
  |-- references (author_id, target_id)
  |-- projects (owner_id)
  |     |-- project_technologies
  |     |-- project_images
  |     |-- project_members (user_id)
  |     |-- project_likes (user_id)
  |     |-- project_upvotes (user_id)
  |     |-- comments (author_id)
  |     |     |-- comment_likes (user_id)
  |     |     |-- comments (parent_id -> self)
  |     |-- changelogs (author_id)
  |     |-- open_positions
  |           |-- position_applications (applicant_id)
  |-- notifications (user_id, actor_id)
  |-- activities (actor_id)
```

---

## 2. API Endpoint Listesi

Hono.js route yapisi ile RESTful API tasarimi.

### 2.1 Kimlik Dogrulama (`/auth`)

```
GET    /auth/github              -> GitHub OAuth baslat
GET    /auth/github/callback     -> GitHub callback islemi
GET    /auth/google              -> Google OAuth baslat
GET    /auth/google/callback     -> Google callback islemi
POST   /auth/logout              -> Oturumu sonlandir
GET    /auth/me                  -> Mevcut kullanici bilgisi
```

### 2.2 Kullanicilar (`/users`)

```
GET    /users                    -> Kullanici listesi (sayfalama + filtre)
GET    /users/:username          -> Profil detayi
PUT    /users/:username          -> Profil guncelle (sadece kendi)
GET    /users/:username/projects -> Kullanicinin projeleri
GET    /users/:username/followers    -> Takipciler
GET    /users/:username/following    -> Takip edilenler
GET    /users/:username/connections  -> Baglantilar
GET    /users/:username/references   -> Alinan referanslar
GET    /users/:username/activity     -> Aktivite feed
```

### 2.3 Takip Sistemi (`/users/:username/follow`)

```
POST   /users/:username/follow       -> Takip et
DELETE /users/:username/follow       -> Takibi birak
GET    /users/:username/follow/status -> Takip durumu
```

### 2.4 Baglanti Sistemi (`/connections`)

```
POST   /connections                   -> Baglanti istegi gonder
GET    /connections/pending           -> Bekleyen istekler
PUT    /connections/:id/accept        -> Istegi kabul et
PUT    /connections/:id/reject        -> Istegi reddet
DELETE /connections/:id               -> Baglantiyi kaldir
```

### 2.5 Referanslar (`/references`)

```
POST   /references                    -> Referans yaz
GET    /references/:id                -> Referans detayi
DELETE /references/:id                -> Referans sil (sadece yazar)
```

### 2.6 Projeler (`/projects`)

```
GET    /projects                      -> Proje listesi (sayfalama + filtre + siralama)
POST   /projects                      -> Yeni proje olustur
GET    /projects/:slug                -> Proje detayi
PUT    /projects/:slug                -> Proje guncelle
DELETE /projects/:slug                -> Proje sil
GET    /projects/:slug/similar        -> Benzer projeler
```

### 2.7 Proje Etkilesim

```
POST   /projects/:slug/like          -> Begen
DELETE /projects/:slug/like          -> Begeniyi kaldir
POST   /projects/:slug/upvote        -> Upvote
DELETE /projects/:slug/upvote        -> Upvote kaldir
GET    /projects/:slug/stats         -> Istatistikler
```

### 2.8 Proje Gorselleri

```
POST   /projects/:slug/images        -> Gorsel yukle (multipart)
DELETE /projects/:slug/images/:id     -> Gorsel sil
PUT    /projects/:slug/images/order   -> Gorsel sirasini degistir
```

### 2.9 Takim Uyeleri

```
GET    /projects/:slug/members        -> Takim uyeleri
POST   /projects/:slug/members        -> Uye ekle/davet et
PUT    /projects/:slug/members/:id    -> Uye rolunu degistir
DELETE /projects/:slug/members/:id    -> Uyeyi cikar
```

### 2.10 Yorumlar

```
GET    /projects/:slug/comments       -> Yorumlar (sayfalama)
POST   /projects/:slug/comments       -> Yorum yaz
PUT    /comments/:id                  -> Yorum duzenle
DELETE /comments/:id                  -> Yorum sil
POST   /comments/:id/like            -> Yorum begen
DELETE /comments/:id/like            -> Begeniyi kaldir
```

### 2.11 Changelog

```
GET    /projects/:slug/changelog      -> Changelog listesi
POST   /projects/:slug/changelog      -> Yeni changelog girisi
PUT    /changelog/:id                 -> Changelog duzenle
DELETE /changelog/:id                 -> Changelog sil
```

### 2.12 Acik Pozisyonlar

```
GET    /positions                      -> Tum acik pozisyonlar (filtreli)
GET    /projects/:slug/positions       -> Proje pozisyonlari
POST   /projects/:slug/positions       -> Pozisyon olustur
PUT    /positions/:id                  -> Pozisyon guncelle
DELETE /positions/:id                  -> Pozisyon sil
POST   /positions/:id/apply           -> Basvur
GET    /positions/:id/applications     -> Basvurular (proje sahibi)
PUT    /applications/:id/status        -> Basvuru durumu guncelle
```

### 2.13 Bildirimler

```
GET    /notifications                  -> Bildirim listesi (sayfalama)
PUT    /notifications/read-all         -> Tumunu okundu isaretle
PUT    /notifications/:id/read         -> Tek bildirim okundu
GET    /notifications/unread-count     -> Okunmamis sayisi
```

### 2.14 Arama

```
GET    /search?q=&type=               -> Genel arama (users, projects, positions)
GET    /search/users?q=&profession=   -> Kullanici arama
GET    /search/projects?q=&category=&tech= -> Proje arama
```

### 2.15 Feed

```
GET    /feed                           -> Kisisellestirilmis feed
GET    /feed/trending                  -> Trend projeler
GET    /feed/latest                    -> En yeni projeler
```

---

## 3. Dosya/Klasor Yapisi

```
1elat.com/
|-- apps/
|   |-- web/                          # React Router v7 (Remix) - Frontend
|   |   |-- app/
|   |   |   |-- components/
|   |   |   |   |-- ui/               # shadcn/ui bilesenler
|   |   |   |   |-- layout/           # Navbar, Footer, Sidebar
|   |   |   |   |-- auth/             # Login butonlari, OAuth UI
|   |   |   |   |-- user/             # Profil karti, takipci listesi
|   |   |   |   |-- project/          # Proje karti, galeri, yorum
|   |   |   |   |-- feed/             # Aktivite feed bilesenler
|   |   |   |   |-- notification/     # Bildirim dropdown, listesi
|   |   |   |   |-- search/           # Arama bilesenler
|   |   |   |   |-- shared/           # Pagination, FilterBar, EmptyState
|   |   |   |-- routes/
|   |   |   |   |-- _index.tsx        # Anasayfa / Landing
|   |   |   |   |-- _auth.tsx         # Auth layout (korunmus)
|   |   |   |   |-- _auth.feed.tsx    # Kisisel feed
|   |   |   |   |-- _auth.settings.tsx
|   |   |   |   |-- auth.login.tsx    # Giris sayfasi
|   |   |   |   |-- auth.callback.github.tsx
|   |   |   |   |-- auth.callback.google.tsx
|   |   |   |   |-- explore.tsx       # Kesfet sayfasi
|   |   |   |   |-- explore.projects.tsx
|   |   |   |   |-- explore.developers.tsx
|   |   |   |   |-- explore.positions.tsx
|   |   |   |   |-- projects.new.tsx  # Yeni proje olustur
|   |   |   |   |-- projects.$slug.tsx         # Proje detay
|   |   |   |   |-- projects.$slug.edit.tsx    # Proje duzenle
|   |   |   |   |-- projects.$slug.changelog.tsx
|   |   |   |   |-- u.$username.tsx            # Kullanici profili
|   |   |   |   |-- u.$username.projects.tsx
|   |   |   |   |-- u.$username.connections.tsx
|   |   |   |   |-- search.tsx        # Arama sonuclari
|   |   |   |   |-- notifications.tsx
|   |   |   |-- lib/
|   |   |   |   |-- api.ts            # API client (fetch wrapper)
|   |   |   |   |-- auth.ts           # Client-side auth helpers
|   |   |   |   |-- utils.ts          # Genel yardimci fonksiyonlar
|   |   |   |   |-- constants.ts      # Sabitler
|   |   |   |-- hooks/
|   |   |   |   |-- use-auth.ts
|   |   |   |   |-- use-infinite-scroll.ts
|   |   |   |   |-- use-optimistic.ts
|   |   |   |-- root.tsx
|   |   |   |-- entry.server.tsx
|   |   |-- public/
|   |   |-- wrangler.toml
|   |
|   |-- api/                           # Hono.js - Backend API
|   |   |-- src/
|   |   |   |-- index.ts              # Ana Hono app ve route mount
|   |   |   |-- routes/
|   |   |   |   |-- auth.ts           # /auth/* endpointleri
|   |   |   |   |-- users.ts          # /users/* endpointleri
|   |   |   |   |-- projects.ts       # /projects/* endpointleri
|   |   |   |   |-- comments.ts       # /comments/* endpointleri
|   |   |   |   |-- connections.ts    # /connections/* endpointleri
|   |   |   |   |-- references.ts     # /references/* endpointleri
|   |   |   |   |-- positions.ts      # /positions/* endpointleri
|   |   |   |   |-- notifications.ts  # /notifications/* endpointleri
|   |   |   |   |-- search.ts         # /search/* endpointleri
|   |   |   |   |-- feed.ts           # /feed/* endpointleri
|   |   |   |-- middleware/
|   |   |   |   |-- auth.ts           # Oturum dogrulama middleware
|   |   |   |   |-- rate-limit.ts     # Hiz sinirlandirma
|   |   |   |   |-- validate.ts       # Zod validasyon middleware
|   |   |   |   |-- error-handler.ts  # Merkezi hata yonetimi
|   |   |   |-- services/
|   |   |   |   |-- user.service.ts
|   |   |   |   |-- project.service.ts
|   |   |   |   |-- comment.service.ts
|   |   |   |   |-- connection.service.ts
|   |   |   |   |-- notification.service.ts
|   |   |   |   |-- search.service.ts
|   |   |   |   |-- upload.service.ts  # R2 islemleri
|   |   |   |   |-- feed.service.ts
|   |   |   |-- lib/
|   |   |   |   |-- id.ts             # nanoid uretici
|   |   |   |   |-- pagination.ts     # Sayfalama yardimcilari
|   |   |   |   |-- errors.ts         # Ozel hata siniflari
|   |   |   |-- types.ts              # Hono Bindings ve context tipleri
|   |   |-- wrangler.toml
|
|-- packages/
|   |-- db/                            # Drizzle ORM + D1
|   |   |-- src/
|   |   |   |-- schema/
|   |   |   |   |-- users.ts
|   |   |   |   |-- projects.ts
|   |   |   |   |-- notifications.ts
|   |   |   |   |-- index.ts          # Barrel export
|   |   |   |-- index.ts
|   |   |-- drizzle/
|   |   |   |-- migrations/           # SQL migration dosyalari
|   |   |-- drizzle.config.ts
|   |
|   |-- auth/                          # OAuth islemleri
|   |   |-- src/
|   |   |   |-- github.ts
|   |   |   |-- google.ts
|   |   |   |-- session.ts
|   |   |   |-- index.ts
|   |
|   |-- shared/                        # Paylasilmis tipler ve validatorler
|   |   |-- src/
|   |   |   |-- types/
|   |   |   |   |-- user.ts
|   |   |   |   |-- project.ts
|   |   |   |   |-- notification.ts
|   |   |   |   |-- common.ts         # ApiResponse, Pagination vb.
|   |   |   |   |-- index.ts
|   |   |   |-- validators/
|   |   |   |   |-- user.ts
|   |   |   |   |-- project.ts
|   |   |   |   |-- comment.ts
|   |   |   |   |-- search.ts
|   |   |   |   |-- index.ts
|   |   |   |-- constants/
|   |   |   |   |-- professions.ts
|   |   |   |   |-- categories.ts
|   |   |   |   |-- index.ts
|   |   |   |-- index.ts
|
|-- docs/                              # Proje dokumantasyonu
|   |-- TECHNICAL_PLAN.md
|
|-- turbo.json
|-- pnpm-workspace.yaml
|-- package.json
```

---

## 4. Kimlik Dogrulama Akisi

### 4.1 OAuth Akis Diyagrami

```
Kullanici                Frontend (web)           API (Hono)           OAuth Provider
   |                         |                        |                      |
   |-- "GitHub ile Giris" -->|                        |                      |
   |                         |-- GET /auth/github --->|                      |
   |                         |                        |-- redirect URL --->  |
   |                         |<-- 302 redirect -------|                      |
   |<-- redirect ------------|                        |                      |
   |                         |                        |                      |
   |-- yetkilendirme ------->|                        |                      |
   |                         |                        |<-- code + state ---- |
   |                         |                        |                      |
   |                         |-- GET /auth/github/    |                      |
   |                         |   callback?code=xxx -->|                      |
   |                         |                        |-- code -> token ---> |
   |                         |                        |<-- access_token ---- |
   |                         |                        |-- get user profile ->|
   |                         |                        |<-- profile data ---- |
   |                         |                        |                      |
   |                         |                        |-- DB: upsert user    |
   |                         |                        |-- KV: session olustur|
   |                         |                        |                      |
   |                         |<-- Set-Cookie: token --|                      |
   |<-- redirect to /feed ---|                        |                      |
```

### 4.2 Session Yonetimi

```typescript
// Session stratejisi: KV-based token
// - Cookie: `session_token` (HttpOnly, Secure, SameSite=Lax)
// - KV key: `session:{token}` -> userId
// - TTL: 7 gun (otomatik uzatma ile)

// Middleware ornegi:
const authMiddleware = async (c, next) => {
  const token = getCookie(c, "session_token");
  if (!token) return c.json({ error: "Unauthorized" }, 401);

  const userId = await c.env.SESSION.get(`session:${token}`);
  if (!userId) return c.json({ error: "Session expired" }, 401);

  // Session TTL'i yenile (sliding window)
  await c.env.SESSION.put(`session:${token}`, userId, {
    expirationTtl: 60 * 60 * 24 * 7
  });

  c.set("userId", userId);
  await next();
};
```

### 4.3 OAuth Implementasyon Detaylari

```typescript
// packages/auth/src/github.ts
// GitHub OAuth 2.0 akisi

const GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USER_URL = "https://api.github.com/user";
const GITHUB_EMAIL_URL = "https://api.github.com/user/emails";

export function getAuthorizationUrl(config: GitHubOAuthConfig): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: "read:user user:email",
    state: crypto.randomUUID(), // CSRF korumasi
  });
  return `${GITHUB_AUTH_URL}?${params}`;
}

// Google icin benzer yapi:
// - Authorization: https://accounts.google.com/o/oauth2/v2/auth
// - Token: https://oauth2.googleapis.com/token
// - Scope: openid email profile
```

### 4.4 Ilk Kayit Akisi

```
OAuth basarili -> Kullanici DB'de var mi?
  |-- Evet -> Session olustur -> Feed'e yonlendir
  |-- Hayir -> Yeni kullanici olustur (OAuth verilerinden)
              -> /onboarding sayfasina yonlendir
              -> Kullanici username, meslek, bio secer
              -> Profil tamamlaninca feed'e yonlendir
```

---

## 5. Dosya Yukleme Stratejisi (R2)

### 5.1 Yukleme Akisi

```
Kullanici                   Frontend                    API                  R2
   |                          |                          |                    |
   |-- dosya sec (drag/drop)->|                          |                    |
   |                          |-- client-side validasyon |                    |
   |                          |   (boyut, tip, boyut)    |                    |
   |                          |                          |                    |
   |                          |-- POST /projects/:slug/  |                    |
   |                          |   images (multipart) --->|                    |
   |                          |                          |-- validasyon       |
   |                          |                          |-- resize/optimize  |
   |                          |                          |-- PUT object ----->|
   |                          |                          |<-- key + url ------|
   |                          |                          |-- DB: kayit ekle   |
   |                          |<-- { url, id } ----------|                    |
   |<-- onizleme goster ------|                          |                    |
```

### 5.2 R2 Obje Anahtari Yapisi

```
Klasor yapisi:
  avatars/{userId}/{timestamp}-{hash}.webp
  covers/{userId}/{timestamp}-{hash}.webp
  projects/{projectId}/{timestamp}-{hash}.webp
  projects/{projectId}/thumbnail.webp
```

### 5.3 Gorsel Isleme Stratejisi

```typescript
// Cloudflare Workers icerisinde gorsel isleme
// Not: Workers'da sharp kullanilamaz, Cloudflare Images veya
// basit boyut sinirlamasi kullanilacak

const UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxImagesPerProject: 10,
  allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  avatarMaxSize: 2 * 1024 * 1024, // 2MB
};

// R2 yukleme fonksiyonu
async function uploadToR2(
  bucket: R2Bucket,
  key: string,
  data: ArrayBuffer,
  contentType: string
): Promise<string> {
  await bucket.put(key, data, {
    httpMetadata: { contentType },
    customMetadata: {
      uploadedAt: new Date().toISOString(),
    },
  });
  // Public URL dondurmek icin R2 custom domain kullanilacak
  return `https://cdn.1elat.com/${key}`;
}
```

### 5.4 Silme Stratejisi

```
Gorsel silindiginde:
  1. DB'den kayit sil
  2. R2'den obje sil (Queue uzerinden async)
  3. CDN cache invalidate (eger varsa)

Proje silindiginde:
  1. Tum iliskili gorselleri bul
  2. Queue'ya toplu silme gorevi gonder
  3. Queue worker R2'den temizlik yapar
```

---

## 6. Bildirim Sistemi

### 6.1 Mimari

```
Olay Olusur (like, yorum vb.)
        |
        v
  API Handler
        |
        v
  Queue'ya mesaj gonder -----> Cloudflare Queue
        |                            |
        v                            v
  HTTP yanit don (hizli)     Queue Consumer (Worker)
                                     |
                        +------------+------------+
                        |                         |
                        v                         v
                  D1: notification            KV: unread count
                  tablosuna kaydet            guncelle
```

### 6.2 Queue Mesaj Formati

```typescript
interface NotificationMessage {
  type: NotificationType;
  actorId: string;       // islemi yapan
  targetUserId: string;  // bildirimi alacak
  resourceType: ResourceType;
  resourceId: string;
  metadata?: Record<string, string>;
}

// Ornek: Proje begenme
{
  type: "project_like",
  actorId: "user_abc123",
  targetUserId: "user_xyz789",
  resourceType: "project",
  resourceId: "project_456",
  metadata: {
    projectName: "Harika Proje",
    actorName: "Ahmet Yilmaz"
  }
}
```

### 6.3 Queue Consumer

```typescript
// apps/api/src/queue-consumer.ts
export default {
  async queue(batch: MessageBatch<NotificationMessage>, env: Bindings) {
    const db = createDb(env.DB);

    for (const message of batch.messages) {
      const { type, actorId, targetUserId, resourceType, resourceId, metadata } = message.body;

      // Kendine bildirim gonderme
      if (actorId === targetUserId) {
        message.ack();
        continue;
      }

      // 1. Bildirim kaydi olustur
      await db.insert(notifications).values({
        id: nanoid(),
        userId: targetUserId,
        actorId,
        type,
        resourceType,
        resourceId,
        message: buildNotificationMessage(type, metadata),
        isRead: false,
      });

      // 2. Okunmamis sayisini guncelle (KV)
      const countKey = `unread:${targetUserId}`;
      const current = parseInt(await env.SESSION.get(countKey) || "0");
      await env.SESSION.put(countKey, String(current + 1), {
        expirationTtl: 60 * 60 * 24 * 30 // 30 gun
      });

      message.ack();
    }
  }
};
```

### 6.4 KV Cache Yapisi

```
Bildirim ile ilgili KV key'leri:
  unread:{userId}  ->  "5"  (okunmamis bildirim sayisi)

Avantaj:
  - GET /notifications/unread-count cok hizli (KV okuma ~ms)
  - D1 sorgusu gerektirmez
  - Bildirim okundugunda KV guncellenir
```

---

## 7. Performans Stratejisi

### 7.1 KV Caching Stratejisi

```typescript
// Cache katmanlari ve TTL degerleri

const CACHE_CONFIG = {
  // Sik degisen, kisa cache
  userProfile: { prefix: "cache:user:", ttl: 300 },          // 5 dk
  projectDetail: { prefix: "cache:project:", ttl: 300 },     // 5 dk
  projectList: { prefix: "cache:projects:", ttl: 60 },       // 1 dk

  // Nadir degisen, uzun cache
  professionsList: { prefix: "cache:professions", ttl: 86400 }, // 24 saat
  categoriesList: { prefix: "cache:categories", ttl: 86400 },  // 24 saat
  trendingProjects: { prefix: "cache:trending", ttl: 300 },    // 5 dk

  // Sayac cache
  unreadCount: { prefix: "unread:", ttl: 2592000 },            // 30 gun
};

// Cache-aside pattern
async function getCachedOrFetch<T>(
  kv: KVNamespace,
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await kv.get(key, "json");
  if (cached) return cached as T;

  const data = await fetcher();
  await kv.put(key, JSON.stringify(data), { expirationTtl: ttl });
  return data;
}
```

### 7.2 Sayfalama (Cursor-Based)

```typescript
// Cursor-based pagination (offset yerine)
// Avantaj: Buyuk veri setlerinde tutarli performans

interface PaginationParams {
  cursor?: string;  // son elemanin id'si
  limit: number;    // varsayilan 20, maks 50
  direction: "next" | "prev";
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
    total?: number; // sadece ilk sayfada
  };
}

// Kullanim ornegi:
// GET /projects?cursor=proj_abc123&limit=20&direction=next
```

### 7.3 Indexleme Stratejisi

Tum indexler sema tanimlarinda belirtildi. Ozet:

| Tablo | Index | Amac |
|-------|-------|------|
| users | email, username, github_id, google_id | Benzersiz arama |
| users | profession | Meslek filtreleme |
| projects | slug | URL bazli arama |
| projects | category, type, stage | Filtreleme |
| projects | created_at, likes_count, upvotes_count | Siralama |
| projects | owner_id | Kullanici projeleri |
| follows | follower_id, following_id | Takip sorgulari |
| connections | requester_id, receiver_id, status | Baglanti sorgulari |
| comments | project_id, created_at | Proje yorumlari |
| notifications | user_id + is_read | Okunmamis bildirimleri |
| activities | actor_id, created_at | Feed sorgulari |

### 7.4 D1 Sorgu Optimizasyonu

```typescript
// 1. Sadece gerekli alanlari sec (SELECT *)
const userSummary = await db
  .select({
    id: users.id,
    username: users.username,
    firstName: users.firstName,
    avatarUrl: users.avatarUrl,
    profession: users.profession,
  })
  .from(users)
  .where(eq(users.id, userId));

// 2. Iliskili verileri ayri sorgularla cek (D1 JOIN performansi sinirli)
// Proje detayinda: proje + teknolojiler + uyeler ayri sorgular

// 3. Count sorgularini minimize et
// Like/upvote sayilarini projects tablosunda denormalize tut
// Her like/upvote'da counter'i artir/azalt

// 4. Batch okuma (birden fazla proje)
const projectIds = ["id1", "id2", "id3"];
const projectsList = await db
  .select()
  .from(projects)
  .where(inArray(projects.id, projectIds));
```

### 7.5 Frontend Performans

```
1. React Router loader'lari ile server-side data fetching
2. Optimistic UI guncellemeleri (like, follow)
3. Infinite scroll (cursor-based pagination)
4. Gorsel lazy loading (Intersection Observer)
5. Route-based code splitting (React Router otomatik)
6. Cloudflare CDN uzerinden statik asset servisi
7. Stale-While-Revalidate pattern (loaderlar icin)
```

---

## 8. Guvenlik Onlemleri

### 8.1 Kimlik Dogrulama ve Yetkilendirme

```typescript
// 1. Session cookie ayarlari
const COOKIE_OPTIONS = {
  httpOnly: true,       // XSS korunmasi
  secure: true,         // Sadece HTTPS
  sameSite: "lax",      // CSRF korunmasi
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 gun
  domain: ".1elat.com",
};

// 2. OAuth state parametresi (CSRF)
// State KV'de saklanir, callback'te dogrulanir
// TTL: 10 dakika

// 3. Yetkilendirme kontrolleri
// - Sadece kendi profilini duzenleyebilir
// - Sadece proje sahibi/admini proje duzenleyebilir
// - Sadece yorum sahibi yorum silebilir
// - Proje sahibi pozisyon yonetebilir
```

### 8.2 Girdi Dogrulama

```typescript
// Tum girdiler Zod ile dogrulanir (middleware uzerinden)
// packages/shared/src/validators/ altinda tanimli

// Middleware ornegi:
import { zValidator } from "@hono/zod-validator";

app.post("/projects",
  authMiddleware,
  zValidator("json", createProjectSchema),
  async (c) => { /* ... */ }
);

// Validasyon kurallari:
// - String uzunluk sinirlari (name: 1-100, description: 0-5000)
// - URL format dogrulama
// - Enum degerleri kontrol
// - SQL injection: Drizzle ORM parametreli sorgular kullanir
```

### 8.3 Rate Limiting

```typescript
// KV-based rate limiting
const RATE_LIMITS = {
  // Genel API
  "api:general": { requests: 100, window: 60 },     // 100 req/dk
  // Yazma islemleri
  "api:write": { requests: 30, window: 60 },         // 30 req/dk
  // Auth islemleri
  "api:auth": { requests: 10, window: 60 },           // 10 req/dk
  // Arama
  "api:search": { requests: 20, window: 60 },         // 20 req/dk
  // Dosya yukleme
  "api:upload": { requests: 10, window: 300 },         // 10 req/5dk
};

// Implementasyon: Sliding window counter (KV)
// Key: `rl:{category}:{userId}:{windowId}`
```

### 8.4 Dosya Yukleme Guvenligi

```
1. Dosya tipi dogrulama (Content-Type + magic bytes)
2. Dosya boyutu siniri (5MB genel, 2MB avatar)
3. Dosya ismi sanitizasyonu (orijinal isim saklanmaz)
4. R2 bucket public erisim kisitlamasi
5. Signed URL'ler (gerekirse ozel icerik icin)
6. Gorsel boyut siniri (maks 4096x4096px)
```

### 8.5 CORS Yapilandirmasi

```typescript
app.use("*", cors({
  origin: [
    "https://1elat.com",
    "https://www.1elat.com",
    ...(isDev ? ["http://localhost:5173"] : []),
  ],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400,
}));
```

### 8.6 Ek Guvenlik Onlemleri

```
1. Hono.js secureHeaders middleware (X-Frame-Options, CSP vb.)
2. Request body boyut siniri (1MB JSON, 10MB multipart)
3. SQL Injection: Drizzle ORM parametreli sorgular (otomatik)
4. XSS: React otomatik escaping + CSP header
5. Markdown iceriklerde HTML sanitizasyonu (DOMPurify)
6. Kullanici icerigi render'da XSS filtresi
7. Email dogrulama (OAuth provider'dan gelen)
8. Hassas bilgileri loglamama (token, password vb.)
```

---

## 9. Uygulama Fazlari

### Faz 1 — MVP (4-6 hafta)

**Hedef**: Temel kullanici ve proje sistemi ile calisir duruma getirmek.

```
Hafta 1-2: Altyapi ve Auth
  [ ] Veritabani semasini olustur (users, projects temel tablolar)
  [ ] Drizzle migration'lari calistir
  [ ] GitHub OAuth implementasyonu
  [ ] Google OAuth implementasyonu
  [ ] Session yonetimi (KV)
  [ ] Auth middleware
  [ ] Giris/cikis sayfasi
  [ ] Onboarding akisi (username, meslek secimi)

Hafta 3-4: Kullanici ve Proje CRUD
  [ ] Kullanici profil sayfasi
  [ ] Profil duzenleme
  [ ] Proje olusturma formu
  [ ] Proje detay sayfasi
  [ ] Proje duzenleme/silme
  [ ] Proje listesi (kesfet sayfasi)
  [ ] Temel sayfalama (cursor-based)
  [ ] Filtreleme (kategori, tur, asama)

Hafta 5-6: Etkilesim Temeli
  [ ] Like/Upvote sistemi
  [ ] Yorum sistemi (tek seviye)
  [ ] Takip sistemi (follow/unfollow)
  [ ] Temel gorsel yukleme (R2 - tek gorsel)
  [ ] Basit responsive tasarim
  [ ] Hata sayfalari (404, 500)
  [ ] Temel SEO (meta tag'ler)
```

**MVP Ciktisi**: Kullanicilar giris yapabilir, profil olusturabilir, proje paylasabilir, begenebilir ve yorum yazabilir.

### Faz 2 — Sosyal Ozellikler (4-6 hafta)

**Hedef**: Platform sosyal etkilesimini guclendirir.

```
Hafta 7-8: Gelismis Sosyal
  [ ] Baglanti sistemi (connection request/accept/reject)
  [ ] Referans sistemi
  [ ] Kullanici rating hesaplama
  [ ] Nested yorumlar (yanit destegi)
  [ ] Yorum begenme

Hafta 9-10: Feed ve Bildirimler
  [ ] Aktivite feed (takip edilen kullanicilarin aktiviteleri)
  [ ] Bildirim sistemi (Queue consumer)
  [ ] Bildirim UI (dropdown + sayfa)
  [ ] Okunmamis bildirim sayaci (KV)
  [ ] Trend projeler algoritmasi

Hafta 11-12: Proje Gelistirmeleri
  [ ] Coklu gorsel yukleme (gallery)
  [ ] Takim uyeleri yonetimi
  [ ] Changelog sistemi
  [ ] Proje teknoloji stack yonetimi
  [ ] Gelismis arama (tam metin)
```

**Faz 2 Ciktisi**: Tam sosyal deneyim - baglantilar, referanslar, bildirimler ve zengin proje sayfasi.

### Faz 3 — Olgunlasma (4-6 hafta)

**Hedef**: Platform kalitesini ve kullanici deneyimini ileri seviyeye tasir.

```
Hafta 13-14: Is Birligi
  [ ] Acik pozisyonlar sistemi
  [ ] Pozisyon basvuru akisi
  [ ] Basvuru yonetimi (proje sahibi)
  [ ] Pozisyon arama ve filtreleme
  [ ] Proje takim davet sistemi

Hafta 15-16: Performans ve UX
  [ ] KV caching katmani
  [ ] Optimistic UI guncellemeleri
  [ ] Infinite scroll
  [ ] Gorsel lazy loading
  [ ] Skeleton loading states
  [ ] Gelismis filtreleme UI
  [ ] Mobil uyumluluk iyilestirmeleri

Hafta 17-18: Kalite ve Guvenlik
  [ ] Rate limiting implementasyonu
  [ ] Gelismis hata yonetimi
  [ ] Loglama ve monitoring
  [ ] E2E testler (kritik akislar)
  [ ] SEO iyilestirmeleri
  [ ] Accessibility (a11y) iyilestirmeleri
  [ ] Performans metrikleri ve izleme
```

**Faz 3 Ciktisi**: Production-ready platform - is birligi ozellikleri, optimize performans, guvenlik ve kalite.

---

## Ek: Ortam Degiskenleri

```toml
# wrangler.toml (API)
[vars]
API_VERSION = "1.0.0"
FRONTEND_URL = "https://1elat.com"
GITHUB_CLIENT_ID = ""
GOOGLE_CLIENT_ID = ""

# Secrets (wrangler secret put)
# GITHUB_CLIENT_SECRET
# GOOGLE_CLIENT_SECRET
# SESSION_SECRET

[[d1_databases]]
binding = "DB"
database_name = "1elat-db"
database_id = ""

[[kv_namespaces]]
binding = "SESSION"
id = ""

[[r2_buckets]]
binding = "FILES"
bucket_name = "1elat-files"

[[queues.producers]]
binding = "NOTIFICATIONS"
queue = "1elat-notifications"

[[queues.consumers]]
queue = "1elat-notifications"
max_batch_size = 10
max_batch_timeout = 30
```

---

## Ek: Anahtar Tasarim Kararlari

| Karar | Secim | Gerekce |
|-------|-------|---------|
| ID stratejisi | nanoid (21 karakter) | UUID'den kisa, URL-safe, D1 text PK uyumlu |
| Sayfalama | Cursor-based | Offset'e gore buyuk veri setlerinde daha performansli |
| Like/Upvote sayaci | Denormalize (projects tablosunda) | Her sayfa yuklemede COUNT sorgusu onlenir |
| Gorsel boyutlandirma | Client-side + boyut siniri | Workers'da gorsel isleme sinirli, Cloudflare Images opsiyonel |
| Session | KV token-based | JWT'den daha guvenli (sunucu tarafli iptal), D1 yukunu azaltir |
| Bildirim | Async Queue | API yanit suresi etkilenmez, batch isleme imkani |
| Feed | Fanout-on-read | Basit implementasyon, D1 sinirlarinda yeterli |
| Arama | D1 LIKE + index | Basit baslanir, gerekirse Cloudflare Vectorize'a gecilir |
| Markdown | Client-side render | Server yukunu azaltir, DOMPurify ile guvenli |
| Cache | KV cache-aside | Basit, D1 yukunu azaltir, TTL ile otomatik invalidasyon |
