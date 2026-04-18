import { Link } from "react-router";
import { Ban, CircleCheck, Info, Shield, ShieldOff } from "lucide-react";
import type { AdminUserListItem } from "@1elat/shared";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";
import { useT, useLang, type Lang } from "~/lib/i18n";

interface UserTableProps {
  users: AdminUserListItem[];
  currentUserId: string;
  pendingUserId: string | null;
  onToggleStatus: (user: AdminUserListItem) => void;
  onToggleRole: (user: AdminUserListItem) => void;
}

function formatDate(value: string | null, lang: Lang, neverLabel: string): string {
  if (!value) return neverLabel;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return neverLabel;
  return new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "?";
}

export function UserTable({
  users,
  currentUserId,
  pendingUserId,
  onToggleStatus,
  onToggleRole,
}: UserTableProps) {
  const t = useT();
  const lang = useLang();

  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        {t.admin.users.empty}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">
                {t.admin.users.table.user}
              </th>
              <th className="px-4 py-3 text-left font-medium">
                {t.admin.users.table.role}
              </th>
              <th className="px-4 py-3 text-left font-medium">
                {t.admin.users.table.status}
              </th>
              <th className="px-4 py-3 text-left font-medium">
                {t.admin.users.table.lastLogin}
              </th>
              <th className="px-4 py-3 text-right font-medium">
                {t.admin.users.table.actions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => {
              const isSelf = u.id === currentUserId;
              const isPending = pendingUserId === u.id;
              const isAdmin = u.role === "admin";
              const isActive = u.status === "active";

              const statusActionLabel = isActive
                ? t.admin.users.actions.toggleStatusActive
                : t.admin.users.actions.toggleStatusSuspended;
              const roleActionLabel = isAdmin
                ? t.admin.users.actions.removeAdmin
                : t.admin.users.actions.makeAdmin;

              const StatusIcon = isActive ? Ban : CircleCheck;
              const RoleIcon = isAdmin ? ShieldOff : Shield;

              return (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        {u.avatarUrl ? (
                          <AvatarImage src={u.avatarUrl} alt="" />
                        ) : null}
                        <AvatarFallback>
                          {initials(u.firstName, u.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="truncate font-medium text-foreground">
                          {u.firstName} {u.lastName}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
                        isAdmin
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {isAdmin
                        ? t.admin.users.roleLabel.admin
                        : t.admin.users.roleLabel.user}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
                        isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-destructive/10 text-destructive",
                      )}
                    >
                      {isActive
                        ? t.admin.users.statusLabel.active
                        : t.admin.users.statusLabel.suspended}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(u.lastLoginAt, lang, t.admin.users.lastLoginNever)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/u/${u.username}`}
                        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                        title={t.admin.users.actions.viewProfile}
                        aria-label={t.admin.users.actions.viewProfile}
                      >
                        <Info className="size-4" aria-hidden="true" />
                      </Link>
                      <button
                        type="button"
                        disabled={isSelf || isPending}
                        onClick={() => onToggleStatus(u)}
                        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                        title={
                          isSelf
                            ? t.admin.users.actions.cannotModifySelf
                            : statusActionLabel
                        }
                        aria-label={statusActionLabel}
                      >
                        <StatusIcon className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        disabled={isSelf || isPending}
                        onClick={() => onToggleRole(u)}
                        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                        title={
                          isSelf
                            ? t.admin.users.actions.cannotModifySelf
                            : roleActionLabel
                        }
                        aria-label={roleActionLabel}
                      >
                        <RoleIcon className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
