import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),

  // Auth routes
  route("auth/login", "routes/auth.login.tsx"),
  route("auth/onboarding", "routes/auth.onboarding.tsx"),

  // Explore (public)
  route("explore/projects", "routes/explore.projects.tsx"),
  route("explore/developers", "routes/explore.developers.tsx"),

  // User profile (public)
  route("u/:username", "routes/u.$username.tsx"),

  // Search (public)
  route("search", "routes/search.tsx"),

  // Preferences (theme/lang cookies)
  route("api/preferences", "routes/api.preferences.tsx"),

  // Authenticated routes (dashboard shell)
  layout("routes/_auth.tsx", [
    route("dashboard", "routes/_auth.dashboard.tsx"),
    route("dashboard/admin", "routes/_auth.dashboard.admin.tsx"),
    route("projects", "routes/_auth.projects.tsx"),
    route("projects/new", "routes/projects.new.tsx"),
    route("projects/:slug", "routes/projects.$slug.tsx"),
    route("projects/:slug/edit", "routes/projects.$slug.edit.tsx"),
    route("settings", "routes/_auth.settings.tsx"),
    route("notifications", "routes/notifications.tsx"),
  ]),
] satisfies RouteConfig;
