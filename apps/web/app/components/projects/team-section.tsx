import { useEffect, useState, type ReactNode } from "react";
import { useFetcher, useRevalidator } from "react-router";
import { Users, UserPlus, Trash2, X, Loader2 } from "lucide-react";

import type {
  ProjectInvitationWithDetails,
  ProjectMemberWithUser,
} from "@1elat/shared";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { useT } from "~/lib/i18n";

interface TeamSectionProps {
  slug: string;
  members: ProjectMemberWithUser[];
  invitations: ProjectInvitationWithDetails[];
  isOwner: boolean;
}

export function TeamSection({
  slug,
  members,
  invitations,
  isOwner,
}: TeamSectionProps): ReactNode {
  const t = useT();

  return (
    <section id="team" aria-labelledby="team-title" className="space-y-8">
      <h2 id="team-title" className="flex items-center gap-2 text-xl font-semibold">
        <Users className="h-5 w-5" />
        {t.projectEdit.team.title}
      </h2>

      <MembersList slug={slug} members={members} isOwner={isOwner} />

      <Separator />

      <InvitationsList invitations={invitations} isOwner={isOwner} />

      {isOwner ? (
        <>
          <Separator />
          <InviteForm slug={slug} />
        </>
      ) : null}
    </section>
  );
}

interface MembersListProps {
  slug: string;
  members: ProjectMemberWithUser[];
  isOwner: boolean;
}

