import { redirect } from "react-router";

import type { Route } from "./+types/api.invitations.$id";
import { getAuthUser } from "~/lib/auth";

/**
 * ResourceRoute: davet aksiyonlari icin proxy.
 *
 * Intent'ler (formData icinde "intent"):
 *  - "accept"  -> POST /invitations/:id/accept
 *  - "decline" -> POST /invitations/:id/decline
 *  - "cancel"  -> POST /invitations/:id/cancel
 */

interface ApiResponse<T = unknown> {
  data: T | null;
  error: { message: string; code?: string } | null;
}

export async function action({
  request,
  params,
  context,
}: Route.ActionArgs): Promise<Response> {
  const apiUrl =
    context.cloudflare?.env?.API_URL ?? "http://127.0.0.1:8787";
  const id = params.id;
  if (!id) {
    return Response.json(
      { data: null, error: { message: "Missing id" } } satisfies ApiResponse,
      { status: 400 },
    );
  }

  const user = await getAuthUser(request, apiUrl);
  if (!user) {
    throw redirect("/auth/login");
  }

  const cookie = request.headers.get("cookie") ?? "";
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  const allowed = new Set(["accept", "decline", "cancel"]);
  if (!allowed.has(intent)) {
    return Response.json(
      { data: null, error: { message: `Unknown intent: ${intent}` } } satisfies ApiResponse,
      { status: 400 },
    );
  }

  const target = `${apiUrl}/invitations/${encodeURIComponent(id)}/${intent}`;
  const upstream = await fetch(target, {
    method: "POST",
    headers: { cookie },
  });

  if (upstream.status === 204) {
    return Response.json({ data: { ok: true }, error: null });
  }
  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}

export function loader(): Response {
  return Response.json(
    { data: null, error: { message: "Method Not Allowed" } } satisfies ApiResponse,
    { status: 405 },
  );
}
