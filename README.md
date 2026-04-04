# 1elat — Developer Collaboration Platform

Monorepo powered by pnpm workspaces + Turborepo, deployed on Cloudflare Workers.

## Structure

```
├── apps/
│   ├── api/          # Hono.js API worker (D1, KV, R2, Queues)
│   └── web/          # React Router v7 (Remix) on Cloudflare Workers
├── packages/
│   ├── auth/         # OAuth helpers (GitHub + Google) — skeleton
│   ├── db/           # Drizzle ORM schema + D1 client
│   └── shared/       # Zod validators + shared types
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Run all apps in development
pnpm dev

# Build all packages and apps
pnpm build

# Type-check everything
pnpm typecheck
```

## Apps

### api (`apps/api`)
Hono.js worker with Cloudflare bindings (D1, KV, R2, Queues).

- `GET /` — API info
- `GET /health` — Service health check
- `GET /auth/github` — GitHub OAuth (placeholder)
- `GET /auth/google` — Google OAuth (placeholder)

### web (`apps/web`)
React Router v7 app on Cloudflare Workers with service binding to the API worker.

## Packages

### db (`packages/db`)
Drizzle ORM schema targeting Cloudflare D1. Exports `createDb(d1)` factory and schema.

### auth (`packages/auth`)
OAuth skeleton for GitHub and Google. Session management via Cloudflare KV with 7-day TTL.

### shared (`packages/shared`)
Zod schemas and TypeScript types shared across all packages.

## Cloudflare Setup

1. Create a D1 database: `wrangler d1 create 1elat-db`
2. Create a KV namespace: `wrangler kv namespace create SESSION`
3. Create an R2 bucket: `wrangler r2 bucket create 1elat-files`
4. Create a Queue: `wrangler queues create 1elat-notifications`
5. Update the IDs in `apps/api/wrangler.toml`

### Secrets

Set via `wrangler secret put <NAME>` in each app directory:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SESSION_SECRET`
