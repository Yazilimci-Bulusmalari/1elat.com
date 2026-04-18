import type { ReactElement } from "react";
import { Link } from "react-router";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { RichTextDisplay } from "~/components/projects/rich-text-display";
import { useT } from "~/lib/i18n";
import type { UserCard } from "@1elat/shared";

interface MakerSaysCardProps {
  launchStory: string;
  owner: UserCard;
}

function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function MakerSaysCard({
  launchStory,
  owner,
}: MakerSaysCardProps): ReactElement {
  const t = useT();
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-3">
        <Link to={`/u/${owner.username}`}>
          <Avatar className="h-10 w-10">
            {owner.avatarUrl ? (
              <AvatarImage
                src={owner.avatarUrl}
                alt={`${owner.firstName} ${owner.lastName}`}
              />
            ) : null}
            <AvatarFallback>
              {initials(owner.firstName, owner.lastName)}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <p className="text-sm font-semibold">{t.projectDetail.makerSays.title}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link to={`/u/${owner.username}`} className="hover:underline">
              {owner.firstName} {owner.lastName}
            </Link>
            <span className="rounded-full bg-accent-brand/10 px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wider text-accent-brand">
              {t.projectDetail.makerSays.makerBadge}
            </span>
          </div>
        </div>
      </div>
      <RichTextDisplay html={launchStory} />
    </div>
  );
}
