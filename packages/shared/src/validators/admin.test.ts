import { describe, it, expect } from "vitest";
import {
  updateAdminUserSchema,
  listAdminUsersQuerySchema,
  createSkillSchema,
  updateSkillSchema,
} from "./admin";

describe("createSkillSchema", () => {
  it("accepts valid input", () => {
    const result = createSkillSchema.safeParse({
      slug: "frontend",
      nameEn: "Frontend",
      nameTr: "Frontend",
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional fields", () => {
    const result = createSkillSchema.safeParse({
      slug: "backend",
      nameEn: "Backend",
      nameTr: "Backend",
      icon: "server",
      parentId: "parent-1",
      sortOrder: 5,
    });
    expect(result.success).toBe(true);
  });

  it("rejects slug with uppercase", () => {
    const result = createSkillSchema.safeParse({
      slug: "Frontend",
      nameEn: "Frontend",
      nameTr: "Frontend",
    });
    expect(result.success).toBe(false);
  });

  it("rejects slug with spaces", () => {
    const result = createSkillSchema.safeParse({
      slug: "front end",
      nameEn: "Frontend",
      nameTr: "Frontend",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short slug", () => {
    const result = createSkillSchema.safeParse({
      slug: "a",
      nameEn: "A",
      nameTr: "A",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = createSkillSchema.safeParse({ slug: "test" });
    expect(result.success).toBe(false);
  });
});

describe("updateSkillSchema", () => {
  it("accepts partial update", () => {
    const result = updateSkillSchema.safeParse({ nameEn: "Updated" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = updateSkillSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
