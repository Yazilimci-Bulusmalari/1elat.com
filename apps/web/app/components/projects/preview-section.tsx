import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";

import { useT } from "~/lib/i18n";

interface PreviewSectionProps {
  username: string;
  slug: string;
}

export function PreviewSection({
  username,
  slug,
}: PreviewSectionProps): ReactNode {
  const t = useT();
  const href = `/p/${username}/${slug}`;

  return (
    <section id="preview" aria-labelledby="preview-title" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 id="preview-title" className="text-xl font-semibold">
          {t.projectEdit.preview.title}
        </h2>
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>{t.projectEdit.preview.openInNewTab}</span>
        </a>
      </div>
      <p className="text-xs text-muted-foreground">
        {t.projectEdit.preview.hint}
      </p>
      <iframe
        src={href}
        title={t.projectEdit.preview.title}
        className="h-[80vh] w-full rounded-md border border-border bg-background"
      />
    </section>
  );
}
