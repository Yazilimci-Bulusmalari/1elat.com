import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  Bell,
  Settings,
  Plus,
  Sparkles,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export type SidebarUser = {
  username: string;
  firstName: string;
  lastName: string;
};

const mainNav = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard, isActive: (p: string) => p === "/dashboard" },
  {
    to: "/explore/projects",
    label: "Projects",
    icon: FolderOpen,
    showAdd: true,
    addTo: "/projects/new",
    isActive: (p: string) => p.startsWith("/explore/projects") || p.startsWith("/projects"),
  },
  {
    to: "/explore/developers",
    label: "Developers",
    icon: Users,
    isActive: (p: string) => p.startsWith("/explore/developers"),
  },
  {
    to: "/notifications",
    label: "Notifications",
    icon: Bell,
    isActive: (p: string) => p.startsWith("/notifications"),
  },
  { to: "/settings", label: "Settings", icon: Settings, isActive: (p: string) => p.startsWith("/settings") },
] as const;

export function DashboardSidebar({ user }: { user: SidebarUser }) {
  const { pathname } = useLocation();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-sidebar lg:w-60">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4 lg:h-[3.25rem]">
        <img src="/logo-white.svg" alt="" className="h-7 w-auto" />
        <span className="text-sm font-semibold tracking-tight">1elat</span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {mainNav.map((item) => {
          const active = item.isActive(pathname);
          return (
            <div key={item.to} className="flex items-center gap-1">
              <Link
                to={item.to}
                className={cn(
                  "flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0 opacity-80" />
                {item.label}
              </Link>
              {"showAdd" in item && item.showAdd ? (
                <Button variant="ghost" size="icon-xs" className="size-8 shrink-0" nativeButton={false} render={<Link to={item.addTo} />} aria-label="New project">
                  <Plus className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="p-3 pt-0">
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">Pro</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Unlock featured placement and advanced project insights.
          </p>
          <Button size="sm" className="mt-3 w-full" variant="outline" nativeButton={false} render={<Link to="/settings" />}>
            Learn more
          </Button>
        </div>
      </div>

      <div className="border-t border-border p-3">
        <Link
          to={`/u/${user.username}`}
          className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-sidebar-accent/60"
        >
          <span className="truncate font-medium">
            {user.firstName} {user.lastName}
          </span>
        </Link>
        <p className="truncate px-2 text-xs text-muted-foreground">@{user.username}</p>
      </div>
    </aside>
  );
}
