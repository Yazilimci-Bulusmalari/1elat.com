# 1elat.com — Gelistirici Sosyal Platformu
# Product Requirements Document (PRD)

**Versiyon:** 1.0  
**Tarih:** 4 Nisan 2026  
**Yazar:** Abdullah Cicekli  
**Durum:** Taslak

---

## 1. Vizyon ve Amac

1elat.com, yazilim gelistiricilerinin projelerini sergileyebildigi, birbirlerini kesfettigi, ortak calisma arkadasi bulabildigi ve projelere destek verebildigi sosyal bir platformdur.

### Problem
- Gelistiriciler projelerini gostermek icin dagnik platformlar kullaniyor (GitHub, LinkedIn, Twitter)
- Ortak calisma arkadasi bulmak zor ve organik degil
- Proje bazli sosyal etkilesim eksik
- Turkiye odakli bir gelistirici toplulugu yok

### Cozum
Tek bir platformda proje vitrinleme, gelistirici kesfetme, takim olusturma ve topluluk etkilesimi sunan sosyal agdir.

---

## 2. Hedef Kitle

| Segment | Tanim | Ihtiyac |
|---------|-------|---------|
| Bagimsiz Gelistirici | Kendi projelerini yapan bireysel gelistiriciler | Proje gosterimi, geri bildirim alma |
| Startup Kuruculari | Teknik ekip arayan girisimciler | Takim olusturma, yatirimci iliskisi |
| Junior Gelistiriciler | Kariyer baslangicindaki gelistiriciler | Mentorluk, referans, portfolyo |
| Freelancer | Serbest calisan gelistiriciler | Ag olusturma, proje bulma |
| Yatirimcilar | Teknik projelere yatirim yapmak isteyenler | Proje kesfetme, kurucu degerlendirme |

---

## 3. Kullanici Hikayeleri (User Stories)

### 3.1 Kimlik Dogrulama ve Profil

| ID | Hikaye | Oncelik |
|----|--------|---------|
| US-001 | Kullanici olarak GitHub hesabimla hizli kayit olmak istiyorum ki gelistirici kimligim otomatik dogrulansin. | MVP |
| US-002 | Kullanici olarak Google hesabimla giris yapmak istiyorum ki hizli erisim saglayayim. | MVP |
| US-003 | Kullanici olarak profilime isim, soyisim, meslek bilgisi ve iletisim bilgilerimi eklemek istiyorum ki diger gelistiriciler beni tanisin. | MVP |
| US-004 | Kullanici olarak birden fazla meslek/rol secebilmek istiyorum (ornegin hem backend hem devops). | MVP |
| US-005 | Kullanici olarak profilimde projelerimi ve birlikte calistigim kisileri gorebilmek istiyorum. | MVP |

### 3.2 Sosyal Ozellikler

| ID | Hikaye | Oncelik |
|----|--------|---------|
| US-010 | Kullanici olarak baska gelistiricileri takip etmek istiyorum ki aktivitelerini gorebilmem. | MVP |
| US-011 | Kullanici olarak baglanti istegi gondermek istiyorum (LinkedIn tarzi) ki profesyonel agimi genisleteyim. | v1.1 |
| US-012 | Kullanici olarak baska bir gelistiriciye referans vermek istiyorum ki yeteneklerini onaylayayim. | v1.1 |
| US-013 | Kullanici olarak referans istemek istiyorum ki profilimi guclendireyim. | v1.1 |
| US-014 | Kullanici olarak son aktivitelerimi kategorilere gore filtrelemek istiyorum. | v1.1 |

### 3.3 Proje Yonetimi

| ID | Hikaye | Oncelik |
|----|--------|---------|
| US-020 | Kullanici olarak yeni proje eklemek istiyorum (baslik, aciklama, logo, platform bilgisi ile). | MVP |
| US-021 | Kullanici olarak projeme takim uyeleri eklemek istiyorum ki birlikte calistigimiz gorunsun. | MVP |
| US-022 | Kullanici olarak projeme teknoloji stack listesi eklemek istiyorum. | MVP |
| US-023 | Kullanici olarak projemi begenmek (like) ve upvote yapmak istiyorum ki populer projeleri one cikarayim. | MVP |
| US-024 | Kullanici olarak projelere yorum yapmak istiyorum ki geri bildirim vereyim. | MVP |
| US-025 | Kullanici olarak projeme ornek gorseller yuklemek istiyorum ki projemin gorsellerini gostereyim. | MVP |
| US-026 | Kullanici olarak projeme changelog eklemek istiyorum ki gelisim surecini takip edeyim. | v1.1 |
| US-027 | Kullanici olarak projemin yatirima acik oldugunu belirtmek istiyorum. | v1.1 |
| US-028 | Kullanici olarak projem icin calisma arkadasi aradigimi ve hangi rolleri aradigimi belirtmek istiyorum. | MVP |
| US-029 | Kullanici olarak proje asamasini belirtmek istiyorum (fikir, development, beta, launched, exit). | MVP |

