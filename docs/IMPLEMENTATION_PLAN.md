# 1elat.com — Nihai Implementasyon Plani

> Gelistirici Sosyal Platformu | Tarih: 2026-04-04
> Bu dokuman, product plani, teknik mimari ve rakip analizinin birlestirilmis halidir.
> Claude Code bu plana gore adim adim gelistirme yapacaktir.

---

## Gelistirme Talimatlari (Claude Code icin)

### Kod Kalitesi Kurallari

- **Clean Code**: Okunabilir, anlasilir, bakimi kolay kod yaz. Fonksiyon ve degisken isimleri aciklayici olsun.
- **SOLID Prensipleri**: Her modulu Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation ve Dependency Inversion prensiplerine uygun yaz.
- **TDD (Test-Driven Development)**: Once test yaz, sonra implementasyonu yap. Her yeni ozellik icin test dosyasi olustur. Testler gecmeden kodu tamamlanmis sayma.
- **DRY**: Tekrar eden kodu soyutla. Ortak logic'i service veya utility katmanina tasi.
- **KISS**: Basit cozumleri tercih et. Over-engineering yapma.
- **YAGNI**: Sadece istenen ozellikleri implement et. Spekulatif kod yazma.

### UI/UX Kurallari

- **Ikon kutuphanesi**: Sadece `lucide-react` kullan. Baska ikon kutuphanesi ekleme.
- **Emoji yasagi**: Kod icinde, UI'da ve kullanici arayuzunde emoji KULLANMA. Ikonlar icin her zaman Lucide ikonlari kullan.
- **UI framework**: shadcn/ui + Tailwind CSS v4. Bilesenler `app/components/ui/` altinda.
- **Responsive**: Tum sayfalar mobile-first tasarimla olusturulsun.
- **Dark mode**: Varsayilan olarak dark mode aktif. Light/dark toggle sonra eklenecek.
- **Loading states**: Her sayfa ve veri cekme islemi icin skeleton/loading state olsun.
- **Error states**: Hata durumlari icin kullanici dostu mesajlar goster.

### Dosya ve Klasor Kurallari

- Test dosyalari: `__tests__/` veya `*.test.ts` olarak kaynak dosyanin yanina
- Service katmani: `apps/api/src/services/` altinda, her domain icin ayri dosya
- Route dosyalari: `apps/api/src/routes/` altinda, her domain icin ayri dosya
- Middleware: `apps/api/src/middleware/` altinda
- Shared tipler: `packages/shared/src/types/` altinda
- Shared validatorler: `packages/shared/src/validators/` altinda
- DB schema: `packages/db/src/schema/` altinda, domain bazli ayrilmis

### Teknik Kurallar

- ID uretimi: `nanoid` kullan (21 karakter, URL-safe)
- Validasyon: Tum girdiler `Zod` ile dogrulansin, hem client hem server tarafinda
- Hata yonetimi: Merkezi error handler, ozel hata siniflari
- Loglama: `hono/logger` middleware, hassas bilgileri loglama
- Tipler: TypeScript strict mode, `any` kullanma, tum fonksiyonlara donus tipi yaz

---

## Platform Ozeti

### Vizyon
1elat.com, yazilim gelistiricilerinin projelerini sergileyebildigi, birbirlerini kesfettigi, ortak calisma arkadasi bulabildigi ve projelere destek verebildigi sosyal bir platform.

### Hedef Kitle
| Segment | Ihtiyac |
|---------|---------|
| Bagimsiz Gelistirici | Proje gosterimi, geri bildirim |
| Startup Kuruculari | Takim olusturma, yatirimci iliskisi |
| Junior Gelistiriciler | Mentorluk, referans, portfolyo |
| Freelancer | Ag olusturma, proje bulma |

### Rekabet Avantaji
1. Hepsi bir arada: Proje paylasimi + sosyal ag + takim olusturma tek platformda
2. Turkiye/MENA odagi: Bolgesel gelistirici toplulugu
3. Proof-of-work profil: GitHub entegrasyonu ile dogrulanmis katkilar
4. Yapici geri bildirim kulturu: Kod inceleme, proje degerlendirme, referans

---

## Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Monorepo | pnpm workspaces + Turborepo |
| Frontend | React Router v7 (Remix) — Cloudflare Workers |
| Backend | Hono.js — Cloudflare Workers |
| Database | Drizzle ORM — Cloudflare D1 (SQLite) |
| Auth | GitHub + Google OAuth (manuel) |
| Session | Cloudflare KV (HttpOnly cookie) |
| Dosya | Cloudflare R2 |
| Bildirim | Cloudflare Queues |
| Cache | Cloudflare KV (cache-aside pattern) |
| UI | Tailwind CSS v4 + shadcn/ui + Lucide icons |
| Validasyon | Zod |
| ID | nanoid |
| Test | Vitest |

