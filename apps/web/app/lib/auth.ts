import type { UserRole, Skill } from "@1elat/shared";

export interface AuthUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  website: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  location: string | null;
  githubId: string | null;
  googleId: string | null;
  isPublic: boolean;
  isOpenToWork: boolean;
  role: UserRole;
  skills: Skill[];
}

export async function getAuthUser(
  request: Request,
  apiUrl: string,
): Promise<AuthUser | null> {
  const cookie = request.headers.get("cookie") || "";

  try {
    const res = await fetch(`${apiUrl}/auth/me`, {
      headers: { cookie },
    });

    if (!res.ok) return null;

    const json = (await res.json()) as
      | { data: AuthUser; error: null }
      | { data: null; error: unknown };

    return json.data;
  } catch {
    return null;
  }
}
