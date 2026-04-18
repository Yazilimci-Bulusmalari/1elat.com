import { describe, it, expect, vi, beforeEach } from "vitest";
import { isEngaged, toggleEngagement } from "./engagement.service";
import type { EngagementKind } from "@1elat/shared";

/**
 * Engagement strategy testleri.
 * Toggle iki kez select yapar (varlik kontrolu + counter), arada insert ya da delete + counter update.
 */
function makeDb(opts: {
  existing: unknown; // 1. select sonucu (varsa toggle off)
  countAfter: number; // 2. select sonucu counter
}) {
  const queue: unknown[] = [opts.existing, { count: opts.countAfter }];
  const insertSpy = vi.fn().mockResolvedValue(undefined);
  const updateSpy = vi.fn().mockResolvedValue(undefined);
  const deleteSpy = vi.fn().mockResolvedValue(undefined);

  const chain: Record<string, unknown> = {};
  chain.from = () => chain;
  chain.where = () => chain;
  chain.get = () => Promise.resolve(queue.shift());
  chain.all = () => Promise.resolve([]);

  return {
    db: {
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
    },
    insertSpy,
    updateSpy,
    deleteSpy,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

const KINDS: EngagementKind[] = [
  "project_upvote",
  "project_like",
  "project_follow",
  "comment_like",
];

describe("toggleEngagement - 4 strategy", () => {
  for (const kind of KINDS) {
    describe(kind, () => {
      it("yoksa -> ekler, active=true, count artar", async () => {
        const { db, insertSpy, updateSpy, deleteSpy } = makeDb({
          existing: undefined,
          countAfter: 5,
        });
        const r = await toggleEngagement(db as never, kind, "parent-1", "u1");
        expect(r.active).toBe(true);
        expect(r.count).toBe(5);
        expect(insertSpy).toHaveBeenCalledTimes(1);
        expect(updateSpy).toHaveBeenCalledTimes(1);
        expect(deleteSpy).not.toHaveBeenCalled();
      });

      it("varsa -> siler, active=false, count duser", async () => {
        const { db, insertSpy, updateSpy, deleteSpy } = makeDb({
          existing: { id: "x" },
          countAfter: 4,
        });
        const r = await toggleEngagement(db as never, kind, "parent-1", "u1");
        expect(r.active).toBe(false);
        expect(r.count).toBe(4);
        expect(deleteSpy).toHaveBeenCalledTimes(1);
        expect(updateSpy).toHaveBeenCalledTimes(1);
        expect(insertSpy).not.toHaveBeenCalled();
      });
    });
  }
});

describe("isEngaged", () => {
  it("kayit varsa true", async () => {
    const { db } = makeDb({ existing: { id: "x" }, countAfter: 0 });
    const r = await isEngaged(db as never, "project_like", "p1", "u1");
    expect(r).toBe(true);
  });
  it("yoksa false", async () => {
    const { db } = makeDb({ existing: undefined, countAfter: 0 });
    const r = await isEngaged(db as never, "project_like", "p1", "u1");
    expect(r).toBe(false);
  });
});
