import { createContext, createElement, useContext, type ReactNode } from "react";

export type Lang = "tr" | "en";

export interface Dictionary {
  nav: {
    explore: string;
    developers: string;
    projects: string;
    community: string;
    signIn: string;
    getStarted: string;
    newProject: string;
    signOut: string;
    profile: string;
    settings: string;
  };
  home: {
    hero: {
      title: string;
      subtitle: string;
      cta: string;
      socialProof: {
        users: string;
        rating: string;
      };
    };
    phone: {
      title: string;
      scanHint: string;
      welcome: string;
      emailPlaceholder: string;
      send: string;
    };
  };
  theme: {
    toggle: string;
  };
  lang: {
    switch: string;
  };
  settings: {
    title: string;
    tabs: {
      account: string;
      linkedAccounts: string;
      password: string;
      notifications: string;
      deleteAccount: string;
    };
    account: {
      title: string;
      description: string;
      profilePhoto: string;
      uploadPhoto: string;
      choosePhoto: string;
      removePhoto: string;
      maxSize: string;
      fullName: string;
      firstNamePlaceholder: string;
      lastNamePlaceholder: string;
      username: string;
      usernameHint: string;
      email: string;
      phone: string;
      phonePlaceholder: string;
      bio: string;
      bioPlaceholder: string;
      location: string;
      locationPlaceholder: string;
      website: string;
      websitePlaceholder: string;
      socialLinks: string;
      save: string;
      saving: string;
      saved: string;
    };
    linkedAccounts: {
      title: string;
      description: string;
      github: string;
      google: string;
      remove: string;
      connect: string;
      passwordWarning: string;
      setPassword: string;
    };
    password: {
      title: string;
      description: string;
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
      update: string;
    };
    notifications: {
      title: string;
      description: string;
      marketing: string;
      marketingDescription: string;
      updates: string;
      updatesDescription: string;
      security: string;
      securityDescription: string;
    };
    deleteAccount: {
      title: string;
      warning: string;
      confirmLabel: string;
      confirmPlaceholder: string;
      button: string;
    };
  };
  sidebar: {
    home: string;
    projects: string;
    explore: string;
    notifications: string;
    settings: string;
    newProjectAria: string;
    pro: {
      title: string;
      description: string;
      learnMore: string;
    };
  };
  topbar: {
    searchPlaceholder: string;
  };
  dashboard: {
    greeting: string;
    subtitle: string;
    kpi: {
      projectLikes: string;
      projectLikesHint: string;
      profileViews: string;
      comingSoon: string;
      engagement: string;
      engagementHint: string;
    };
    performance: {
      title: string;
      description: string;
      last7Days: string;
      thisWeek: string;
      priorWeek: string;
    };
    focus: {
      title: string;
      progress: string;
      description: string;
      action: string;
      continueSetup: string;
    };
    profileCard: {
      moreAria: string;
      callAria: string;
      videoAria: string;
      comingSoon: string;
      viewProfile: string;
    };
    activity: {
      title: string;
      description: string;
      welcome: string;
      welcomeBody: string;
      justNow: string;
      createProjectHint: string;
      newProject: string;
      browseDevelopersHint: string;
      browseDevelopers: string;
    };
  };
  footer: {
    newsletter: {
      title: string;
      description: string;
      placeholder: string;
      subscribe: string;
    };
    tagline: string;
    columns: {
      product: string;
      community: string;
    };
    links: {
      about: string;
      contact: string;
      privacy: string;
      terms: string;
      explore: string;
      developers: string;
      projects: string;
      community: string;
    };
    rights: string;
  };
}

