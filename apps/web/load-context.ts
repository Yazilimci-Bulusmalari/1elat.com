import type { AppLoadContext } from "react-router";

interface CloudflareEnv {
  API_URL: string;
  APP_NAME: string;
  SESSION_SECRET: string;
  API: Fetcher;
}

declare module "react-router" {
  interface AppLoadContext {
    cloudflare: {
      env: CloudflareEnv;
      ctx: ExecutionContext;
    };
  }
}
