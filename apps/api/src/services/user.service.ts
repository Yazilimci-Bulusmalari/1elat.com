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

/**
 * Idempotent admin promotion. Login akislarinda her seferinde guvenle cagrilabilir.
 * SRP: yalnizca rol yukseltir; baska yan etki uretmez.
 */
export async function promoteIfAdmin(
  db: Database,
  user: UserRow,
  adminEmailsCsv: string | undefined
): Promise<UserRow> {
  if (!adminEmailsCsv) return user;

  const adminEmails = adminEmailsCsv
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.length === 0) return user;
  if (!adminEmails.includes(user.email.toLowerCase())) return user;
  if (user.role === "admin") return user;

  await db
    .update(schema.users)
    .set({ role: "admin", updatedAt: new Date() })
    .where(eq(schema.users.id, user.id));

  return { ...user, role: "admin" };
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

export async function updateUser(
  db: Database,
  userId: string,
  data: Partial<{
    username: string;
    firstName: string;
    lastName: string;
    bio: string | null;
    avatarUrl: string | null;
    website: string | null;
    githubUrl: string | null;
    linkedinUrl: string | null;
    twitterUrl: string | null;
    location: string | null;
    isPublic: boolean;
  }>
): Promise<UserRow | undefined> {
  await db
    .update(schema.users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.users.id, userId));

  return getUserById(db, userId);
}

/**
 * Son giris zamani guncelleme - throttled (5dk debounce).
 * SRP: yalnizca lastLoginAt damgasini gunceller.
 * DB write spam'ini onlemek icin onceki damga ile farki >=5dk olmali.
 */
const TOUCH_LAST_LOGIN_THROTTLE_MS = 5 * 60 * 1000;

export async function touchLastLogin(
  db: Database,
  userId: string,
  now: Date = new Date()
): Promise<void> {
  const user = await db
    .select({ lastLoginAt: schema.users.lastLoginAt })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .get();

  if (!user) return;

  const last = user.lastLoginAt;
  if (last && now.getTime() - last.getTime() < TOUCH_LAST_LOGIN_THROTTLE_MS) {
    return;
  }

  await db
    .update(schema.users)
    .set({ lastLoginAt: now })
    .where(eq(schema.users.id, userId));
}

export async function isUsernameTaken(
  db: Database,
  username: string,
  excludeUserId: string
): Promise<boolean> {
  const existing = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.username, username))
    .get();

  return !!existing && existing.id !== excludeUserId;
}
