import { describe, it, expect, vi } from "vitest";
import { getAdminStats } from "./admin-stats.service";

/**
 * In-process fake DB. Drizzle'in select().from(...).where(...).get() chain'ini
 * taklit eder ve sirayla 6 sayim deger doner.
 */
function fakeDb(values: number[]) {
  let i = 0;
  const next = () => {
    const v = values[i] ?? 0;
    i += 1;
    return Promise.resolve({ value: v });
  };
  const chain = {
    from: () => chain,
    where: () => chain,
    get: () => next(),
  } as unknown as { select: () => unknown };
  const db = {
    select: () => chain,
  };
  return db as unknown as Parameters<typeof getAdminStats>[0];
}

describe("getAdminStats", () => {
  it("6 alan doner ve sayilari sirayla map'ler", async () => {
    const db = fakeDb([10, 20, 2, 5, 8, 7]);
    const stats = await getAdminStats(db);
    expect(stats).toEqual({
      totalUsers: 10,
      totalProjects: 20,
      totalAdmins: 2,
      signupsLast7Days: 5,
      signupsLast30Days: 8,
      projectsLast7Days: 7,
    });
  });

  it("tum sayilar non-negatif", async () => {
    const db = fakeDb([0, 0, 0, 0, 0, 0]);
    const stats = await getAdminStats(db);
    Object.values(stats).forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
    });
  });

  it("undefined sayim icin 0 fallback uygular", async () => {
    const db = {
      select: () => ({
        from: () => ({
          where: () => ({ get: () => Promise.resolve(undefined) }),
          get: () => Promise.resolve(undefined),
        }),
      }),
    } as unknown as Parameters<typeof getAdminStats>[0];

    const stats = await getAdminStats(db);
    expect(stats.totalUsers).toBe(0);
    expect(stats.totalProjects).toBe(0);
    expect(stats.totalAdmins).toBe(0);
  });
});

describe("promoteIfAdmin", () => {
  it("ADMIN_EMAILS yoksa user degismez", async () => {
    const { promoteIfAdmin } = await import("./user.service");
    const db = { update: vi.fn() } as never;
    const user = { id: "1", email: "a@x.com", role: "user" } as never;
    const result = await promoteIfAdmin(db, user, undefined);
    expect(result.role).toBe("user");
  });

  it("email listede degilse user degismez", async () => {
    const { promoteIfAdmin } = await import("./user.service");
    const db = { update: vi.fn() } as never;
    const user = { id: "1", email: "a@x.com", role: "user" } as never;
    const result = await promoteIfAdmin(db, user, "other@x.com");
    expect(result.role).toBe("user");
  });

  it("zaten admin ise UPDATE atlanir (idempotent)", async () => {
    const { promoteIfAdmin } = await import("./user.service");
    const updateSpy = vi.fn();
    const db = { update: updateSpy } as never;
    const user = { id: "1", email: "a@x.com", role: "admin" } as never;
    const result = await promoteIfAdmin(db, user, "a@x.com");
    expect(result.role).toBe("admin");
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("email eslesirse ve user ise admin'e yukseltir", async () => {
    const { promoteIfAdmin } = await import("./user.service");
    const setMock = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
    const db = { update: vi.fn().mockReturnValue({ set: setMock }) } as never;
    const user = { id: "1", email: "A@x.com", role: "user" } as never;
    const result = await promoteIfAdmin(db, user, "a@x.com,b@x.com");
    expect(result.role).toBe("admin");
    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({ role: "admin" })
    );
  });
});
