import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConflictError, NotFoundError } from "../lib/errors";

vi.mock("./slug.service", () => ({
  generateSlug: vi.fn((s: string) => s.toLowerCase().replace(/\s+/g, "-")),
  ensureUniqueSlug: vi.fn(async (_db, _o, base: string) => base),
}));

import {
  createDraft,
  deleteProject,
  updateProject,
  getBySlug,
} from "./project.service";
import { generateSlug, ensureUniqueSlug } from "./slug.service";

beforeEach(() => {
  vi.clearAllMocks();
});

/**
 * Esnek mock: select chain'in farkli derinliklerini destekler.
 * select->from->where->get veya select->from->innerJoin->where->orderBy...
 */
function makeQueueDb(opts: {
  selectGetQueue: Array<unknown>;
  insertSpy?: ReturnType<typeof vi.fn>;
  updateSpy?: ReturnType<typeof vi.fn>;
  deleteSpy?: ReturnType<typeof vi.fn>;
}) {
  const queue = [...opts.selectGetQueue];
  const insertSpy = opts.insertSpy ?? vi.fn().mockResolvedValue(undefined);
  const updateSpy = opts.updateSpy ?? vi.fn().mockResolvedValue(undefined);
  const deleteSpy = opts.deleteSpy ?? vi.fn().mockResolvedValue(undefined);

  const chain: Record<string, unknown> = {};
  chain.from = () => chain;
  chain.where = () => chain;
  chain.innerJoin = () => chain;
  chain.orderBy = () => chain;
  chain.limit = () => chain;
  chain.offset = () => chain;
  chain.get = () => Promise.resolve(queue.shift());
  chain.all = () => Promise.resolve(queue.shift() ?? []);

  return {
    select: () => chain,
    insert: () => ({ values: (v: unknown) => { insertSpy(v); return Promise.resolve(undefined); } }),
    update: () => ({
      set: (data: Record<string, unknown>) => {
        updateSpy(data);
        return { where: () => Promise.resolve(undefined) };
      },
    }),
    delete: () => ({ where: () => { deleteSpy(); return Promise.resolve(undefined); } }),
    _spies: { insertSpy, updateSpy, deleteSpy },
  } as unknown as { select: () => unknown; _spies: typeof opts };
}

const ROW = {
  id: "p1",
  ownerId: "u1",
  slug: "todo-app",
  name: "Todo App",
  tagline: null,
  description: null,
  launchStory: null,
  categoryId: null,
  typeId: null,
  stageId: null,
  websiteUrl: null,
  repoUrl: null,
  demoUrl: null,
  thumbnailUrl: null,
  pricingModel: null,
  status: "draft",
  isPublic: true,
  isOpenSource: false,
  isSeekingInvestment: false,
  isSeekingTeammates: false,
  likesCount: 0,
  upvotesCount: 0,
  viewsCount: 0,
  commentsCount: 0,
  startDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  launchedAt: null,
};

describe("createDraft", () => {
  it("slug uretir ve insert eder, donus Project sekli", async () => {
    const insertSpy = vi.fn().mockResolvedValue(undefined);
    const db = makeQueueDb({ selectGetQueue: [ROW], insertSpy });
    const result = await createDraft(db as never, "u1", "Todo App");
    expect(generateSlug).toHaveBeenCalledWith("Todo App");
    expect(ensureUniqueSlug).toHaveBeenCalled();
    expect(insertSpy).toHaveBeenCalled();
    expect(result.status).toBe("draft");
    expect(result.slug).toBe("todo-app");
  });

  it("create sonrasi row bulunamazsa hata firlatir", async () => {
    const db = makeQueueDb({ selectGetQueue: [undefined] });
    await expect(createDraft(db as never, "u1", "X")).rejects.toThrow();
  });
});

describe("updateProject", () => {
  it("yayinda slug degisimi reddedilir (ConflictError)", async () => {
    const published = { ...ROW, status: "published" };
    const db = makeQueueDb({ selectGetQueue: [published] });
    await expect(
      updateProject(db as never, "p1", { slug: "new-slug" })
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("draft'ta slug degisimi gecer", async () => {
    const db = makeQueueDb({
      // 1) load existing, 2) getById -> select, 3) loadTags, 4) loadTechnologyIds
      selectGetQueue: [ROW, { ...ROW, slug: "yeni-slug" }, [], []],
    });
    const result = await updateProject(db as never, "p1", { slug: "yeni-slug" });
    expect(result.slug).toBe("yeni-slug");
  });

  it("var olmayan proje icin NotFoundError", async () => {
    const db = makeQueueDb({ selectGetQueue: [undefined] });
    await expect(
      updateProject(db as never, "p1", { name: "X" })
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("deleteProject", () => {
  it("draft silinir", async () => {
    const deleteSpy = vi.fn().mockResolvedValue(undefined);
    const db = makeQueueDb({
      selectGetQueue: [{ status: "draft" }],
      deleteSpy,
    });
    await deleteProject(db as never, "p1");
    expect(deleteSpy).toHaveBeenCalled();
  });

  it("published proje silinemez (ConflictError)", async () => {
    const db = makeQueueDb({ selectGetQueue: [{ status: "published" }] });
    await expect(deleteProject(db as never, "p1")).rejects.toBeInstanceOf(
      ConflictError
    );
  });

  it("var olmayan proje icin NotFoundError", async () => {
    const db = makeQueueDb({ selectGetQueue: [undefined] });
    await expect(deleteProject(db as never, "p1")).rejects.toBeInstanceOf(
      NotFoundError
    );
  });
});

describe("getBySlug visibility", () => {
  it("baskasi draft projeyi goremez", async () => {
    const owner = { id: "u1", username: "alice" };
    const db = makeQueueDb({ selectGetQueue: [owner, ROW] });
    const result = await getBySlug(db as never, "alice", "todo-app", "stranger");
    expect(result).toBeNull();
  });

  it("owner kendi draft'ini gorur", async () => {
    const owner = { id: "u1", username: "alice" };
    const db = makeQueueDb({ selectGetQueue: [owner, ROW, [], []] });
    const result = await getBySlug(db as never, "alice", "todo-app", "u1");
    expect(result?.status).toBe("draft");
  });

  it("baskasi published projeyi gorur", async () => {
    const owner = { id: "u1", username: "alice" };
    const published = { ...ROW, status: "published" };
    const db = makeQueueDb({ selectGetQueue: [owner, published, [], []] });
    const result = await getBySlug(db as never, "alice", "todo-app", "stranger");
    expect(result?.status).toBe("published");
  });

  it("baskasi published ama isPublic=false ise goremez", async () => {
    const owner = { id: "u1", username: "alice" };
    const priv = { ...ROW, status: "published", isPublic: false };
    const db = makeQueueDb({ selectGetQueue: [owner, priv] });
    const result = await getBySlug(db as never, "alice", "todo-app", "stranger");
    expect(result).toBeNull();
  });

  it("kullanici yoksa null", async () => {
    const db = makeQueueDb({ selectGetQueue: [undefined] });
    const result = await getBySlug(db as never, "ghost", "x", "viewer");
    expect(result).toBeNull();
  });
});
