import { Link } from "react-router";
import { MapPin, FolderOpen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { useLang } from "~/lib/i18n";
import type { UserCard } from "@1elat/shared";

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

interface DeveloperCardProps {
  developer: UserCard;
  openToWorkLabel: string;
  projectsLabel: string;
}

export function DeveloperCard({
  developer,
  openToWorkLabel,
  projectsLabel,
}: DeveloperCardProps): React.ReactElement {
  const lang = useLang();

  return (
    <Link
      to={`/u/${developer.username}`}
      className="group relative flex flex-col rounded-lg border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-accent/50"
    >
      {developer.isOpenToWork ? (
        <span className="absolute right-3 top-3 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
          {openToWorkLabel}
        </span>
      ) : null}

      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12 shrink-0">
          {developer.avatarUrl ? (
            <AvatarImage src={developer.avatarUrl} alt={developer.username} />
          ) : null}
          <AvatarFallback className="text-sm">
            {getInitials(developer.firstName, developer.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {developer.firstName} {developer.lastName}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            @{developer.username}
          </p>
        </div>
      </div>

      {developer.bio ? (
        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {developer.bio}
        </p>
      ) : null}

      {developer.skills.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1">
          {developer.skills.slice(0, 4).map((skill) => (
            <span
              key={skill.id}
              className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
            >
              {lang === "tr" ? skill.nameTr : skill.nameEn}
            </span>
          ))}
          {developer.skills.length > 4 ? (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              +{developer.skills.length - 4}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-auto flex items-center gap-4 pt-3 text-xs text-muted-foreground">
        {developer.location ? (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {developer.location}
          </span>
        ) : null}
        <span className="flex items-center gap-1">
          <FolderOpen className="h-3 w-3" />
          {projectsLabel.replace("{count}", String(developer.projectCount))}
        </span>
      </div>
    </Link>
  );
}
