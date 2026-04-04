export interface GitHubOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface GitHubUserProfile {
  githubId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  githubUrl: string;
  login: string;
  bio: string | null;
  location: string | null;
}

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_API_URL = "https://api.github.com";
const USER_AGENT = "1elat.com";

export function getAuthorizationUrl(config: GitHubOAuthConfig, state: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: "read:user,user:email",
    state,
  });

  return `${GITHUB_AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(
  code: string,
  config: GitHubOAuthConfig
): Promise<string> {
  const response = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub token exchange failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (data.error || !data.access_token) {
    throw new Error(
      `GitHub token exchange error: ${data.error_description || data.error || "no access_token returned"}`
    );
  }

  return data.access_token;
}

export async function getUserProfile(accessToken: string): Promise<GitHubUserProfile> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "User-Agent": USER_AGENT,
    Accept: "application/json",
  };

  const [userResponse, emailsResponse] = await Promise.all([
    fetch(`${GITHUB_API_URL}/user`, { headers }),
    fetch(`${GITHUB_API_URL}/user/emails`, { headers }),
  ]);

  if (!userResponse.ok) {
    throw new Error(`GitHub user fetch failed with status ${userResponse.status}`);
  }

  if (!emailsResponse.ok) {
    throw new Error(`GitHub emails fetch failed with status ${emailsResponse.status}`);
  }

  const user = (await userResponse.json()) as {
    id: number;
    login: string;
    name: string | null;
    avatar_url: string | null;
    html_url: string;
    bio: string | null;
    location: string | null;
    email: string | null;
  };

  const emails = (await emailsResponse.json()) as Array<{
    email: string;
    primary: boolean;
    verified: boolean;
  }>;

  const primaryEmail = emails.find((e) => e.primary && e.verified);
  const email = primaryEmail?.email || user.email;

  if (!email) {
    throw new Error(
      "GitHub account has no verified primary email. Please add and verify an email on GitHub."
    );
  }

  return {
    githubId: String(user.id),
    email,
    name: user.name || user.login,
    avatarUrl: user.avatar_url || null,
    githubUrl: user.html_url,
    login: user.login,
    bio: user.bio || null,
    location: user.location || null,
  };
}
