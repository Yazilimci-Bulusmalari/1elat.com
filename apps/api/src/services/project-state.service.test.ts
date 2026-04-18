import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  canTransition,
  publishProject,
  unpublishProject,
  archiveProject,
  restoreProject,
} from "./project-state.service";
import { ProjectValidationError, ConflictError } from "../lib/errors";

vi.mock("./project.service", () => ({
  getById: vi.fn(),
}));

import { getById } from "./project.service";

describe("canTransition", () => {
  it("draft -> published izinli", () => {
    expect(canTransition("draft", "published")).toBe(true);
  });
  it("draft -> archived izinli degil", () => {
    expect(canTransition("draft", "archived")).toBe(false);
  });
  it("published -> draft izinli", () => {
    expect(canTransition("published", "draft")).toBe(true);
  });
  it("published -> archived izinli", () => {
    expect(canTransition("published", "archived")).toBe(true);
  });
  it("archived -> published izinli", () => {
    expect(canTransition("archived", "published")).toBe(true);
  });
  it("archived -> draft izinli degil", () => {
    expect(canTransition("archived", "draft")).toBe(false);
  });
  it("ayni statuye gecis izinli degil", () => {
    expect(canTransition("draft", "draft")).toBe(false);
  });
});

/**
 * Drizzle chain mock: select->from->where->get; update->set->where (await edilebilir).
 */
function mockDb(opts: {
  row: Record<string, unknown> | undefined;
  updateSpy?: ReturnType<typeof vi.fn>;
}) {
  const updateSpy = opts.updateSpy ?? vi.fn().mockResolvedValue(undefined);
  return {
    select: () => ({
      from: () => ({
        where: () => ({ get: () => Promise.resolve(opts.row) }),
      }),
    }),
    update: () => ({
      set: (data: Record<string, unknown>) => {
        updateSpy(data);
        return { where: () => Promise.resolve(undefined) };
      },
    }),
  } as never;
}

const COMPLETE_DRAFT = {
  id: "p1",
  ownerId: "u1",
  status: "draft",
  name: "App",
  tagline: "Tagline",
  description: "x".repeat(120),
  categoryId: "c1",
  typeId: "t1",
  stageId: "s1",
  websiteUrl: "https://example.com",
  repoUrl: null,
  demoUrl: null,
  launchedAt: null,
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("publishProject", () => {
  it("zorunlu alanlar tamamsa published olur ve launchedAt set", async () => {
    const updateSpy = vi.fn().mockResolvedValue(undefined);
    const db = mockDb({ row: COMPLETE_DRAFT, updateSpy });
    vi.mocked(getById).mockResolvedValueOnce({
      ...COMPLETE_DRAFT,
      status: "published",
      launchedAt: new Date(),
    } as never);

    const result = await publishProject(db, "p1");
    expect(result.status).toBe("published");
    const setArg = updateSpy.mock.calls[0][0];
    expect(setArg.status).toBe("published");
    expect(setArg.launchedAt).toBeInstanceOf(Date);
  });

  it("eksik alanlar varsa ProjectValidationError firlatir ve missingFields tasir", async () => {
    const incomplete = { ...COMPLETE_DRAFT, tagline: null, description: null };
    const db = mockDb({ row: incomplete });
    await expect(publishProject(db, "p1")).rejects.toBeInstanceOf(
      ProjectValidationError
    );
    try {
      await publishProject(db, "p1");
    } catch (e) {
      const err = e as ProjectValidationError;
      expect(err.missingFields).toEqual(
        expect.arrayContaining(["tagline", "description"])
      );
    }
  });

  it("hicbir link yoksa ProjectValidationError firlatir", async () => {
    const noLinks = {
      ...COMPLETE_DRAFT,
      websiteUrl: null,
      repoUrl: null,
      demoUrl: null,
    };
    const db = mockDb({ row: noLinks });
    await expect(publishProject(db, "p1")).rejects.toBeInstanceOf(
      ProjectValidationError
    );
  });

  it("zaten published proje icin ConflictError (gecersiz gecis)", async () => {
    const published = { ...COMPLETE_DRAFT, status: "published" };
    const db = mockDb({ row: published });
    await expect(publishProject(db, "p1")).rejects.toBeInstanceOf(ConflictError);
  });

  it("republish: launchedAt zaten varsa korunur (set'e launchedAt yazilmaz)", async () => {
    const archivedRow = {
      ...COMPLETE_DRAFT,
      status: "archived",
      launchedAt: new Date("2026-01-01"),
    };
    const updateSpy = vi.fn().mockResolvedValue(undefined);
    const db = mockDb({ row: archivedRow, updateSpy });
    vi.mocked(getById).mockResolvedValueOnce({
      ...archivedRow,
      status: "published",
    } as never);

    await publishProject(db, "p1");
    const setArg = updateSpy.mock.calls[0][0];
    expect(setArg.status).toBe("published");
    expect(setArg.launchedAt).toBeUndefined();
  });
});

describe("unpublishProject", () => {
  it("published -> draft, launchedAt'a dokunmaz", async () => {
    const row = {
      ...COMPLETE_DRAFT,
      status: "published",
      launchedAt: new Date("2026-01-01"),
    };
    const updateSpy = vi.fn().mockResolvedValue(undefined);
    const db = mockDb({ row, updateSpy });
    vi.mocked(getById).mockResolvedValueOnce({
      ...row,
      status: "draft",
    } as never);

    await unpublishProject(db, "p1");
    const setArg = updateSpy.mock.calls[0][0];
    expect(setArg.status).toBe("draft");
    expect(setArg).not.toHaveProperty("launchedAt");
  });

  it("draft proje icin ConflictError", async () => {
    const db = mockDb({ row: COMPLETE_DRAFT });
    await expect(unpublishProject(db, "p1")).rejects.toBeInstanceOf(ConflictError);
  });
});

describe("archiveProject", () => {
  it("published -> archived", async () => {
    const row = { ...COMPLETE_DRAFT, status: "published" };
    const updateSpy = vi.fn().mockResolvedValue(undefined);
    const db = mockDb({ row, updateSpy });
    vi.mocked(getById).mockResolvedValueOnce({
      ...row,
      status: "archived",
    } as never);
    await archiveProject(db, "p1");
    expect(updateSpy.mock.calls[0][0].status).toBe("archived");
  });

  it("draft proje arsivlenemez (ConflictError)", async () => {
    const db = mockDb({ row: COMPLETE_DRAFT });
    await expect(archiveProject(db, "p1")).rejects.toBeInstanceOf(ConflictError);
  });
});

describe("restoreProject", () => {
  it("archived -> published", async () => {
    const row = {
      ...COMPLETE_DRAFT,
      status: "archived",
      launchedAt: new Date("2026-01-01"),
    };
    const updateSpy = vi.fn().mockResolvedValue(undefined);
    const db = mockDb({ row, updateSpy });
    vi.mocked(getById).mockResolvedValueOnce({
      ...row,
      status: "published",
    } as never);
    await restoreProject(db, "p1");
    expect(updateSpy.mock.calls[0][0].status).toBe("published");
  });
});
