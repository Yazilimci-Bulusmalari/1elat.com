import type { Route } from "./+types/api.projects.$slug.engagement";

/**
 * ResourceRoute: public engagement proxy for projects.
 *
 * Forwards cookie from browser to backend so auth works without CORS pain.
 * Accepted intents (form field `intent`):
 *  - "upvote" -> POST /p/:username/:slug/upvote
 *  - "like"   -> POST /p/:username/:slug/like
 *  - "follow" -> POST /p/:username/:slug/follow
 *
 * Requires form field `username` (project owner username).
 */

interface EngagementOk {
  data: { active: boolean; count: number };
  error: null;
}

interface EngagementErr {
  data: null;
  error: { message: string; code?: string };
}

type EngagementResponse = EngagementOk | EngagementErr;

export async function action({
  request,
  params,
  context,
}: Route.ActionArgs): Promise<Response> {
  const apiUrl =
    context.cloudflare?.env?.API_URL ?? "http://127.0.0.1:8787";
  const slug = params.slug;

  if (!slug) {
    return Response.json(
      { data: null, error: { message: "Missing slug" } } satisfies EngagementResponse,
      { status: 400 },
    );
  }

  const form = await request.formData();
  const intent = form.get("intent");
  const username = form.get("username");

  if (typeof intent !== "string" || !["upvote", "like", "follow"].includes(intent)) {
    return Response.json(
      { data: null, error: { message: "Invalid intent" } } satisfies EngagementResponse,
      { status: 400 },
    );
  }

  if (typeof username !== "string" || username.length === 0) {
    return Response.json(
      { data: null, error: { message: "Missing username" } } satisfies EngagementResponse,
      { status: 400 },
    );
  }

  const cookie = request.headers.get("cookie") ?? "";

  const target = `${apiUrl}/p/${encodeURIComponent(username)}/${encodeURIComponent(slug)}/${intent}`;
  const upstream = await fetch(target, {
    method: "POST",
    headers: { cookie },
  });

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}

export function loader(): Response {
  return Response.json(
    { data: null, error: { message: "Method Not Allowed" } } satisfies EngagementResponse,
    { status: 405 },
  );
}
