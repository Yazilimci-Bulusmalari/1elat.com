import type { ReactElement } from "react";
import { Link, useFetcher } from "react-router";
import { Pencil, MoreHorizontal } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useT } from "~/lib/i18n";
import type { ProjectStatus } from "@1elat/shared";

interface OwnerActionsProps {
  slug: string;
  status: ProjectStatus;
}

export function OwnerActions({ slug, status }: OwnerActionsProps): ReactElement {
  const t = useT();
  const fetcher = useFetcher();

  function submitIntent(intent: "publish" | "unpublish" | "restore"): void {
    const form = new FormData();
    form.set("intent", intent);
    fetcher.submit(form, {
      method: "post",
      action: `/api/projects/${slug}?intent=${intent}`,
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={<Link to={`/projects/${slug}/edit`} />}
      >
        <Pencil />
        {t.projectDetail.owner.edit}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="outline" size="icon-sm" aria-label={t.projectDetail.owner.manage} />}
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {status === "draft" || status === "archived" ? (
            <DropdownMenuItem onClick={() => submitIntent("publish")}>
              {t.projectDetail.owner.manageActions.publish}
            </DropdownMenuItem>
          ) : null}
          {status === "published" ? (
            <DropdownMenuItem onClick={() => submitIntent("unpublish")}>
              {t.projectDetail.owner.manageActions.unpublish}
            </DropdownMenuItem>
          ) : null}
          {status === "archived" ? (
            <DropdownMenuItem onClick={() => submitIntent("restore")}>
              {t.projectDetail.owner.manageActions.restore}
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              if (confirm(t.projectDetail.owner.deleteConfirm)) {
                // Delete not wired in this phase.
              }
            }}
          >
            {t.projectDetail.owner.manageActions.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
