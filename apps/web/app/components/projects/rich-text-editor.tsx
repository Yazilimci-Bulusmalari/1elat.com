import { useEffect, useState, type ReactNode } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Undo,
  Redo,
} from "lucide-react";

import { cn } from "~/lib/utils";

export interface RichTextEditorLabels {
  bold: string;
  italic: string;
  h2: string;
  h3: string;
  bulletList: string;
  orderedList: string;
  quote: string;
  code: string;
  link: string;
  linkPrompt: string;
  undo: string;
  redo: string;
}

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  labels: RichTextEditorLabels;
  ariaLabel?: string;
}

/**
 * SSR-safe Tiptap editor for Cloudflare Workers.
 * - Uses isMounted gate so editor instance is only created on the client.
 * - Server / first paint renders an empty skeleton with the same height
 *   to avoid layout shift.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = "200px",
  labels,
  ariaLabel,
}: RichTextEditorProps): ReactNode {
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="overflow-hidden rounded-lg border border-input bg-background">
        <div className="flex h-10 items-center gap-1 border-b border-border bg-muted/40 px-2" />
        <div style={{ minHeight }} />
      </div>
    );
  }

  return (
    <ClientEditor
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      minHeight={minHeight}
      labels={labels}
      ariaLabel={ariaLabel}
    />
  );
}

function ClientEditor({
  value,
  onChange,
  placeholder,
  minHeight,
  labels,
  ariaLabel,
}: RichTextEditorProps): ReactNode {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noreferrer noopener",
          target: "_blank",
          class: "text-primary underline",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "",
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-invert max-w-none px-4 py-3 focus:outline-none",
          "[&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold",
          "[&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold",
          "[&_p]:my-2 [&_p]:leading-relaxed",
          "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
          "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
          "[&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
          "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm",
          "[&_p.is-editor-empty:first-child::before]:pointer-events-none [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:h-0 [&_p.is-editor-empty:first-child::before]:text-muted-foreground [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
        ),
        "aria-label": ariaLabel ?? "",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      // Tiptap returns "<p></p>" for empty; normalize to empty string
      const normalized = html === "<p></p>" ? "" : html;
      onChange(normalized);
    },
    immediatelyRender: false,
  });

  // Sync external value -> editor (e.g. project reload from server)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const incoming = value || "<p></p>";
    if (current !== incoming) {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) {
    return (
      <div
        className="overflow-hidden rounded-lg border border-input bg-background"
        style={{ minHeight }}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-input bg-background focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
      <Toolbar editor={editor} labels={labels} />
      <div style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

interface ToolbarProps {
  editor: Editor;
  labels: RichTextEditorLabels;
}

function Toolbar({ editor, labels }: ToolbarProps): ReactNode {
  function handleLink(): void {
    const previous = editor.getAttributes("link").href as string | undefined;
    const input = window.prompt(labels.linkPrompt, previous ?? "https://");
    if (input === null) return;
    if (input === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    let href = input.trim();
    if (!/^https?:\/\//i.test(href)) {
      href = `https://${href}`;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  }

  return (
    <div
      role="toolbar"
      className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 px-1.5 py-1"
    >
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        label={labels.bold}
      >
        <Bold className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        label={labels.italic}
      >
        <Italic className="h-3.5 w-3.5" />
      </ToolbarButton>
      <Divider />
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        active={editor.isActive("heading", { level: 2 })}
        label={labels.h2}
      >
        <Heading2 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        active={editor.isActive("heading", { level: 3 })}
        label={labels.h3}
      >
        <Heading3 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <Divider />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        label={labels.bulletList}
      >
        <List className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        label={labels.orderedList}
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        label={labels.quote}
      >
        <Quote className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        label={labels.code}
      >
        <Code className="h-3.5 w-3.5" />
      </ToolbarButton>
      <Divider />
      <ToolbarButton
        onClick={handleLink}
        active={editor.isActive("link")}
        label={labels.link}
      >
        <Link2 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <Divider />
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        label={labels.undo}
      >
        <Undo className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        label={labels.redo}
      >
        <Redo className="h-3.5 w-3.5" />
      </ToolbarButton>
    </div>
  );
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: ReactNode;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: ToolbarButtonProps): ReactNode {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
        active && "bg-accent text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Divider(): ReactNode {
  return <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />;
}
