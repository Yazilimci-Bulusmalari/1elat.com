# Proje Oluşturma + Detay Sayfası — Tasarım Belgesi

**Tarih:** 2026-04-18
**Kapsam:** Proje yaşam döngüsü (oluştur → düzenle → yayınla), detay sayfası, ilgili API.
**Referans:** ProductHunt ürün sayfası deseni (overview + tabs + sidebar + maker post).

---

## 1. Hedefler

1. Kullanıcılar projelerini **taslak** olarak oluşturup üzerinde özgürce çalışabilsinler.
2. Hazır olduklarında tek tıkla **yayınlayabilsinler** (zorunlu alan validasyonu sonrası).
3. Yayın sonrası **düzenleyebilsinler** (bazı alanlar kilitlenir).
4. Detay sayfası, ProductHunt'taki gibi keşfedilebilir, sosyal etkileşime açık olsun (upvote, beğeni, yorum, takip).
5. Proje sahibi tek başına veya **ekiple** birlikte projeyi oluşturabilsin.

---

## 2. Yaşam Döngüsü Modeli

### 2.1 Durumlar (state machine)

```
            ┌──────────┐  publish   ┌──────────────┐  archive  ┌──────────┐
  create →  │  draft   │ ─────────→ │  published   │ ────────→ │ archived │
            └────▲─────┘ ←───────── └──────▲───────┘  republish└────┬─────┘
                 │       unpublish         └─────────────────────────┘
                 │
                 └── delete (sadece taslak için, yumuşak silme önerilir)
```

**Karar:** Şemaya `status text enum('draft','published','archived') notNull default 'draft'` ekle.

**Neden mevcut alanlar yetersiz:**
- `launchedAt IS NULL` → taslak çıkarımı kırılgan; arşiv durumunu ifade edemez.
- `isPublic` zaten görünürlük için kullanılıyor (yayında bile gizli proje senaryosu için saklanır).
- Açık enum, sorgular ve UI rozetleri için tek doğruluk kaynağıdır.

### 2.2 Geçiş kuralları

| Geçiş | İzin | Validasyon | Yan etki |
|-------|------|------------|----------|
| `→ draft` (create) | Auth user | Yok (boş kabul) | `ownerId` set, `slug` üret |
| `draft → published` | Owner | Zorunlu alan kontrolü | `launchedAt = now()` |
| `published → draft` | Owner | Yok | `launchedAt` korunur (tekrar yayınlanırsa güncellenmez) |
| `published → archived` | Owner | Yok | Listelerden gizlenir |
| `archived → published` | Owner | Yok | Geri görünür olur |
| `delete` | Owner (sadece draft) veya admin (her durum) | Yok | `cascade` ile alt kayıtlar (images, members, comments) silinir |

**Yayın için zorunlu alanlar:** `name`, `tagline`, `description` (≥120 karakter), `categoryId`, `typeId`, `stageId`, en az 1 `image` veya `thumbnailUrl`, `websiteUrl` veya `repoUrl` veya `demoUrl`'den en az biri.

---

## 3. Veri Modeli Değişiklikleri

### 3.1 `projects` tablosuna eklenenler