---

## Veritabani Semasi

### Tablolar Ozeti

**Lookup / Referans Tablolari (seed data ile doldurulur, admin panelden yonetilebilir):**

| Tablo | Amac | Faz |
|-------|------|-----|
| professions | Meslek listesi (TR + EN isim) | MVP |
| categories | Proje kategorileri (TR + EN isim) | MVP |
| project_types | Proje turleri (web, mobile vs.) | MVP |
| project_stages | Proje asamalari (fikir, beta vs.) | MVP |
| technologies | Teknoloji listesi (React, Node.js vs.) | MVP |

**Ana Tablolar:**

| Tablo | Amac | Faz |
|-------|------|-----|
| users | Kullanici bilgileri | MVP |
| user_professions | Kullanici-meslek iliskisi (coka-cok) | MVP |
| follows | Takip iliskileri | MVP |
| projects | Proje bilgileri | MVP |
| project_technologies | Proje tech stack (coka-cok) | MVP |
| project_images | Proje gorselleri | MVP |
| project_members | Takim uyeleri | MVP |
| project_likes | Begeniler | MVP |
| project_upvotes | Upvote'lar | MVP |
| comments | Yorumlar | MVP |
| comment_likes | Yorum begenileri | Faz 2 |
| connections | Baglanti sistemi (LinkedIn tarzi) | Faz 2 |
| references | Kullanici referanslari | Faz 2 |
| notifications | Bildirimler | Faz 2 |
| activities | Aktivite feed | Faz 2 |
| changelogs | Proje degisiklik gecmisi | Faz 2 |
| open_positions | Acik pozisyonlar | Faz 3 |
| position_applications | Pozisyon basvurulari | Faz 3 |

### Lookup Tablolari (Referans Verileri)

Tum sabit listeler DB'de tutulur. Enum/const KULLANMA. Boylece admin panelden yonetilebilir, yeni deger eklenebilir, TR/EN isimleri guncellenebilir.

```typescript
// packages/db/src/schema/lookups.ts

// =============================================
// MESLEKLER
// =============================================
export const professions = sqliteTable("professions", {
  id: text("id").primaryKey(),           // nanoid
  slug: text("slug").notNull(),          // "frontend-developer"
  nameEn: text("name_en").notNull(),     // "Frontend Developer"
  nameTr: text("name_tr").notNull(),     // "Frontend Gelistirici"
  icon: text("icon"),                    // lucide icon adi: "monitor", "server"
  group: text("group"),                  // gruplama: "engineering", "design", "management"
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// =============================================
// PROJE KATEGORILERI
// =============================================
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),          // "developer-tools"
  nameEn: text("name_en").notNull(),     // "Developer Tools"
  nameTr: text("name_tr").notNull(),     // "Gelistirici Araclari"
  icon: text("icon"),                    // lucide icon adi
  description: text("description"),      // kisa aciklama
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// =============================================
// PROJE TURLERI
// =============================================
export const projectTypes = sqliteTable("project_types", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),          // "web-app"
  nameEn: text("name_en").notNull(),     // "Web Application"
  nameTr: text("name_tr").notNull(),     // "Web Uygulamasi"
  icon: text("icon"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// =============================================
// PROJE ASAMALARI
// =============================================
export const projectStages = sqliteTable("project_stages", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),          // "idea"
  nameEn: text("name_en").notNull(),     // "Idea"
  nameTr: text("name_tr").notNull(),     // "Fikir"
  color: text("color"),                  // tailwind renk: "yellow", "green", "blue"
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// =============================================
// TEKNOLOJILER
// =============================================
export const technologies = sqliteTable("technologies", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),          // "react"
  name: text("name").notNull(),          // "React" (teknoloji isimleri evrensel)
  iconUrl: text("icon_url"),             // CDN'deki ikon URL'si
  group: text("group"),                  // "language", "framework", "database", "cloud", "tool"
  websiteUrl: text("website_url"),       // "https://react.dev"
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
```

### Users Tablosu

