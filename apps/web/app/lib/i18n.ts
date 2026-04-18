import { createContext, createElement, useContext, type ReactNode } from "react";

export type Lang = "tr" | "en";

export interface Dictionary {
  nav: {
    developers: string;
    projects: string;
    signIn: string;
    getStarted: string;
    newProject: string;
    signOut: string;
    profile: string;
    settings: string;
  };
  explore: {
    developers: {
      title: string;
      subtitle: string;
      filters: string;
      empty: string;
      openToWork: string;
      activeProjects: string;
      allSkills: string;
      noResults: string;
    };
    projects: {
      title: string;
      subtitle: string;
      filters: string;
      empty: string;
      tags: {
        all: string;
        web: string;
        mobile: string;
        aiMl: string;
        devops: string;
        openSource: string;
      };
    };
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
      skills: string;
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
    skills: {
      title: string;
      description: string;
      subtitle: string;
      maxSkills: string;
      selected: string;
      save: string;
      saving: string;
      saved: string;
      noSkills: string;
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
    admin: string;
    newProjectAria: string;
    pro: {
      title: string;
      description: string;
      learnMore: string;
    };
  };
  admin: {
    title: string;
    subtitle: string;
    error: string;
    stats: {
      totalUsers: string;
      totalProjects: string;
      totalAdmins: string;
      signupsLast7Days: string;
      signupsLast30Days: string;
      projectsLast7Days: string;
    };
    users: {
      sectionTitle: string;
      sectionSubtitle: string;
      searchPlaceholder: string;
      filters: {
        roleLabel: string;
        statusLabel: string;
        role: { all: string; admin: string; user: string };
        status: { all: string; active: string; suspended: string };
      };
      table: {
        user: string;
        role: string;
        status: string;
        lastLogin: string;
        actions: string;
      };
      roleLabel: { user: string; admin: string };
      statusLabel: { active: string; suspended: string };
      lastLoginNever: string;
      actions: {
        viewProfile: string;
        toggleStatusActive: string;
        toggleStatusSuspended: string;
        makeAdmin: string;
        removeAdmin: string;
        cannotModifySelf: string;
      };
      pagination: {
        previous: string;
        next: string;
        pageOf: string;
      };
      errors: { updateFailed: string; loadFailed: string };
      empty: string;
    };
  };
  topbar: {
    searchPlaceholder: string;
  };
  dashboard: {
    greeting: string;
    subtitle: string;
    openToWork: {
      title: string;
      description: string;
      active: string;
      inactive: string;
      needSkills: string;
      needSkillsLink: string;
    };
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
  publicProfile: {
    notFound: string;
    notFoundDescription: string;
    backHome: string;
    locationNotSet: string;
    noWebsite: string;
    joinedAt: string;
    projects: string;
    activity: string;
    noProjectsYet: string;
    noActivityYet: string;
    follow: string;
    openToWork: string;
    skills: string;
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
  newProjectModal: {
    title: string;
    description: string;
    nameLabel: string;
    namePlaceholder: string;
    submit: string;
    submitting: string;
    cancel: string;
    error: string;
    closeAria: string;
  };
  projectEdit: {
    title: string;
    backToProjects: string;
    autosave: {
      idle: string;
      saving: string;
      saved: string;
      error: string;
    };
    actions: {
      preview: string;
      publish: string;
      publishing: string;
      unpublish: string;
      restore: string;
      retry: string;
      more: string;
    };
    sections: {
      basic: string;
      description: string;
      media: string;
      links: string;
      tags: string;
      team: string;
      settings: string;
      preview: string;
      placeholder: string;
    };
    basic: {
      name: string;
      namePlaceholder: string;
      tagline: string;
      taglinePlaceholder: string;
      taglineCounter: string;
      slug: string;
      slugLocked: string;
      category: string;
      categoryPlaceholder: string;
      type: string;
      typePlaceholder: string;
      stage: string;
      stagePlaceholder: string;
    };
    links: {
      website: string;
      repo: string;
      demo: string;
    };
    settings: {
      pricingModel: string;
      pricing: {
        none: string;
        free: string;
        freemium: string;
        paid: string;
        open_source: string;
      };
      isOpenSource: string;
      isPublic: string;
      isSeekingInvestment: string;
      isSeekingTeammates: string;
    };
    publish: {
      success: string;
      missingFields: string;
      failed: string;
      fieldLabels: {
        name: string;
        tagline: string;
        description: string;
        categoryId: string;
        typeId: string;
        stageId: string;
        links: string;
        images: string;
      };
    };
    progress: {
      label: string;
    };
    loadError: string;
    description: {
      title: string;
      descriptionLabel: string;
      descriptionHint: string;
      descriptionMin: string;
      launchStoryLabel: string;
      launchStoryHint: string;
      placeholder: {
        description: string;
        launchStory: string;
      };
      charCount: string;
    };
    editor: {
      bold: string;
      italic: string;
      h2: string;
      h3: string;
      bulletList: string;
      orderedList: string;
      quote: string;
      code: string;
      link: string;
      linkPrompt: string;
      undo: string;
      redo: string;
    };
    media: {
      title: string;
      logo: {
        label: string;
        hint: string;
        upload: string;
        replace: string;
        remove: string;
        formatHint: string;
      };
      gallery: {
        label: string;
        hint: string;
        add: string;
        empty: string;
        limitReached: string;
        moveUp: string;
        moveDown: string;
        delete: string;
        uploading: string;
      };
      errors: {
        fileTooLarge: string;
        unsupportedType: string;
        limitExceeded: string;
        uploadFailed: string;
      };
    };
    tags: {
      title: string;
      category: string;
      type: string;
      stage: string;
      selectPlaceholder: string;
      technologies: {
        label: string;
        placeholder: string;
        add: string;
        empty: string;
        limit: string;
      };
      customTags: {
        label: string;
        placeholder: string;
        hint: string;
        limit: string;
      };
    };
    team: {
      title: string;
      members: {
        label: string;
        owner: string;
        remove: string;
        removeConfirm: string;
      };
      invitations: {
        label: string;
        empty: string;
        cancel: string;
      };
      invite: {
        title: string;
        username: string;
        usernamePlaceholder: string;
        role: string;
        rolePlaceholder: string;
        message: string;
        messagePlaceholder: string;
        submit: string;
        submitting: string;
        success: string;
        errors: {
          duplicate: string;
          alreadyMember: string;
          cannotInviteSelf: string;
          userNotFound: string;
          generic: string;
        };
      };
    };
    preview: {
      title: string;
      hint: string;
      openInNewTab: string;
    };
  };
  projectDetail: {
    visitWebsite: string;
    follow: string;
    unfollow: string;
    followers: string;
    category: string;
    stage: string;
    pricing: {
      free: string;
      freemium: string;
      paid: string;
      open_source: string;
    };
    launchedNotYet: string;
    lookingFor: {
      teammates: string;
      investment: string;
    };
    tabs: {
      overview: string;
      discussion: string;
      team: string;
      more: string;
    };
    comingSoon: {
      discussion: string;
      team: string;
    };
    upvote: string;
    like: string;
    share: string;
    shareCopied: string;
    owner: {
      banner: { draft: string };
      publishCta: string;
      edit: string;
      manage: string;
      manageActions: {
        publish: string;
        unpublish: string;
        archive: string;
        restore: string;
        delete: string;
      };
      deleteConfirm: string;
    };
    makerSays: {
      title: string;
      makerBadge: string;
    };
    more: {
      views: string;
      upvotes: string;
      likes: string;
      comments: string;
      followers: string;
      members: string;
      createdAt: string;
      updatedAt: string;
      owner: string;
      visitProfile: string;
    };
    gallery: {
      prev: string;
      next: string;
      close: string;
    };
    errors: {
      engagementFailed: string;
      cannotFollowOwnProject: string;
    };
    notFound: {
      title: string;
      description: string;
      back: string;
    };
    technologies: string;
    tags: string;
  };
}

const tr: Dictionary = {
  nav: {
    developers: "Geliştiriciler",
    projects: "Projeler",
    signIn: "Giriş Yap",
    getStarted: "Hemen Başla",
    newProject: "Yeni Proje",
    signOut: "Çıkış Yap",
    profile: "Profil",
    settings: "Ayarlar",
  },
  explore: {
    developers: {
      title: "Geliştiricileri Keşfet",
      subtitle: "Topluluktaki geliştiricileri bul ve bağlantı kur",
      filters: "Filtreler",
      empty: "Geliştiriciler burada görünecek",
      openToWork: "Çalışmaya Açık",
      activeProjects: "{count} proje",
      allSkills: "Tüm Yetkinlikler",
      noResults: "Bu filtrelere uygun geliştirici bulunamadı",
    },
    projects: {
      title: "Projeleri Keşfet",
      subtitle: "Geliştirici topluluğundan projeleri keşfet",
      filters: "Filtreler",
      empty: "Projeler burada görünecek",
      tags: {
        all: "Tümü",
        web: "Web",
        mobile: "Mobil",
        aiMl: "AI/ML",
        devops: "DevOps",
        openSource: "Açık Kaynak",
      },
    },
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
      skills: "Yetkinlikler",
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
    skills: {
      title: "Yetkinlikler",
      description: "Hangi alanlarda deneyimli olduğunuzu belirtin.",
      subtitle: "Yetkinliklerinizi seçin",
      maxSkills: "En fazla 15 yetkinlik seçebilirsiniz.",
      selected: "{count} / 15 seçili",
      save: "Kaydet",
      saving: "Kaydediliyor...",
      saved: "Kaydedildi",
      noSkills: "Henüz yetkinlik tanımlanmamış.",
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
    home: "Dashboard",
    projects: "Projeler",
    explore: "Keşfet",
    notifications: "Bildirimler",
    settings: "Ayarlar",
    admin: "Yönetim",
    newProjectAria: "Yeni proje",
    pro: {
      title: "Pro",
      description: "Öne çıkan yerleşim ve gelişmiş proje analizlerinin kilidini aç.",
      learnMore: "Daha fazla bilgi",
    },
  },
  admin: {
    title: "Yönetim Paneli",
    subtitle: "Platform genelinde temel metrikler ve özet istatistikler.",
    error: "Yönetim verileri alınamadı. Lütfen daha sonra tekrar deneyin.",
    stats: {
      totalUsers: "Toplam Kullanıcı",
      totalProjects: "Toplam Proje",
      totalAdmins: "Toplam Yönetici",
      signupsLast7Days: "Son 7 Gün Kayıt",
      signupsLast30Days: "Son 30 Gün Kayıt",
      projectsLast7Days: "Son 7 Gün Proje",
    },
    users: {
      sectionTitle: "Kullanıcı Yönetimi",
      sectionSubtitle: "Platformdaki kullanıcıları arayın, filtreleyin ve yönetin.",
      searchPlaceholder: "Ad veya e-posta ile arayın...",
      filters: {
        roleLabel: "Rol",
        statusLabel: "Durum",
        role: { all: "Tümü", admin: "Yöneticiler", user: "Kullanıcılar" },
        status: { all: "Tümü", active: "Aktif", suspended: "Pasif" },
      },
      table: {
        user: "Kullanıcı",
        role: "Rol",
        status: "Durum",
        lastLogin: "Son Giriş",
        actions: "İşlemler",
      },
      roleLabel: { user: "Kullanıcı", admin: "Yönetici" },
      statusLabel: { active: "Aktif", suspended: "Pasif" },
      lastLoginNever: "Hiç",
      actions: {
        viewProfile: "Profili görüntüle",
        toggleStatusActive: "Pasifleştir",
        toggleStatusSuspended: "Aktifleştir",
        makeAdmin: "Admin yap",
        removeAdmin: "Adminliği kaldır",
        cannotModifySelf: "Kendinize uygulayamazsınız",
      },
      pagination: {
        previous: "Önceki",
        next: "Sonraki",
        pageOf: "{page} / {total}",
      },
      errors: {
        updateFailed: "Güncelleme başarısız",
        loadFailed: "Kullanıcılar yüklenemedi",
      },
      empty: "Sonuç bulunamadı",
    },
  },
  topbar: {
    searchPlaceholder: "Ara",
  },
  dashboard: {
    greeting: "Merhaba, {firstName}",
    subtitle: "Projelerini ve topluluk etkinliğini takip et. Bu hafta harika bir şey yayına al.",
    openToWork: {
      title: "Çalışmaya Açık",
      description: "Diğer geliştiricilerin seni bulabilmesi için bu ayarı aç.",
      active: "Çalışmaya açıksın",
      inactive: "Çalışmaya kapalısın",
      needSkills: "Önce yetkinliklerini ekle",
      needSkillsLink: "Yetkinlikleri Düzenle",
    },
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
  publicProfile: {
    notFound: "Kullanıcı bulunamadı",
    notFoundDescription: "Bu kullanıcı adıyla eşleşen bir profil bulunamadı.",
    backHome: "Ana sayfaya dön",
    locationNotSet: "Konum belirtilmemiş",
    noWebsite: "Web sitesi yok",
    joinedAt: "Katılım: {date}",
    projects: "Projeler",
    activity: "Etkinlik",
    noProjectsYet: "Henüz proje yok",
    noActivityYet: "Henüz etkinlik yok",
    follow: "Takip Et",
    openToWork: "Çalışmaya Açık",
    skills: "Yetkinlikler",
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
  newProjectModal: {
    title: "Yeni Proje",
    description: "Bir proje adı seçin. Gerisini sonra doldurursunuz.",
    nameLabel: "Proje adı",
    namePlaceholder: "Harika Projem",
    submit: "Oluştur",
    submitting: "Oluşturuluyor...",
    cancel: "Vazgeç",
    error: "Proje oluşturulamadı. Lütfen tekrar deneyin.",
    closeAria: "Kapat",
  },
  projectEdit: {
    title: "Projeyi Düzenle",
    backToProjects: "Projelere dön",
    autosave: {
      idle: "Düzenlenmedi",
      saving: "Kaydediliyor...",
      saved: "Kaydedildi",
      error: "Kaydedilemedi",
    },
    actions: {
      preview: "Önizle",
      publish: "Yayınla",
      publishing: "Yayınlanıyor...",
      unpublish: "Yayından Kaldır",
      restore: "Geri Yükle",
      retry: "Tekrar dene",
      more: "Daha fazla",
    },
    sections: {
      basic: "Temel",
      description: "Açıklama",
      media: "Medya",
      links: "Bağlantılar",
      tags: "Etiketler",
      team: "Ekip",
      settings: "Ayarlar",
      preview: "Önizleme",
      placeholder: "Bu bölüm sonraki fazda gelecek (Faz {phase})",
    },
    basic: {
      name: "Proje adı",
      namePlaceholder: "Harika Projem",
      tagline: "Kısa tanım",
      taglinePlaceholder: "Bir cümlelik açıklama",
      taglineCounter: "{count}/80",
      slug: "URL kısa adı (slug)",
      slugLocked: "Yayındaki projenin slug'i değiştirilemez",
      category: "Kategori",
      categoryPlaceholder: "Kategori seçin",
      type: "Proje türü",
      typePlaceholder: "Tür seçin",
      stage: "Aşama",
      stagePlaceholder: "Aşama seçin",
    },
    links: {
      website: "Web sitesi",
      repo: "Kaynak kod deposu",
      demo: "Demo adresi",
    },
    settings: {
      pricingModel: "Fiyatlandırma modeli",
      pricing: {
        none: "-",
        free: "Ücretsiz",
        freemium: "Freemium",
        paid: "Ücretli",
        open_source: "Açık kaynak",
      },
      isOpenSource: "Açık kaynak",
      isPublic: "Herkese açık",
      isSeekingInvestment: "Yatırım arıyor",
      isSeekingTeammates: "Takım arkadaşı arıyor",
    },
    publish: {
      success: "Proje yayınlandı",
      missingFields: "Yayınlamak için şu alanları doldurun:",
      failed: "Proje yayınlanamadı",
      fieldLabels: {
        name: "Proje adı",
        tagline: "Kısa tanım",
        description: "Açıklama",
        categoryId: "Kategori",
        typeId: "Proje türü",
        stageId: "Aşama",
        links: "En az bir bağlantı (web, repo veya demo)",
        images: "Görsel",
      },
    },
    progress: {
      label: "Tamamlanma: %{percent}",
    },
    loadError: "Proje yüklenemedi",
    description: {
      title: "Açıklama",
      descriptionLabel: "Proje Açıklaması",
      descriptionHint:
        "Projenizi 1-2 paragrafla anlatın. Detay sayfasında Overview tab'ında görünür.",
      descriptionMin: "Yayın için en az 120 karakter",
      launchStoryLabel: "Maker Notu",
      launchStoryHint:
        "Hikayenizi paylaşın — neden bu projeyi yaptınız, nereye gidiyor. Detay sayfasında 'Maker says' bölümünde görünür.",
      placeholder: {
        description: "Projenizden kısaca bahsedin...",
        launchStory: "Bu projeyi neden yaptınız, hikayesi nedir?",
      },
      charCount: "{count} karakter",
    },
    editor: {
      bold: "Kalın",
      italic: "İtalik",
      h2: "Başlık 2",
      h3: "Başlık 3",
      bulletList: "Madde işaretli liste",
      orderedList: "Numaralı liste",
      quote: "Alıntı",
      code: "Kod",
      link: "Bağlantı",
      linkPrompt: "Bağlantı URL'si:",
      undo: "Geri al",
      redo: "Yinele",
    },
    media: {
      title: "Medya",
      logo: {
        label: "Logo",
        hint: "Profil ve kart önizlemelerinde kullanılır.",
        upload: "Logo Yükle",
        replace: "Değiştir",
        remove: "Kaldır",
        formatHint: "JPEG, PNG, WebP, GIF · maks. 5MB",
      },
      gallery: {
        label: "Galeri",
        hint: "Detay sayfasında carousel olarak gösterilir. Maks 8 görsel.",
        add: "Görsel Ekle",
        empty: "Henüz görsel yok",
        limitReached: "Maks {max} görsele ulaştınız",
        moveUp: "Yukarı taşı",
        moveDown: "Aşağı taşı",
        delete: "Sil",
        uploading: "Yükleniyor... ({current}/{total})",
      },
      errors: {
        fileTooLarge: "Dosya çok büyük (maks 5MB)",
        unsupportedType: "Geçersiz dosya türü (JPEG, PNG, WebP, GIF)",
        limitExceeded: "Galeri limiti aşıldı",
        uploadFailed: "Yükleme başarısız",
      },
    },
    tags: {
      title: "Etiketler",
      category: "Kategori",
      type: "Tip",
      stage: "Aşama",
      selectPlaceholder: "Seçiniz",
      technologies: {
        label: "Teknolojiler",
        placeholder: "Teknoloji ekle",
        add: "Ekle",
        empty: "Henüz teknoloji eklenmedi",
        limit: "Maks 20 teknoloji",
      },
      customTags: {
        label: "Özel Etiketler",
        placeholder: "Etiket yazın ve Enter'a basın",
        hint: "Maks 5 etiket, her biri 30 karakter",
        limit: "Maks 5 etikete ulaştınız",
      },
    },
    team: {
      title: "Ekip",
      members: {
        label: "Üyeler",
        owner: "Sahip",
        remove: "Çıkar",
        removeConfirm: "Bu üyeyi çıkarmak istediğinize emin misiniz?",
      },
      invitations: {
        label: "Bekleyen Davetler",
        empty: "Bekleyen davet yok",
        cancel: "İptal Et",
      },
      invite: {
        title: "Yeni Davet",
        username: "Kullanıcı adı",
        usernamePlaceholder: "kullanici_adi",
        role: "Rol",
        rolePlaceholder: "Frontend, Designer vb.",
        message: "Mesaj",
        messagePlaceholder: "Davet mesajı (opsiyonel)",
        submit: "Davet Gönder",
        submitting: "Gönderiliyor...",
        success: "Davet gönderildi",
        errors: {
          duplicate: "Bu kullanıcıya zaten bekleyen bir davet var",
          alreadyMember: "Kullanıcı zaten üye",
          cannotInviteSelf: "Kendinizi davet edemezsiniz",
          userNotFound: "Kullanıcı bulunamadı",
          generic: "Davet gönderilemedi",
        },
      },
    },
    preview: {
      title: "Önizleme",
      hint: "Detay sayfası Faz D'de tamamlanacak. Aşağıda mevcut durumu görebilirsiniz.",
      openInNewTab: "Yeni sekmede aç",
    },
  },
  projectDetail: {
    visitWebsite: "Web sitesini ziyaret et",
    follow: "Takip Et",
    unfollow: "Takibi Bırak",
    followers: "{count} takipçi",
    category: "Kategori",
    stage: "Aşama",
    pricing: {
      free: "Ücretsiz",
      freemium: "Freemium",
      paid: "Ücretli",
      open_source: "Açık Kaynak",
    },
    launchedNotYet: "Henüz yayında değil",
    lookingFor: {
      teammates: "Ekip üyesi arıyor",
      investment: "Yatırım arıyor",
    },
    tabs: {
      overview: "Genel Bakış",
      discussion: "Tartışma",
      team: "Ekip",
      more: "Daha Fazla",
    },
    comingSoon: {
      discussion: "Yorumlar Faz D.3'te gelecek",
      team: "Ekip Faz D.4'te gelecek",
    },
    upvote: "Destekle",
    like: "Beğen",
    share: "Paylaş",
    shareCopied: "Link kopyalandı",
    owner: {
      banner: {
        draft: "Bu proje henüz yayında değil. Sadece sen görüyorsun.",
      },
      publishCta: "Yayınla",
      edit: "Düzenle",
      manage: "Yönet",
      manageActions: {
        publish: "Yayınla",
        unpublish: "Yayından Kaldır",
        archive: "Arşivle",
        restore: "Geri Yükle",
        delete: "Sil",
      },
      deleteConfirm: "Bu projeyi silmek istediğinize emin misiniz?",
    },
    makerSays: {
      title: "Maker says",
      makerBadge: "Maker",
    },
    more: {
      views: "{count} görüntülenme",
      upvotes: "{count} destek",
      likes: "{count} beğeni",
      comments: "{count} yorum",
      followers: "{count} takipçi",
      members: "{count} üye",
      createdAt: "Oluşturuldu: {date}",
      updatedAt: "Son güncelleme: {date}",
      owner: "Sahip",
      visitProfile: "Profili görüntüle",
    },
    gallery: {
      prev: "Önceki",
      next: "Sonraki",
      close: "Kapat",
    },
    errors: {
      engagementFailed: "İşlem başarısız",
      cannotFollowOwnProject: "Kendi projenizi takip edemezsiniz",
    },
    notFound: {
      title: "Proje bulunamadı",
      description: "Aradığınız proje mevcut değil veya kaldırılmış olabilir.",
      back: "Projelere dön",
    },
    technologies: "Teknolojiler",
    tags: "Etiketler",
  },
};

const en: Dictionary = {
  nav: {
    developers: "Developers",
    projects: "Projects",
    signIn: "Sign In",
    getStarted: "Get Started",
    newProject: "New Project",
    signOut: "Sign Out",
    profile: "Profile",
    settings: "Settings",
  },
  explore: {
    developers: {
      title: "Explore Developers",
      subtitle: "Find and connect with developers in the community",
      filters: "Filters",
      empty: "Developers will appear here",
      openToWork: "Open to Work",
      activeProjects: "{count} projects",
      allSkills: "All Skills",
      noResults: "No developers found matching these filters",
    },
    projects: {
      title: "Explore Projects",
      subtitle: "Discover projects from the developer community",
      filters: "Filters",
      empty: "Projects will appear here",
      tags: {
        all: "All",
        web: "Web",
        mobile: "Mobile",
        aiMl: "AI/ML",
        devops: "DevOps",
        openSource: "Open Source",
      },
    },
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
      skills: "Skills",
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
    skills: {
      title: "Skills",
      description: "Specify which areas you are experienced in.",
      subtitle: "Select your skills",
      maxSkills: "You can select up to 15 skills.",
      selected: "{count} / 15 selected",
      save: "Save",
      saving: "Saving...",
      saved: "Saved",
      noSkills: "No skills defined yet.",
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
    admin: "Admin",
    newProjectAria: "New project",
    pro: {
      title: "Pro",
      description: "Unlock featured placement and advanced project insights.",
      learnMore: "Learn more",
    },
  },
  admin: {
    title: "Admin Panel",
    subtitle: "Key platform-wide metrics and summary statistics.",
    error: "Could not load admin data. Please try again later.",
    stats: {
      totalUsers: "Total Users",
      totalProjects: "Total Projects",
      totalAdmins: "Total Admins",
      signupsLast7Days: "Signups (Last 7 Days)",
      signupsLast30Days: "Signups (Last 30 Days)",
      projectsLast7Days: "Projects (Last 7 Days)",
    },
    users: {
      sectionTitle: "User Management",
      sectionSubtitle: "Search, filter and manage platform users.",
      searchPlaceholder: "Search by name or email...",
      filters: {
        roleLabel: "Role",
        statusLabel: "Status",
        role: { all: "All", admin: "Admins", user: "Users" },
        status: { all: "All", active: "Active", suspended: "Suspended" },
      },
      table: {
        user: "User",
        role: "Role",
        status: "Status",
        lastLogin: "Last Login",
        actions: "Actions",
      },
      roleLabel: { user: "User", admin: "Admin" },
      statusLabel: { active: "Active", suspended: "Suspended" },
      lastLoginNever: "Never",
      actions: {
        viewProfile: "View profile",
        toggleStatusActive: "Suspend",
        toggleStatusSuspended: "Activate",
        makeAdmin: "Make admin",
        removeAdmin: "Remove admin",
        cannotModifySelf: "You cannot apply this to yourself",
      },
      pagination: {
        previous: "Previous",
        next: "Next",
        pageOf: "{page} / {total}",
      },
      errors: {
        updateFailed: "Update failed",
        loadFailed: "Could not load users",
      },
      empty: "No results found",
    },
  },
  topbar: {
    searchPlaceholder: "Search",
  },
  dashboard: {
    greeting: "Hello, {firstName}",
    subtitle: "Track your projects and community activity. Ship something great this week.",
    openToWork: {
      title: "Open to Work",
      description: "Let other developers find you for collaboration.",
      active: "You are open to work",
      inactive: "You are not open to work",
      needSkills: "Add your skills first",
      needSkillsLink: "Edit Skills",
    },
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
  publicProfile: {
    notFound: "User not found",
    notFoundDescription: "No profile matches this username.",
    backHome: "Back to home",
    locationNotSet: "Location not set",
    noWebsite: "No website",
    joinedAt: "Joined {date}",
    projects: "Projects",
    activity: "Activity",
    noProjectsYet: "No projects yet",
    noActivityYet: "No recent activity",
    follow: "Follow",
    openToWork: "Open to Work",
    skills: "Skills",
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
  newProjectModal: {
    title: "New Project",
    description: "Pick a project name. You can fill in the rest later.",
    nameLabel: "Project name",
    namePlaceholder: "My Awesome Project",
    submit: "Create",
    submitting: "Creating...",
    cancel: "Cancel",
    error: "Could not create project. Please try again.",
    closeAria: "Close",
  },
  projectEdit: {
    title: "Edit Project",
    backToProjects: "Back to projects",
    autosave: {
      idle: "No changes",
      saving: "Saving...",
      saved: "Saved",
      error: "Save failed",
    },
    actions: {
      preview: "Preview",
      publish: "Publish",
      publishing: "Publishing...",
      unpublish: "Unpublish",
      restore: "Restore",
      retry: "Retry",
      more: "More",
    },
    sections: {
      basic: "Basics",
      description: "Description",
      media: "Media",
      links: "Links",
      tags: "Tags",
      team: "Team",
      settings: "Settings",
      preview: "Preview",
      placeholder: "This section is coming in a future phase ({phase})",
    },
    basic: {
      name: "Project name",
      namePlaceholder: "My Awesome Project",
      tagline: "Tagline",
      taglinePlaceholder: "A one-line description",
      taglineCounter: "{count}/80",
      slug: "URL slug",
      slugLocked: "Published project slug cannot be changed",
      category: "Category",
      categoryPlaceholder: "Select a category",
      type: "Project type",
      typePlaceholder: "Select a type",
      stage: "Stage",
      stagePlaceholder: "Select a stage",
    },
    links: {
      website: "Website",
      repo: "Repository",
      demo: "Demo URL",
    },
    settings: {
      pricingModel: "Pricing model",
      pricing: {
        none: "-",
        free: "Free",
        freemium: "Freemium",
        paid: "Paid",
        open_source: "Open source",
      },
      isOpenSource: "Open source",
      isPublic: "Public",
      isSeekingInvestment: "Seeking investment",
      isSeekingTeammates: "Seeking teammates",
    },
    publish: {
      success: "Project published",
      missingFields: "Fill in the following fields to publish:",
      failed: "Could not publish project",
      fieldLabels: {
        name: "Project name",
        tagline: "Tagline",
        description: "Description",
        categoryId: "Category",
        typeId: "Project type",
        stageId: "Stage",
        links: "At least one link (website, repo or demo)",
        images: "Image",
      },
    },
    progress: {
      label: "Completion: {percent}%",
    },
    loadError: "Could not load project",
    description: {
      title: "Description",
      descriptionLabel: "Project Description",
      descriptionHint:
        "Describe your project in 1-2 paragraphs. Shown in the Overview tab on the detail page.",
      descriptionMin: "At least 120 characters required to publish",
      launchStoryLabel: "Maker Note",
      launchStoryHint:
        "Share your story — why you built this and where it is going. Shown in the 'Maker says' section on the detail page.",
      placeholder: {
        description: "Briefly describe your project...",
        launchStory: "Why did you build this? What is the story?",
      },
      charCount: "{count} characters",
    },
    editor: {
      bold: "Bold",
      italic: "Italic",
      h2: "Heading 2",
      h3: "Heading 3",
      bulletList: "Bullet list",
      orderedList: "Numbered list",
      quote: "Quote",
      code: "Code",
      link: "Link",
      linkPrompt: "Link URL:",
      undo: "Undo",
      redo: "Redo",
    },
    media: {
      title: "Media",
      logo: {
        label: "Logo",
        hint: "Used in profile and card previews.",
        upload: "Upload Logo",
        replace: "Replace",
        remove: "Remove",
        formatHint: "JPEG, PNG, WebP, GIF · max. 5MB",
      },
      gallery: {
        label: "Gallery",
        hint: "Shown as a carousel on the detail page. Max 8 images.",
        add: "Add Image",
        empty: "No images yet",
        limitReached: "You reached the {max} image limit",
        moveUp: "Move up",
        moveDown: "Move down",
        delete: "Delete",
        uploading: "Uploading... ({current}/{total})",
      },
      errors: {
        fileTooLarge: "File is too large (max 5MB)",
        unsupportedType: "Unsupported file type (JPEG, PNG, WebP, GIF)",
        limitExceeded: "Gallery limit reached",
        uploadFailed: "Upload failed",
      },
    },
    tags: {
      title: "Tags",
      category: "Category",
      type: "Type",
      stage: "Stage",
      selectPlaceholder: "Select",
      technologies: {
        label: "Technologies",
        placeholder: "Add technology",
        add: "Add",
        empty: "No technologies added yet",
        limit: "Max 20 technologies",
      },
      customTags: {
        label: "Custom Tags",
        placeholder: "Type a tag and press Enter",
        hint: "Max 5 tags, 30 chars each",
        limit: "Reached the 5 tag limit",
      },
    },
    team: {
      title: "Team",
      members: {
        label: "Members",
        owner: "Owner",
        remove: "Remove",
        removeConfirm: "Are you sure you want to remove this member?",
      },
      invitations: {
        label: "Pending Invitations",
        empty: "No pending invitations",
        cancel: "Cancel",
      },
      invite: {
        title: "New Invitation",
        username: "Username",
        usernamePlaceholder: "username",
        role: "Role",
        rolePlaceholder: "Frontend, Designer, etc.",
        message: "Message",
        messagePlaceholder: "Invitation message (optional)",
        submit: "Send Invitation",
        submitting: "Sending...",
        success: "Invitation sent",
        errors: {
          duplicate: "There is already a pending invitation for this user",
          alreadyMember: "User is already a member",
          cannotInviteSelf: "You cannot invite yourself",
          userNotFound: "User not found",
          generic: "Could not send invitation",
        },
      },
    },
    preview: {
      title: "Preview",
      hint: "Detail page will be finished in Phase D. Current state shown below.",
      openInNewTab: "Open in new tab",
    },
  },
  projectDetail: {
    visitWebsite: "Visit website",
    follow: "Follow",
    unfollow: "Unfollow",
    followers: "{count} followers",
    category: "Category",
    stage: "Stage",
    pricing: {
      free: "Free",
      freemium: "Freemium",
      paid: "Paid",
      open_source: "Open Source",
    },
    launchedNotYet: "Not launched yet",
    lookingFor: {
      teammates: "Looking for teammates",
      investment: "Seeking investment",
    },
    tabs: {
      overview: "Overview",
      discussion: "Discussion",
      team: "Team",
      more: "More",
    },
    comingSoon: {
      discussion: "Comments coming in Phase D.3",
      team: "Team coming in Phase D.4",
    },
    upvote: "Upvote",
    like: "Like",
    share: "Share",
    shareCopied: "Link copied",
    owner: {
      banner: {
        draft: "This project is not yet published. Only you can see it.",
      },
      publishCta: "Publish",
      edit: "Edit",
      manage: "Manage",
      manageActions: {
        publish: "Publish",
        unpublish: "Unpublish",
        archive: "Archive",
        restore: "Restore",
        delete: "Delete",
      },
      deleteConfirm: "Are you sure you want to delete this project?",
    },
    makerSays: {
      title: "Maker says",
      makerBadge: "Maker",
    },
    more: {
      views: "{count} views",
      upvotes: "{count} upvotes",
      likes: "{count} likes",
      comments: "{count} comments",
      followers: "{count} followers",
      members: "{count} members",
      createdAt: "Created: {date}",
      updatedAt: "Last updated: {date}",
      owner: "Owner",
      visitProfile: "View profile",
    },
    gallery: {
      prev: "Previous",
      next: "Next",
      close: "Close",
    },
    errors: {
      engagementFailed: "Action failed",
      cannotFollowOwnProject: "You cannot follow your own project",
    },
    notFound: {
      title: "Project not found",
      description: "The project you are looking for does not exist or has been removed.",
      back: "Back to projects",
    },
    technologies: "Technologies",
    tags: "Tags",
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
