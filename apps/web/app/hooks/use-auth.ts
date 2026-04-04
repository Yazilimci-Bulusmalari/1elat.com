import { useRouteLoaderData } from "react-router";

interface AuthUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export function useAuth(): { user: AuthUser | null; isAuthenticated: boolean } {
  const rootData = useRouteLoaderData("root") as { user: AuthUser | null } | undefined;
  return {
    user: rootData?.user ?? null,
    isAuthenticated: !!rootData?.user,
  };
}
