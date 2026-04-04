import { describe, it, expect } from "vitest";
import { createUserSchema, updateUserSchema } from "./user";

const validUser = {
  email: "test@example.com",
  username: "john_doe",
  firstName: "John",
  lastName: "Doe",
  professionIds: ["prof-1"],
  primaryProfessionId: "prof-1",
};

describe("createUserSchema", () => {
  it("accepts valid input", () => {
    const result = createUserSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it("accepts valid input with all optional fields", () => {
    const result = createUserSchema.safeParse({
      ...validUser,
      bio: "Hello world",
      avatarUrl: "https://example.com/avatar.png",
      website: "https://example.com",
      githubUrl: "https://github.com/johndoe",
      linkedinUrl: "https://linkedin.com/in/johndoe",
      twitterUrl: "https://twitter.com/johndoe",
      location: "Istanbul, Turkey",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = createUserSchema.safeParse({ ...validUser, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects short username (less than 3 chars)", () => {
    const result = createUserSchema.safeParse({ ...validUser, username: "ab" });
    expect(result.success).toBe(false);
  });

  it("rejects username with invalid characters", () => {
    const result = createUserSchema.safeParse({ ...validUser, username: "John Doe!" });
    expect(result.success).toBe(false);
  });

  it("rejects uppercase username", () => {
    const result = createUserSchema.safeParse({ ...validUser, username: "JohnDoe" });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = createUserSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects missing email", () => {
    const { email, ...noEmail } = validUser;
    const result = createUserSchema.safeParse(noEmail);
    expect(result.success).toBe(false);
  });

  it("rejects missing username", () => {
    const { username, ...noUsername } = validUser;
    const result = createUserSchema.safeParse(noUsername);
    expect(result.success).toBe(false);
  });

  it("requires professionIds with at least 1 item", () => {
    const result = createUserSchema.safeParse({ ...validUser, professionIds: [] });
    expect(result.success).toBe(false);
  });

  it("rejects professionIds with more than 5 items", () => {
    const result = createUserSchema.safeParse({
      ...validUser,
      professionIds: ["a", "b", "c", "d", "e", "f"],
    });
    expect(result.success).toBe(false);
  });

  it("accepts professionIds with exactly 5 items", () => {
    const result = createUserSchema.safeParse({
      ...validUser,
      professionIds: ["a", "b", "c", "d", "e"],
    });
    expect(result.success).toBe(true);
  });
});

describe("updateUserSchema", () => {
  it("accepts partial updates", () => {
    const result = updateUserSchema.safeParse({ firstName: "Jane" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object (all fields optional)", () => {
    const result = updateUserSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("does not allow email field", () => {
    const result = updateUserSchema.safeParse({ email: "new@example.com" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("email");
    }
  });
});