```typescript
// users tablosunda profession artik FK degil, coka-cok iliski var (user_professions)
export const users = sqliteTable("users", {
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
  rating: integer("rating").default(0),       // 0-100 (10 uzerinden * 10)
  ratingCount: integer("rating_count").default(0),
  isPublic: integer("is_public", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Kullanici birden fazla meslege sahip olabilir
export const userProfessions = sqliteTable("user_professions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  professionId: text("profession_id").notNull().references(() => professions.id),
  isPrimary: integer("is_primary", { mode: "boolean" }).default(false), // birincil meslek
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
```

### Projects Tablosu

```typescript
// category, type, stage artik FK olarak lookup tablolarina isaret eder
export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  tagline: text("tagline"),                // max 120 karakter
  description: text("description"),         // markdown destekli
  categoryId: text("category_id").notNull().references(() => categories.id),
  typeId: text("type_id").notNull().references(() => projectTypes.id),
  stageId: text("stage_id").notNull().references(() => projectStages.id),
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
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  launchedAt: integer("launched_at", { mode: "timestamp" }),
});

// project_technologies artik technologies tablosuna FK
export const projectTechnologies = sqliteTable("project_technologies", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  technologyId: text("technology_id").notNull().references(() => technologies.id),
});
```

### Seed Data (packages/db/src/seed.ts)

Lookup tablolari icin baslangic verileri asagidadir. Migration sonrasi `seed.ts` ile doldurulur.
Detayli seed verisi icin `packages/db/src/seed.ts` dosyasina bak.

### Diger Tablolar (Drizzle schema)

Tum tablo tanimlari icin `docs/TECHNICAL_PLAN.md` dosyasina bak. Orada:
- project_technologies, project_images, project_members
- project_likes, project_upvotes
- comments, comment_likes
- follows, connections, references
- notifications, activities
- changelogs, open_positions, position_applications
- Tum indexler ve iliskiler detayli olarak tanimli

### Iliski Diyagrami

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

## API Endpoint Listesi

### Auth (`/auth`)
```
GET    /auth/github              -> GitHub OAuth baslat
GET    /auth/github/callback     -> GitHub callback
GET    /auth/google              -> Google OAuth baslat
GET    /auth/google/callback     -> Google callback
POST   /auth/logout              -> Oturumu sonlandir
GET    /auth/me                  -> Mevcut kullanici bilgisi
```

### Users (`/users`)
```
GET    /users                    -> Kullanici listesi (sayfalama + filtre)
GET    /users/:username          -> Profil detayi
PUT    /users/:username          -> Profil guncelle (sadece kendi)
GET    /users/:username/projects -> Kullanicinin projeleri
GET    /users/:username/followers    -> Takipciler
GET    /users/:username/following    -> Takip edilenler
GET    /users/:username/activity     -> Aktivite feed
```

### Follow (`/users/:username/follow`)
```
POST   /users/:username/follow       -> Takip et
DELETE /users/:username/follow       -> Takibi birak
GET    /users/:username/follow/status -> Takip durumu
```

### Projects (`/projects`)
```
GET    /projects                      -> Proje listesi (sayfalama + filtre + siralama)
POST   /projects                      -> Yeni proje olustur
GET    /projects/:slug                -> Proje detayi
PUT    /projects/:slug                -> Proje guncelle
DELETE /projects/:slug                -> Proje sil
POST   /projects/:slug/like          -> Begen
DELETE /projects/:slug/like          -> Begeniyi kaldir
POST   /projects/:slug/upvote        -> Upvote
DELETE /projects/:slug/upvote        -> Upvote kaldir
GET    /projects/:slug/stats         -> Istatistikler
POST   /projects/:slug/images        -> Gorsel yukle
DELETE /projects/:slug/images/:id     -> Gorsel sil
GET    /projects/:slug/members        -> Takim uyeleri
POST   /projects/:slug/members        -> Uye ekle
DELETE /projects/:slug/members/:id    -> Uyeyi cikar
GET    /projects/:slug/comments       -> Yorumlar
POST   /projects/:slug/comments       -> Yorum yaz
```

### Comments (`/comments`)
```
PUT    /comments/:id                  -> Yorum duzenle
DELETE /comments/:id                  -> Yorum sil
POST   /comments/:id/like            -> Yorum begen
DELETE /comments/:id/like            -> Begeniyi kaldir
```

### Connections (`/connections`) — Faz 2
```
POST   /connections                   -> Baglanti istegi gonder
GET    /connections/pending           -> Bekleyen istekler
PUT    /connections/:id/accept        -> Kabul et
PUT    /connections/:id/reject        -> Reddet
DELETE /connections/:id               -> Baglantiyi kaldir
```

