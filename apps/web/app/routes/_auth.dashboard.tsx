import type { ComponentType } from "react";
import { useRouteLoaderData } from "react-router";
import {
  Calendar,
  ThumbsUp,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { useT, useLang, type Lang } from "~/lib/i18n";
import type { loader as authLoader } from "./_auth";

function formatToday(lang: Lang): string {
  return new Intl.DateTimeFormat(lang, {
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
  const t = useT();
  const lang = useLang();

  const greeting = t.dashboard.greeting.replace("{firstName}", user.firstName || user.username);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
            {greeting}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            {t.dashboard.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {formatToday(lang)}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          icon={ThumbsUp}
          label={t.dashboard.kpi.projectLikes}
          value="--"
          trend="+0"
          trendUp
          hint={t.dashboard.kpi.projectLikesHint}
        />
        <KpiCard
          icon={Clock}
          label={t.dashboard.kpi.profileViews}
          value="--"
          trend="--"
          trendUp={false}
          hint={t.dashboard.kpi.comingSoon}
        />
        <KpiCard
          icon={TrendingUp}
          label={t.dashboard.kpi.engagement}
          value="--"
          trend="--"
          trendUp
          hint={t.dashboard.kpi.engagementHint}
        />
      </div>
    </div>
  );
}
