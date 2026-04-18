import { redirect } from "react-router";
import type { Route } from "./+types/api.preferences";

const ONE_YEAR = 60 * 60 * 24 * 365;

function buildCookie(name: string, value: string): string {
  return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax`;
}

export async function action({ request }: Route.ActionArgs): Promise<Response> {
  const formData = await request.formData();
  const theme = formData.get("theme");
  const lang = formData.get("lang");
  const redirectTo =
    (formData.get("redirectTo") as string | null) ||
    request.headers.get("referer") ||
    "/";

  const headers = new Headers();
  headers.append("Location", redirectTo);

  if (theme === "light" || theme === "dark") {
    headers.append("Set-Cookie", buildCookie("theme", theme));
  }
  if (lang === "tr" || lang === "en") {
    headers.append("Set-Cookie", buildCookie("lang", lang));
  }

  return new Response(null, { status: 303, headers });
}

export function loader(): Response {
  return redirect("/");
}
