import type { ReactElement } from "react";
import {
  Globe,
  ExternalLink,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
} from "lucide-react";

import { Separator } from "~/components/ui/separator";
import { EngagementButton } from "./engagement-button";
import { useT, useLang } from "~/lib/i18n";
import type { ProjectDetail, PricingModel } from "@1elat/shared";

function GitHubIcon(props: React.SVGProps<SVGSVGElement>): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

interface EngagementState {
  isUpvoted: boolean;
  upvotesCount: number;
  isLiked: boolean;
  likesCount: number;
  isFollowed: boolean;
  followersCount: number;
}

interface ProjectSidebarProps {
  project: ProjectDetail;
  engagement: EngagementState;
  isOwner: boolean;
  isAuthed: boolean;
  onUpvote: () => void;
  onLike: () => void;
  onFollow: () => void;
  onShare: () => void;
  errorMessage: string | null;
  engagementPending: boolean;
}

function formatRelativeTime(
  from: Date,
  lang: string,
  notYetLabel: string,
): string {
  if (!from) return notYetLabel;
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  const now = Date.now();
  const diffMs = from.getTime() - now;
  const absSec = Math.abs(diffMs) / 1000;

  const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: "year", seconds: 31536000 },
    { unit: "month", seconds: 2592000 },
    { unit: "week", seconds: 604800 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
  ];

  for (const { unit, seconds } of units) {
    if (absSec >= seconds) {
      const value = Math.round(diffMs / 1000 / seconds);
      return rtf.format(value, unit);
    }
  }
  return rtf.format(Math.round(diffMs / 1000), "second");
}

function pricingLabel(
  model: PricingModel | null,
  t: ReturnType<typeof useT>,
): string | null {
  if (!model) return null;
  return t.projectDetail.pricing[model];
}

export function ProjectSidebar({
  project,
  engagement,
  isOwner,
  isAuthed,
  onUpvote,
  onLike,
  onFollow,
  onShare,
  errorMessage,
  engagementPending,
}: ProjectSidebarProps): ReactElement {
  const t = useT();
  const lang = useLang();

  const launchedLabel = project.launchedAt
    ? formatRelativeTime(
        new Date(project.launchedAt),
        lang,
        t.projectDetail.launchedNotYet,
      )
    : t.projectDetail.launchedNotYet;

  const stageName = project.stage
    ? lang === "tr"
      ? project.stage.nameTr
      : project.stage.nameEn
    : null;

  const pricing = pricingLabel(project.pricingModel, t);

  const links = [
    project.websiteUrl
      ? {
          url: project.websiteUrl,
          icon: Globe,
          label: t.projectDetail.visitWebsite,
        }
      : null,
    project.repoUrl
      ? { url: project.repoUrl, icon: GitHubIcon, label: "Repository" }
      : null,
    project.demoUrl
      ? { url: project.demoUrl, icon: ExternalLink, label: "Demo" }
      : null,
  ].filter((l): l is NonNullable<typeof l> => l !== null);

  return (
    <aside className="space-y-4 lg:sticky lg:top-20">
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{launchedLabel}</span>
        </div>

        <EngagementButton
          kind="upvote"
          active={engagement.isUpvoted}
          count={engagement.upvotesCount}
          label={t.projectDetail.upvote}
          labelActive={t.projectDetail.upvote}
          size="lg"
          variant={engagement.isUpvoted ? "default" : "outline"}
          onClick={onUpvote}
          disabled={!isAuthed || engagementPending}
          fullWidth
        />

        <div className="grid grid-cols-2 gap-2">
          <EngagementButton
            kind="like"
            active={engagement.isLiked}
            count={engagement.likesCount}
            label={t.projectDetail.like}
            size="sm"
            onClick={onLike}
            disabled={!isAuthed || engagementPending}
          />
          {isOwner ? (
            <button
              type="button"
              onClick={onShare}
              className="inline-flex h-7 items-center justify-center rounded-md border border-border bg-background px-2.5 text-[0.8rem] font-medium hover:bg-muted"
            >
              {t.projectDetail.share}
            </button>
          ) : (
            <EngagementButton
              kind="follow"
              active={engagement.isFollowed}
              label={
                engagement.isFollowed
                  ? t.projectDetail.unfollow
                  : t.projectDetail.follow
              }
              showCount={false}
              size="sm"
              onClick={onFollow}
              disabled={!isAuthed || engagementPending}
            />
          )}
        </div>

        {!isOwner ? (
          <button
            type="button"
            onClick={onShare}
            className="inline-flex h-7 w-full items-center justify-center rounded-md border border-border bg-background px-2.5 text-[0.8rem] font-medium hover:bg-muted"
          >
            {t.projectDetail.share}
          </button>
        ) : null}

        {errorMessage ? (
          <p className="text-xs text-destructive">{errorMessage}</p>
        ) : null}
      </div>

      {links.length > 0 ? (
        <div className="rounded-xl border border-border bg-card p-4">
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-foreground hover:text-accent-brand"
                >
                  <link.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{link.label}</span>
                  <ExternalLink className="ml-auto h-3 w-3 shrink-0 text-muted-foreground" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {(stageName || pricing) ? (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          {stageName ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t.projectDetail.stage}
              </p>
              <p className="mt-1 text-sm">{stageName}</p>
            </div>
          ) : null}
          {stageName && pricing ? <Separator /> : null}
          {pricing ? (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>{pricing}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {project.technologies && project.technologies.length > 0 ? (
        <div className="rounded-xl border border-border bg-card p-4">
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

      {(project.isSeekingTeammates || project.isSeekingInvestment) ? (
        <div className="space-y-2 rounded-xl border border-border bg-card p-4">
          {project.isSeekingTeammates ? (
            <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/5 px-3 py-2 text-sm text-green-700 dark:text-green-400">
              <Users className="h-4 w-4" />
              <span>{t.projectDetail.lookingFor.teammates}</span>
            </div>
          ) : null}
          {project.isSeekingInvestment ? (
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
              <TrendingUp className="h-4 w-4" />
              <span>{t.projectDetail.lookingFor.investment}</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
