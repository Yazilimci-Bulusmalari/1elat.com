import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { createDb } from "@1elat/db";
import { errorHandler } from "./middleware/error-handler";
import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/users";
import { adminRoutes } from "./routes/admin";
import { skillRoutes } from "./routes/skills";
import { projectsRoutes } from "./routes/projects";
import { commentsRoutes } from "./routes/comments";
import { invitationsRoutes } from "./routes/invitations";
import { filesRoutes } from "./routes/files";
import { lookupRoutes } from "./routes/lookups";
import type { AppEnv } from "./types";

const app = new Hono<AppEnv>();

// Global middleware
app.use("*", logger());
app.use("*", secureHeaders());
app.use("*", (c, next) => {
  const origin = c.env.CORS_ORIGIN || "http://localhost:5173";
  return cors({ origin, credentials: true })(c, next);
});

// DB middleware - initialize drizzle instance per request
app.use("*", async (c, next) => {
  const db = createDb(c.env.DB);
  c.set("db", db);
  await next();
});

// Error handler
app.onError(errorHandler);

// Health check
app.get("/", (c) => {
  return c.json({ message: "1elat api", version: "0.1.0" });
});

app.get("/health", (c) => {
  return c.json({ status: "ok", version: c.env.API_VERSION });
});

app.route("/auth", authRoutes);
app.route("/users", userRoutes);
app.route("/admin", adminRoutes);
app.route("/skills", skillRoutes);
app.route("/", projectsRoutes);
app.route("/comments", commentsRoutes);
app.route("/", invitationsRoutes);
app.route("/files", filesRoutes);
app.route("/lookups", lookupRoutes);

export default app;
