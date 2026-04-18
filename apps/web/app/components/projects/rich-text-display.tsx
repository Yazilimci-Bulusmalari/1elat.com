import type { ReactNode } from "react";

import { cn } from "~/lib/utils";

export interface RichTextDisplayProps {
  html: string;
  className?: string;
}

/**
 * Trusted HTML renderer for project description / launch story.
 *
 * MVP: Tiptap output is owner-authored content; we render it as-is.
 * TODO (next phase): pipe through DOMPurify or a server-side sanitizer
 * before render to defend against future paste-from-html or XSS vectors.
 */
export function RichTextDisplay({
  html,
  className,
}: RichTextDisplayProps): ReactNode {
  return (
    <div
      className={cn(
        "prose prose-invert max-w-none",
        "[&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold",
        "[&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold",
        "[&_p]:my-2 [&_p]:leading-relaxed",
        "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
        "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
        "[&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
        "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm",
        "[&_a]:text-primary [&_a]:underline",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
