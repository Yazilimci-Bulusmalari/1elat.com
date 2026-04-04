import type { User } from "@1elat/shared";

interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export function getAuthorizationUrl(config: GoogleOAuthConfig): string {
  throw new Error("not implemented");
}

export async function exchangeCodeForToken(
  code: string,
  config: GoogleOAuthConfig
): Promise<string> {
  throw new Error("not implemented");
}

export async function getUserProfile(accessToken: string): Promise<User> {
  throw new Error("not implemented");
}
