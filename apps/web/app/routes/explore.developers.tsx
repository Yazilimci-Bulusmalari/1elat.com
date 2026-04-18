import { useEffect, useState } from "react";
import { useLoaderData, useSearchParams } from "react-router";
import type { Route } from "./+types/explore.developers";
import {
  UserSearch,
  ChevronLeft,
  ChevronRight,
  Check,
  Briefcase,
  Search,
  ChevronDown,
  X,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { DeveloperCard } from "~/components/explore/developer-card";
import { useT, useLang } from "~/lib/i18n";
import { cn } from "~/lib/utils";
import type { UserCard, Skill } from "@1elat/shared";

export async function loader({ request, context }: Route.LoaderArgs): Promise<{
  apiUrl: string;
  skills: Skill[];
  developers: UserCard[];
  total: number;
  page: number;
  limit: number;
}> {
  const apiUrl =
    context.cloudflare?.env?.API_URL ?? "http://127.0.0.1:8787";

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") ?? "1", 10);
  const limit = 12;
  const skillIds = url.searchParams.get("skillIds") ?? "";
  const search = url.searchParams.get("search") ?? "";
  const openToWork = url.searchParams.get("openToWork") === "true";

  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (openToWork) params.set("openToWork", "true");
  if (skillIds) params.set("skillIds", skillIds);
  if (search) params.set("search", search);

  try {
    const [skillsRes, devsRes] = await Promise.all([
      fetch(`${apiUrl}/skills`),
      fetch(`${apiUrl}/users?${params.toString()}`),
    ]);

    const skillsJson = (await skillsRes.json()) as { data: Skill[] };
    const devsJson = (await devsRes.json()) as {
      data: { developers: UserCard[]; total: number; page: number; limit: number };
    };

    return {
      apiUrl,
      skills: skillsJson.data ?? [],
      developers: devsJson.data?.developers ?? [],
      total: devsJson.data?.total ?? 0,
      page,
      limit,
    };
  } catch {
    return { apiUrl, skills: [], developers: [], total: 0, page: 1, limit };
  }
}

export default function ExploreDevelopersPage(): React.ReactElement {
  const { skills, developers, total, page, limit } =
    useLoaderData<typeof loader>();
  const t = useT();
  const lang = useLang();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedSkillIds =
    searchParams.get("skillIds")?.split(",").filter(Boolean) ?? [];
  const searchQuery = searchParams.get("search") ?? "";
  const openToWorkOnly = searchParams.get("openToWork") === "true";

  const [searchInput, setSearchInput] = useState<string>(searchQuery);

  function updateParams(updates: Record<string, string | null>): void {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }
    setSearchParams(next);
  }

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === searchQuery) return;
    if (trimmed.length > 0 && trimmed.length < 3) return;

    const timer = setTimeout(() => {
      updateParams({
        search: trimmed || null,
        page: null,
      });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  function toggleSkill(skillId: string): void {
    const current = new Set(selectedSkillIds);
    if (current.has(skillId)) {
      current.delete(skillId);
    } else {
      current.add(skillId);
    }
    const ids = [...current].join(",");
    updateParams({
      skillIds: ids || null,
      page: null,
    });
  }

  function clearSkills(): void {
    updateParams({ skillIds: null, page: null });
  }

  const totalPages = Math.ceil(total / limit);
  const skillsLabel =
    selectedSkillIds.length > 0
      ? `${t.explore.developers.allSkills} (${selectedSkillIds.length})`
      : t.explore.developers.allSkills;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t.explore.developers.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t.explore.developers.subtitle}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative sm:max-w-xs sm:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t.topbar.searchPlaceholder}
              className="pl-9"
            />
          </div>

          {skills.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <span>{skillsLabel}</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </Button>
                }
              />
              <DropdownMenuContent align="start" className="max-h-80 w-64 overflow-y-auto">
                {selectedSkillIds.length > 0 ? (
                  <>
                    <DropdownMenuItem
                      className="gap-2 text-muted-foreground"
                      onClick={clearSkills}
                    >
                      <X className="h-3.5 w-3.5" />
                      {lang === "tr" ? "Temizle" : "Clear"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                ) : null}
                {skills.map((skill) => {
                  const isSelected = selectedSkillIds.includes(skill.id);
                  const label = lang === "tr" ? skill.nameTr : skill.nameEn;
                  return (
                    <DropdownMenuCheckboxItem
                      key={skill.id}
                      checked={isSelected}
                      closeOnClick={false}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleSkill(skill.id);
                      }}
                    >
                      {label}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          <button
            type="button"
            onClick={() =>
              updateParams({
                openToWork: openToWorkOnly ? null : "true",
                page: null,
              })
            }
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              openToWorkOnly
                ? "border-accent-brand bg-accent-brand/10 text-accent-brand"
                : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
            )}
          >
            {openToWorkOnly ? <Check className="h-3 w-3" /> : <Briefcase className="h-3 w-3" />}
            {t.explore.developers.openToWork}
          </button>
        </div>

        <Separator />

        {developers.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8">
            <UserSearch className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {selectedSkillIds.length > 0 || searchQuery
                ? t.explore.developers.noResults
                : t.explore.developers.empty}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {developers.map((dev) => (
                <DeveloperCard
                  key={dev.id}
                  developer={dev}
                  openToWorkLabel={t.explore.developers.openToWork}
                  projectsLabel={t.explore.developers.activeProjects}
                />
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => updateParams({ page: String(page - 1) })}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => updateParams({ page: String(page + 1) })}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
