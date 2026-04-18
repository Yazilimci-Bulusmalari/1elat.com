import type { ReactElement } from "react";
import { ExternalLink, Package } from "lucide-react";

import { Button } from "~/components/ui/button";
import { useT, useLang } from "~/lib/i18n";
import type { ProjectDetail } from "@1elat/shared";

interface ProjectHeroProps {
  project: ProjectDetail;
}

export function ProjectHero({ project }: ProjectHeroProps): ReactElement {
  const t = useT();
  const lang = useLang();

  const categoryName = project.category
    ? lang === "tr"
      ? project.category.nameTr
      : project.category.nameEn
    : null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <div className="shrink-0">
        {project.thumbnailUrl ? (
          <img
            src={project.thumbnailUrl}
            alt={project.name}
            className="h-20 w-20 rounded-xl border border-border object-cover sm:h-24 sm:w-24"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-border bg-muted sm:h-24 sm:w-24">
            <Package className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {project.name}
          </h1>
          {categoryName ? (
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
              {categoryName}
            </span>
          ) : null}
        </div>
        {project.tagline ? (
          <p className="text-base text-muted-foreground sm:text-lg">
            {project.tagline}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-sm text-muted-foreground">
          <span>
            {t.projectDetail.followers.replace(
              "{count}",
              String(project.followersCount),
            )}
          </span>
          {project.websiteUrl ? (
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={
                <a
                  href={project.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <ExternalLink />
              {t.projectDetail.visitWebsite}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
