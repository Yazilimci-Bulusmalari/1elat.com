import { UserSearch, Filter } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { useT } from "~/lib/i18n";

export default function ExploreDevelopersPage(): React.ReactElement {
  const t = useT();
  const tags = [
    t.explore.developers.tags.all,
    t.explore.developers.tags.frontend,
    t.explore.developers.tags.backend,
    t.explore.developers.tags.fullstack,
    t.explore.developers.tags.mobile,
    t.explore.developers.tags.devops,
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t.explore.developers.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t.explore.developers.subtitle}
            </p>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-1.5">
            <Filter className="h-4 w-4" />
            {t.explore.developers.filters}
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
          <UserSearch className="h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {t.explore.developers.empty}
          </p>
        </div>
      </div>
    </div>
  );
}
