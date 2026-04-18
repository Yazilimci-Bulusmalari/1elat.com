# ADR 0001: Admin Rolu Altyapisi

- Tarih: 2026-04-18
- Durum: Kabul edildi
- Karar verenler: Platform ekibi
- Kapsam: `apps/api`, `apps/web`, `packages/db`, `packages/shared`

## 1. Baglam ve Karar

1elat.com bugune kadar duz bir yetki modeliyle calisti: tum kullanicilar esit. Operasyonel ihtiyaclar (platform saglik metrikleri, kullanici ve proje sayilari) icin sadece secili birkac kisinin gorebilecegi bir istatistik ekrani gerekli. RBAC, permission tablolari, group/role iliski tablolari, scope-based policy engine gibi cozumler bu asamada ihtiyacin cok otesinde (YAGNI). Bunun yerine **ikili rol modeli** secildi: `"user" | "admin"`. Kullanici tablosuna tek bir enum kolonu eklenir; admin yetkisi tek noktadan kontrol edilen bir middleware ile dogrulanir. Cozum, ileride `"moderator"` gibi roller eklenirse enum'a deger ekleyerek genisletilebilir; gercek RBAC ihtiyaci dogarsa ayri bir ADR ile tablolu modele gecilir.

## 2. Veri Modeli

`packages/db/src/schema/users.ts` icindeki `users` tablosuna tek kolon eklenir:

```ts
role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
```

Migration: `packages/db/migrations/` altinda yeni dosya. Mevcut tum kayitlar default ile `"user"` olur; backfill gerekmez.

**Neden ayri tablo degil?**
- **Basitlik**: Ikili rol icin join gereksiz; her `users` SELECT'inde rol zaten elde.
- **Performans**: D1 uzerinde ek tablo + join, single-column read'den pahali.
- **Default deger guvenli**: Yeni kullanicilar otomatik `"user"`; kod hatasi admin'e yukseltemez.
- **Indexlenebilir**: Admin sayisi sorgusu gibi durumlarda kolon dogrudan filtrelenebilir; ileride `index("idx_users_role")` eklenebilir.

**Trade-off**: Permission granulariteyi enum disaridan veremiyoruz. Kabul edildi: ihtiyac yok.

## 3. Ilk Admin Stratejisi

Soru: Sistemin ilk admin'i nasil olusur ve calisma anindaki guncellemeler nasil senkron tutulur?