### References (`/references`) — Faz 2
```
POST   /references                    -> Referans yaz
DELETE /references/:id                -> Referans sil
```

### Notifications (`/notifications`) — Faz 2
```
GET    /notifications                  -> Bildirim listesi
PUT    /notifications/read-all         -> Tumunu okundu isaretle
PUT    /notifications/:id/read         -> Okundu isaretle
GET    /notifications/unread-count     -> Okunmamis sayisi
```

### Positions (`/positions`) — Faz 3
```
GET    /positions                      -> Acik pozisyonlar
POST   /projects/:slug/positions       -> Pozisyon olustur
PUT    /positions/:id                  -> Pozisyon guncelle
DELETE /positions/:id                  -> Pozisyon sil
POST   /positions/:id/apply           -> Basvur
GET    /positions/:id/applications     -> Basvurular
PUT    /applications/:id/status        -> Durum guncelle
```

### Search (`/search`)
```
GET    /search?q=&type=               -> Genel arama
GET    /search/users?q=&profession=   -> Kullanici arama
GET    /search/projects?q=&category=  -> Proje arama
```

### Feed (`/feed`)
```
GET    /feed                           -> Kisisellestirilmis feed
GET    /feed/trending                  -> Trend projeler
GET    /feed/latest                    -> En yeni projeler
```

---

## Sayfa Yapisi

### Landing Page (`/`)
- Hero section: Baslik, aciklama, CTA butonlari
- One cikan projeler: Haftanin en populer projeleri
- Istatistikler: Toplam gelistirici, proje, baglanti
- Nasil calisir: 3 adimli kullanim akisi
- Son eklenen projeler
- Footer

### Projeler / Kesfet (`/explore/projects`)
- Filtre paneli: Kategori, tur, teknoloji, asama, yatirima acik, calisma arkadasi ariyor
- Siralama: En yeni, en populer, en cok upvote
- Proje kartlari: Logo, baslik, kisa aciklama, tech stack, upvote/like sayisi, asama rozeti
- Cursor-based pagination

### Kisiler (`/explore/developers`)
- Filtre paneli: Meslek, konum, rating araligi
- Siralama: En populer, en yeni, en yuksek rating
- Kisi kartlari: Avatar, isim, meslekler, proje sayisi, rating, takip butonu
- Cursor-based pagination

### Proje Detay (`/projects/:slug`)
- Proje basligi, logo, kategori, asama rozeti
- Detayli aciklama (markdown)
- Gorsel galerisi
- Takim listesi ve roller
- Tech stack
- Linkler (website, repo, demo)
- Proje bilgileri (baslangic tarihi, platform)
- Calisma arkadasi araniyor (roller + basvuru butonu)
- Upvote/like butonlari ve sayaci
- Yorumlar

### Kullanici Profil (`/u/:username`)
- Avatar, isim, meslekler, konum
- Istatistikler: Proje sayisi, takipci, takip edilen, rating
- Iletisim bilgileri, sosyal linkler
- Bio
- Projeler (kart gorunumu)
- Birlikte calisilanlar
- Son aktiviteler
- Takip/baglanti butonu

### Dashboard (`/dashboard`)
- Ozet kartlari: Proje sayisi, toplam upvote, takipci
- Projelerim (hizli erisim, duzenle)
- Bildirimler
- Aktivite akisi
- Hizli islemler (yeni proje, profili duzenle)

---

## Dosya/Klasor Yapisi

