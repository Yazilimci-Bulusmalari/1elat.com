import type { ReactElement } from "react";
import { Link } from "react-router";
import { ExternalLink } from "lucide-react";

import { useT, useLang } from "~/lib/i18n";
import type { ProjectDetail } from "@1elat/shared";

interface MoreTabProps {
  project: ProjectDetail;
}

function formatDate(value: Date | string, lang: string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(lang, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

function Row({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export function MoreTab({ project }: MoreTabProps): ReactElement {
  const t = useT();
  const lang = useLang();
  const m = t.projectDetail.more;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{m.owner}</p>
          <Link
            to={`/u/${project.owner.username}`}
            className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
          >
            {project.owner.firstName} {project.owner.lastName}
            <span className="text-muted-foreground">
              @{project.owner.username}
            </span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <Row
        label={m.views.replace("{count}", "").trim()}
        value={String(project.viewsCount)}
      />
      <Row
        label={m.upvotes.replace("{count}", "").trim()}
        value={String(project.upvotesCount)}
      />
      <Row
        label={m.likes.replace("{count}", "").trim()}
        value={String(project.likesCount)}
      />
      <Row
        label={m.comments.replace("{count}", "").trim()}
        value={String(project.commentsCount)}
      />
      <Row
        label={m.followers.replace("{count}", "").trim()}
        value={String(project.followersCount)}
      />
      <Row
        label={m.members.replace("{count}", "").trim()}
        value={String(project.members.length)}
      />
      <Row
        label={m.createdAt.replace("{date}", "").replace(":", "").trim()}
        value={formatDate(project.createdAt, lang)}
      />
      <Row
        label={m.updatedAt.replace("{date}", "").replace(":", "").trim()}
        value={formatDate(project.updatedAt, lang)}
      />
    </div>
  );
}
