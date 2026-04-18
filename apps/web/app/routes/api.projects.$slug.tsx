import { redirect } from "react-router";

import type { Route } from "./+types/api.projects.$slug";
import { getAuthUser } from "~/lib/auth";

/**
 * ResourceRoute: projects/:slug icin yazma islemleri icin proxy.
 * Cookie'yi backend'e iletir, CORS'a gerek kalmaz, useFetcher ile uyumludur.
 *
 * Kabul edilen intent'ler (form alani veya ?intent query):
 *  - "patch"     -> PATCH  /p/:username/:slug     body: JSON payload
 *  - "publish"   -> POST   /p/:username/:slug/publish
 *  - "unpublish" -> POST   /p/:username/:slug/unpublish
 *  - "restore"   -> POST   /p/:username/:slug/restore
 */

interface ApiResponse<T = unknown> {
  data: T | null;
  error: { message: string; missingFields?: string[] } | null;
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

  const url = new URL(request.url);
  const intentFromQuery = url.searchParams.get("intent");

  let intent = intentFromQuery ?? "patch";
  let bodyJson: string | undefined;

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const text = await request.text();
    bodyJson = text;
    // intent query-string'de yoksa JSON body icinden bakmaya gerek yok — patch varsayilan.
  } else {
    const form = await request.formData();
    const intentField = form.get("intent");
    if (typeof intentField === "string" && intentField.length > 0) {
      intent = intentField;
    }
    const payload = form.get("payload");
    if (typeof payload === "string" && payload.length > 0) {
      bodyJson = payload;
    }
  }

  const base = `${apiUrl}/p/${encodeURIComponent(username)}/${encodeURIComponent(slug)}`;
  let method: string;
  let target: string;
  switch (intent) {
    case "publish":
      method = "POST";
      target = `${base}/publish`;
      break;
    case "unpublish":
      method = "POST";
      target = `${base}/unpublish`;
      break;
    case "restore":
      method = "POST";
      target = `${base}/restore`;
      break;
    case "patch":
    default:
      method = "PATCH";
      target = base;
      break;
  }

  const upstream = await fetch(target, {
    method,
    headers: {
      cookie,
      ...(bodyJson ? { "Content-Type": "application/json" } : {}),
    },
    body: bodyJson,
  });

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