| Alan | Tip | Notlar |
|------|-----|--------|
| `status` | text enum('draft','published','archived') notNull default 'draft' | Yaşam döngüsü |
| `launchStory` | text nullable | Maker post (image 7'deki uzun anlatı, markdown destekli) |
| `pricingModel` | text enum('free','freemium','paid','open_source') nullable | "Free" rozeti için |

### 3.2 `project_tags` (yeni tablo)

PH'taki "Launch tags" karşılığı (Browser Extensions, Chrome Extensions, Security gibi). Mevcut `categories` ile karıştırma — kategori 1 tane (taksonomi), tag çoklu (serbest etiketleme).

```ts
project_tags = {
  id, projectId (fk cascade), label text notNull,
  index(projectId)
}
```

Alternatif: Mevcut `technologies` lookup tablosu zaten var; tag yerine onu kullanmak (sadece teknolojiler) — ama PH'taki tag'ler "Browser Extensions" gibi domain etiketleri, technology değil. **Karar:** ayrı `project_tags`.

### 3.3 `project_followers` (yeni tablo)

Image 6'daki "26 followers" + "Follow Ahtapot" butonu için. Mevcut `follows` tablosu user→user için.

```ts
project_followers = {
  id, projectId (fk cascade), userId (fk cascade), createdAt,
  index(projectId), index(userId), unique(projectId, userId)
}
```

### 3.4 Mevcut tablolarda boşluklar

- `comments`: `parentId` var ama nested thread için `index(parent_id)` mevcut — yeterli.
- `project_images`: `caption` ve `sortOrder` var — galeri için yeterli. Boyut kısıtı (MB) ve mime type validasyonu API katmanında.

---

## 4. Detay Sayfası (Public View)

### 4.1 URL & SEO

- Public URL: `/p/:username/:slug` (PH-style scoped). Kullanıcı silinirse `username` kayar; kalıcı kanonik için ID-bazlı redirect alternatifi var ama `slug` kapsamı yeterli.
- Alternatif: `/projects/:slug` global unique slug. **Karar:** `/p/:username/:slug` (uniqueness sadece owner scope'unda; kullanıcı X'in iki "todo-app" projesi olamaz, ama farklı kullanıcılar olabilir).
- SEO meta: og:title, og:description, og:image (`thumbnailUrl`).

### 4.2 Layout (PH map)

```
┌────────────────────────────────────────────────────────┬──────────────┐
│ HERO                                                   │ SIDEBAR      │
│ ┌──────┐ Project Name                  [Visit website] │ Launched 6mo │
│ │ Logo │ Tagline (kısa)                                │              │
│ └──────┘ Followers · Category badge                    │ [▲ Upvote N] │
│                                                        │              │
│ Description (1-2 cümle özet)                           │ + Follow     │
│                                                        │ + Bookmark   │
│ ┌─────────┬───────────┬──────┬──────┐                  │ ↗ Share      │
│ │Overview │Discussion │ Team │ More │                  │              │
│ └─────────┴───────────┴──────┴──────┘                  │ Links        │
│                                                        │  ↗ Website   │
│ ── TAB CONTENT ──                                      │  ↗ GitHub    │
│                                                        │  ↗ Demo      │
│ [Media gallery — yatay scroll, 16:9 thumb'lar]         │              │
│                                                        │ Stage: Beta  │
│ Pricing: Free · Tags: Browser Ext, Chrome Ext, Sec     │ Pricing: Free│
│                                                        │              │
│ ── Maker says ──                                       │ Tech stack   │
│ ┌──────────────────────────────────────────┐           │ [Hono] [TS]  │
│ │ [Avatar] Owner · Maker badge · pinned    │           │              │
│ │ "Hey 1elat! 👋 ... markdown body ..."    │           │ Looking for  │
│ │ [▲ Upvote 6] [Report] [Share] [6mo ago]  │           │ - Teammates  │
│ └──────────────────────────────────────────┘           │ - Investment │
│                                                        │              │
│ ── Comments (N) ──                                     └──────────────┘
│ [Yeni yorum kutusu — login gerekir]                    
│ [Yorum thread'leri, nested]                            
└────────────────────────────────────────────────────────
```

### 4.3 Tab içerikleri

**Overview:**
- Hero meta (zaten yukarıda)
- Galeri (yatay carousel, lightbox)
- Maker says (sahibinin uzun anlatısı, markdown render)
- Pricing + Tags chip'leri

**Discussion:**
- Yeni yorum kutusu (login gerekir, login değilse "Yorum yapmak için giriş yap" CTA)
- Yorum listesi: en yeni / en çok beğenilen sıralaması
- Nested replies (`parentId` ile, tek seviye yeterli — derin nesting karmaşa yapar)
- Her yoruma like, reply, report

**Team:**
- Owner kart üstte (Owner badge)
- `project_members` listesi: avatar, ad, rol (örn. "Frontend", "Designer"), katılım tarihi
- Owner'sa "Add member" CTA → modal: username arama, rol gir, davet et

**More:**
- Project metadata: oluşturulma tarihi, son güncelleme, görüntülenme sayısı
- Versiyon geçmişi (gelecek faz)
- Report project / Hide

### 4.4 Sağ sidebar bileşenleri

- **Launch date**: `Intl.RelativeTimeFormat(lang)` ile "6 ay önce yayınlandı".
- **Upvote**: optimistic toggle, anonim kullanıcı için login modali.
- **Follow project**: kullanıcı projeye abone, yeni yorum/etkinlik bildirimi alır (bildirim altyapısı ayrı faz).
- **Bookmark / Add to collection**: kullanıcının "kütüphanesi" — gelecek faz, şimdilik koleksiyon = `liked` listesi.
- **Share**: Web Share API + kopyala linki.
- **Links**: website / repo / demo (varsa).
- **Stage**: shadcn `Badge` rozeti (Idea, Prototype, MVP, Beta, Production — `project_stages` lookup).
- **Pricing**: aynı şekilde rozet.
- **Tech stack**: `project_technologies` join ile teknoloji isimleri chip'leri.
- **Looking for**: `isSeekingTeammates` / `isSeekingInvestment` → ilgili rozetler.

### 4.5 Sahip görünümü farkı

Sahip kendi sayfasını gezerken:
- Sağ üst köşede "Düzenle" + "Yönet" (status menüsü: yayınla/yayından kaldır/arşivle/sil) butonları.
- Taslakta: "Bu proje yayında değil — sadece sen görebilirsin" üst bilgi banner'ı + büyük "Yayınla" CTA.
- Stat kartları (görüntülenme, upvote, beğeni) sahip için her zaman görünür.

---

## 5. Oluşturma Akışı

### 5.1 Tek-sayfa form mu, wizard mı?

**Karar: Tek-sayfa form, sol nav ile bölüm atlama, otomatik kayıt (autosave).**

**Neden:**
- Wizard adım adım navigasyonu keser, kullanıcı yarıda bırakırsa veri kaybeder.
- Tek sayfa + autosave → her input değişiminde 800ms debounce ile PATCH → kaybolma riski yok.
- Sol nav (Bölümler: Temel, Açıklama, Medya, Bağlantılar, Etiketler, Ekip, Ayarlar, Önizleme) üst kısımdaki tamamlanma yüzdesini gösterir.

### 5.2 Akış adımları

```
┌────────────────────────────────────────────────────────┐
│ 1. /dashboard'da "Yeni Proje" butonu → modal:          │
│    "Projenizin adı?" → POST /projects (sadece name)    │
│    → 201 { slug } → redirect /projects/:slug/edit      │
├────────────────────────────────────────────────────────┤
│ 2. /projects/:slug/edit                                │
│    Sol: bölüm nav + tamamlanma %                       │
│    Sağ: aktif bölüm formu                              │
│    Üstte: [Önizle] [Yayınla] (validasyon eksikse       │
│            butona hover ile eksiklikler tooltip)       │
│                                                        │
│    Her input değişimi: 800ms debounce → PATCH          │
│    Üstte: "Kaydedildi · az önce" indicator             │
├────────────────────────────────────────────────────────┤
│ 3. Yayınla tıklandığında:                              │
│    - Frontend Zod validasyon (eksik varsa highlight)   │
│    - Backend POST /projects/:slug/publish              │
│    - 200 → redirect /p/:username/:slug + toast         │
└────────────────────────────────────────────────────────┘
```

### 5.3 Bölümler ve alanlar

**Temel:**
- Adı (notNull)
- Tagline (1-cümle, ≤80 karakter)
- Slug (autogen kebab-case + manuel düzenleme; yayın sonrası kilit)

**Açıklama:**
- Description (markdown editor — `@uiw/react-md-editor` veya basit textarea + preview tab; karar: önce textarea + lite markdown, sonra zenginleştir)
- Maker says / Launch story (markdown)

**Medya:**
- Logo (1 adet, kare, `thumbnailUrl`)
- Galeri (≤8 görsel, drag-to-reorder, `sortOrder`, caption opsiyonel)
- Upload akışı: client → POST `/projects/:slug/images` (multipart) → Worker → R2 → URL döner. R2 public bucket veya signed URL — public daha basit.

**Bağlantılar:**
- Website URL
- Repo URL (GitHub/GitLab vs)
- Demo URL

**Etiketler:**
- Category (lookup, single)
- Type (lookup, single)
- Stage (lookup, single)
- Technologies (multi, autocomplete)
- Custom tags (free text, ≤5)

**Ekip:**
- Owner (otomatik, salt-okunur)
- Üyeler: username arama → davet butonu (davet kabul akışı opsiyonel; MVP için doğrudan ekleme + üye bildirimi yeterli)
- Her üyeye serbest rol metni (örn. "Backend Lead")

**Ayarlar:**
- Pricing model (free/freemium/paid/open_source)
- isOpenSource toggle
- isPublic toggle (yayın sonrası gizli yapma için)
- isSeekingInvestment toggle
- isSeekingTeammates toggle

**Önizleme:**
- Detay sayfasının iframe / aynı bileşenle render — kullanıcı yayın öncesi görebilir.

### 5.4 Otomatik kayıt (autosave) detayı

- Her form alanı `onChange` → debounce(800ms) → PATCH `/projects/:slug` (delta gönder).
- Üst bar: "Kaydediliyor..." → "Kaydedildi · 2 sn önce" (Intl.RelativeTimeFormat).
- Network hatası: kırmızı "Kaydedilemedi · Tekrar dene" butonu.
- Çakışma: optimistic concurrency yerine "last write wins" (tek kullanıcı düzenlediği için yeterli; ekip düzenleme gelecek faz).

### 5.5 Slug yönetimi

- Yeni proje: name'den slugify → uniqueness check `(ownerId, slug)` — çakışma varsa `-2`, `-3` ekle.
- Taslakta: kullanıcı manuel düzenleyebilir.
- Yayın sonrası: kilitli (SEO + kalıcı link). İstisna: admin override.

---

## 6. API Tasarımı

### 6.1 Kaynak konvansiyonu

- Path: `/projects` koleksiyonu, `/projects/:slug` öğe (slug bazlı erişim daha güzel URL).
- Sahip listeleri: `/me/projects` (auth).
- Public listesi: `/projects` (yayında olanlar).
- Yorum/upvote alt kaynaklar: `/projects/:slug/comments`, `/projects/:slug/upvotes`.

### 6.2 Endpoint'ler

| Method | Path | Auth | Açıklama |
|--------|------|------|----------|
| POST | `/projects` | required | Taslak oluştur. Body: `{ name }`. → 201 `{ slug, id }` |
| GET | `/projects` | optional | Yayında olanları listele. Query: `category, stage, tag, technology, search, sort, page, limit`. |
| GET | `/projects/:slug` | optional | Detay. Owner ise her durumda; başkası ise `status=published && isPublic`. → 404 yoksa veya yetkisiz. |
| PATCH | `/projects/:slug` | owner | Kısmi update. Body: tüm alanlar opsiyonel. Yayınsa `slug` değişimini reddet. |
| POST | `/projects/:slug/publish` | owner | Validasyon + status=published + launchedAt set. Eksik alan varsa 422. |
| POST | `/projects/:slug/unpublish` | owner | status=draft. launchedAt korunur. |
| POST | `/projects/:slug/archive` | owner | status=archived. |
| DELETE | `/projects/:slug` | owner (sadece draft) veya admin | Cascade. |
| GET | `/me/projects` | required | Kendi tüm projeleri (her status). |
| POST | `/projects/:slug/images` | owner | multipart/form-data → R2 upload. Body: file + caption (opsiyonel). |
| DELETE | `/projects/:slug/images/:imageId` | owner | |
| PATCH | `/projects/:slug/images/reorder` | owner | Body: `[{ id, sortOrder }]`. |
| POST | `/projects/:slug/upvote` | required | Idempotent toggle. → `{ upvoted, upvotesCount }`. |
| POST | `/projects/:slug/like` | required | Idempotent toggle. |
| POST | `/projects/:slug/follow` | required | Idempotent toggle. |
| GET | `/projects/:slug/comments` | optional | Nested thread, sıralama. |
| POST | `/projects/:slug/comments` | required | Body: `{ content, parentId? }`. |
| PATCH | `/comments/:id` | author | İçerik düzenleme. |
| DELETE | `/comments/:id` | author veya admin | Yumuşak silme önerilir (silinmiş yorumun yerine "Silindi" placeholder). |
| POST | `/comments/:id/like` | required | Idempotent toggle. |
| POST | `/projects/:slug/members` | owner | Body: `{ userId, role }`. |
| DELETE | `/projects/:slug/members/:userId` | owner | Owner kendisini çıkaramaz. |

### 6.3 Validasyon (paylaşılan, Zod)

`packages/shared/src/validators/project.ts`:

```ts
createProjectSchema = z.object({
  name: z.string().min(2).max(80)
})

updateProjectSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  tagline: z.string().max(80).nullable().optional(),
  description: z.string().max(10000).nullable().optional(),
  launchStory: z.string().max(20000).nullable().optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(2).max(60).optional(),
  websiteUrl: z.string().url().nullable().optional(),
  repoUrl: z.string().url().nullable().optional(),
  demoUrl: z.string().url().nullable().optional(),
  categoryId: z.string().optional(),
  typeId: z.string().optional(),
  stageId: z.string().optional(),
  technologyIds: z.array(z.string()).max(20).optional(),
  tags: z.array(z.string().max(30)).max(5).optional(),
  pricingModel: z.enum(['free','freemium','paid','open_source']).nullable().optional(),
  isOpenSource: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  isSeekingInvestment: z.boolean().optional(),
  isSeekingTeammates: z.boolean().optional(),
}).refine(o => Object.keys(o).length > 0, "En az bir alan gönderilmeli")

publishProjectSchema = updateProjectSchema.required({
  name: true, tagline: true, description: true,
  categoryId: true, typeId: true, stageId: true,
}).refine(...) // en az bir link, en az bir görsel
```

### 6.4 Yetkilendirme katmanı

- `requireAuth` (mevcut)
- `requireProjectOwner(slug)` middleware — proje yoksa 404, owner değilse 403.
- Admin her zaman geçer (mevcut role kontrolü).
- Public read: yayın + isPublic değilse 404 (varlığı bile gizle).

### 6.5 Servis katmanı (SOLID)

- `ProjectService` — CRUD, slug üretimi.
- `ProjectStateService` — publish/unpublish/archive geçişleri (state pattern). Tek sorumluluk: durum geçiş kuralları.
- `ProjectMediaService` — R2 upload/delete.
- `CommentService` — yorum CRUD + nested threading.
- `EngagementService` — upvote/like/follow toggle (3'ünün de aynı pattern'i).

---

## 7. Frontend Mimarisi

### 7.1 Route haritası

| Path | Açıklama |
|------|----------|
| `/p/:username/:slug` | Public detay sayfası (image 6+7 birleşimi) |
| `/projects/:slug/edit` | Sahip düzenleme (autosave) |
| `/projects/:slug/preview` | Yayın öncesi önizleme (sahip) |
| `/dashboard/projects` | Sahibin proje listesi (taslak/yayında/arşiv tab'ları) |
| `/explore/projects` | Public keşif (mevcut, geliştirilecek) |

`projects.new.tsx` rotası kalkıyor — yerine modal + POST → redirect /edit akışı.

### 7.2 Bileşen ağacı

```
ProjectDetailPage
├── ProjectHero (logo, name, tagline, follow count, visit website CTA)
├── ProjectTabs
│   ├── OverviewTab
│   │   ├── MediaGallery
│   │   ├── DescriptionRenderer (markdown)
│   │   ├── TagChips, TechChips, PricingBadge
│   │   └── MakerSaysCard
│   ├── DiscussionTab
│   │   ├── CommentForm
│   │   └── CommentThread (recursive)
│   ├── TeamTab
│   │   └── MemberCard (xN)
│   └── MoreTab
└── ProjectSidebar
    ├── LaunchDateBadge
    ├── UpvoteButton
    ├── ActionRow (follow, bookmark, share)
    ├── LinksList
    ├── StageBadge, PricingBadge
    ├── TechStackList
    └── LookingForBadges

ProjectEditPage
├── EditNav (sol, bölüm linkleri, tamamlanma %)
├── EditHeader (autosave indicator, Önizle, Yayınla CTA)
└── ActiveSection (Temel | Açıklama | Medya | ...)
```

### 7.3 Durum yönetimi

- Detay sayfası: server-rendered loader; mutation'lar (upvote/comment) `useFetcher` ile, optimistic update.
- Edit sayfası: form state local (React state), server'a 800ms debounce'lu PATCH. `useFetcher` queue ile sıralı kayıt (race condition önleme).
- Tüm filter/search state URL'de (admin sayfasında uyguladığımız desen).

### 7.4 i18n

Yeni namespace'ler: `project.detail.*`, `project.edit.*`, `project.publish.*`, `project.comment.*`. TR varsayılan, Türkçe karakterler doğru (AGENTS.md kuralı).

---

## 8. Uygulanacak SOLID + Pattern'ler

| İlke / Desen | Nerede |
|--------------|--------|
| **SRP** | Servisler ayrı: `ProjectService` (CRUD), `ProjectStateService` (geçiş), `ProjectMediaService` (R2), `EngagementService` (toggle'lar). |
| **OCP** | Yeni durum eklemek = `ProjectStateService`'e geçiş ekle; route handler'lar değişmez. |
| **DIP** | Servisler `db`, `r2` instance'ı parametre alır; route'lar context'ten geçirir. |
| **State Pattern** | `ProjectStateService` durum geçişleri için. Her durum kendi izinli geçişlerini bilir. |
| **Strategy** | `EngagementService.toggle(kind: 'upvote'|'like'|'follow')` — tek implementasyon, davranış parametre. |
| **Repository / Service Layer** | DB sorguları route'ta değil servislerde. |
| **Decorator (Middleware Chain)** | `requireAuth → requireProjectOwner` zinciri. |
| **Guard Clauses** | Validasyon ve yetki kontrolleri erken çıkışla. |
| **Single Source of Truth** | Zod şemaları + tipler `packages/shared`'da. |
| **URL as State** | Filter/search/page URL'de (admin desenine uyumlu). |
| **Container/Presentational** | Sayfa loader, çocuk komponentler pure render. |
| **Optimistic UI** | Upvote, like, follow için. |
| **Idempotent Toggle** | Aynı butona iki kez basmak güvenli. |

---

## 9. Faz Planı (önerilen sıra)

Bu spec **bir oturumda implement edilemez**. Önerilen fazlar:

### Faz A — Backend temeli (öncelik 1)
- `status` + `launchStory` + `pricingModel` kolonları + migration
- `project_tags`, `project_followers` tabloları + migration
- `ProjectService` (CRUD), `ProjectStateService` (publish/unpublish/archive)
- Endpoint'ler: POST /projects, GET /projects, GET /projects/:slug, PATCH, publish, unpublish, archive, DELETE, GET /me/projects
- Shared validators (`packages/shared/src/validators/project.ts`)
- Test: en az happy path + state transition + auth.

### Faz B — Medya (öncelik 2)
- `ProjectMediaService` + R2 upload endpoint'leri (POST/DELETE/reorder)
- Frontend: drag-drop yükleme komponenti
- Bağımlılık: R2 bucket'ı `apps/api` zaten configure (wrangler.toml)

### Faz C — Engagement (öncelik 3)
- `EngagementService` (upvote/like/follow toggle)
- Comments service + endpoint'ler (nested)
- Members service + endpoint'ler

### Faz D — Detay sayfası UI (öncelik 4, A'dan sonra)
- `ProjectDetailPage` ve alt komponentleri
- Tab navigasyonu, sidebar, maker says
- i18n

### Faz E — Edit sayfası UI (öncelik 5, A+B'den sonra)
- Sol nav + bölümler
- Autosave (800ms debounce, fetcher queue)
- Yayınla butonu + Zod validasyon highlight
- "Yeni Proje" modal (dashboard CTA)

### Faz F — Listeleme UI (öncelik 6)
- `/dashboard/projects` (sahip, tab'lı: Tümü/Taslak/Yayında/Arşiv)
- `/explore/projects` (mevcut'u zenginleştir: filtre, sıralama, infinite scroll veya pagination)

### Faz G — Polish
- Önizleme modu
- Bookmark/collection
- Bildirimler (project follower'lara yeni yorum/etkinlik bildirimi — zaten Cloudflare Queues planlanmış)

---

## 10. Açık Sorular (sen karar vereceksin)

1. **Slug URL'si**: `/p/:username/:slug` mı (PH gibi user-scoped) yoksa `/projects/:slug` global unique mi? Tasarımda user-scoped öneriyorum.
2. **Markdown editör**: lite (textarea + preview tab) mı, gelişmiş (toolbar'lı) mı? Önerim: önce lite, sonra gerekirse geliştir.
3. **Yorum nesting derinliği**: 1 seviye (parent → reply) yeterli mi yoksa sınırsız nested mi? Önerim: 1 seviye (PH de öyle).
4. **Comment soft-delete**: silinen yorumun yerine "Silindi" placeholder mı, yoksa tamamen kaldırma mı? Önerim: soft-delete (thread bütünlüğü için).
5. **Project members davet akışı**: doğrudan ekleme (owner ekler, kullanıcıya bildirim) mi, yoksa davet → kabul akışı mı? Önerim: MVP'de doğrudan ekleme + opt-out.
6. **Üst-faz öncelik**: Yukarıdaki sıralama uygun mu? Eğer "önce UI görmek istiyorum" diyorsan, mock data ile UI önce yapılabilir, backend sonra bağlanır.

---

## 11. Bu Spec'e Dahil Olmayan (kapsam dışı)

- Notification altyapısı (queue + push) — ayrı spec.
- Search engine (Algolia/Typesense) — şimdilik basit `LIKE` araması yeterli.
- Proje analitiği grafikleri — sahibin dashboard'unda zaten placeholder var.
- A/B testing, feature flags.
- Çoklu dil desteği proje açıklamasında (i18n için tek dil yeterli).

---

**Sonraki adım:** Bu spec'i incele, açık sorulara cevap ver, başlamak istediğin fazı söyle. Faz A'dan başlamak en doğal akış (backend olmadan UI çalışmaz).
