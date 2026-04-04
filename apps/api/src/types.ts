import type { Database } from "@1elat/db";

export type Bindings = {
  DB: D1Database;
  SESSION: KVNamespace;
  FILES: R2Bucket;
  NOTIFICATIONS?: Queue;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GITHUB_REDIRECT_URI: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
  API_VERSION: string;
  CORS_ORIGIN: string;
};

export type Variables = {
  userId: string;
  db: Database;
  validatedBody: unknown;
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};