```
1elat.com/
|-- apps/
|   |-- web/                          # React Router v7 - Frontend
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
|   |   |   |   |-- _index.tsx        # Landing page
|   |   |   |   |-- _auth.tsx         # Auth layout (korunmus)
|   |   |   |   |-- _auth.dashboard.tsx
|   |   |   |   |-- _auth.settings.tsx
|   |   |   |   |-- auth.login.tsx
|   |   |   |   |-- auth.callback.github.tsx
|   |   |   |   |-- auth.callback.google.tsx
|   |   |   |   |-- explore.tsx
|   |   |   |   |-- explore.projects.tsx
|   |   |   |   |-- explore.developers.tsx
|   |   |   |   |-- projects.new.tsx
|   |   |   |   |-- projects.$slug.tsx
|   |   |   |   |-- projects.$slug.edit.tsx
|   |   |   |   |-- u.$username.tsx
|   |   |   |   |-- search.tsx
|   |   |   |   |-- notifications.tsx
|   |   |   |-- lib/
|   |   |   |   |-- api.ts            # API client
|   |   |   |   |-- auth.ts           # Client-side auth helpers
|   |   |   |   |-- utils.ts
|   |   |   |   |-- constants.ts
|   |   |   |-- hooks/
|   |   |   |   |-- use-auth.ts
|   |   |   |   |-- use-infinite-scroll.ts
|   |   |   |   |-- use-optimistic.ts
|   |
|   |-- api/                           # Hono.js - Backend API
|   |   |-- src/
|   |   |   |-- index.ts              # Ana Hono app
|   |   |   |-- routes/
|   |   |   |   |-- auth.ts
|   |   |   |   |-- users.ts
|   |   |   |   |-- projects.ts
|   |   |   |   |-- comments.ts
|   |   |   |   |-- connections.ts    # Faz 2
|   |   |   |   |-- references.ts     # Faz 2
|   |   |   |   |-- notifications.ts  # Faz 2
|   |   |   |   |-- positions.ts      # Faz 3
|   |   |   |   |-- search.ts
|   |   |   |   |-- feed.ts
|   |   |   |-- middleware/
|   |   |   |   |-- auth.ts
|   |   |   |   |-- rate-limit.ts
|   |   |   |   |-- validate.ts
|   |   |   |   |-- error-handler.ts
|   |   |   |-- services/
|   |   |   |   |-- user.service.ts
|   |   |   |   |-- project.service.ts
|   |   |   |   |-- comment.service.ts
|   |   |   |   |-- notification.service.ts  # Faz 2
|   |   |   |   |-- upload.service.ts
|   |   |   |   |-- search.service.ts
|   |   |   |   |-- feed.service.ts
|   |   |   |-- lib/
|   |   |   |   |-- id.ts             # nanoid
|   |   |   |   |-- pagination.ts
|   |   |   |   |-- errors.ts
|   |   |   |-- types.ts
|
|-- packages/
|   |-- db/
|   |   |-- src/
|   |   |   |-- schema/
|   |   |   |   |-- users.ts
|   |   |   |   |-- projects.ts
|   |   |   |   |-- notifications.ts  # Faz 2
|   |   |   |   |-- index.ts
|   |   |   |-- index.ts
|   |   |-- drizzle.config.ts
|   |
|   |-- auth/
|   |   |-- src/
|   |   |   |-- github.ts
|   |   |   |-- google.ts
|   |   |   |-- session.ts
|   |   |   |-- index.ts
|   |
|   |-- shared/
|   |   |-- src/
|   |   |   |-- types/
|   |   |   |   |-- user.ts
|   |   |   |   |-- project.ts
|   |   |   |   |-- common.ts
|   |   |   |   |-- index.ts
|   |   |   |-- validators/
|   |   |   |   |-- user.ts
|   |   |   |   |-- project.ts
|   |   |   |   |-- comment.ts
|   |   |   |   |-- index.ts
|   |   |   |-- constants/
|   |   |   |   |-- professions.ts
|   |   |   |   |-- categories.ts
|   |   |   |   |-- index.ts
|   |   |   |-- index.ts
```

---

## Kimlik Dogrulama Akisi

```
Kullanici -> "GitHub ile Giris" -> API /auth/github -> GitHub yetkilendirme
-> Callback /auth/github/callback -> Code'u token'a cevir -> Profil bilgisi al
-> DB: Kullanici var mi?
  -> Evet: Session olustur (KV), cookie set et, /dashboard'a yonlendir
  -> Hayir: Kullanici olustur, /onboarding'e yonlendir
```

Session: KV-based token, HttpOnly cookie, 7 gun TTL, sliding window.

---

## Guvenlik

