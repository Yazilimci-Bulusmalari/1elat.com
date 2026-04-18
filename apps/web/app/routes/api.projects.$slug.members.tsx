import { redirect } from "react-router";

import type { Route } from "./+types/api.projects.$slug.members";
import { getAuthUser } from "~/lib/auth";

/**
 * ResourceRoute: projects/:slug ekip uyeleri icin proxy.
 *
 * Intent'ler (formData icinde "intent"):
 *  - "remove" -> DELETE /p/:username/:slug/members/:userId   (formData: userId)
 */

interface ApiResponse<T = unknown> {
  data: T | null;
  error: { message: string; code?: string } | null;
}

async function requireOwnerUsername(
  request: Request,
  apiUrl: string,
): Promise<string> {
  const user = await getAuthUser(request, apiUrl);
  if (!user) {
    throw redirect("/auth/login");
  }
  return user.username;
}

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
      { data: null, error: { message: "Missing slug" } } satisfies ApiResponse,
      { status: 400 },
    );
  }

  const username = await requireOwnerUsername(request, apiUrl);
  const cookie = request.headers.get("cookie") ?? "";
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  const base = `${apiUrl}/p/${encodeURIComponent(username)}/${encodeURIComponent(slug)}`;

  if (intent === "remove") {
    const userId = String(form.get("userId") ?? "");
    if (!userId) {
      return Response.json(
        { data: null, error: { message: "userId gerekli" } } satisfies ApiResponse,
        { status: 400 },
      );
    }
    const upstream = await fetch(
      `${base}/members/${encodeURIComponent(userId)}`,
      { method: "DELETE", headers: { cookie } },
    );
    if (upstream.status === 204) {
      return Response.json({ data: { ok: true }, error: null });
    }
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  return Response.json(
    { data: null, error: { message: `Unknown intent: ${intent}` } } satisfies ApiResponse,
    { status: 400 },
  );
}

export function loader(): Response {
  return Response.json(
    { data: null, error: { message: "Method Not Allowed" } } satisfies ApiResponse,
    { status: 405 },
  );
}
