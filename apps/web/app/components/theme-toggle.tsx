import { useLocation } from "react-router";
import { Moon, Sun } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useT } from "~/lib/i18n";
import type { Theme } from "~/lib/theme";

interface ThemeToggleProps {
  theme: Theme;
}

export function ThemeToggle({ theme }: ThemeToggleProps): React.ReactElement {
  const t = useT();
  const location = useLocation();
  const next: Theme = theme === "dark" ? "light" : "dark";
  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <form method="post" action="/api/preferences" className="contents">
      <input type="hidden" name="theme" value={next} />
      <input
        type="hidden"
        name="redirectTo"
        value={location.pathname + location.search}
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        aria-label={t.theme.toggle}
        title={t.theme.toggle}
      >
        <Icon className="h-4 w-4" />
      </Button>
    </form>
  );
}
