import { useCallback, useState, useTransition } from "react";
import {
  redirect,
  useLoaderData,
  useNavigate,
  useRevalidator,
  useSearchParams,
} from "react-router";
import {
  Users,
  FolderKanban,
  Shield,
  UserPlus,
  FolderPlus,
} from "lucide-react";
import type {
  AdminStats,
  AdminUserListItem,
  AdminUserListResponse,
  UserRole,
  UserStatus,
} from "@1elat/shared";
import { getAuthUser } from "~/lib/auth";
import { KpiCard } from "~/components/dashboard/kpi-card";
import { useT } from "~/lib/i18n";
import { UserSearchBar } from "~/components/admin/user-search-bar";
import {
  UserFilterTabs,
  type RoleFilter,
  type StatusFilter,
} from "~/components/admin/user-filter-tabs";
import { UserTable } from "~/components/admin/user-table";
import { UserPagination } from "~/components/admin/user-pagination";

interface LoaderData {
  apiUrl: string;
  currentUserId: string;
  stats: AdminStats | null;
  usersResponse: AdminUserListResponse | null;
  filters: {
    search: string;
    role: RoleFilter;
    status: StatusFilter;
    page: number;
    limit: number;
  };
}

const PAGE_LIMIT = 20;

function parseRoleFilter(value: string | null): RoleFilter {
  return value === "admin" || value === "user" ? value : "all";
}

function parseStatusFilter(value: string | null): StatusFilter {
  return value === "active" || value === "suspended" ? value : "all";
}

function parsePage(value: string | null): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
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

  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "";
  const role = parseRoleFilter(url.searchParams.get("role"));
  const status = parseStatusFilter(url.searchParams.get("status"));
  const page = parsePage(url.searchParams.get("page"));

  const cookie = request.headers.get("cookie") || "";
  const usersUrl = new URL(`${apiUrl}/admin/users`);
  if (search) usersUrl.searchParams.set("search", search);
  usersUrl.searchParams.set("role", role);
  usersUrl.searchParams.set("status", status);
  usersUrl.searchParams.set("page", String(page));
  usersUrl.searchParams.set("limit", String(PAGE_LIMIT));

  const [statsResult, usersResult] = await Promise.allSettled([
    fetch(`${apiUrl}/admin/stats`, { headers: { cookie } }),
    fetch(usersUrl.toString(), { headers: { cookie } }),
  ]);

  let stats: AdminStats | null = null;
  if (statsResult.status === "fulfilled" && statsResult.value.ok) {
    try {
      const json = (await statsResult.value.json()) as {
        data: AdminStats | null;
      };
      stats = json.data;
    } catch {
      stats = null;
    }
  }

  let usersResponse: AdminUserListResponse | null = null;
  if (usersResult.status === "fulfilled" && usersResult.value.ok) {
    try {
      const json = (await usersResult.value.json()) as {
        data: AdminUserListResponse | null;
      };
      usersResponse = json.data;
    } catch {
      usersResponse = null;
    }
  }

  return {
    apiUrl,
    currentUserId: user.id,
    stats,
    usersResponse,
    filters: { search, role, status, page, limit: PAGE_LIMIT },
  };
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

export default function AdminPage() {
  const { apiUrl, currentUserId, stats, usersResponse, filters } =
    useLoaderData<typeof loader>() as LoaderData;
  const t = useT();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [, startTransition] = useTransition();
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const updateParams = useCallback(
    (mutate: (next: URLSearchParams) => void) => {
      const next = new URLSearchParams(searchParams);
      mutate(next);
      startTransition(() => {
        navigate(`?${next.toString()}`, { replace: true });
      });
    },
    [navigate, searchParams],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      updateParams((next) => {
        if (value) next.set("search", value);
        else next.delete("search");
        next.delete("page");
      });
    },
    [updateParams],
  );

  const handleRoleChange = useCallback(
    (next: RoleFilter) => {
      updateParams((sp) => {
        if (next === "all") sp.delete("role");
        else sp.set("role", next);
        sp.delete("page");
      });
    },
    [updateParams],
  );

  const handleStatusChange = useCallback(
    (next: StatusFilter) => {
      updateParams((sp) => {
        if (next === "all") sp.delete("status");
        else sp.set("status", next);
        sp.delete("page");
      });
    },
    [updateParams],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateParams((sp) => {
        if (page <= 1) sp.delete("page");
        else sp.set("page", String(page));
      });
    },
    [updateParams],
  );

  const patchUser = useCallback(
    async (
      user: AdminUserListItem,
      patch: { role?: UserRole; status?: UserStatus },
    ) => {
      setPendingUserId(user.id);
      setMutationError(null);
      try {
        const res = await fetch(`${apiUrl}/admin/users/${user.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (!res.ok) {
          setMutationError(t.admin.users.errors.updateFailed);
          return;
        }
        revalidator.revalidate();
      } catch (err) {
        console.error("admin user patch failed", err);
        setMutationError(t.admin.users.errors.updateFailed);
      } finally {
        setPendingUserId(null);
      }
    },
    [apiUrl, revalidator, t.admin.users.errors.updateFailed],
  );

  const handleToggleStatus = useCallback(
    (user: AdminUserListItem) => {
      void patchUser(user, {
        status: user.status === "active" ? "suspended" : "active",
      });
    },
    [patchUser],
  );

  const handleToggleRole = useCallback(
    (user: AdminUserListItem) => {
      void patchUser(user, {
        role: user.role === "admin" ? "user" : "admin",
      });
    },
    [patchUser],
  );

  const totalPages = usersResponse
    ? Math.max(1, Math.ceil(usersResponse.total / usersResponse.limit))
    : 1;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
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

      <section className="space-y-4">
        <header>
          <h2 className="text-xl font-semibold tracking-tight">
            {t.admin.users.sectionTitle}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.admin.users.sectionSubtitle}
          </p>
        </header>

        <UserSearchBar
          initialValue={filters.search}
          onChange={handleSearchChange}
        />
        <UserFilterTabs
          role={filters.role}
          status={filters.status}
          onRoleChange={handleRoleChange}
          onStatusChange={handleStatusChange}
        />

        {mutationError ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            {mutationError}
          </div>
        ) : null}

        {usersResponse === null ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {t.admin.users.errors.loadFailed}
          </div>
        ) : (
          <>
            <UserTable
              users={usersResponse.users}
              currentUserId={currentUserId}
              pendingUserId={pendingUserId}
              onToggleStatus={handleToggleStatus}
              onToggleRole={handleToggleRole}
            />
            <UserPagination
              page={usersResponse.page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </section>
    </div>
  );
}
