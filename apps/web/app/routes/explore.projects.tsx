import { FolderSearch, Filter } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { useT } from "~/lib/i18n";

export default function ExploreProjectsPage(): React.ReactElement {
  const t = useT();
  const tags = [
    t.explore.projects.tags.all,
    t.explore.projects.tags.web,
    t.explore.projects.tags.mobile,
    t.explore.projects.tags.aiMl,
    t.explore.projects.tags.devops,
    t.explore.projects.tags.openSource,
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t.explore.projects.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t.explore.projects.subtitle}
            </p>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-1.5">
            <Filter className="h-4 w-4" />
            {t.explore.projects.filters}
          </Button>
        </div>

        <Separator />

        <div className="flex gap-2">
          {tags.map((tag) => (
            <Button key={tag} variant="secondary" size="sm" className="text-xs">
              {tag}
            </Button>
          ))}
        </div>

        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8">
          <FolderSearch className="h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {t.explore.projects.empty}
          </p>
        </div>
      </div>
    </div>
  );
}
