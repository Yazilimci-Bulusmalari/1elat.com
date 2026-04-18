import type { Database } from "@1elat/db";
import type { schema as dbSchema } from "@1elat/db";

type ProjectRow = typeof dbSchema.projects.$inferSelect;

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
  API_URL: string;
  CORS_ORIGIN: string;
  ADMIN_EMAILS?: string;
};

export type Variables = {
  userId: string;
  db: Database;
  validatedBody: unknown;
  project: ProjectRow;
  projectOwner: { id: string; username: string };
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};
