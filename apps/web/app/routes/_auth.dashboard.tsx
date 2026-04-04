import type { ComponentType } from "react";
import { Link, useRouteLoaderData } from "react-router";
import {
  Calendar,
  ThumbsUp,
  Clock,
  TrendingUp,
  FolderOpen,
  MessageSquare,
  FileCode2,
  MoreHorizontal,
  Video,
  Phone,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { PerformanceChart } from "~/components/dashboard/performance-chart";
import type { loader as authLoader } from "./_auth";

function formatToday(): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());
}

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  trend,
  trendUp,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
  trend: string;
  trendUp: boolean;
}) {
  return (
    <Card className="border-border/80 shadow-none">
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted/60">
            <Icon className="h-4 w-4 text-foreground/80" />
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={trendUp ? "text-emerald-500" : "text-amber-500"}>{trend}</span>
            <span>{hint}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const data = useRouteLoaderData<typeof authLoader>("routes/_auth");
  if (!data) {
    throw new Error("Missing auth layout data");
  }
  const { user } = data;
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username;
  const initials =
    `${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`.toUpperCase() ||
    user.username.slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="grid gap-6 xl:grid-cols-[1fr_min(100%,320px)] xl:items-start xl:gap-8">
        <div className="min-w-0 space-y-6">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                Hello, {user.firstName || user.username}
              </h1>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Track your projects and community activity. Ship something great this week.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatToday()}
            </div>
          </header>

          <div className="grid gap-4 sm:grid-cols-3">
            <KpiCard
              icon={ThumbsUp}
              label="Project likes"
              value="--"
              trend="+0"
              trendUp
              hint="when you publish projects"
            />
            <KpiCard
              icon={Clock}
              label="Profile views"
              value="--"
              trend="--"
              trendUp={false}
              hint="coming soon"
            />
            <KpiCard
              icon={TrendingUp}
              label="Engagement"
              value="--"
              trend="--"
              trendUp
              hint="trend vs last month"
            />
          </div>

          <Card className="border-border/80 shadow-none">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0 pb-2">
              <div>
                <CardTitle className="text-base">Performance</CardTitle>
                <CardDescription>Placeholder trend until analytics ships</CardDescription>
              </div>
              <span className="rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
                Last 7 days
              </span>
            </CardHeader>
            <CardContent className="pt-2">
              <PerformanceChart />
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-6 rounded-full bg-primary" />
                  This week
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-6 rounded-full bg-muted-foreground/40" />
                  Prior week
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-none" id="tasks">
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">Current focus</CardTitle>
                <span className="text-xs font-medium text-muted-foreground">Profile setup ~30%</span>
              </div>
              <CardDescription>Complete your profile to get discovered</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[30%] rounded-full bg-primary transition-all" />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Add bio, skills, and your first project.
                </p>
                <Button size="sm" nativeButton={false} render={<Link to="/settings" />}>
                  Continue setup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="flex min-w-0 flex-col gap-6">
          <Card className="border-border/80 shadow-none">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start gap-3">
                <Avatar className="size-14 rounded-full border border-border">
                  {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={displayName} /> : null}
                  <AvatarFallback className="text-sm font-medium">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold leading-tight">{displayName}</p>
                  <p className="truncate text-sm text-muted-foreground">@{user.username}</p>
                </div>
                <Button variant="ghost" size="icon-sm" className="shrink-0" type="button" aria-label="More">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon-sm" className="flex-1" type="button" disabled title="Coming soon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon-sm" className="flex-1" type="button" disabled title="Coming soon">
                  <Video className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="secondary" className="w-full" size="sm" nativeButton={false} render={<Link to={`/u/${user.username}`} />}>
                View profile
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Activity</CardTitle>
              <CardDescription>Recent highlights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-sm leading-snug">
                    <span className="font-medium text-foreground">Welcome</span>
                    <span className="text-muted-foreground"> — your feed will show follows and project updates.</span>
                  </p>
                  <p className="text-xs text-muted-foreground">Just now</p>
                </div>
              </div>
              <Separator />
              <div className="flex gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-sm leading-snug text-muted-foreground">
                    Create a project to showcase on Explore.
                  </p>
                  <Button variant="link" className="h-auto p-0 text-xs" nativeButton={false} render={<Link to="/projects/new" />}>
                    New project
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="flex gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                  <FileCode2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-sm leading-snug text-muted-foreground">
                    Discover developers by role and stack.
                  </p>
                  <Button variant="link" className="h-auto p-0 text-xs" nativeButton={false} render={<Link to="/explore/developers" />}>
                    Browse developers
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