### 3.4 Kesfetme ve Filtreleme

| ID | Hikaye | Oncelik |
|----|--------|---------|
| US-030 | Kullanici olarak projeleri kategoriye, teknolojiye, asamaya gore filtrelemek istiyorum. | MVP |
| US-031 | Kullanici olarak gelistiricileri meslege ve becerilere gore filtrelemek istiyorum. | MVP |
| US-032 | Kullanici olarak trende olan projeleri gorebilmek istiyorum. | MVP |
| US-033 | Kullanici olarak calisma arkadasi arayan projeleri filtreleyebilmek istiyorum. | v1.1 |
| US-034 | Kullanici olarak yatirima acik projeleri gorebilmek istiyorum. | v2.0 |

### 3.5 Rating Sistemi

| ID | Hikaye | Oncelik |
|----|--------|---------|
| US-040 | Kullanici olarak birlikte calistigim bir gelistiriciye 10 uzerinden puan vermek istiyorum. | v1.1 |
| US-041 | Kullanici olarak profilimde ortalama ratingimi gorebilmek istiyorum. | v1.1 |

---

## 4. Ozellik Onceliklendirmesi

### 4.1 MVP (Minimum Viable Product)

**Hedef:** Temel proje paylasimi ve gelistirici profili islevi

| Ozellik | Aciklama |
|---------|----------|
| GitHub + Google OAuth | Kayit ve giris |
| Kullanici profili | Isim, soyisim, meslek, iletisim bilgileri |
| Meslek listesi | Sabit liste (backend, frontend, mobile, devops, design, PM, marketing vs.) |
| Proje olusturma | Baslik, aciklama, logo, platform, kategori, tur |
| Proje gorselleri | Ornek gorsel yukleme |
| Takim yonetimi | Projeye gelistirici ekleme |
| Teknoloji stack | Projede kullanilan teknolojiler |
| Proje asamasi | Fikir, development, beta, launched, exit |
| Like ve upvote | Proje begenme ve oylama |
| Yorum sistemi | Projelere yorum yapma |
| Takip sistemi | Follow/unfollow |
| Calisma arkadasi arama | Proje icin rol bazli arama |
| Projeler sayfasi | Filtreli listeleme, pagination |
| Kisiler sayfasi | Meslek ve skill bazli filtreleme |
| Proje detay sayfasi | Tum proje bilgileri |
| Profil sayfasi | Projeler, birlikte calisilanlar |
| Landing page | Tanitim sayfasi |
| Dashboard | Kullanici paneli |

### 4.2 v1.1 (Ikinci Surum)

| Ozellik | Aciklama |
|---------|----------|
| Baglanti sistemi | LinkedIn tarzi istek gonder/kabul et |
| Referans sistemi | Referans isteme ve verme |
| Rating sistemi | 10 uzerinden puanlama |
| Changelog | Proje degisiklik gecmisi |
| Yatirima acik | Projenin yatirimci aradigi bilgisi |
| Son aktiviteler | Kategorilere gore filtrelenebilir aktivite akisi |
| Bildirim sistemi | Takip, yorum, baglanti bildirimleri |
| Calisma arkadasi filtresi | Arkadaslik arayan projeleri filtrele |

### 4.3 v2.0 (Ucuncu Surum)

| Ozellik | Aciklama |
|---------|----------|
| Mesajlasma | Gelistiriciler arasi direkt mesaj |
| Yatirimci paneli | Yatirimcilar icin ozel gorunum |
| Oneri motoru | Kisi ve proje onerileri |
| Rozetler ve basarimlar | Gamification ogeleri |
| API erisimi | Ucuncu parti entegrasyonlar |
| Etkinlikler | Online/offline etkinlik yonetimi |
| Blog/yazi | Teknik yazi paylasimi |

---

## 5. Sayfa Listesi ve Bilesenler

### 5.1 Landing Page (`/`)

| Bilesen | Aciklama |
|---------|----------|
| Hero Section | Baslik, aciklama, CTA butonlari (Kayit Ol, Projeleri Kes) |
| One Cikan Projeler | Haftanin/gunun en populer projeleri (upvote bazli) |
| Istatistikler | Toplam gelistirici, proje, baglanti sayilari |
| Nasil Calisir | 3 adimli kullanim akisi |
| Son Eklenen Projeler | Yeni projelerin slider gorunumu |
| Footer | Linkler, sosyal medya, iletisim |

