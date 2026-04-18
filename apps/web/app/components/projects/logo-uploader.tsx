import { useEffect, useRef, useState, type ReactNode } from "react";
import { useFetcher, useRevalidator } from "react-router";
import { ImagePlus, Loader2, X } from "lucide-react";

import {
  ALLOWED_IMAGE_MIME_TYPES,
  PROJECT_IMAGE_MAX_BYTES,
  type AllowedImageMime,
} from "@1elat/shared";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export interface LogoUploaderLabels {
  label: string;
  hint: string;
  upload: string;
  replace: string;
  remove: string;
  formatHint: string;
  errors: {
    fileTooLarge: string;
    unsupportedType: string;
    uploadFailed: string;
  };
}

export interface LogoUploaderProps {
  slug: string;
  currentLogoUrl: string | null;
  labels: LogoUploaderLabels;
}

interface ApiEnvelope<T> {
  data: T | null;
  error: { message: string } | null;
}

export function LogoUploader({
  slug,
  currentLogoUrl,
  labels,
}: LogoUploaderProps): ReactNode {
  const fetcher = useFetcher<ApiEnvelope<{ thumbnailUrl: string } | { ok: boolean }>>();
  const revalidator = useRevalidator();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  const isPending = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.data) {
      revalidator.revalidate();
      setClientError(null);
    }
  }, [fetcher.state, fetcher.data, revalidator]);

  const serverError =
    fetcher.state === "idle" && fetcher.data?.error
      ? mapServerError(fetcher.data.error.message, labels.errors)
      : null;

  function validate(file: File): string | null {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as AllowedImageMime)) {
      return labels.errors.unsupportedType;
    }
    if (file.size > PROJECT_IMAGE_MAX_BYTES) {
      return labels.errors.fileTooLarge;
    }
    return null;
  }

  function uploadFile(file: File): void {
    const err = validate(file);
    if (err) {
      setClientError(err);
      return;
    }
    setClientError(null);
    const fd = new FormData();
    fd.append("intent", "upload");
    fd.append("kind", "logo");
    fd.append("file", file);
    fetcher.submit(fd, {
      method: "POST",
      action: `/api/projects/${slug}/media`,
      encType: "multipart/form-data",
    });
  }

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>): void {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  function handleRemove(): void {
    const fd = new FormData();
    fd.append("intent", "deleteLogo");
    fetcher.submit(fd, {
      method: "POST",
      action: `/api/projects/${slug}/media`,
    });
  }

  const error = clientError ?? serverError;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{labels.label}</h3>
        <span className="text-xs text-muted-foreground">{labels.formatHint}</span>
      </div>
      <p className="text-xs text-muted-foreground">{labels.hint}</p>

      <div className="flex items-start gap-4">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={cn(
            "relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/20",
            isPending && "opacity-60",
          )}
        >
          {currentLogoUrl ? (
            <img
              src={currentLogoUrl}
              alt={labels.label}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImagePlus
              className="h-6 w-6 text-muted-foreground"
              aria-hidden="true"
            />
          )}
          {isPending ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_IMAGE_MIME_TYPES.join(",")}
            hidden
            onChange={handleSelect}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={isPending}
            >
              {currentLogoUrl ? labels.replace : labels.upload}
            </Button>
            {currentLogoUrl ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleRemove}
                disabled={isPending}
              >
                <X className="mr-1 h-3.5 w-3.5" />
                {labels.remove}
              </Button>
            ) : null}
          </div>
          {error ? (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function mapServerError(
  message: string,
  errors: LogoUploaderLabels["errors"],
): string {
  const m = message.toLowerCase();
  if (m.includes("too large") || m.includes("file_too_large")) {
    return errors.fileTooLarge;
  }
  if (m.includes("unsupported") || m.includes("media_type")) {
    return errors.unsupportedType;
  }
  return errors.uploadFailed;
}
