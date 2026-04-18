import { describe, it, expect } from "vitest";
import { generateSlug, ensureUniqueSlug } from "./slug.service";

describe("generateSlug", () => {
  it("Turkce karakterleri donusturur", () => {
    expect(generateSlug("Çiğdem Şahin")).toBe("cigdem-sahin");
    expect(generateSlug("İstanbul Öğrenci")).toBe("istanbul-ogrenci");
    expect(generateSlug("ÜRÜN")).toBe("urun");
  });

  it("lowercase yapar", () => {
    expect(generateSlug("Hello World")).toBe("hello-world");
  });

  it("non-alphanumeric karakterleri tireye cevirir", () => {
    expect(generateSlug("foo!@#$bar")).toBe("foo-bar");
  });

  it("coklu tireyi tek tireye indirir", () => {
    expect(generateSlug("foo --- bar")).toBe("foo-bar");
  });

  it("bastaki ve sondaki tireyi kirpar", () => {
    expect(generateSlug("---foo---")).toBe("foo");
  });

  it("bos input icin fallback kullanir", () => {
    expect(generateSlug("!!!")).toBe("proje");
    expect(generateSlug("")).toBe("proje");
  });

  it("rakamlari korur", () => {
    expect(generateSlug("Project 2026")).toBe("project-2026");
  });
});

/**
 * In-process drizzle chain mock: select().from().where().all()
 */
function fakeDbWithSlugs(slugs: string[]) {
  const rows = slugs.map((slug) => ({ slug }));
  const chain = {
    from: () => chain,
    where: () => chain,
    all: () => Promise.resolve(rows),
  };
  return { select: () => chain } as never;
}

describe("ensureUniqueSlug", () => {
  it("slug bos ise base slug doner", async () => {
    const db = fakeDbWithSlugs([]);
    const result = await ensureUniqueSlug(db, "owner-1", "todo-app");
    expect(result).toBe("todo-app");
  });

  it("ayni slug varsa -2 ekler", async () => {
    const db = fakeDbWithSlugs(["todo-app"]);
    const result = await ensureUniqueSlug(db, "owner-1", "todo-app");
    expect(result).toBe("todo-app-2");
  });

  it("birden fazla cakisma varsa siradaki sayiyi bulur", async () => {
    const db = fakeDbWithSlugs(["todo-app", "todo-app-2", "todo-app-3"]);
    const result = await ensureUniqueSlug(db, "owner-1", "todo-app");
    expect(result).toBe("todo-app-4");
  });

  it("aralarda bosluk olsa bile siradan ilk bos sayiyi bulur", async () => {
    const db = fakeDbWithSlugs(["todo-app", "todo-app-3"]);
    const result = await ensureUniqueSlug(db, "owner-1", "todo-app");
    expect(result).toBe("todo-app-2");
  });
});
