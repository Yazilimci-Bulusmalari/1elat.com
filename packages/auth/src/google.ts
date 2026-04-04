export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface GoogleUserProfile {
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  firstName: string;
  lastName: string;
}

const GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

export function getAuthorizationUrl(config: GoogleOAuthConfig, state: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "consent",
  });

  return `${GOOGLE_AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(
  code: string,
  config: GoogleOAuthConfig
): Promise<string> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw new Error(`Google token exchange failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (data.error || !data.access_token) {
    throw new Error(
      `Google token exchange error: ${data.error_description || data.error || "no access_token returned"}`
    );
  }

  return data.access_token;
}

export async function getUserProfile(accessToken: string): Promise<GoogleUserProfile> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Google userinfo fetch failed with status ${response.status}`);
  }

  const user = (await response.json()) as {
    id: string;
    email: string;
    name: string;
    given_name: string;
    family_name: string;
    picture: string | null;
  };

  if (!user.email) {
    throw new Error("Google account has no email associated.");
  }

  return {
    googleId: user.id,
    email: user.email,
    name: user.name || `${user.given_name} ${user.family_name}`.trim(),
    avatarUrl: user.picture || null,
    firstName: user.given_name || "",
    lastName: user.family_name || "",
  };
}
