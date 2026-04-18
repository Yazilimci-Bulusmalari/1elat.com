import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  FolderOpen,
  Bell,
  Settings,
  Plus,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import { useT } from "~/lib/i18n";

export type SidebarUser = {
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
};

interface DashboardSidebarProps {
  user: SidebarUser;
  collapsed: boolean;
  onToggle: () => void;
  apiUrl: string;
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function DashboardSidebar({ user, collapsed, onToggle, apiUrl }: DashboardSidebarProps) {
  const { pathname } = useLocation();
  const t = useT();

  const mainNav = [
    {
      to: "/dashboard",
      label: t.sidebar.home,
      icon: LayoutDashboard,
      isActive: (p: string) => p === "/dashboard",
    },
    {
      to: "/projects",
      label: t.sidebar.projects,
      icon: FolderOpen,
      showAdd: true,
      addTo: "/projects/new",
      isActive: (p: string) => p.startsWith("/projects"),
    },
    {
      to: "/notifications",
      label: t.sidebar.notifications,
      icon: Bell,
      isActive: (p: string) => p.startsWith("/notifications"),
    },
    {
      to: "/settings",
      label: t.sidebar.settings,
      icon: Settings,
      isActive: (p: string) => p.startsWith("/settings"),
    },
  ] as const;

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-200",
        collapsed ? "w-16" : "w-56 lg:w-60",
      )}
    >
      <div className="flex h-14 items-center border-b border-border px-3 lg:h-[3.25rem]">
        {collapsed ? (
          <Button
            variant="ghost"
            size="icon"
            className="mx-auto"
            onClick={onToggle}
            aria-label="Open sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </Button>
        ) : (
          <div className="flex w-full items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2">
              <img src="/logo-white.svg" alt="" className="h-7 w-auto" />
              <span className="text-sm font-semibold tracking-tight">1elat</span>
            </Link>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onToggle}
              aria-label="Close sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {mainNav.map((item) => {
          const active = item.isActive(pathname);
          return (
            <div key={item.to} className="flex items-center gap-0.5">
              <Link
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex flex-1 items-center rounded-lg transition-colors",
                  collapsed ? "justify-center px-0 py-2" : "gap-2 px-3 py-2",
                  "text-sm font-medium",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0 opacity-80" />
                {!collapsed && item.label}
              </Link>
              {!collapsed && "showAdd" in item && item.showAdd ? (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="size-7 shrink-0"
                  nativeButton={false}
                  render={<Link to={item.addTo} />}
                  aria-label={t.sidebar.newProjectAria}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="p-3 pt-0">
          <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">{t.sidebar.pro.title}</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {t.sidebar.pro.description}
            </p>
            <Button size="sm" className="mt-3 w-full" variant="outline" nativeButton={false} render={<Link to="/settings" />}>
              {t.sidebar.pro.learnMore}
            </Button>
          </div>
        </div>
      )}

      <div className="border-t border-border p-2">
        {collapsed ? (
          <div className="flex flex-col items-center gap-1">
            <Link
              to={`/u/${user.username}`}
              title={`${user.firstName} ${user.lastName}`}
              className="flex items-center justify-center rounded-lg p-2 hover:bg-sidebar-accent/60"
            >
              <Avatar className="h-7 w-7">
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.username} />
                ) : null}
                <AvatarFallback className="text-[10px]">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <a
              href={`${apiUrl}/auth/logout`}
              title={t.nav.signOut}
              className="flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
            <Link
              to={`/u/${user.username}`}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-lg py-1 hover:opacity-80"
            >
              <Avatar className="h-8 w-8 shrink-0">
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.username} />
                ) : null}
                <AvatarFallback className="text-xs">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
              </div>
            </Link>
            <a
              href={`${apiUrl}/auth/logout`}
              title={t.nav.signOut}
              className="flex shrink-0 items-center justify-center rounded-lg p-1.5 text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}
