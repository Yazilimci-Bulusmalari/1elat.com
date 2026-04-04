import { describe, it, expect } from "vitest";
import { parsePaginationParams, buildPaginationResult } from "./pagination";

describe("parsePaginationParams", () => {
  it("defaults to limit 20 when no params given", () => {
    const result = parsePaginationParams({});
    expect(result.limit).toBe(20);
    expect(result.cursor).toBeUndefined();
  });

  it("respects custom limit", () => {
    const result = parsePaginationParams({ limit: "50" });
    expect(result.limit).toBe(50);
  });

  it("caps limit at 100", () => {
    const result = parsePaginationParams({ limit: "200" });
    expect(result.limit).toBe(100);
  });

  it("handles non-numeric limit by defaulting to 20", () => {
    const result = parsePaginationParams({ limit: "abc" });
    expect(result.limit).toBe(20);
  });

  it("handles zero limit by defaulting to 1 (minimum)", () => {
    const result = parsePaginationParams({ limit: "0" });
    expect(result.limit).toBe(20);
  });

  it("handles negative limit by setting to 1 (minimum)", () => {
    const result = parsePaginationParams({ limit: "-5" });
    expect(result.limit).toBe(1);
  });

  it("passes through cursor value", () => {
    const result = parsePaginationParams({ cursor: "abc123" });
    expect(result.cursor).toBe("abc123");
  });

  it("treats empty cursor as undefined", () => {
    const result = parsePaginationParams({ cursor: "" });
    expect(result.cursor).toBeUndefined();
  });
});

describe("buildPaginationResult", () => {
  it("returns hasMore false when items count equals limit", () => {
    const items = [
      { id: "1", name: "a" },
      { id: "2", name: "b" },
    ];
    const result = buildPaginationResult(items, 2);
    expect(result.hasMore).toBe(false);
    expect(result.data).toHaveLength(2);
  });

  it("returns hasMore false when items count is less than limit", () => {
    const items = [{ id: "1", name: "a" }];
    const result = buildPaginationResult(items, 5);
    expect(result.hasMore).toBe(false);
    expect(result.data).toHaveLength(1);
  });

  it("returns hasMore true and trims when items exceed limit", () => {
    const items = [
      { id: "1", name: "a" },
      { id: "2", name: "b" },
      { id: "3", name: "c" },
    ];
    const result = buildPaginationResult(items, 2);
    expect(result.hasMore).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data[1].id).toBe("2");
  });

  it("sets cursor to last item id", () => {
    const items = [
      { id: "aaa", name: "first" },
      { id: "bbb", name: "second" },
    ];
    const result = buildPaginationResult(items, 5);
    expect(result.cursor).toBe("bbb");
  });

  it("returns null cursor for empty array", () => {
    const result = buildPaginationResult([], 10);
    expect(result.cursor).toBeNull();
    expect(result.hasMore).toBe(false);
    expect(result.data).toHaveLength(0);
  });
});
