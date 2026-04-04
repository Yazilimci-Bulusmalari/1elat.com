# 1elat.com — Gelistirici Sosyal Platformu

## Implementasyon Plani

Bu projenin detayli implementasyon plani `docs/IMPLEMENTATION_PLAN.md` dosyasindadir.
Gelistirmeye baslamadan once bu dosyayi oku ve faz/adim sirasina uy.

## Gelistirme Kurallari

### Kod Kalitesi
- **Clean Code**: Okunabilir, anlasilir, bakimi kolay kod yaz
- **SOLID Prensipleri**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **TDD**: Once test yaz, sonra implementasyonu yap. Testler gecmeden kodu tamamlanmis sayma
- **DRY**: Tekrar eden kodu soyutla
- **KISS**: Basit cozumleri tercih et
- **YAGNI**: Sadece istenen ozellikleri implement et

### UI/UX
- **Ikon**: Sadece `lucide-react` kullan. Baska ikon kutuphanesi ekleme
- **Emoji yasagi**: Kodda, UI'da, dosyalarda emoji KULLANMA. Ikonlar icin Lucide kullan
- **UI framework**: shadcn/ui + Tailwind CSS v4
- **Dark mode**: Varsayilan dark mode
- **Responsive**: Mobile-first tasarim
- **Loading states**: Her sayfada skeleton/loading
- **Error states**: Kullanici dostu hata mesajlari

### Teknik
- ID: `nanoid` (21 karakter)
- Validasyon: `Zod` (client + server)
- TypeScript strict mode, `any` kullanma
- Tum fonksiyonlara donus tipi yaz
- Test framework: Vitest

### Dosya Organizasyonu
- Test dosyalari kaynak dosyanin yaninda: `*.test.ts`
- Service katmani: `apps/api/src/services/`
- Route dosyalari: `apps/api/src/routes/`
- Middleware: `apps/api/src/middleware/`
- Shared tipler: `packages/shared/src/types/`
- Shared validatorler: `packages/shared/src/validators/`
- DB schema: `packages/db/src/schema/`

## Tech Stack
- Monorepo: pnpm + Turborepo
- Frontend: React Router v7 (Remix) on Cloudflare Workers
- Backend: Hono.js on Cloudflare Workers
- DB: Drizzle ORM + Cloudflare D1
- Auth: GitHub + Google OAuth (manuel)
- Session: Cloudflare KV
- Files: Cloudflare R2
- Notifications: Cloudflare Queues
- UI: Tailwind CSS v4 + shadcn/ui + lucide-react