const tr: Dictionary = {
  nav: {
    explore: "Keşfet",
    developers: "Geliştiriciler",
    projects: "Projeler",
    community: "Topluluk",
    signIn: "Giriş Yap",
    getStarted: "Hemen Başla",
    newProject: "Yeni Proje",
    signOut: "Çıkış Yap",
    profile: "Profil",
    settings: "Ayarlar",
  },
  home: {
    hero: {
      title: "Geliştiriciler için sosyal platform",
      subtitle:
        "Projelerini paylaş, başkalarının çalışmalarını keşfet ve gerçek bir geliştirici topluluğunun parçası ol.",
      cta: "Hemen Başla",
      socialProof: {
        users: "64.739 mutlu kullanıcı",
        rating: "4.8/5 puan",
      },
    },
    phone: {
      title: "1elat",
      scanHint: "1elat.com'u ziyaret etmek için tara",
      welcome: "1ELAT'A HOŞ GELDİN",
      emailPlaceholder: "E-posta adresin",
      send: "Gönder",
    },
  },
  theme: {
    toggle: "Temayı değiştir",
  },
  lang: {
    switch: "Dili değiştir",
  },
  settings: {
    title: "Ayarlar",
    tabs: {
      account: "Hesap",
      linkedAccounts: "Bağlı Hesaplar",
      password: "Parola Değiştir",
      notifications: "Bildirimler",
      deleteAccount: "Hesabı Kapat",
    },
    account: {
      title: "Hesap Bilgileri",
      description: "Profilinizi ve hesap bilgilerinizi güncelleyin.",
      profilePhoto: "Profil Fotoğrafı",
      uploadPhoto: "Fotoğraf Yükle",
      choosePhoto: "Fotoğraf Seç",
      removePhoto: "Kaldır",
      maxSize: "Maks. 2MB, JPEG/PNG/WebP",
      fullName: "Ad Soyad",
      firstNamePlaceholder: "Ad",
      lastNamePlaceholder: "Soyad",
      username: "Kullanıcı Adı",
      usernameHint: "Profil URL'niz: 1elat.com/u/",
      email: "E-posta",
      phone: "Telefon",
      phonePlaceholder: "+90 5XX XXX XX XX",
      bio: "Hakkında",
      bioPlaceholder: "Kendinizi kısa bir şekilde tanıtın...",
      location: "Konum",
      locationPlaceholder: "İstanbul, Türkiye",
      website: "Web Sitesi",
      websitePlaceholder: "https://ornek.com",
      socialLinks: "Sosyal Bağlantılar",
      save: "Değişiklikleri Kaydet",
      saving: "Kaydediliyor...",
      saved: "Kaydedildi",
    },
    linkedAccounts: {
      title: "Bağlı Hesaplar",
      description: "GitHub ve Google hesaplarınızı bağlayın veya kaldırın.",
      github: "GitHub",
      google: "Google",
      remove: "Kaldır",
      connect: "Bağla",
      passwordWarning: "Bağlantıyı kaldırmak için önce bir şifre belirlemelisiniz.",
      setPassword: "Şifre belirle",
    },
    password: {
      title: "Parola Değiştir",
      description: "Hesabınızın güvenliğini sağlamak için parolanızı değiştirin.",
      currentPassword: "Mevcut Parola",
      newPassword: "Yeni Parola",
      confirmPassword: "Yeni Parola (Tekrar)",
      update: "Parolayı Güncelle",
    },
    notifications: {
      title: "Bildirim Tercihleri",
      description: "Hangi bildirimleri almak istediğinizi seçin.",
      marketing: "Pazarlama e-postaları",
      marketingDescription: "Etkinlikler, kampanyalar ve yenilikler hakkında bilgilendirilirsiniz.",
      updates: "Güncellemeler",
      updatesDescription: "Platform güncellemeleri ve yeni özellikler hakkında bilgi alırsınız.",
      security: "Güvenlik bildirimleri",
      securityDescription: "Hesap güvenliğiyle ilgili önemli bildirimler.",
    },
    deleteAccount: {
      title: "Hesabı Kapat",
      warning: "Bu işlem geri alınamaz. Hesabınız kalıcı olarak devre dışı bırakılacak ve verilerinize erişiminiz kesilecektir.",
      confirmLabel: "Onaylamak için e-posta adresinizi yazın",
      confirmPlaceholder: "ornek@email.com",
      button: "Hesabımı Kapat",
    },
  },
  sidebar: {
    home: "Ana Sayfa",
    projects: "Projeler",
    explore: "Keşfet",
    notifications: "Bildirimler",
    settings: "Ayarlar",
    newProjectAria: "Yeni proje",
    pro: {
      title: "Pro",
      description: "Öne çıkan yerleşim ve gelişmiş proje analizlerinin kilidini aç.",
      learnMore: "Daha fazla bilgi",
    },
  },
  topbar: {
    searchPlaceholder: "Ara",
  },
  dashboard: {
    greeting: "Merhaba, {firstName}",
    subtitle: "Projelerini ve topluluk etkinliğini takip et. Bu hafta harika bir şey yayına al.",
    kpi: {
      projectLikes: "Proje beğenileri",
      projectLikesHint: "projelerini yayınladığında",
      profileViews: "Profil görüntülenmeleri",
      comingSoon: "yakında",
      engagement: "Etkileşim",
      engagementHint: "geçen aya göre eğilim",
    },
    performance: {
      title: "Performans",
      description: "Analitik gelene kadar yer tutucu eğilim",
      last7Days: "Son 7 gün",
      thisWeek: "Bu hafta",
      priorWeek: "Önceki hafta",
    },
    focus: {
      title: "Mevcut odak",
      progress: "Profil kurulumu ~{percent}%",
      description: "Keşfedilmek için profilini tamamla",
      action: "Biyografi, yetenekler ve ilk projeni ekle.",
      continueSetup: "Kuruluma devam et",
    },
    profileCard: {
      moreAria: "Daha fazla",
      callAria: "Sesli arama",
      videoAria: "Görüntülü arama",
      comingSoon: "Yakında",
      viewProfile: "Profili görüntüle",
    },
    activity: {
      title: "Etkinlik",
      description: "Son öne çıkanlar",
      welcome: "Hoş geldin",
      welcomeBody: " — akışın takipler ve proje güncellemelerini gösterecek.",
      justNow: "Az önce",
      createProjectHint: "Keşfet'te sergilemek için bir proje oluştur.",
      newProject: "Yeni proje",
      browseDevelopersHint: "Geliştiricileri rol ve teknoloji yığınına göre keşfet.",
      browseDevelopers: "Geliştiricilere göz at",
    },
  },
  footer: {
    newsletter: {
      title: "Güncellemelere abone ol",
      description:
        "Spam yok, sadece iyi içerikler. Gelen kutunu doldurmayacağımıza ve verilerini güvende tutacağımıza söz veriyoruz.",
      placeholder: "E-posta adresin",
      subscribe: "Abone Ol",
    },
    tagline: "Hayalperestler, üretenler ve inananlar için.",
    columns: {
      product: "1elat",
      community: "Topluluk",
    },
    links: {
      about: "Hakkımızda",
      contact: "İletişim",
      privacy: "Gizlilik",
      terms: "Kullanım Şartları",
      explore: "Keşfet",
      developers: "Geliştiriciler",
      projects: "Projeler",
      community: "Topluluk",
    },
    rights: "Tüm hakları saklıdır.",
  },
};

