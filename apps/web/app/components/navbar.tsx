import { Link } from "react-router";
import { LogOut, Settings, LayoutDashboard, Plus, User as UserIcon, Compass, Users } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

const navLinks = [
  { label: "Explore", href: "/explore/projects", icon: Compass },
  { label: "Developers", href: "/explore/developers", icon: Users },
] as const;

interface NavbarProps {
  apiUrl: string;
  user: {
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  } | null;
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function Navbar({ user, apiUrl }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex shrink-0 items-center">
            <img
              src="/logo-white.svg"
              alt="1elat"
              className="h-8 w-auto"
              decoding="async"
            />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                className="gap-1.5"
                render={<Link to="/projects/new" />}
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">New Project</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full" />
                  }
                >
                  <Avatar className="h-8 w-8">
                    {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.username} /> : null}
                    <AvatarFallback className="text-xs">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2" render={<Link to="/dashboard" />}>
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2" render={<Link to={`/u/${user.username}`} />}>
                    <UserIcon className="h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2" render={<Link to="/settings" />}>
                    <Settings className="h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2"
                    render={<a href={`${apiUrl}/auth/logout`} />}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/auth/login" />}>
                Sign In
              </Button>
              <Button size="sm" nativeButton={false} render={<Link to="/auth/login" />}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
