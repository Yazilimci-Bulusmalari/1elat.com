import type { ReactElement } from "react";

import { MediaGallery } from "./media-gallery";
import { MakerSaysCard } from "./maker-says-card";
import { RichTextDisplay } from "~/components/projects/rich-text-display";
import { useT } from "~/lib/i18n";
import type { ProjectDetail } from "@1elat/shared";

interface OverviewTabProps {
  project: ProjectDetail;
}

export function OverviewTab({ project }: OverviewTabProps): ReactElement {
  const t = useT();
  const tags = project.tags ?? [];

  return (
    <div className="space-y-6">
      <MediaGallery images={project.images} />

      {project.description ? (
        <RichTextDisplay html={project.description} />
      ) : null}

      {(tags.length > 0 ||
        (project.technologies && project.technologies.length > 0)) ? (
        <div className="space-y-3">
          {project.technologies && project.technologies.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t.projectDetail.technologies}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map((tech) => (
                  <span
                    key={tech.id}
                    className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {tags.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t.projectDetail.tags}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {project.launchStory ? (
        <MakerSaysCard
          launchStory={project.launchStory}
          owner={project.owner}
        />
      ) : null}
    </div>
  );
}