### 5.2 Projeler Sayfasi (`/projects`)

| Bilesen | Aciklama |
|---------|----------|
| Filtre paneli | Kategori, tur, teknoloji, asama, yatirima acik, calisma arkadasi ariyor |
| Siralama | En yeni, en populer, en cok upvote, en cok yorum |
| Proje kartlari | Logo, baslik, kisa aciklama, tech stack ikonlari, upvote/like sayisi, asama rozeti |
| Pagination | Sayfa bazli veya sonsuz scroll |
| Arama cubugu | Proje adi ve aciklama icinde arama |

### 5.3 Kisiler Sayfasi (`/people`)

| Bilesen | Aciklama |
|---------|----------|
| Filtre paneli | Meslek, beceriler, konum, rating araligi |
| Siralama | En populer, en yeni, en yuksek rating |
| Kisi kartlari | Avatar, isim, meslekler, proje sayisi, rating, takip butonu |
| Pagination | Sayfa bazli |
| Arama cubugu | Isim ve beceri arama |

### 5.4 Proje Detay Sayfasi (`/projects/:slug`)

| Bilesen | Aciklama |
|---------|----------|
| Proje basligi | Logo, baslik, kategori, asama rozeti |
| Aciklama | Detayli proje aciklamasi (markdown destegi) |
| Gorsel galerisi | Ornek ekran goruntuleri |
| Takim listesi | Gelistirici kartlari, roller |
| Tech stack | Kullanilan teknoloji listesi |
| Linkler | Website, repo, urun linkleri |
| Proje bilgileri | Baslangic tarihi, sure, platform |
| Calisma arkadasi | Aranan roller ve basvuru butonu |
| Yatirima acik | Yatirim bilgisi (v1.1) |
| Upvote/like | Oylama butonlari ve sayaci |
| Yorumlar | Yorum listesi ve yorum formu |
| Changelog | Versiyon degisiklikleri (v1.1) |

### 5.5 Kullanici Profil Sayfasi (`/users/:username`)

| Bilesen | Aciklama |
|---------|----------|
| Profil basligi | Avatar, isim, meslekler, konum |
| Istatistikler | Proje sayisi, takipci, takip edilen, rating |
| Iletisim bilgileri | E-posta, sosyal medya linkleri |
| Bio | Kisa tanitim yazisi |
| Projeler | Kullanicinin projeleri (kart gorunumu) |
| Birlikte calisilanlar | Ortak calisilan gelistiriciler |
| Referanslar | Alinan referanslar (v1.1) |
| Son aktiviteler | Zaman cizelgesi |
| Takip/baglanti butonu | Follow veya baglanti istegi gonder |

### 5.6 Dashboard (`/dashboard`)

| Bilesen | Aciklama |
|---------|----------|
| Ozet kartlari | Proje sayisi, toplam upvote, takipci, profil goruntulenme |
| Projelerim | Kullanicinin projeleri (hizli erisim, duzenle) |
| Bildirimler | Son bildirimler listesi |
| Aktivite akisi | Takip edilenlerin aktiviteleri |
| Baglanti istekleri | Bekleyen istekler (v1.1) |
| Referans istekleri | Bekleyen referanslar (v1.1) |
| Hizli islemler | Yeni proje ekle, profili duzenle |

---

## 6. Kullanici Akislari (User Flows)

### 6.1 Kayit ve Profil Olusturma

```
Landing Page
  → "GitHub ile Kayit Ol" butonu
  → GitHub OAuth yetkilendirme
  → Profil tamamlama formu (isim, soyisim, meslek secimi, iletisim)
  → Dashboard'a yonlendirme
```

### 6.2 Proje Ekleme

```
Dashboard
  → "Yeni Proje Ekle" butonu
  → Proje formu (baslik, aciklama, kategori, tur, platform)
  → Logo ve gorsel yukleme
  → Tech stack secimi
  → Takim uyesi ekleme (kullanici arama)
  → Proje asamasi ve tarih secimi
  → Calisma arkadasi araniyorsa: roller tanimlama
  → "Yayinla" butonu
  → Proje detay sayfasina yonlendirme
```

### 6.3 Gelistirici Kesfetme

```
Navbar → "Kisiler" linki
  → Kisiler sayfasi
  → Filtre: meslek = "backend", beceri = "Node.js"
  → Kisi kartina tikla
  → Profil sayfasi
  → "Takip Et" veya "Baglanti Istegi Gonder"
  → Profilden projeye gecis
```