- HttpOnly + Secure + SameSite=Lax cookie
- OAuth state parametresi (CSRF korumasi, KV'de 10dk TTL)
- Zod validasyon tum girdilerde
- Drizzle ORM parametreli sorgular (SQL injection korunmasi)
- Rate limiting (KV sliding window): 100 req/dk genel, 10 req/dk auth
- Dosya tipi + boyut dogrulama (5MB max, sadece image/*)
- CORS: Sadece 1elat.com + localhost:5173
- CSP header + secureHeaders middleware
- Markdown icerik: DOMPurify ile sanitize

---

## Performans

- KV cache-aside pattern (profil 5dk, liste 1dk, sabit veriler 24saat)
- Cursor-based pagination (offset yerine)
- Denormalize sayaclar (likes_count, upvotes_count projects tablosunda)
- D1: Sadece gerekli alanlar SELECT, iliskili veriler ayri sorgular
- Frontend: Optimistic UI, lazy loading, route-based code splitting
- R2 CDN uzerinden gorsel servisi

---

## Implementasyon Fazlari

---

### FAZ 1 — MVP (6 hafta)

**Hedef**: Temel kullanici ve proje sistemi. Giris, profil, proje paylasma, begeni, yorum, takip.

#### Adim 1.1: Altyapi Hazirlik (Hafta 1)

- [ ] `packages/shared` yeniden yapilandir:
  - `src/types/user.ts` — User, UserProfile, UserCard tipleri
  - `src/types/project.ts` — Project, ProjectCard, ProjectDetail tipleri
  - `src/types/common.ts` — ApiResponse<T>, PaginatedResponse<T>, Cursor tipleri
  - `src/types/lookups.ts` — Profession, Category, ProjectType, ProjectStage, Technology tipleri
  - `src/validators/user.ts` — createUserSchema, updateUserSchema
  - `src/validators/project.ts` — createProjectSchema, updateProjectSchema
  - `src/validators/comment.ts` — createCommentSchema
  - NOT: Sabit meslek/kategori listesi TUTMA. Bunlar DB'den gelecek.
- [ ] `packages/db` schema yeniden yapilandir:
  - `src/schema/lookups.ts` — professions, categories, project_types, project_stages, technologies tablolari
  - `src/schema/users.ts` — users, user_professions, follows tablolari + indexler
  - `src/schema/projects.ts` — projects, project_technologies, project_images, project_members, project_likes, project_upvotes, comments tablolari + indexler
  - `src/schema/index.ts` — barrel export
  - `src/seed.ts` — lookup tablolari icin baslangic verileri (meslekler, kategoriler, turler, asamalar, teknolojiler — TR+EN)
  - Drizzle migration olustur ve calistir
  - Seed script'i calistir
- [ ] `apps/api` altyapi:
  - `src/lib/id.ts` — nanoid helper
  - `src/lib/pagination.ts` — cursor-based pagination helper
  - `src/lib/errors.ts` — AppError, NotFoundError, UnauthorizedError, ValidationError siniflari
  - `src/middleware/error-handler.ts` — merkezi hata yakalama
  - `src/middleware/validate.ts` — Zod validasyon middleware
  - `src/types.ts` — Hono Bindings, AppContext tipleri
- [ ] Her adim icin testler yaz (Vitest)

#### Adim 1.2: Auth Sistemi (Hafta 2)

- [ ] `packages/auth` implement et:
  - `src/github.ts` — getAuthorizationUrl, exchangeCodeForToken, getUserProfile
  - `src/google.ts` — ayni fonksiyonlar Google icin
  - `src/session.ts` — createSession, getSession, deleteSession, refreshSession
- [ ] `apps/api` auth route'lari:
  - `src/routes/auth.ts` — /auth/github, /auth/github/callback, /auth/google, /auth/google/callback, /auth/logout, /auth/me
  - `src/middleware/auth.ts` — authMiddleware (session dogrulama + userId set)
  - `src/services/user.service.ts` — findOrCreateUser, getUserById, getUserByUsername
- [ ] `apps/web` auth sayfalari:
  - `app/routes/auth.login.tsx` — giris sayfasi (GitHub + Google butonlari)
  - `app/routes/auth.callback.github.tsx` — GitHub callback handler
  - `app/routes/auth.callback.google.tsx` — Google callback handler
  - `app/routes/auth.onboarding.tsx` — ilk kayit sonrasi profil tamamlama (username, meslek, bio)
  - `app/lib/auth.ts` — client-side auth helper (cookie okuma, session kontrolu)
  - `app/hooks/use-auth.ts` — useAuth hook
- [ ] Auth icin testler

#### Adim 1.3: Kullanici Profil (Hafta 3)

- [ ] `apps/api` kullanici route'lari:
  - `src/routes/users.ts` — GET /users, GET /users/:username, PUT /users/:username
  - `src/services/user.service.ts` — listUsers, getUserProfile, updateUser
- [ ] `apps/web` profil sayfalari:
  - `app/routes/u.$username.tsx` — profil sayfasi
  - `app/routes/_auth.settings.tsx` — profil duzenleme
  - `app/components/user/user-card.tsx` — kullanici karti
  - `app/components/user/user-profile-header.tsx` — profil baslik bolumu
  - `app/components/user/user-stats.tsx` — istatistikler
  - `app/components/shared/pagination.tsx` — sayfalama bileseni
  - `app/components/shared/filter-bar.tsx` — filtre cubugu
  - `app/components/shared/empty-state.tsx` — bos durum
- [ ] Kisiler sayfasi: `app/routes/explore.developers.tsx`
- [ ] Testler

#### Adim 1.4: Proje CRUD (Hafta 4)

- [ ] `apps/api` proje route'lari:
  - `src/routes/projects.ts` — GET /projects, POST /projects, GET /projects/:slug, PUT /projects/:slug, DELETE /projects/:slug
  - `src/services/project.service.ts` — createProject, getProjectBySlug, updateProject, deleteProject, listProjects
  - `src/services/upload.service.ts` — uploadImage, deleteImage (R2)
- [ ] `apps/web` proje sayfalari:
  - `app/routes/projects.new.tsx` — proje olusturma formu
  - `app/routes/projects.$slug.tsx` — proje detay sayfasi
  - `app/routes/projects.$slug.edit.tsx` — proje duzenleme
  - `app/routes/explore.projects.tsx` — proje kesfet sayfasi (filtreli)
  - `app/components/project/project-card.tsx` — proje karti
  - `app/components/project/project-detail.tsx` — proje detay bileseni
  - `app/components/project/project-form.tsx` — proje formu (create/edit)
  - `app/components/project/tech-stack-badge.tsx` — teknoloji rozeti
  - `app/components/project/stage-badge.tsx` — asama rozeti
  - `app/components/project/image-gallery.tsx` — gorsel galerisi
- [ ] Testler

#### Adim 1.5: Etkilesim Sistemi (Hafta 5)

- [ ] `apps/api` etkilesim route'lari:
  - `src/routes/projects.ts` icerisine: POST/DELETE /projects/:slug/like, POST/DELETE /projects/:slug/upvote
  - `src/routes/comments.ts` — GET /projects/:slug/comments, POST /projects/:slug/comments, PUT/DELETE /comments/:id
  - `src/routes/users.ts` icerisine: POST/DELETE /users/:username/follow, GET /users/:username/follow/status
  - `src/services/comment.service.ts` — createComment, updateComment, deleteComment, listComments
- [ ] `apps/web` etkilesim bilesenleri:
  - `app/components/project/like-button.tsx` — begeni butonu (optimistic UI)
  - `app/components/project/upvote-button.tsx` — upvote butonu (optimistic UI)
  - `app/components/project/comment-section.tsx` — yorum bolumu
  - `app/components/project/comment-item.tsx` — tekil yorum
  - `app/components/project/comment-form.tsx` — yorum yazma formu
  - `app/components/user/follow-button.tsx` — takip butonu (optimistic UI)
- [ ] Testler

#### Adim 1.6: Landing Page ve Polish (Hafta 6)

- [ ] `apps/web` landing page:
  - `app/routes/_index.tsx` — tam landing page
  - `app/components/layout/hero-section.tsx`
  - `app/components/layout/featured-projects.tsx`
  - `app/components/layout/stats-section.tsx`
  - `app/components/layout/how-it-works.tsx`
  - `app/components/layout/footer.tsx`
- [ ] Dashboard:
  - `app/routes/_auth.dashboard.tsx`
  - `app/components/layout/sidebar.tsx` (dashboard icin)
- [ ] Navbar guncelle: auth durumuna gore Sign In/profil dropdown
- [ ] Responsive tasarim kontrol
- [ ] Error sayfalari (404, 500)
- [ ] Loading/skeleton states
- [ ] SEO meta tag'leri
- [ ] Testler

**MVP Ciktisi**: Kullanicilar giris yapabilir, profil olusturabilir, proje paylasabilir, begenebilir, upvote yapabilir, yorum yazabilir, birbirini takip edebilir.

---

### FAZ 2 — Sosyal Ozellikler (6 hafta)

**Hedef**: Baglanti sistemi, referans, bildirimler, feed, changelog.

#### Adim 2.1: Baglanti Sistemi (Hafta 7)

- [ ] DB: connections tablosu migration
- [ ] API: /connections route'lari (POST, GET pending, PUT accept/reject, DELETE)
- [ ] Web: baglanti istegi butonu, bekleyen istekler sayfasi, baglantilar listesi
- [ ] Testler

#### Adim 2.2: Referans Sistemi (Hafta 8)

- [ ] DB: references tablosu migration
- [ ] API: /references route'lari (POST, DELETE)
- [ ] API: Rating hesaplama (referans ortalamasindan)
- [ ] Web: referans yazma formu, profilde referanslar bolumu, rating gosterimi
- [ ] Testler

#### Adim 2.3: Bildirim Sistemi (Hafta 9-10)

- [ ] DB: notifications tablosu migration
- [ ] API: Queue consumer worker (bildirim olusturma)
- [ ] API: /notifications route'lari (GET, PUT read, GET unread-count)
- [ ] API: KV unread count yonetimi
- [ ] Web: bildirim dropdown (navbar), bildirimler sayfasi, okunmamis sayac
- [ ] Tum etkilesim noktalarinda queue'ya mesaj gonderme (like, yorum, takip, baglanti, referans)
- [ ] Testler

#### Adim 2.4: Feed ve Aktivite (Hafta 11)

- [ ] DB: activities tablosu migration
- [ ] API: /feed route'lari (kisisel, trending, latest)
- [ ] API: aktivite kayit service'i (proje olusturma, like, yorum vb.)
- [ ] Web: feed sayfasi, aktivite kartlari, trend projeler
- [ ] Testler

#### Adim 2.5: Proje Gelistirmeleri (Hafta 12)

- [ ] DB: changelogs, comment_likes tablolari migration
- [ ] API: /changelog route'lari, nested yorumlar, yorum begenme
- [ ] Web: changelog bolumu, nested yorum UI, gelismis arama
- [ ] Testler

**Faz 2 Ciktisi**: Tam sosyal deneyim — baglantilar, referanslar, bildirimler, feed, changelog.

---

### FAZ 3 — Olgunlasma (6 hafta)

**Hedef**: Pozisyon sistemi, performans optimizasyonu, guvenlik sertlestirme.

#### Adim 3.1: Acik Pozisyonlar (Hafta 13-14)

- [ ] DB: open_positions, position_applications tablolari migration
- [ ] API: /positions route'lari (CRUD, basvuru, durum yonetimi)
- [ ] Web: pozisyon olusturma, pozisyon listesi, basvuru formu, basvuru yonetimi
- [ ] Kesfet sayfasinda "calisma arkadasi ariyor" filtresi
- [ ] Testler

#### Adim 3.2: Performans (Hafta 15-16)

- [ ] KV caching katmani (cache-aside pattern)
- [ ] Optimistic UI (like, follow, upvote)
- [ ] Infinite scroll (cursor-based)
- [ ] Gorsel lazy loading
- [ ] Skeleton loading states
- [ ] Gelismis filtreleme UI
- [ ] Mobil uyumluluk iyilestirmeleri

#### Adim 3.3: Guvenlik ve Kalite (Hafta 17-18)

- [ ] Rate limiting (KV sliding window)
- [ ] Gelismis hata yonetimi ve loglama
- [ ] E2E testler (kritik akislar)
- [ ] SEO iyilestirmeleri (sitemap, structured data)
- [ ] Accessibility (a11y) iyilestirmeleri
- [ ] Lighthouse skoru > 90 hedefi
- [ ] Production deployment

**Faz 3 Ciktisi**: Production-ready platform.

---

## KPI Hedefleri

| Metrik | 3 Ay | 6 Ay | 12 Ay |
|--------|------|------|-------|
| Kayitli kullanici | 500 | 2.000 | 10.000 |
| Aylik aktif (MAU) | 200 | 800 | 4.000 |
| Toplam proje | 200 | 1.000 | 5.000 |
| Proje basina yorum | 3 | 5 | 8 |
| Oturum suresi | 3dk | 5dk | 8dk |
| Uptime | %99.9 | %99.9 | %99.9 |
| API yanit suresi | <200ms | <200ms | <200ms |

---

## Onemli Tasarim Kararlari

| Karar | Secim | Gerekce |
|-------|-------|---------|
| ID stratejisi | nanoid (21 karakter) | UUID'den kisa, URL-safe |
| Sayfalama | Cursor-based | Buyuk veri setlerinde tutarli performans |
| Sayaclar | Denormalize | COUNT sorgusu onlenir |
| Session | KV token-based | Sunucu tarafli iptal, JWT'den guvenli |
| Bildirim | Async Queue | API yanit suresi etkilenmez |
| Feed | Fanout-on-read | Basit, D1 sinirlarinda yeterli |
| Arama | D1 LIKE + index | MVP icin yeterli, sonra Vectorize |
| Cache | KV cache-aside | D1 yukunu azaltir |

---

*Bu plan, product (PRODUCT_PLAN.md), teknik mimari (TECHNICAL_PLAN.md) ve rakip analizi (platform-arastirma-raporu.md) dokumanlarinin birlestirilmis ve onceliklendirilmis halidir. Claude Code bu plana gore faz faz gelistirme yapacaktir.*
