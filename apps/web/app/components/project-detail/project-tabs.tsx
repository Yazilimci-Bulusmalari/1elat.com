import { useEffect, useState, type ReactElement } from "react";
import { Link, useLocation } from "react-router";

import { cn } from "~/lib/utils";
import { useT } from "~/lib/i18n";
import { OverviewTab } from "./overview-tab";
import { MoreTab } from "./more-tab";
import type { ProjectDetail } from "@1elat/shared";

type TabKey = "overview" | "discussion" | "team" | "more";

const TAB_KEYS: TabKey[] = ["overview", "discussion", "team", "more"];

function parseHash(hash: string): TabKey {
  const clean = hash.replace(/^#/, "") as TabKey;
  return TAB_KEYS.includes(clean) ? clean : "overview";
}

interface ProjectTabsProps {
  project: ProjectDetail;
}

export function ProjectTabs({ project }: ProjectTabsProps): ReactElement {
  const t = useT();
  const location = useLocation();
  const [active, setActive] = useState<TabKey>(() => parseHash(location.hash));

  useEffect(() => {
    setActive(parseHash(location.hash));
  }, [location.hash]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: t.projectDetail.tabs.overview },
    { key: "discussion", label: t.projectDetail.tabs.discussion },
    { key: "team", label: t.projectDetail.tabs.team },
    { key: "more", label: t.projectDetail.tabs.more },
  ];

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        className="flex gap-1 overflow-x-auto border-b border-border"
      >
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          return (
            <Link
              key={tab.key}
              to={{ hash: `#${tab.key}` }}
              replace
              role="tab"
              aria-selected={isActive}
              className={cn(
                "relative whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "text-foreground after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div role="tabpanel" className="pt-2">
        {active === "overview" ? <OverviewTab project={project} /> : null}
        {active === "discussion" ? (
          <div className="py-12 text-center text-muted-foreground">
            {t.projectDetail.comingSoon.discussion}
          </div>
        ) : null}
        {active === "team" ? (
          <div className="py-12 text-center text-muted-foreground">
            {t.projectDetail.comingSoon.team}
          </div>
        ) : null}
        {active === "more" ? <MoreTab project={project} /> : null}
      </div>
    </div>
  );
}