### 6.4 Proje Kesfetme ve Etkilesim

```
Navbar → "Projeler" linki
  → Projeler sayfasi
  → Filtre: kategori = "SaaS", asama = "beta"
  → Proje kartina tikla
  → Proje detay sayfasi
  → Upvote yap
  → Yorum yaz
  → "Calisma Arkadasi Ol" basvurusu yap
```

### 6.5 Calisma Arkadasi Bulma

```
Projeler sayfasi
  → Filtre: "Calisma arkadasi ariyor" = evet
  → Filtre: aranan rol = "frontend"
  → Proje detay sayfasi
  → Aranan roller bolumu
  → "Basvur" butonu
  → Basvuru mesaji yaz
  → Proje sahibine bildirim gider
  → Proje sahibi kabul/red eder
```

### 6.6 Referans Verme (v1.1)

```
Kullanici profili
  → "Referans Ver" butonu
  → Referans formu (calisilan proje, puan, yorum)
  → Referans profildegorunur
```

---

## 7. Veri Modeli (Ozet)

### User
```
id, email, name, surname, username, avatar_url,
bio, location, website, github_url, linkedin_url,
auth_provider, auth_provider_id,
created_at, updated_at
```

### UserProfession (Coka-cok iliski)
```
user_id, profession_id
```

### Profession (Sabit liste)
```
id, name, slug
# Degerler: backend, frontend, mobile, devops, fullstack,
# design, pm, marketing, data, qa, security, gamedev, other
```

### Project
```
id, title, slug, description, logo_url,
category_id, type (web/mobile/desktop/api/other),
platform, website_url, repo_url, product_urls,
is_open_source, is_seeking_investment, is_seeking_teammates,
stage (idea/development/beta/launched/exit),
start_date, duration,
created_by, created_at, updated_at
```

### ProjectMember
```
project_id, user_id, role, joined_at
```

### ProjectImage
```
id, project_id, image_url, order
```

### ProjectTechStack
```
project_id, technology_id
```

### Technology
```
id, name, slug, icon_url, category
```

### ProjectLike
```
user_id, project_id, created_at
```

### ProjectUpvote
```
user_id, project_id, created_at
```

### Comment
```
id, project_id, user_id, content, parent_id,
created_at, updated_at
```

### Follow
```
follower_id, following_id, created_at
```

### Connection (v1.1)
```
id, requester_id, receiver_id,
status (pending/accepted/rejected),
created_at, updated_at
```

### Reference (v1.1)
```
id, from_user_id, to_user_id, project_id,
rating, content, created_at
```

### Rating (v1.1)
```
id, from_user_id, to_user_id,
score (1-10), created_at
```

### Changelog (v1.1)
```
id, project_id, version, title, content, created_at
```

### SeekingRole
```
id, project_id, profession_id, description, is_active
```

### TeammateApplication
```
id, seeking_role_id, user_id, message,
status (pending/accepted/rejected), created_at
```

---

## 8. Teknik Gereksinimler

### Frontend
- **Framework:** Next.js (App Router)
- **UI:** Tailwind CSS + shadcn/ui
- **State:** Zustand veya React Query
- **Form:** React Hook Form + Zod
- **Gorsel:** Next/Image optimizasyonu

### Backend
- **Runtime:** Node.js
- **Framework:** Next.js API Routes veya ayri Express/Fastify
- **ORM:** Prisma veya Drizzle
- **Auth:** NextAuth.js (GitHub + Google providers)
- **Dosya yukleme:** AWS S3 veya Cloudflare R2

### Veritabani
- **Ana DB:** PostgreSQL
- **Cache:** Redis (opsiyonel, v1.1+)

### Altyapi
- **Hosting:** Vercel veya AWS
- **CDN:** Cloudflare
- **CI/CD:** GitHub Actions

### Performans Gereksinimleri
- Sayfa yukleme suresi: < 2 saniye
- API yanit suresi: < 200ms (ortalama)
- Gorsel optimizasyonu: WebP, lazy loading
- SEO: SSR/SSG ile tam SEO destegi

---

## 9. Basari Metrikleri (KPIs)

### Kullanici Metrikleri

| Metrik | Hedef (3 ay) | Hedef (6 ay) | Hedef (12 ay) |
|--------|-------------|-------------|---------------|
| Kayitli kullanici | 500 | 2.000 | 10.000 |
| Aylik aktif kullanici (MAU) | 200 | 800 | 4.000 |
| Gunluk aktif kullanici (DAU) | 50 | 200 | 1.000 |
| Profil tamamlama orani | %60 | %70 | %80 |