**Secilen yaklasim — `ADMIN_EMAILS` env**:
- `apps/api/wrangler.toml` `[vars]` altinda (veya secret olarak) virgulle ayrilmis e-posta listesi: `ADMIN_EMAILS = "ada@example.com,sue@example.com"`.
- Login callback ve `/auth/me` endpoint'inde: kullanicinin email'i listede ve `user.role !== "admin"` ise atomik UPDATE ile yukseltilir. Tersi yapilmaz (env'den kaldirmak demote etmez; demote ayri bir SQL/admin operasyonu).
- **Idempotent**: Her cagri guvenli, side-effect yok; rol zaten `"admin"` ise UPDATE atilmaz.

**Alternatifler ve trade-off**:
| Yaklasim | Arti | Eksi |
|---|---|---|
| Manuel SQL (`wrangler d1 execute`) | Sifir kod, sifir env | Insan hatasi, env'ler arasi tutarsizlik, audit zor |
| Seed migration | Versiyon kontrollu | Hardcoded e-posta repo'da kalir, prod/dev karisir |
| `ADMIN_EMAILS` env (secilen) | Env basina farkli, kod degisikligi gerektirmez, idempotent | Env'de PII (email) tutar; rotation'da deploy gerekir |
| Ayri admin invite akisi | Iyi UX | Bootstrap problemini cozmez (ilk admin?) |

Env yaklasimi hem bootstrap'i hem ongoing senkronizasyonu cozer. PII riski dusuk: zaten internal env'de.

## 4. Yetkilendirme Akisi

Hono middleware zinciri, **Chain of Responsibility** pattern'inin saf bir uygulamasi:

```
Request → requireAuth → requireAdmin → handler
                ↓             ↓
            401 yoksa     403 yetersiz
```

- `requireAuth`: Session cookie'yi cozer, `users` tablosundan kullaniciyi (rol dahil) cekip `c.set("user", user)`. Yoksa 401.
- `requireAdmin`: `c.get("user").role !== "admin"` ise 403 ForbiddenError. Bagimsiz, tek isi var.
- Handler: Sadece is mantigi. Yetki kontrolunu bilmez.

Her halka tek karar verir, sonrakine devreder. Yeni admin endpoint = sadece `.use(requireAuth, requireAdmin)` zincirini takmak.

## 5. Uygulanan SOLID Prensipleri

**SRP — Single Responsibility**
- `RoleService` (varsa): rol promotion/demotion mantigi. Auth degil, stats degil.
- `StatsService.getAdminStats()`: sadece istatistik hesaplama; auth bilmez, response sekillendirmez.
- `requireAdmin` middleware: tek isi rol kontrolu; logging, rate limiting, audit baska middleware'in isi.

**OCP — Open/Closed**
- Yeni admin-only endpoint eklemek icin auth katmani degistirilmez. Sadece yeni route + `requireAdmin` zinciri eklenir. Mevcut `requireAuth` koduna dokunulmaz.

**LSP — Liskov Substitution**
- `AuthUser.role: UserRole` zorunlu (opsiyonel degil). Her `AuthUser` ornegi her yerde ayni sozlesmeyle davranir; `role` undefined olabilir varsayimi yapilmaz, runtime'da surpriz olmaz.

**ISP — Interface Segregation**
- Frontend `AuthUser` minimal: id, email, name, avatar, role. Stats verisi `AdminStats` ayri tip, ayri endpoint. Normal kullanici `AdminStats`'i ne import eder ne de payload'unda goruur.

**DIP — Dependency Inversion**
- Middleware yuksek seviye soyutlama uzerinden calisir: `c.get("user")`. Drizzle query, D1 binding gibi detaylara dogrudan bagli degil. `requireAuth` user'i nasil cozecegini biliyor; `requireAdmin` sadece "user nesnesinde role var" sozlesmesine guvenir.

## 6. Uygulanan Design Pattern'ler

**Decorator / Middleware Chain**
- `app.use("/admin/*", requireAuth, requireAdmin)`: Her endpoint'i sarmalayan dekorator zinciri. Davranis ekler, handler'i degistirmez.

**Guard Clause**
- Middleware iceri girer girmez erken cikis: `if (!user) throw Unauthorized; if (user.role !== "admin") throw Forbidden`. Nested if yok, mutlu yol duz.

**Repository / Service Layer**
- `StatsService.getAdminStats(db): Promise<AdminStats>`: Route handler `db.select(...)` cagirmaz, sadece servisi cagirir. SQL detayi servisin icinde gizli; test edilebilir.

**Single Source of Truth**
- `packages/shared/src/types/user.ts` icinde `export type UserRole = "user" | "admin"`.
- `packages/shared/src/types/admin.ts` icinde `export interface AdminStats { ... }`.
- Hem `apps/api` hem `apps/web` buradan import eder. API ve web tip senkronizasyonu otomatik.

**Idempotent Operation**
- `ADMIN_EMAILS` promotion: her login'de calisir, sonuc ayni — rol zaten `"admin"` ise UPDATE atlanir veya `WHERE role != 'admin'` filtresiyle no-op olur. Retry/replay guvenli.

## 7. Kontratlar (Ozet)

**API**
- `GET /admin/stats` → `requireAuth` + `requireAdmin` → `AdminStats`
- `AdminStats = { totalUsers: number; totalProjects: number; totalAdmins: number; signupsLast7Days: number; signupsLast30Days: number; projectsLast7Days: number }`

**Frontend**
- `AuthUser.role: UserRole` `/auth/me` uzerinden propagate.
- Sidebar'da admin linki: `user.role === "admin"` kosulu ile.
- `/dashboard/admin` route loader: admin degilse `/dashboard`'a redirect.

**Shared**
- `packages/shared/src/types/user.ts`: `UserRole`.
- `packages/shared/src/types/admin.ts`: `AdminStats`.

## 8. Trade-off'lar ve Bilinen Sinirlar

- **Enum genisletilebilirligi**: `"moderator"`, `"support"` eklenirse her `role === "admin"` kontrolu yetersiz kalir; helper (`hasAdminPrivilege(role)`) ile sarmalanmali. Suanki tek check noktasi (middleware) bunu kolaylastirir.
- **Env'de e-posta**: Liste buyurse env okunabilirligi duser; 20+ admin icin DB-driven invite akisi gerekir.
- **Demote yok**: `ADMIN_EMAILS`'ten cikarmak demote etmez. Operasyonel olarak bilincli secim — yanlislikla rol kaybi onlenir. Demote icin manuel SQL veya ileride admin UI.
- **Cache**: `/auth/me` her cagrida DB'ye gider; rol degisimi anlik yansir ama ek query maliyeti var. Yuksek trafik durumunda KV session payload'una rol gomulebilir (invalidasyon karmasikligi pahasina).
- **Audit**: Rol degisikligi loglanmiyor. Compliance ihtiyaci dogarsa ayri `audit_log` tablosu eklenmeli.
- **Bootstrap zinciri**: `ADMIN_EMAILS` bos ve hic admin yoksa `/admin/stats` kimseye acilmaz; ilk deploy oncesi env doldurulmali.
