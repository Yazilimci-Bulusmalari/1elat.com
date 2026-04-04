import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),

  // Auth routes
  route("auth/login", "routes/auth.login.tsx"),
  route("auth/onboarding", "routes/auth.onboarding.tsx"),

  // Explore
  layout("routes/explore.tsx", [
    route("explore/projects", "routes/explore.projects.tsx"),
    route("explore/developers", "routes/explore.developers.tsx"),
  ]),

  // Projects
  route("projects/new", "routes/projects.new.tsx"),
  route("projects/:slug", "routes/projects.$slug.tsx"),
  route("projects/:slug/edit", "routes/projects.$slug.edit.tsx"),

  // User profile
  route("u/:username", "routes/u.$username.tsx"),

  // Search
  route("search", "routes/search.tsx"),

  // Authenticated routes
  layout("routes/_auth.tsx", [
    route("dashboard", "routes/_auth.dashboard.tsx"),
    route("settings", "routes/_auth.settings.tsx"),
    route("notifications", "routes/notifications.tsx"),
  ]),
] satisfies RouteConfig;
