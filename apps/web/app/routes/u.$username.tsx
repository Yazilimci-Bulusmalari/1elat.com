import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/u.$username";
import {
  User,
  MapPin,
  LinkIcon,
  Calendar,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { useT, useLang } from "~/lib/i18n";

interface PublicUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  website: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  location: string | null;
  rating: number;
  ratingCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function loader({ params, context }: Route.LoaderArgs): Promise<{
  user: PublicUser | null;
}> {
  const apiUrl =
    context.cloudflare?.env?.API_URL ?? "http://127.0.0.1:8787";
  const { username } = params;

  try {
    const res = await fetch(`${apiUrl}/users/${username}`);
    if (!res.ok) return { user: null };

    const json = (await res.json()) as {
      data: PublicUser;
      error: null;
    };
    return { user: json.data };
  } catch {
    return { user: null };
  }
}

function GitHubIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function LinkedInIcon(
  props: React.SVGProps<SVGSVGElement>,
): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

function formatJoinDate(dateStr: string, lang: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat(lang, {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function formatWebsiteDisplay(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function UserProfilePage(): React.ReactElement {
  const { user } = useLoaderData<typeof loader>();
  const t = useT();
  const lang = useLang();

  if (!user) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-20">
        <User className="mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold">{t.publicProfile.notFound}</h1>
        <p className="mb-6 text-muted-foreground">
          {t.publicProfile.notFoundDescription}
        </p>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link to="/" />}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.publicProfile.backHome}
        </Button>
      </div>
    );
  }

  const fullName = `${user.firstName} ${user.lastName}`;
  const joinDate = formatJoinDate(user.createdAt, lang);
  const socialLinks = [
    { url: user.githubUrl, icon: GitHubIcon, label: "GitHub" },
    { url: user.linkedinUrl, icon: LinkedInIcon, label: "LinkedIn" },
    { url: user.twitterUrl, icon: XIcon, label: "X" },
  ].filter((link) => link.url);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <Avatar className="h-24 w-24">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={fullName} />
              ) : null}
              <AvatarFallback className="text-2xl">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <h1 className="text-xl font-bold tracking-tight">{fullName}</h1>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </div>

          {user.bio ? (
            <p className="text-sm leading-relaxed text-foreground/80">
              {user.bio}
            </p>
          ) : null}

          <Button variant="outline" className="w-full">
            {t.publicProfile.follow}
          </Button>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>
                {user.location || t.publicProfile.locationNotSet}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 shrink-0" />
              {user.website ? (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-accent-brand hover:underline"
                >
                  {formatWebsiteDisplay(user.website)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span>{t.publicProfile.noWebsite}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>
                {t.publicProfile.joinedAt.replace("{date}", joinDate)}
              </span>
            </div>
          </div>

          {socialLinks.length > 0 ? (
            <div className="flex items-center gap-3 pt-1">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={link.label}
                >
                  <link.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div className="col-span-2 space-y-6">
          <div>
            <h2 className="mb-3 text-lg font-semibold">
              {t.publicProfile.projects}
            </h2>
            <Separator className="mb-4" />
            <div className="flex min-h-[20vh] flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6">
              <User className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {t.publicProfile.noProjectsYet}
              </p>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">
              {t.publicProfile.activity}
            </h2>
            <Separator className="mb-4" />
            <div className="flex min-h-[20vh] flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6">
              <Calendar className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {t.publicProfile.noActivityYet}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
