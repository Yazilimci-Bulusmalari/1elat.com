import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

type Bindings = {
  DB: D1Database;
  SESSION: KVNamespace;
  FILES: R2Bucket;
  NOTIFICATIONS: Queue;
  API_VERSION: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", logger());
app.use("*", cors());

app.get("/", (c) => {
  return c.json({ message: "1elat api", version: "0.1.0" });
});

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    services: {
      d1: "connected",
      kv: "connected",
      r2: "connected",
      queue: "connected",
    },
  });
});

app.get("/auth/github", (c) => {
  return c.json({ message: "github oauth - not implemented" });
});

app.get("/auth/google", (c) => {
  return c.json({ message: "google oauth - not implemented" });
});

export default app;
