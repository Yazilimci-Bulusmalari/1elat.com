export async function getAuthUser(
  request: Request,
  apiUrl: string,
): Promise<{
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
} | null> {
  const cookie = request.headers.get("cookie") || "";

  try {
    const res = await fetch(`${apiUrl}/auth/me`, {
      headers: { cookie },
    });

    if (!res.ok) return null;

    const json = (await res.json()) as
      | {
          data: {
            id: string;
            username: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
          };
          error: null;
        }
      | { data: null; error: unknown };

    return json.data;
  } catch {
    return null;
  }
}
