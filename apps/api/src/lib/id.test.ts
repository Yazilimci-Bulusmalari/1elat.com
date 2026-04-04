import { describe, it, expect } from "vitest";
import { generateId } from "./id";

describe("generateId", () => {
  it("returns a string of length 21", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id).toHaveLength(21);
  });

  it("returns unique values on multiple calls", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });

  it("returns URL-safe characters only", () => {
    const id = generateId();
    // nanoid default alphabet: A-Za-z0-9_-
    expect(id).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});
