import { Link, useLoaderData, useRouteLoaderData } from "react-router";
import {
  Plus,
  FolderOpen,
  ExternalLink,
  Pencil,
  MoreHorizontal,
  Search,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useT } from "~/lib/i18n";
import type { loader as authLoader } from "./_auth";
import type { Route } from "./+types/_auth.projects";
import type { ProjectListItem } from "@1elat/shared";

interface ApiEnvelope<T> {
  data: T | null;
  error: { message: string } | null;
}

interface MyProjectsLoaderData {
  projects: ProjectListItem[];
}

export async function loader({
  request,
  context,
}: Route.LoaderArgs): Promise<MyProjectsLoaderData> {
  const apiUrl =
    context.cloudflare?.env?.API_URL ?? "http://127.0.0.1:8787";
  const cookie = request.headers.get("cookie") ?? "";
  const res = await fetch(`${apiUrl}/me/projects?status=all&limit=50`, {
    headers: { cookie },
  });
  if (!res.ok) {
    return { projects: [] };
  }
  const json = (await res.json()) as ApiEnvelope<{ items: ProjectListItem[] }>;
  return { projects: json.data?.items ?? [] };
}

export default function MyProjectsPage(): React.ReactElement {
  const data = useRouteLoaderData<typeof authLoader>("routes/_auth");
  if (!data) throw new Error("Missing auth layout data");
  const { projects } = useLoaderData<typeof loader>();

  const t = useT();
  const isProjectsLabel = t.nav.projects;

  const emptyTitle = isProjectsLabel === "Projects" ? "No projects yet" : "Henuz proje yok";
  const emptyDesc = isProjectsLabel === "Projects"
    ? "Create your first project to showcase on your profile and the Explore page."
    : "Profilinizde ve Kesfet sayfasinda sergilemek icin ilk projenizi olusturun.";
  const createLabel = isProjectsLabel === "Projects" ? "Create Project" : "Proje Olustur";
  const pageTitle = isProjectsLabel === "Projects" ? "My Projects" : "Projelerim";
  const pageDesc = isProjectsLabel === "Projects"
    ? "Manage and organize your projects."
    : "Projelerinizi yonetin ve duzenleyin.";
  const searchPlaceholder = isProjectsLabel === "Projects" ? "Search projects..." : "Proje ara...";

  const isTR = isProjectsLabel !== "Projects";
  const statusLabels: Record<string, string> = isTR
    ? { draft: "Taslak", published: "Yayinda", archived: "Arsiv" }
    : { draft: "Draft", published: "Published", archived: "Archived" };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{pageDesc}</p>
        </div>
        <Button size="sm" className="gap-1.5" nativeButton={false} render={<Link to="/projects/new" />}>
          <Plus className="h-4 w-4" />
          {createLabel}
        </Button>
      </div>

      {projects.length > 0 ? (
        <>
          <div className="mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder={searchPlaceholder} className="pl-9" />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {projects.map((project) => (
              <Card key={project.slug} className="border-border/80 shadow-none">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                    {project.thumbnailUrl ? (
                      <img src={project.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <FolderOpen className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/projects/${project.slug}/edit`}
                        className="truncate font-medium hover:underline"
                      >
                        {project.name}
                      </Link>
                      <span
                        className={
                          project.status === "published"
                            ? "shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500"
                            : project.status === "archived"
                              ? "shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                              : "shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500"
                        }
                      >
                        {statusLabels[project.status] ?? project.status}
                      </span>
                    </div>
                    {project.tagline ? (
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">{project.tagline}</p>
                    ) : null}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {project.status === "published" ? (
                        <DropdownMenuItem
                          className="gap-2"
                          render={<Link to={`/p/${project.ownerUsername}/${project.slug}`} />}
                        >
                          <ExternalLink className="h-4 w-4" />
                          {isProjectsLabel === "Projects" ? "View" : "Goruntule"}
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem className="gap-2" render={<Link to={`/projects/${project.slug}/edit`} />}>
                        <Pencil className="h-4 w-4" />
                        {isProjectsLabel === "Projects" ? "Edit" : "Duzenle"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-12 flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <FolderOpen className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{emptyTitle}</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">{emptyDesc}</p>
          </div>
          <Button className="gap-1.5" nativeButton={false} render={<Link to="/projects/new" />}>
            <Plus className="h-4 w-4" />
            {createLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
