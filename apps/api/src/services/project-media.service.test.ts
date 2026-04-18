import { describe, it, expect, beforeEach, vi } from "vitest";
import { schema } from "@1elat/db";
import {
  uploadProjectImage,
  deleteProjectImage,
  reorderProjectImages,
  deleteProjectLogo,
  listProjectImages,
  type MediaDeps,
} from "./project-media.service";
import type { StorageService } from "./storage.service";
import {
  FileTooLargeError,
  ForbiddenError,
  MediaLimitExceededError,
  NotFoundError,
  UnsupportedMediaTypeError,
} from "../lib/errors";

/**
 * Fake storage: Map ile in-memory.
 */
function makeStorage(): StorageService & { _store: Map<string, ArrayBuffer> } {
  const store = new Map<string, ArrayBuffer>();
  return {
    _store: store,
    async upload(key, body) {
      store.set(key, body);
    },
    async delete(key) {
      store.delete(key);
    },
    async get(key) {
      const b = store.get(key);
      if (!b) return null;
      return { body: b, contentType: "image/png", size: b.byteLength };
    },
    getPublicUrl(key) {
      return `https://api.test.com/files/${key}`;
    },
    extractKeyFromUrl(url) {
      const p = "https://api.test.com/files/";
      return url.startsWith(p) ? url.slice(p.length) : null;
    },
  };
}

/**
 * Fake DB: project_images icin Array; projects icin tek row Map.
 * Drizzle chain'in subset'ini taklit eder.
 */
type ImageRow = {
  id: string;
  projectId: string;
  url: string;
  caption: string | null;
  sortOrder: number;
  createdAt: Date;
};
type ProjectRow = { id: string; thumbnailUrl: string | null };

function makeDb(opts: { images?: ImageRow[]; projects?: ProjectRow[] } = {}) {
  const images: ImageRow[] = opts.images ?? [];
  const projects: ProjectRow[] = opts.projects ?? [{ id: "p1", thumbnailUrl: null }];

  let currentMode: "projects" | "images" | "count_images" = "images";

  const chain: Record<string, unknown> = {};
  chain.from = (t: unknown) => {
    // count_images mode select() icinde set edilmis olabilir; from cagrisinda
    // hangi tablo oldugunu schema referansi ile karsilastir.
    if (t === schema.projects) {
      if (currentMode !== "count_images") currentMode = "projects";
    } else if (t === schema.projectImages) {
      if (currentMode !== "count_images") currentMode = "images";
    }
    return chain;
  };
  chain.where = () => chain;
  chain.orderBy = () => chain;
  chain.limit = () => chain;
  chain.offset = () => chain;

  chain.get = async () => {
    if (currentMode === "count_images") {
      currentMode = "images";
      return { value: images.length };
    }
    if (currentMode === "projects") {
      return projects[0];
    }
    return images[0];
  };
  chain.all = async () => {
    if (currentMode === "projects") return projects;
    return [...images];
  };

  const db = {
    _images: images,
    _projects: projects,
    select: (cols?: Record<string, unknown>) => {
      if (cols && "value" in cols) {
        currentMode = "count_images";
      }
      return chain;
    },
    insert: () => ({
      values: async (v: ImageRow | ImageRow[]) => {
        const rows = Array.isArray(v) ? v : [v];
        for (const r of rows) images.push(r);
      },
    }),
    update: () => ({
      set: (data: Partial<ProjectRow & ImageRow>) => ({
        where: async () => {
          if ("thumbnailUrl" in data) {
            for (const p of projects) p.thumbnailUrl = data.thumbnailUrl ?? null;
          }
          if ("sortOrder" in data && typeof data.sortOrder === "number") {
            // En son insert edilen row'u guncelle (test pratik amaclari icin
            // birden cok update'ten oncekini bul)
            // Bu mock'ta where parametresine erisemiyoruz; gercek dogruluk icin
            // her seferde tum image'lara sortOrder yazariz cunku sadece tek bir
            // call yapiliyor.
            for (const img of images) img.sortOrder = data.sortOrder;
          }
        },
      }),
    }),
    delete: () => ({
      where: async () => {
        // Tek imageId silmek icin: testte sonradan dogrularim.
        // Implementation: tum images'i bosaltmak yerine son sorgulanan id'yi sileriz.
        // Pratik: testte bu cagrildiktan sonra images'a bakacagiz.
        if (lastDeleteImageId) {
          const idx = images.findIndex((i) => i.id === lastDeleteImageId);
          if (idx >= 0) images.splice(idx, 1);
          lastDeleteImageId = null;
        }
      },
    }),
  };

  let lastDeleteImageId: string | null = null;
  // expose helper to set delete target
  (db as unknown as { _setDeleteTarget: (id: string) => void })._setDeleteTarget = (
    id: string
  ) => {
    lastDeleteImageId = id;
  };

  return db as unknown as MediaDeps["db"] & {
    _images: ImageRow[];
    _projects: ProjectRow[];
    _setDeleteTarget: (id: string) => void;
  };
}

