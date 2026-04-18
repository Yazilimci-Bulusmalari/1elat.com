import { redirect, useLoaderData } from "react-router";
import {
  Users,
  FolderKanban,
  Shield,
  UserPlus,
  FolderPlus,
} from "lucide-react";
import type { AdminStats } from "@1elat/shared";
import { getAuthUser } from "~/lib/auth";
import { KpiCard } from "~/components/dashboard/kpi-card";
import { useT } from "~/lib/i18n";

interface LoaderData {
  stats: AdminStats | null;
}

export async function loader({
  request,
  context,
}: {
  request: Request;
  context: { cloudflare?: { env?: { API_URL?: string } } };
}): Promise<LoaderData | Response> {
  const apiUrl = context.cloudflare?.env?.API_URL ?? "http://127.0.0.1:8787";
  const user = await getAuthUser(request, apiUrl);
  if (!user) return redirect("/auth/login");
  if (user.role !== "admin") return redirect("/dashboard");

  const cookie = request.headers.get("cookie") || "";

  try {
    const res = await fetch(`${apiUrl}/admin/stats`, {
      headers: { cookie },
    });
    if (!res.ok) return { stats: null };
    const json = (await res.json()) as
      | { data: AdminStats; error: null }
      | { data: null; error: unknown };
    return { stats: json.data };
  } catch {
    return { stats: null };
  }
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

export default function AdminPage() {
  const { stats } = useLoaderData<typeof loader>() as LoaderData;
  const t = useT();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
          {t.admin.title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {t.admin.subtitle}
        </p>
      </header>

      {stats === null ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {t.admin.error}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard
            icon={Users}
            label={t.admin.stats.totalUsers}
            value={formatNumber(stats.totalUsers)}
            hint=""
          />
          <KpiCard
            icon={FolderKanban}
            label={t.admin.stats.totalProjects}
            value={formatNumber(stats.totalProjects)}
            hint=""
          />
          <KpiCard
            icon={Shield}
            label={t.admin.stats.totalAdmins}
            value={formatNumber(stats.totalAdmins)}
            hint=""
          />
          <KpiCard
            icon={UserPlus}
            label={t.admin.stats.signupsLast7Days}
            value={formatNumber(stats.signupsLast7Days)}
            hint=""
          />
          <KpiCard
            icon={UserPlus}
            label={t.admin.stats.signupsLast30Days}
            value={formatNumber(stats.signupsLast30Days)}
            hint=""
          />
          <KpiCard
            icon={FolderPlus}
            label={t.admin.stats.projectsLast7Days}
            value={formatNumber(stats.projectsLast7Days)}
            hint=""
          />
        </div>
      )}
    </div>
  );
}
