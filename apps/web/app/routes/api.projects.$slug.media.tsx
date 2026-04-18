import { redirect } from "react-router";

import type { Route } from "./+types/api.projects.$slug.media";
import { getAuthUser } from "~/lib/auth";

/**
 * ResourceRoute: projects/:slug medya islemleri icin proxy.
 * Strategy pattern: formData icindeki "intent" alanina gore endpoint secimi.
 *
 * Intent'ler:
 *  - "upload"      -> POST   /p/:username/:slug/images       (multipart: file, kind, caption?)
 *  - "delete"      -> DELETE /p/:username/:slug/images/:id   (formData: imageId)
 *  - "reorder"     -> PATCH  /p/:username/:slug/images/reorder (formData: order=JSON)
 *  - "deleteLogo"  -> DELETE /p/:username/:slug/logo
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
      {
        data: null,
        error: { message: "Missing slug" },
      } satisfies ApiResponse,
      { status: 400 },
    );
  }

  const username = await requireOwnerUsername(request, apiUrl);
  const cookie = request.headers.get("cookie") ?? "";

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  const base = `${apiUrl}/p/${encodeURIComponent(username)}/${encodeURIComponent(slug)}`;

  if (intent === "upload") {
    // Multipart forward: clone the relevant fields into a fresh FormData
    const file = form.get("file");
    const kind = form.get("kind");
    const caption = form.get("caption");
    if (!(file instanceof File)) {
      return Response.json(
        {
          data: null,
          error: { message: "file alani gerekli" },
        } satisfies ApiResponse,
        { status: 400 },
      );
    }
    const fd = new FormData();
    fd.append("file", file, file.name);
    if (typeof kind === "string") fd.append("kind", kind);
    if (typeof caption === "string" && caption.length > 0) {
      fd.append("caption", caption);
    }
    const upstream = await fetch(`${base}/images`, {
      method: "POST",
      headers: { cookie },
      body: fd,
    });
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (intent === "delete") {
    const imageId = String(form.get("imageId") ?? "");
    if (!imageId) {
      return Response.json(
        {
          data: null,
          error: { message: "imageId gerekli" },
        } satisfies ApiResponse,
        { status: 400 },
      );
    }
    const upstream = await fetch(
      `${base}/images/${encodeURIComponent(imageId)}`,
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

  if (intent === "reorder") {
    const orderRaw = String(form.get("order") ?? "");
    if (!orderRaw) {
      return Response.json(
        {
          data: null,
          error: { message: "order gerekli" },
        } satisfies ApiResponse,
        { status: 400 },
      );
    }
    const upstream = await fetch(`${base}/images/reorder`, {
      method: "PATCH",
      headers: { cookie, "Content-Type": "application/json" },
      body: orderRaw,
    });
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (intent === "deleteLogo") {
    const upstream = await fetch(`${base}/logo`, {
      method: "DELETE",
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

  return Response.json(
    {
      data: null,
      error: { message: `Unknown intent: ${intent}` },
    } satisfies ApiResponse,
    { status: 400 },
  );
}

export function loader(): Response {
  return Response.json(
    {
      data: null,
      error: { message: "Method Not Allowed" },
    } satisfies ApiResponse,
    { status: 405 },
  );
}
