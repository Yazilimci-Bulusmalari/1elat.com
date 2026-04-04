import type { User } from "@1elat/shared";

interface GitHubOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export function getAuthorizationUrl(config: GitHubOAuthConfig): string {
  throw new Error("not implemented");
}

export async function exchangeCodeForToken(
  code: string,
  config: GitHubOAuthConfig
): Promise<string> {
  throw new Error("not implemented");
}

export async function getUserProfile(accessToken: string): Promise<User> {
  throw new Error("not implemented");
}
