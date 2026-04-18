import { useLocation } from "react-router";
import { Languages } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useLang, useT, type Lang } from "~/lib/i18n";

export function LanguageSwitcher(): React.ReactElement {
  const lang = useLang();
  const t = useT();
  const location = useLocation();
  const next: Lang = lang === "tr" ? "en" : "tr";

  return (
    <form method="post" action="/api/preferences" className="contents">
      <input type="hidden" name="lang" value={next} />
      <input
        type="hidden"
        name="redirectTo"
        value={location.pathname + location.search}
      />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        aria-label={t.lang.switch}
        title={t.lang.switch}
        className="gap-1.5 uppercase"
      >
        <Languages className="h-4 w-4" />
        {lang}
      </Button>
    </form>
  );
}