function MembersList({ slug, members, isOwner }: MembersListProps): ReactNode {
  const t = useT();
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const isSubmitting = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      revalidator.revalidate();
    }
  }, [fetcher.state, fetcher.data, revalidator]);

  function handleRemove(userId: string): void {
    if (!confirm(t.projectEdit.team.members.removeConfirm)) return;
    const fd = new FormData();
    fd.set("intent", "remove");
    fd.set("userId", userId);
    fetcher.submit(fd, {
      method: "POST",
      action: `/api/projects/${slug}/members`,
    });
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">{t.projectEdit.team.members.label}</h3>
      <ul className="space-y-2">
        {members.map((m) => (
          <li
            key={m.userId}
            className="flex items-center gap-3 rounded-lg border border-border p-3"
          >
            <Avatar size="default">
              {m.avatarUrl ? (
                <AvatarImage src={m.avatarUrl} alt={m.username} />
              ) : null}
              <AvatarFallback>
                {m.firstName?.[0]?.toUpperCase() ?? m.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {m.firstName} {m.lastName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                @{m.username} · {m.role}
              </p>
            </div>
            {m.isOwner ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {t.projectEdit.team.members.owner}
              </span>
            ) : isOwner ? (
              <button
                type="button"
                onClick={() => handleRemove(m.userId)}
                disabled={isSubmitting}
                className="inline-flex h-7 items-center gap-1 rounded-md border border-destructive/30 px-2 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50"
              >
                <Trash2 className="h-3 w-3" />
                {t.projectEdit.team.members.remove}
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface InvitationsListProps {
  invitations: ProjectInvitationWithDetails[];
  isOwner: boolean;
}

function InvitationsList({
  invitations,
  isOwner,
}: InvitationsListProps): ReactNode {
  const t = useT();
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const isSubmitting = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      revalidator.revalidate();
    }
  }, [fetcher.state, fetcher.data, revalidator]);

  function handleCancel(id: string): void {
    const fd = new FormData();
    fd.set("intent", "cancel");
    fetcher.submit(fd, {
      method: "POST",
      action: `/api/invitations/${id}`,
    });
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">
        {t.projectEdit.team.invitations.label}
      </h3>
      {invitations.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {t.projectEdit.team.invitations.empty}
        </p>
      ) : (
        <ul className="space-y-2">
          {invitations.map((inv) => (
            <li
              key={inv.id}
              className="flex items-center gap-3 rounded-lg border border-border p-3"
            >
              <Avatar size="default">
                {inv.invitee.avatarUrl ? (
                  <AvatarImage
                    src={inv.invitee.avatarUrl}
                    alt={inv.invitee.username}
                  />
                ) : null}
                <AvatarFallback>
                  {inv.invitee.firstName?.[0]?.toUpperCase() ??
                    inv.invitee.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {inv.invitee.firstName} {inv.invitee.lastName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  @{inv.invitee.username} · {inv.role}
                </p>
              </div>
              {isOwner ? (
                <button
                  type="button"
                  onClick={() => handleCancel(inv.id)}
                  disabled={isSubmitting}
                  className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
                >
                  <X className="h-3 w-3" />
                  {t.projectEdit.team.invitations.cancel}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface InviteResponse {
  data: { id: string } | { ok: true } | null;
  error: { message: string; code?: string } | null;
}

interface InviteFormProps {
  slug: string;
}

function InviteForm({ slug }: InviteFormProps): ReactNode {
  const t = useT();
  const fetcher = useFetcher<InviteResponse>();
  const revalidator = useRevalidator();
  const [inviteeUsername, setInviteeUsername] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isSubmitting = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;
    if (fetcher.data.error) {
      setError(mapErrorCode(fetcher.data.error.code, t));
      setSuccess(null);
      return;
    }
    if (fetcher.data.data) {
      setSuccess(t.projectEdit.team.invite.success);
      setError(null);
      setInviteeUsername("");
      setRole("");
      setMessage("");
      revalidator.revalidate();
    }
  }, [fetcher.state, fetcher.data, revalidator, t]);

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const fd = new FormData();
    fd.set("intent", "create");
    fd.set("inviteeUsername", inviteeUsername.trim());
    fd.set("role", role.trim());
    if (message.trim()) fd.set("message", message.trim());
    fetcher.submit(fd, {
      method: "POST",
      action: `/api/projects/${slug}/invitations`,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-medium">
        <UserPlus className="h-4 w-4" />
        {t.projectEdit.team.invite.title}
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="invite-username">
            {t.projectEdit.team.invite.username}
          </Label>
          <Input
            id="invite-username"
            value={inviteeUsername}
            onChange={(e) => setInviteeUsername(e.target.value)}
            placeholder={t.projectEdit.team.invite.usernamePlaceholder}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invite-role">{t.projectEdit.team.invite.role}</Label>
          <Input
            id="invite-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder={t.projectEdit.team.invite.rolePlaceholder}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="invite-message">
          {t.projectEdit.team.invite.message}
        </Label>
        <Textarea
          id="invite-message"
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 500))}
          placeholder={t.projectEdit.team.invite.messagePlaceholder}
          maxLength={500}
          rows={3}
        />
      </div>

      {error ? (
        <div
          className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      ) : null}
      {success ? (
        <div
          className="rounded-md border border-primary/30 bg-primary/5 p-2 text-sm text-primary"
          role="status"
        >
          {success}
        </div>
      ) : null}

      <Button type="submit" disabled={isSubmitting || !inviteeUsername || !role}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {t.projectEdit.team.invite.submitting}
          </>
        ) : (
          t.projectEdit.team.invite.submit
        )}
      </Button>
    </form>
  );
}

function mapErrorCode(
  code: string | undefined,
  t: ReturnType<typeof useT>,
): string {
  switch (code) {
    case "DUPLICATE_INVITATION":
      return t.projectEdit.team.invite.errors.duplicate;
    case "ALREADY_MEMBER":
      return t.projectEdit.team.invite.errors.alreadyMember;
    case "CANNOT_INVITE_SELF":
      return t.projectEdit.team.invite.errors.cannotInviteSelf;
    case "USER_NOT_FOUND":
    case "NOT_FOUND":
      return t.projectEdit.team.invite.errors.userNotFound;
    default:
      return t.projectEdit.team.invite.errors.generic;
  }
}
