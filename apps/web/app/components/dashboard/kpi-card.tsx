import type { ComponentType } from "react";
import { Card, CardContent } from "~/components/ui/card";

export interface KpiCardProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
  trend?: string;
  trendUp?: boolean;
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  trend,
  trendUp = true,
}: KpiCardProps) {
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
            {trend ? (
              <span className={trendUp ? "text-emerald-500" : "text-amber-500"}>
                {trend}
              </span>
            ) : null}
            <span>{hint}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