### Proje Metrikleri

| Metrik | Hedef (3 ay) | Hedef (6 ay) | Hedef (12 ay) |
|--------|-------------|-------------|---------------|
| Toplam proje | 200 | 1.000 | 5.000 |
| Ortalama proje basina yorum | 3 | 5 | 8 |
| Ortalama proje basina upvote | 5 | 10 | 20 |
| Calisma arkadasi esleme orani | %10 | %20 | %30 |

### Etkilesim Metrikleri

| Metrik | Hedef (3 ay) | Hedef (6 ay) | Hedef (12 ay) |
|--------|-------------|-------------|---------------|
| Ortalama oturum suresi | 3 dk | 5 dk | 8 dk |
| Takip orani (kullanici basina) | 5 | 15 | 30 |
| Haftalik geri donus orani | %20 | %35 | %50 |
| Yorum/kullanici orani | 0.5 | 1.5 | 3.0 |

### Teknik Metrikler

| Metrik | Hedef |
|--------|-------|
| Uptime | %99.9 |
| Ortalama API yanit suresi | < 200ms |
| Hata orani | < %0.1 |
| Lighthouse skoru | > 90 |

---

## 10. Kisitlar ve Riskler

### Kisitlar
- Tek gelistirici (Abdullah) ile baslangiç
- Sinirli butce (baslangicta ucretsiz/dusuk maliyetli araclar)
- Turkiye odakli baslangic, ileride global genisleme

### Riskler

| Risk | Olasilik | Etki | Azaltma Stratejisi |
|------|----------|------|---------------------|
| Dusuk kullanici edinimi | Yuksek | Yuksek | Erken topluluk olusturma, icerik pazarlamasi |
| Spam ve kotu niyetli icerik | Orta | Orta | Raporlama sistemi, moderasyon araclari |
| Olceklenme sorunlari | Dusuk | Yuksek | Olceklenebilir mimari, cache stratejisi |
| Rakip platformlar | Orta | Orta | Benzersiz ozellikler, niş odaklanma |
| Veri guvenligi ihlali | Dusuk | Yuksek | Guvenlik en iyi uygulamalari, duzenli denetim |

---

## 11. Yol Haritasi (Roadmap)

```
MVP (0-3 Ay)
├── Auth sistemi (GitHub + Google)
├── Kullanici profili ve meslek secimi
├── Proje CRUD (olustur, oku, guncelle, sil)
├── Proje gorselleri ve tech stack
├── Like, upvote, yorum sistemi
├── Takip sistemi
├── Calisma arkadasi arama
├── Projeler sayfasi (filtre + pagination)
├── Kisiler sayfasi (filtre + pagination)
├── Landing page
└── Dashboard

v1.1 (3-6 Ay)
├── Baglanti sistemi (istek gonder/kabul et)
├── Referans sistemi
├── Rating sistemi (10 uzerinden)
├── Changelog
├── Yatirima acik ozelligi
├── Bildirim sistemi
├── Son aktiviteler akisi
├── Gelismis arama
└── E-posta bildirimleri

v2.0 (6-12 Ay)
├── Direkt mesajlasma
├── Yatirimci paneli
├── Oneri motoru (ML bazli)
├── Rozetler ve basarimlar
├── API erisimi
├── Etkinlik yonetimi
├── Blog/yazi paylasimi
└── Mobil uygulama (React Native)
```

---

## 12. Kabul Kriterleri

### MVP Kabul Kriterleri
- [ ] Kullanici GitHub ve Google ile kayit olabilir
- [ ] Kullanici profil bilgilerini duzenleyebilir
- [ ] Kullanici yeni proje ekleyebilir (tum gerekli alanlar ile)
- [ ] Projeler sayfasinda filtreleme ve pagination calisir
- [ ] Kisiler sayfasinda meslek bazli filtreleme calisir
- [ ] Proje detay sayfasinda tum bilgiler gorunur
- [ ] Like, upvote ve yorum sistemi calisir
- [ ] Takip sistemi calisir
- [ ] Calisma arkadasi arama ve basvuru akisi calisir
- [ ] Responsive tasarim (mobil, tablet, masaustu)
- [ ] Lighthouse skoru > 90
- [ ] Tum sayfalar SEO uyumlu (SSR/SSG)

---

*Bu belge, 1elat.com projesinin gelistirme surecinde referans dokumani olarak kullanilacaktir. Gereksinimler, gelistirme surecinde guncellenebilir.*