function pngBuf(size = 100): ArrayBuffer {
  return new Uint8Array(size).buffer;
}

describe("uploadProjectImage - validation", () => {
  it("desteklenmeyen mime => UnsupportedMediaTypeError", async () => {
    const deps: MediaDeps = { db: makeDb(), storage: makeStorage() };
    await expect(
      uploadProjectImage(
        deps,
        "p1",
        { name: "x.svg", type: "image/svg+xml", size: 100, body: pngBuf() },
        { kind: "gallery" }
      )
    ).rejects.toBeInstanceOf(UnsupportedMediaTypeError);
  });

  it("buyuk dosya => FileTooLargeError", async () => {
    const deps: MediaDeps = { db: makeDb(), storage: makeStorage() };
    await expect(
      uploadProjectImage(
        deps,
        "p1",
        { name: "x.png", type: "image/png", size: 6 * 1024 * 1024, body: pngBuf(10) },
        { kind: "gallery" }
      )
    ).rejects.toBeInstanceOf(FileTooLargeError);
  });
});

describe("uploadProjectImage - gallery", () => {
  it("happy path: R2 upload + DB insert + url doner", async () => {
    const db = makeDb();
    const storage = makeStorage();
    const deps: MediaDeps = { db, storage };

    const result = await uploadProjectImage(
      deps,
      "p1",
      { name: "a.png", type: "image/png", size: 100, body: pngBuf() },
      { kind: "gallery", caption: "ilk" }
    );
    expect(result.kind).toBe("gallery");
    if (result.kind !== "gallery") return;
    expect(result.image.url).toMatch(/^https:\/\/api\.test\.com\/files\/projects\/p1\/images\//);
    expect(result.image.caption).toBe("ilk");
    expect(result.image.sortOrder).toBe(0);
    expect((db as unknown as { _images: unknown[] })._images).toHaveLength(1);
    expect(storage._store.size).toBe(1);
  });

  it("8 limit asilirsa MediaLimitExceededError, R2'ye yazmaz", async () => {
    const existing = Array.from({ length: 8 }, (_, i) => ({
      id: `img${i}`,
      projectId: "p1",
      url: `https://api.test.com/files/projects/p1/images/${i}.png`,
      caption: null,
      sortOrder: i,
      createdAt: new Date(),
    }));
    const db = makeDb({ images: existing });
    const storage = makeStorage();
    const deps: MediaDeps = { db, storage };

    await expect(
      uploadProjectImage(
        deps,
        "p1",
        { name: "x.png", type: "image/png", size: 100, body: pngBuf() },
        { kind: "gallery" }
      )
    ).rejects.toBeInstanceOf(MediaLimitExceededError);
    expect(storage._store.size).toBe(0);
  });

  it("DB insert fail => R2 nesnesi temizlenir (compensation)", async () => {
    const db = makeDb();
    const storage = makeStorage();
    // Insert fail simulasyonu
    (db as unknown as { insert: () => unknown }).insert = () => ({
      values: async () => {
        throw new Error("DB exploded");
      },
    });

    await expect(
      uploadProjectImage(
        { db, storage },
        "p1",
        { name: "a.png", type: "image/png", size: 100, body: pngBuf() },
        { kind: "gallery" }
      )
    ).rejects.toThrow("DB exploded");
    expect(storage._store.size).toBe(0);
  });
});

describe("uploadProjectImage - logo", () => {
  it("ilk logo: thumbnailUrl set", async () => {
    const db = makeDb({ projects: [{ id: "p1", thumbnailUrl: null }] });
    const storage = makeStorage();
    const result = await uploadProjectImage(
      { db, storage },
      "p1",
      { name: "logo.png", type: "image/png", size: 100, body: pngBuf() },
      { kind: "logo" }
    );
    expect(result.kind).toBe("logo");
    if (result.kind !== "logo") return;
    expect(result.thumbnailUrl).toMatch(/projects\/p1\/logo\//);
    expect(
      (db as unknown as { _projects: ProjectRow[] })._projects[0].thumbnailUrl
    ).toBe(result.thumbnailUrl);
  });

  it("eski logo varsa R2'den silinir", async () => {
    const oldKey = "projects/p1/logo/eski.png";
    const oldUrl = `https://api.test.com/files/${oldKey}`;
    const storage = makeStorage();
    storage._store.set(oldKey, pngBuf());
    const db = makeDb({ projects: [{ id: "p1", thumbnailUrl: oldUrl }] });

    await uploadProjectImage(
      { db, storage },
      "p1",
      { name: "yeni.png", type: "image/png", size: 100, body: pngBuf() },
      { kind: "logo" }
    );
    expect(storage._store.has(oldKey)).toBe(false);
    // Yeni nesne yerinde
    expect(storage._store.size).toBe(1);
  });

  it("proje yoksa NotFoundError", async () => {
    const db = makeDb({ projects: [] });
    const storage = makeStorage();
    await expect(
      uploadProjectImage(
        { db, storage },
        "p1",
        { name: "x.png", type: "image/png", size: 100, body: pngBuf() },
        { kind: "logo" }
      )
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("deleteProjectImage", () => {
  it("ait olmayan imageId => ForbiddenError", async () => {
    const db = makeDb({
      images: [
        {
          id: "img1",
          projectId: "OTHER_PROJECT",
          url: "https://api.test.com/files/projects/x/images/a.png",
          caption: null,
          sortOrder: 0,
          createdAt: new Date(),
        },
      ],
    });
    const storage = makeStorage();
    await expect(
      deleteProjectImage({ db, storage }, "p1", "img1")
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("happy path: DB'den ve R2'den silinir", async () => {
    const key = "projects/p1/images/abc.png";
    const storage = makeStorage();
    storage._store.set(key, pngBuf());
    const db = makeDb({
      images: [
        {
          id: "img1",
          projectId: "p1",
          url: `https://api.test.com/files/${key}`,
          caption: null,
          sortOrder: 0,
          createdAt: new Date(),
        },
      ],
    });
    db._setDeleteTarget("img1");
    await deleteProjectImage({ db, storage }, "p1", "img1");
    expect(storage._store.has(key)).toBe(false);
    expect(db._images).toHaveLength(0);
  });

  it("bulunamazsa NotFoundError", async () => {
    const db = makeDb({ images: [] });
    const storage = makeStorage();
    await expect(
      deleteProjectImage({ db, storage }, "p1", "yok")
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("reorderProjectImages", () => {
  it("baska projeye ait id varsa ForbiddenError", async () => {
    const db = makeDb({
      images: [
        {
          id: "img1",
          projectId: "p1",
          url: "u",
          caption: null,
          sortOrder: 0,
          createdAt: new Date(),
        },
      ],
    });
    await expect(
      reorderProjectImages({ db, storage: makeStorage() }, "p1", [
        { id: "img1", sortOrder: 0 },
        { id: "yabanci", sortOrder: 1 },
      ])
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("happy path: liste doner", async () => {
    const db = makeDb({
      images: [
        {
          id: "img1",
          projectId: "p1",
          url: "u1",
          caption: null,
          sortOrder: 0,
          createdAt: new Date(),
        },
        {
          id: "img2",
          projectId: "p1",
          url: "u2",
          caption: null,
          sortOrder: 1,
          createdAt: new Date(),
        },
      ],
    });
    const result = await reorderProjectImages({ db, storage: makeStorage() }, "p1", [
      { id: "img1", sortOrder: 1 },
      { id: "img2", sortOrder: 0 },
    ]);
    expect(result).toHaveLength(2);
  });
});

describe("deleteProjectLogo", () => {
  it("thumbnailUrl null olur ve R2'den silinir", async () => {
    const key = "projects/p1/logo/old.png";
    const storage = makeStorage();
    storage._store.set(key, pngBuf());
    const db = makeDb({
      projects: [{ id: "p1", thumbnailUrl: `https://api.test.com/files/${key}` }],
    });
    await deleteProjectLogo({ db, storage }, "p1");
    expect(db._projects[0].thumbnailUrl).toBeNull();
    expect(storage._store.has(key)).toBe(false);
  });

  it("proje yoksa NotFoundError", async () => {
    const db = makeDb({ projects: [] });
    await expect(
      deleteProjectLogo({ db, storage: makeStorage() }, "p1")
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("listProjectImages", () => {
  it("projeye ait gorseli sortOrder ile doner", async () => {
    const db = makeDb({
      images: [
        {
          id: "a",
          projectId: "p1",
          url: "u1",
          caption: null,
          sortOrder: 0,
          createdAt: new Date(),
        },
      ],
    });
    const list = await listProjectImages({ db, storage: makeStorage() }, "p1");
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe("a");
  });
});

// Suppress unused warning
void vi;
