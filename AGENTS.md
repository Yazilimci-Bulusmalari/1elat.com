# AGENTS.md — 1elat.com

Bu dosya, projeye katkı veren tüm AI ajanları (Claude Code, Codex, vb.) için bağlayıcı kurallar içerir. `CLAUDE.md` dosyasındaki kurallara EK olarak aşağıdakilere de uyulmalıdır.

## i18n / Lokalizasyon (zorunlu)

**Hiçbir kullanıcıya görünür metin hardcoded olmamalıdır.** Tüm UI metinleri `apps/web/app/lib/i18n.ts` içindeki `Dictionary` interface üzerinden gelmek zorundadır.

### Kurallar

1. **Yeni bir component / sayfa eklerken**: Tüm metinler için önce `Dictionary` interface'ine yeni anahtarlar ekle, ardından TR ve EN sözlüklerine değerlerini gir, son olarak component içinde `useT()` hook'u ile kullan.
2. **Mevcut bir bileşeni değiştirirken**: Yeni metinler için de aynı kural geçerli. Hardcoded string ekleme.
3. **Placeholder, `aria-label`, `title`, `alt` (anlamlı olanlar) dahil** her kullanıcıya gösterilen metin sözlüğe taşınmalıdır.
4. **İstisna:** Marka isimleri (`1elat`, `GitHub`, `X`, `LinkedIn`), URL örnekleri, sahte mockup verileri (telefon mockup'ındaki `9:41` gibi) ve ikon `aria-hidden` SVG'leri istisnadır.
5. **Anahtar isimlendirme:** `<bölüm>.<altbölüm>.<eleman>` (camelCase). Örn: `settings.account.firstNamePlaceholder`.
6. **TR varsayılan dildir.** EN çevirisi olmadan yeni TR anahtarı tanımlanabilir, ama EN çevirisi de en kısa zamanda eklenmelidir (TypeScript zaten Dictionary interface'iyle bunu zorlar).

### Yapılmaması gerekenler

```tsx
// YANLIS — hardcoded
<Button>Kaydet</Button>
<input placeholder="E-posta adresiniz" />
<h1>Ayarlar</h1>

// DOGRU
const t = useT();
<Button>{t.settings.account.save}</Button>
<input placeholder={t.footer.newsletter.placeholder} />
<h1>{t.settings.title}</h1>
```

## Türkçe Karakter Kuralları (zorunlu)

Türkçe çevirilerde **mutlaka doğru Türkçe karakterler kullanılmalıdır**: `ç Ç`, `ğ Ğ`, `ı I`, `i İ`, `ö Ö`, `ş Ş`, `ü Ü`.

ASCII'ye düşürülmüş ("Bagli", "Degistir", "Hesabi", "kisa", "icin", "guvenligini" gibi) çeviriler **kabul edilmez**. Bu, geçmişte tekrarlanan bir hata olduğu için kritik.

### Sık karşılaşılan yanlışlar ve doğruları

| Yanlış | Doğru |
|--------|-------|
| `Bagli` | `Bağlı` |
| `Baglanti` | `Bağlantı` |
| `Bagla` | `Bağla` |
| `Degistir` | `Değiştir` |
| `Degisiklik` | `Değişiklik` |
| `Guncelle` | `Güncelle` |
| `Guncellemeler` | `Güncellemeler` |
| `Guvenlik` | `Güvenlik` |
| `Guvenligini` | `Güvenliğini` |
| `Hakkinda` | `Hakkında` |
| `Hesabi` | `Hesabı` |
| `Hesabimi` | `Hesabımı` |
| `Hesabinizin` | `Hesabınızın` |
| `Icin` | `İçin` |
| `Istanbul` | `İstanbul` |
| `Istediginizi` | `İstediğinizi` |
| `Kalici` | `Kalıcı` |
| `Kaldir` | `Kaldır` |
| `Kisa` | `Kısa` |
| `Kullanici` | `Kullanıcı` |
| `Onemli` | `Önemli` |
| `Ozellikler` | `Özellikler` |
| `Parolayi` | `Parolayı` |
| `Sec` | `Seç` |
| `Sekilde` | `Şekilde` |
| `Sifre` | `Şifre` |
| `Tanitin` | `Tanıtın` |
| `Turkiye` | `Türkiye` |
| `Yukle` | `Yükle` |
| `disi` | `dışı` |
| `eposta` (yalın) | `e-posta` |
| `erisim` | `erişim` |
| `fotograf` | `fotoğraf` |
| `islem` | `işlem` |
| `once` | `önce` |
| `sosyal baglanti` | `sosyal bağlantı` |

### Yapısal kontrol

Yeni TR çevirisi eklerken veya değiştirirken: bitirmeden önce dosyayı tara, ASCII karşılığa düşmüş Türkçe kelime kalıp kalmadığını kontrol et. Şüphe halinde TDK / Google Translate ile teyit et — varsayım yapma.

## Doğrulama

Bir görevi tamamlamış sayılmadan önce:

1. `cd apps/web && pnpm typecheck` — sıfır hata.
2. Eklenen tüm UI metni sözlükte mi? (grep ile kontrol et: tırnak içinde Türkçe / İngilizce metin aranır.)
3. TR sözlüğünde ASCII'ye düşmüş Türkçe kelime var mı? (yukarıdaki tablodaki yanlış formlardan herhangi biri kaldıysa düzelt.)

## Diğer Kurallar

`CLAUDE.md` içindeki kurallar geçerlidir: emoji yok, sadece `lucide-react` ikonları (mevcut paket eski olduğundan brand ikonlar için inline SVG kullanılabilir, yeni kütüphane eklenmez), TypeScript strict, dönüş tipi zorunlu, vs.
