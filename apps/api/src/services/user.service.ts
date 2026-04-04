import { eq } from "drizzle-orm";
import { schema, type Database } from "@1elat/db";
import { generateId } from "../lib/id";

type UserRow = typeof schema.users.$inferSelect;

interface GitHubProfile {
  githubId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  githubUrl: string;
  login: string;
  bio: string | null;
  location: string | null;
}

interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  firstName: string;
  lastName: string;
}

function splitName(fullName: string, fallback: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] || fallback,
    lastName: parts.slice(1).join(" ") || "",
  };
}

export async function findOrCreateUserByGitHub(
  db: Database,
  profile: GitHubProfile
): Promise<{ user: UserRow; isNew: boolean }> {
  // 1. Try to find by githubId
  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.githubId, profile.githubId))
    .get();

  if (existing) {
    return { user: existing, isNew: false };
  }

  // 2. Try to find by email (link accounts)
  const byEmail = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, profile.email))
    .get();

  if (byEmail) {
    await db
      .update(schema.users)
      .set({
        githubId: profile.githubId,
        githubUrl: profile.githubUrl,
        avatarUrl: byEmail.avatarUrl || profile.avatarUrl,
      })
      .where(eq(schema.users.id, byEmail.id));

    const updated = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, byEmail.id))
      .get();

    return { user: updated!, isNew: false };
  }

  // 3. Create new user
  const { firstName, lastName } = splitName(profile.name, profile.login);
  const username = profile.login.toLowerCase().replace(/[^a-z0-9_-]/g, "-");

  const newUser = {
    id: generateId(),
    githubId: profile.githubId,
    googleId: null,
    email: profile.email,
    username,
    firstName,
    lastName,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    coverUrl: null,
    website: null,
    githubUrl: profile.githubUrl,
    linkedinUrl: null,
    twitterUrl: null,
    location: profile.location,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
  };

  await db.insert(schema.users).values(newUser);

  const created = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, newUser.id))
    .get();

  return { user: created!, isNew: true };
}

export async function findOrCreateUserByGoogle(
  db: Database,
  profile: GoogleProfile
): Promise<{ user: UserRow; isNew: boolean }> {
  // 1. Try to find by googleId
  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.googleId, profile.googleId))
    .get();

  if (existing) {
    return { user: existing, isNew: false };
  }

  // 2. Try to find by email (link accounts)
  const byEmail = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, profile.email))
    .get();

  if (byEmail) {
    await db
      .update(schema.users)
      .set({
        googleId: profile.googleId,
        avatarUrl: byEmail.avatarUrl || profile.avatarUrl,
      })
      .where(eq(schema.users.id, byEmail.id));

    const updated = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, byEmail.id))
      .get();

    return { user: updated!, isNew: false };
  }

  // 3. Create new user
  const username = profile.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_-]/g, "-");

  const newUser = {
    id: generateId(),
    githubId: null,
    googleId: profile.googleId,
    email: profile.email,
    username,
    firstName: profile.firstName,
    lastName: profile.lastName,
    bio: null,
    avatarUrl: profile.avatarUrl,
    coverUrl: null,
    website: null,
    githubUrl: null,
    linkedinUrl: null,
    twitterUrl: null,
    location: null,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
  };

  await db.insert(schema.users).values(newUser);

  const created = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, newUser.id))
    .get();

  return { user: created!, isNew: true };
}

export async function getUserById(
  db: Database,
  id: string
): Promise<UserRow | undefined> {
  return db.select().from(schema.users).where(eq(schema.users.id, id)).get();
}

export async function getUserByUsername(
  db: Database,
  username: string
): Promise<UserRow | undefined> {
  return db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username))
    .get();
}