const en: Dictionary = {
  nav: {
    explore: "Explore",
    developers: "Developers",
    projects: "Projects",
    community: "Community",
    signIn: "Sign In",
    getStarted: "Get Started",
    newProject: "New Project",
    signOut: "Sign Out",
    profile: "Profile",
    settings: "Settings",
  },
  home: {
    hero: {
      title: "The social platform for developers",
      subtitle:
        "Share your projects, discover what others are building, and join a real community of developers.",
      cta: "Get Started",
      socialProof: {
        users: "64,739 Happy Customers",
        rating: "4.8/5 Rating",
      },
    },
    phone: {
      title: "1elat",
      scanHint: "Scan to visit 1elat.com",
      welcome: "WELCOME TO 1ELAT",
      emailPlaceholder: "Your email address",
      send: "Send",
    },
  },
  theme: {
    toggle: "Toggle theme",
  },
  lang: {
    switch: "Switch language",
  },
  settings: {
    title: "Settings",
    tabs: {
      account: "Account",
      linkedAccounts: "Linked Accounts",
      password: "Change Password",
      notifications: "Notifications",
      deleteAccount: "Delete Account",
    },
    account: {
      title: "Account Information",
      description: "Update your profile and account details.",
      profilePhoto: "Profile Photo",
      uploadPhoto: "Upload Photo",
      choosePhoto: "Choose Photo",
      removePhoto: "Remove",
      maxSize: "Max 2MB, JPEG/PNG/WebP",
      fullName: "Full Name",
      firstNamePlaceholder: "First name",
      lastNamePlaceholder: "Last name",
      username: "Username",
      usernameHint: "Your profile URL: 1elat.com/u/",
      email: "Email",
      phone: "Phone",
      phonePlaceholder: "+1 (555) 000-0000",
      bio: "Bio",
      bioPlaceholder: "Tell us a bit about yourself...",
      location: "Location",
      locationPlaceholder: "San Francisco, CA",
      website: "Website",
      websitePlaceholder: "https://example.com",
      socialLinks: "Social Links",
      save: "Save Changes",
      saving: "Saving...",
      saved: "Saved",
    },
    linkedAccounts: {
      title: "Linked Accounts",
      description: "Connect or remove your GitHub and Google accounts.",
      github: "GitHub",
      google: "Google",
      remove: "Remove",
      connect: "Connect",
      passwordWarning: "You need to set a password before removing a linked account.",
      setPassword: "Set password",
    },
    password: {
      title: "Change Password",
      description: "Change your password to keep your account secure.",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmPassword: "Confirm New Password",
      update: "Update Password",
    },
    notifications: {
      title: "Notification Preferences",
      description: "Choose which notifications you want to receive.",
      marketing: "Marketing emails",
      marketingDescription: "Get notified about events, campaigns, and new features.",
      updates: "Updates",
      updatesDescription: "Receive updates about platform changes and new features.",
      security: "Security notifications",
      securityDescription: "Important notifications about your account security.",
    },
    deleteAccount: {
      title: "Delete Account",
      warning: "This action cannot be undone. Your account will be permanently deactivated and your data will no longer be accessible.",
      confirmLabel: "Type your email address to confirm",
      confirmPlaceholder: "example@email.com",
      button: "Delete My Account",
    },
  },
  sidebar: {
    home: "Home",
    projects: "Projects",
    explore: "Explore",
    notifications: "Notifications",
    settings: "Settings",
    newProjectAria: "New project",
    pro: {
      title: "Pro",
      description: "Unlock featured placement and advanced project insights.",
      learnMore: "Learn more",
    },
  },
  topbar: {
    searchPlaceholder: "Search",
  },
  dashboard: {
    greeting: "Hello, {firstName}",
    subtitle: "Track your projects and community activity. Ship something great this week.",
    kpi: {
      projectLikes: "Project likes",
      projectLikesHint: "when you publish projects",
      profileViews: "Profile views",
      comingSoon: "coming soon",
      engagement: "Engagement",
      engagementHint: "trend vs last month",
    },
    performance: {
      title: "Performance",
      description: "Placeholder trend until analytics ships",
      last7Days: "Last 7 days",
      thisWeek: "This week",
      priorWeek: "Prior week",
    },
    focus: {
      title: "Current focus",
      progress: "Profile setup ~{percent}%",
      description: "Complete your profile to get discovered",
      action: "Add bio, skills, and your first project.",
      continueSetup: "Continue setup",
    },
    profileCard: {
      moreAria: "More",
      callAria: "Voice call",
      videoAria: "Video call",
      comingSoon: "Coming soon",
      viewProfile: "View profile",
    },
    activity: {
      title: "Activity",
      description: "Recent highlights",
      welcome: "Welcome",
      welcomeBody: " — your feed will show follows and project updates.",
      justNow: "Just now",
      createProjectHint: "Create a project to showcase on Explore.",
      newProject: "New project",
      browseDevelopersHint: "Discover developers by role and stack.",
      browseDevelopers: "Browse developers",
    },
  },
  footer: {
    newsletter: {
      title: "Sign up for updates",
      description:
        "No spam, just good vibes. We promise not to flood your inbox and we keep your data safe.",
      placeholder: "Enter your email",
      subscribe: "Subscribe",
    },
    tagline: "For the visionaries, the builders, and the believers.",
    columns: {
      product: "1elat",
      community: "Community",
    },
    links: {
      about: "About",
      contact: "Contact",
      privacy: "Privacy",
      terms: "Terms",
      explore: "Explore",
      developers: "Developers",
      projects: "Projects",
      community: "Community",
    },
    rights: "All rights reserved.",
  },
};

