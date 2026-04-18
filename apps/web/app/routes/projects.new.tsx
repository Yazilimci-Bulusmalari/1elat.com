import { redirect } from "react-router";
import { getAuthUser } from "~/lib/auth";
import { useT } from "~/lib/i18n";

export async function loader({
  request,
  context,
}: {
  request: Request;
  context: { cloudflare?: { env?: { API_URL?: string } } };
}): Promise<Response> {
  const apiUrl = context.cloudflare?.env?.API_URL ?? "http://127.0.0.1:8787";
  const user = await getAuthUser(request, apiUrl);
  if (!user) {
    return redirect("/auth/login?next=/projects/new");
  }

  const cookie = request.headers.get("cookie") ?? "";
  const defaultName = "Yeni Proje";

  const res = await fetch(`${apiUrl}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ name: defaultName }),
  });

  if (!res.ok) {
    return redirect("/dashboard");
  }

  const json = (await res.json()) as { data?: { slug?: string } };
  const slug = json.data?.slug;
  if (!slug) {
    return redirect("/dashboard");
  }

  return redirect(`/projects/${slug}/edit`);
}

export default function ProjectsNewFallback(): React.ReactElement {
  const t = useT();
  return <p className="p-8 text-sm text-muted-foreground">{t.newProjectModal.submitting}</p>;
}
