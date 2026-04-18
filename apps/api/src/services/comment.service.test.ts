import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ForbiddenError,
  NestingTooDeepError,
  NotFoundError,
} from "../lib/errors";
import {
  createComment,
  deleteComment,
  listComments,
  updateComment,
} from "./comment.service";

/**
 * Esnek query mock'u: select.from.innerJoin.where.orderBy.get/all + insert/update/delete chain.
 */
function makeDb(opts: {
  selectQueue: Array<unknown>; // get() ve all() icin sirayla
  insertSpy?: ReturnType<typeof vi.fn>;
  updateSpy?: ReturnType<typeof vi.fn>;
  deleteSpy?: ReturnType<typeof vi.fn>;
}) {
  const queue = [...opts.selectQueue];
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
  chain.all = () => Promise.resolve((queue.shift() as unknown[]) ?? []);

  return {
    select: () => chain,
    insert: () => ({
      values: (v: unknown) => {
        insertSpy(v);
        return Promise.resolve(undefined);
      },
    }),
    update: () => ({
      set: (data: Record<string, unknown>) => {
        updateSpy(data);
        return { where: () => Promise.resolve(undefined) };
      },
    }),
    delete: () => ({
      where: () => {
        deleteSpy();
        return Promise.resolve(undefined);
      },
    }),
    _spies: { insertSpy, updateSpy, deleteSpy },
  } as unknown as { select: () => unknown; _spies: typeof opts };
}

const AUTHOR = {
  id: "u1",
  username: "alice",
  firstName: "Alice",
  lastName: "X",
  avatarUrl: null,
};

const COMMENT_TOP = {
  id: "c1",
  projectId: "p1",
  authorId: "u1",
  parentId: null,
  content: "hi",
  likesCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const COMMENT_REPLY = {
  ...COMMENT_TOP,
  id: "c2",
  parentId: "c1",
  content: "reply",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("listComments", () => {
  it("top-level + replies hiyerarsisini kurar (1 derinlik)", async () => {
    const rows = [
      { comment: COMMENT_TOP, author: AUTHOR },
      { comment: COMMENT_REPLY, author: AUTHOR },
    ];
    const db = makeDb({ selectQueue: [rows] });
    const result = await listComments(db as never, "p1", { sort: "newest" });
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("c1");
    expect(result[0]!.replies).toHaveLength(1);
    expect(result[0]!.replies![0]!.id).toBe("c2");
  });

  it("viewerId verildiginde likedByViewer doldurulur", async () => {
    const rows = [{ comment: COMMENT_TOP, author: AUTHOR }];
    const liked = [{ commentId: "c1" }];
    const db = makeDb({ selectQueue: [rows, liked] });
    const result = await listComments(db as never, "p1", {
      sort: "mostLiked",
      viewerId: "u2",
    });
    expect(result[0]!.likedByViewer).toBe(true);
  });

  it("oldest sort calisir (sadece basarisiz olmamali)", async () => {
    const db = makeDb({ selectQueue: [[]] });
    const result = await listComments(db as never, "p1", { sort: "oldest" });
    expect(result).toEqual([]);
  });
});

describe("createComment", () => {
  it("project published+public ise top-level yorum olusur", async () => {
    const db = makeDb({
      selectQueue: [
        { status: "published", isPublic: true }, // project check
        { comment: COMMENT_TOP, author: AUTHOR }, // created select
      ],
    });
    const result = await createComment(db as never, "p1", "u1", { content: "hi" });
    expect(result.id).toBe("c1");
  });

  it("project draft ise 403", async () => {
    const db = makeDb({
      selectQueue: [{ status: "draft", isPublic: true }],
    });
    await expect(
      createComment(db as never, "p1", "u1", { content: "hi" })
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("project bulunamazsa 404", async () => {
    const db = makeDb({ selectQueue: [undefined] });
    await expect(
      createComment(db as never, "p1", "u1", { content: "hi" })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("parent zaten reply ise NestingTooDeepError", async () => {
    const db = makeDb({
      selectQueue: [
        { status: "published", isPublic: true },
        { id: "c2", parentId: "c1", projectId: "p1" }, // parent reply
      ],
    });
    await expect(
      createComment(db as never, "p1", "u1", { content: "x", parentId: "c2" })
    ).rejects.toBeInstanceOf(NestingTooDeepError);
  });

  it("parent farkli projedense 404", async () => {
    const db = makeDb({
      selectQueue: [
        { status: "published", isPublic: true },
        { id: "c1", parentId: null, projectId: "p2" },
      ],
    });
    await expect(
      createComment(db as never, "p1", "u1", { content: "x", parentId: "c1" })
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("updateComment", () => {
  it("sahip degil + admin degil -> 403", async () => {
    const db = makeDb({ selectQueue: [{ ...COMMENT_TOP, authorId: "other" }] });
    await expect(
      updateComment(db as never, "c1", "u1", false, "yeni")
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("sahip ise update gecer", async () => {
    const db = makeDb({
      selectQueue: [COMMENT_TOP, { comment: COMMENT_TOP, author: AUTHOR }],
    });
    const r = await updateComment(db as never, "c1", "u1", false, "yeni");
    expect(r.id).toBe("c1");
  });

  it("yok -> 404", async () => {
    const db = makeDb({ selectQueue: [undefined] });
    await expect(
      updateComment(db as never, "cX", "u1", false, "yeni")
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("deleteComment", () => {
  it("top-level silinir, reply sayisini sayar", async () => {
    const deleteSpy = vi.fn().mockResolvedValue(undefined);
    const updateSpy = vi.fn().mockResolvedValue(undefined);
    const db = makeDb({
      selectQueue: [COMMENT_TOP, { value: 3 }],
      deleteSpy,
      updateSpy,
    });
    await deleteComment(db as never, "c1", "u1", false);
    expect(deleteSpy).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();
  });

  it("baska kullanici 403", async () => {
    const db = makeDb({
      selectQueue: [{ ...COMMENT_TOP, authorId: "owner" }],
    });
    await expect(
      deleteComment(db as never, "c1", "u1", false)
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("admin baskasinin yorumunu silebilir", async () => {
    const deleteSpy = vi.fn().mockResolvedValue(undefined);
    const db = makeDb({
      selectQueue: [{ ...COMMENT_TOP, authorId: "owner" }, { value: 0 }],
      deleteSpy,
    });
    await deleteComment(db as never, "c1", "u-admin", true);
    expect(deleteSpy).toHaveBeenCalled();
  });

  it("yok -> 404", async () => {
    const db = makeDb({ selectQueue: [undefined] });
    await expect(
      deleteComment(db as never, "cX", "u1", false)
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
