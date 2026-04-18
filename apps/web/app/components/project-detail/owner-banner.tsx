import type { ReactElement } from "react";
import { Link } from "react-router";
import { AlertCircle } from "lucide-react";

import { Button } from "~/components/ui/button";
import { useT } from "~/lib/i18n";

interface OwnerBannerProps {
  slug: string;
}

export function OwnerBanner({ slug }: OwnerBannerProps): ReactElement {
  const t = useT();
  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <p className="flex-1 text-sm text-amber-800 dark:text-amber-200">
          {t.projectDetail.owner.banner.draft}
        </p>
        <Button
          size="sm"
          nativeButton={false}
          render={<Link to={`/projects/${slug}/edit#preview`} />}
        >
          {t.projectDetail.owner.publishCta}
        </Button>
      </div>
    </div>
  );
}
