import { useState } from "react";
import { Link } from "react-router";
import { LogOut, Plus, User, Settings, Menu, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ThemeToggle } from "~/components/theme-toggle";
import { LanguageSwitcher } from "~/components/language-switcher";
import { useT } from "~/lib/i18n";
import type { Theme } from "~/lib/theme";

interface NavbarProps {
  apiUrl: string;
  theme: Theme;
  user: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
  } | null;
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function Navbar({ user, apiUrl, theme }: NavbarProps): React.ReactElement {
  const t = useT();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: t.nav.explore, href: "/explore/projects" },
    { label: t.nav.developers, href: "/explore/developers" },
    { label: t.nav.projects, href: "/explore/projects" },
    { label: t.nav.community, href: "/explore/developers" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex shrink-0 items-center">
            <span className="text-lg font-bold tracking-tight">1elat</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />
          <ThemeToggle theme={theme} />
          {user ? (
            <>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                className="hidden gap-1.5 sm:inline-flex"
                render={<Link to="/projects/new" />}
              >
                <Plus className="h-4 w-4 shrink-0" />
                {t.nav.newProject}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative hidden h-8 w-8 rounded-full md:inline-flex"
                    />
                  }
                >
                  <Avatar className="h-8 w-8">
                    {user.avatarUrl ? (
                      <AvatarImage src={user.avatarUrl} alt={user.username} />
                    ) : null}
                    <AvatarFallback className="text-xs">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <div className="px-2 py-2">
                    <p className="truncate text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2"
                    render={<Link to={`/u/${user.username}`} />}
                  >
                    <User className="h-4 w-4" />
                    {t.nav.profile}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2"
                    render={<Link to="/settings" />}
                  >
                    <Settings className="h-4 w-4" />
                    {t.nav.settings}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2"
                    render={<a href={`${apiUrl}/auth/logout`} />}
                  >
                    <LogOut className="h-4 w-4" />
                    {t.nav.signOut}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                className="hidden sm:inline-flex"
                render={<Link to="/auth/login" />}
              >
                {t.nav.signIn}
              </Button>
              <Button
                size="sm"
                nativeButton={false}
                className="hidden bg-accent-brand text-accent-brand-foreground hover:bg-accent-brand/90 font-semibold sm:inline-flex"
                render={<Link to="/auth/login" />}
              >
                {t.nav.getStarted}
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <>
                <div className="my-2 h-px bg-border" />
                <Link
                  to="/projects/new"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Plus className="h-4 w-4" />
                  {t.nav.newProject}
                </Link>
                <Link
                  to={`/u/${user.username}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <User className="h-4 w-4" />
                  {t.nav.profile}
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Settings className="h-4 w-4" />
                  {t.nav.settings}
                </Link>
                <div className="my-2 h-px bg-border" />
                <a
                  href={`${apiUrl}/auth/logout`}
                  className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  {t.nav.signOut}
                </a>
              </>
            ) : (
              <>
                <div className="my-2 h-px bg-border" />
                <div className="flex flex-col gap-2 px-3 py-2">
                  <Button
                    size="sm"
                    nativeButton={false}
                    className="w-full bg-accent-brand text-accent-brand-foreground hover:bg-accent-brand/90 font-semibold"
                    render={<Link to="/auth/login" onClick={() => setMobileOpen(false)} />}
                  >
                    {t.nav.getStarted}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    className="w-full"
                    render={<Link to="/auth/login" onClick={() => setMobileOpen(false)} />}
                  >
                    {t.nav.signIn}
                  </Button>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