const dictionaries: Record<Lang, Dictionary> = { tr, en };

export function getDictionary(lang: Lang): Dictionary {
  return dictionaries[lang];
}

function parseCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq) === name) {
      return decodeURIComponent(part.slice(eq + 1));
    }
  }
  return null;
}

function normalizeLang(value: string | null): Lang | null {
  if (!value) return null;
  const v = value.toLowerCase();
  if (v === "tr" || v.startsWith("tr-")) return "tr";
  if (v === "en" || v.startsWith("en-")) return "en";
  return null;
}

export function getLang(request: Request): Lang {
  const fromCookie = normalizeLang(parseCookie(request.headers.get("cookie"), "lang"));
  if (fromCookie) return fromCookie;

  const accept = request.headers.get("accept-language");
  if (accept) {
    const tags = accept.split(",").map((t) => t.split(";")[0].trim());
    for (const tag of tags) {
      const n = normalizeLang(tag);
      if (n) return n;
    }
  }
  return "tr";
}

interface I18nContextValue {
  lang: Lang;
  t: Dictionary;
}

const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  lang: Lang;
  children: ReactNode;
}

export function I18nProvider({ lang, children }: I18nProviderProps): ReactNode {
  const value: I18nContextValue = { lang, t: getDictionary(lang) };
  return createElement(I18nContext.Provider, { value }, children);
}

export function useT(): Dictionary {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT must be used within I18nProvider");
  return ctx.t;
}

export function useLang(): Lang {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useLang must be used within I18nProvider");
  return ctx.lang;
}
