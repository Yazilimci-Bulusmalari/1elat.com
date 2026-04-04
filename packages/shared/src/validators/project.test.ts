import { describe, it, expect } from "vitest";
import { createProjectSchema, updateProjectSchema } from "./project";

const validProject = {
  name: "My Project",
  categoryId: "cat-1",
  typeId: "type-1",
  stageId: "stage-1",
};

describe("createProjectSchema", () => {
  it("accepts valid input with required fields only", () => {
    const result = createProjectSchema.safeParse(validProject);
    expect(result.success).toBe(true);
  });

  it("accepts valid input with all optional fields", () => {
    const result = createProjectSchema.safeParse({
      ...validProject,
      tagline: "A short tagline",
      description: "A longer description of the project",
      websiteUrl: "https://example.com",
      repoUrl: "https://github.com/example/repo",
      demoUrl: "https://demo.example.com",
      isPublic: false,
      isOpenSource: true,
      isSeekingInvestment: true,
      isSeekingTeammates: true,
      technologyIds: ["tech-1", "tech-2"],
      startDate: "2025-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createProjectSchema.safeParse({ ...validProject, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects tagline longer than 120 chars", () => {
    const result = createProjectSchema.safeParse({
      ...validProject,
      tagline: "a".repeat(121),
    });
    expect(result.success).toBe(false);
  });

  it("accepts tagline at exactly 120 chars", () => {
    const result = createProjectSchema.safeParse({
      ...validProject,
      tagline: "a".repeat(120),
    });
    expect(result.success).toBe(true);
  });

  it("rejects description longer than 10000 chars", () => {
    const result = createProjectSchema.safeParse({
      ...validProject,
      description: "a".repeat(10001),
    });
    expect(result.success).toBe(false);
  });

  it("accepts description at exactly 10000 chars", () => {
    const result = createProjectSchema.safeParse({
      ...validProject,
      description: "a".repeat(10000),
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty string for optional URL fields", () => {
    const result = createProjectSchema.safeParse({
      ...validProject,
      websiteUrl: "",
      repoUrl: "",
      demoUrl: "",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid URLs for optional URL fields", () => {
    const result = createProjectSchema.safeParse({
      ...validProject,
      websiteUrl: "https://example.com",
      repoUrl: "https://github.com/repo",
      demoUrl: "https://demo.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid URLs", () => {
    const result = createProjectSchema.safeParse({
      ...validProject,
      websiteUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("rejects technologyIds with more than 20 items", () => {
    const result = createProjectSchema.safeParse({
      ...validProject,
      technologyIds: Array.from({ length: 21 }, (_, i) => `tech-${i}`),
    });
    expect(result.success).toBe(false);
  });

  it("accepts technologyIds with exactly 20 items", () => {
    const result = createProjectSchema.safeParse({
      ...validProject,
      technologyIds: Array.from({ length: 20 }, (_, i) => `tech-${i}`),
    });
    expect(result.success).toBe(true);
  });
});

describe("updateProjectSchema", () => {
  it("accepts partial updates", () => {
    const result = updateProjectSchema.safeParse({ name: "Updated Name" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = updateProjectSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
