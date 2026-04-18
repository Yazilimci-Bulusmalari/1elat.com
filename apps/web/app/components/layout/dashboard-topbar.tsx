import { Link } from "react-router";
import { LogOut, User, Settings } from "lucide-react";
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

interface DashboardTopbarProps {
  apiUrl: string;
  theme: Theme;
  user: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
  };
  children?: React.ReactNode;
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function DashboardTopbar({ user, apiUrl, theme, children }: DashboardTopbarProps): React.ReactElement {
  const t = useT();

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-border bg-background px-4 lg:px-6">
      {children}
      <div className="ml-auto flex items-center gap-1.5">
        <LanguageSwitcher />
        <ThemeToggle theme={theme} />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 rounded-full"
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
      </div>
    </header>
  );
}
