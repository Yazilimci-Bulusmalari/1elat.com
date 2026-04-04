import { describe, it, expect } from "vitest";
import { createCommentSchema, updateCommentSchema } from "./comment";

describe("createCommentSchema", () => {
  it("accepts valid content", () => {
    const result = createCommentSchema.safeParse({ content: "This is a comment" });
    expect(result.success).toBe(true);
  });

  it("accepts content with optional parentId", () => {
    const result = createCommentSchema.safeParse({
      content: "A reply",
      parentId: "parent-123",
    });
    expect(result.success).toBe(true);
  });

  it("accepts content without parentId", () => {
    const result = createCommentSchema.safeParse({ content: "Top-level comment" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.parentId).toBeUndefined();
    }
  });

  it("rejects empty content", () => {
    const result = createCommentSchema.safeParse({ content: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing content", () => {
    const result = createCommentSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects content longer than 5000 chars", () => {
    const result = createCommentSchema.safeParse({ content: "a".repeat(5001) });
    expect(result.success).toBe(false);
  });

  it("accepts content at exactly 5000 chars", () => {
    const result = createCommentSchema.safeParse({ content: "a".repeat(5000) });
    expect(result.success).toBe(true);
  });
});

describe("updateCommentSchema", () => {
  it("accepts valid content", () => {
    const result = updateCommentSchema.safeParse({ content: "Updated comment" });
    expect(result.success).toBe(true);
  });

  it("rejects empty content", () => {
    const result = updateCommentSchema.safeParse({ content: "" });
    expect(result.success).toBe(false);
  });

  it("rejects content longer than 5000 chars", () => {
    const result = updateCommentSchema.safeParse({ content: "a".repeat(5001) });
    expect(result.success).toBe(false);
  });
});
