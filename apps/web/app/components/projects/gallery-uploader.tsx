import { useEffect, useRef, useState, type ReactNode } from "react";
import { useFetcher, useRevalidator } from "react-router";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Loader2,
  Trash2,
} from "lucide-react";

import {
  ALLOWED_IMAGE_MIME_TYPES,
  PROJECT_GALLERY_MAX_COUNT,
  PROJECT_IMAGE_MAX_BYTES,
  type AllowedImageMime,
  type ProjectImage,
} from "@1elat/shared";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export interface GalleryUploaderLabels {
  label: string;
  hint: string;
  add: string;
  empty: string;
  limitReached: string;
  moveUp: string;
  moveDown: string;
  delete: string;
  uploading: string;
  errors: {
    fileTooLarge: string;
    unsupportedType: string;
    limitExceeded: string;
    uploadFailed: string;
  };
}

export interface GalleryUploaderProps {
  slug: string;
  images: ProjectImage[];
  labels: GalleryUploaderLabels;
}

interface ApiEnvelope<T> {
  data: T | null;
  error: { message: string } | null;
}

/**
 * MVP: reorder uses up/down buttons.
 * TODO (polish phase): switch to @dnd-kit for drag-and-drop reordering.
 *
 * Optimistic UI pattern: array swap renders immediately; if the reorder
 * fetcher fails, we revert to the server-derived order via revalidator.
 */
export function GalleryUploader({
  slug,
  images,
  labels,
}: GalleryUploaderProps): ReactNode {
  const uploadFetcher = useFetcher<ApiEnvelope<ProjectImage>>();
  const deleteFetcher = useFetcher<ApiEnvelope<{ ok: boolean }>>();
  const reorderFetcher = useFetcher<ApiEnvelope<ProjectImage[]>>();
  const revalidator = useRevalidator();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [optimisticOrder, setOptimisticOrder] = useState<ProjectImage[] | null>(
    null,
  );
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const [uploadIndex, setUploadIndex] = useState<number>(0);
  const [clientError, setClientError] = useState<string | null>(null);

  const sorted = (optimisticOrder ?? images ?? []).slice().sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const isFull = sorted.length >= PROJECT_GALLERY_MAX_COUNT;
  const isUploading = uploadFetcher.state !== "idle" || uploadQueue.length > 0;

  // Reset optimistic order when fresh server data arrives
  useEffect(() => {
    setOptimisticOrder(null);
  }, [images]);

  // Revalidate after each successful single-file upload, then advance queue
  useEffect(() => {
    if (uploadFetcher.state === "idle" && uploadFetcher.data?.data) {
      revalidator.revalidate();
    }
  }, [uploadFetcher.state, uploadFetcher.data, revalidator]);

  useEffect(() => {
    if (deleteFetcher.state === "idle" && deleteFetcher.data?.data) {
      revalidator.revalidate();
    }
  }, [deleteFetcher.state, deleteFetcher.data, revalidator]);

  // Process upload queue sequentially
  useEffect(() => {
    if (uploadFetcher.state !== "idle") return;
    if (uploadQueue.length === 0) return;
    const file = uploadQueue[0];
    const fd = new FormData();
    fd.append("intent", "upload");
    fd.append("kind", "gallery");
    fd.append("file", file);
    uploadFetcher.submit(fd, {
      method: "POST",
      action: `/api/projects/${slug}/media`,
      encType: "multipart/form-data",
    });
    setUploadQueue((q) => q.slice(1));
    setUploadIndex((i) => i + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadFetcher.state, uploadQueue, slug]);

  // Reset progress counter when queue and fetch fully drain
  useEffect(() => {
    if (uploadFetcher.state === "idle" && uploadQueue.length === 0) {
      const timer = setTimeout(() => setUploadIndex(0), 500);
      return () => clearTimeout(timer);
    }
  }, [uploadFetcher.state, uploadQueue.length]);

  // Revert optimistic order on reorder failure
  useEffect(() => {
    if (reorderFetcher.state === "idle" && reorderFetcher.data?.error) {
      setOptimisticOrder(null);
      revalidator.revalidate();
    }
  }, [reorderFetcher.state, reorderFetcher.data, revalidator]);

  function validate(file: File): string | null {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as AllowedImageMime)) {
      return labels.errors.unsupportedType;
    }
    if (file.size > PROJECT_IMAGE_MAX_BYTES) {
      return labels.errors.fileTooLarge;
    }
    return null;
  }

  function handleFiles(files: FileList | null): void {
    if (!files || files.length === 0) return;
    const remaining = PROJECT_GALLERY_MAX_COUNT - sorted.length;
    if (remaining <= 0) {
      setClientError(labels.errors.limitExceeded);
      return;
    }
    const accepted: File[] = [];
    for (const file of Array.from(files).slice(0, remaining)) {
      const err = validate(file);
      if (err) {
        setClientError(err);
        continue;
      }
      accepted.push(file);
    }
    if (accepted.length > 0) {
      setClientError(null);
      setUploadQueue((q) => [...q, ...accepted]);
    }
  }

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>): void {
    handleFiles(e.target.files);
    e.target.value = "";
  }

  function handleDelete(imageId: string): void {
    const fd = new FormData();
    fd.append("intent", "delete");
    fd.append("imageId", imageId);
    deleteFetcher.submit(fd, {
      method: "POST",
      action: `/api/projects/${slug}/media`,
    });
  }

  function move(index: number, direction: -1 | 1): void {
    const next = sorted.slice();
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    const reindexed = next.map((img, i) => ({ ...img, sortOrder: i }));
    setOptimisticOrder(reindexed);

    const order = reindexed.map((img) => ({
      id: img.id,
      sortOrder: img.sortOrder,
    }));
    const fd = new FormData();
    fd.append("intent", "reorder");
    fd.append("order", JSON.stringify({ order }));
    reorderFetcher.submit(fd, {
      method: "POST",
      action: `/api/projects/${slug}/media`,
    });
  }

  const serverError =
    uploadFetcher.state === "idle" && uploadFetcher.data?.error
      ? mapServerError(uploadFetcher.data.error.message, labels.errors)
      : null;
  const error = clientError ?? serverError;

  const totalQueued = uploadIndex + uploadQueue.length;
  const progressLabel = isUploading
    ? labels.uploading
        .replace("{current}", String(uploadIndex))
        .replace("{total}", String(totalQueued))
    : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{labels.label}</h3>
        <span className="text-xs text-muted-foreground">
          {sorted.length}/{PROJECT_GALLERY_MAX_COUNT}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{labels.hint}</p>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_MIME_TYPES.join(",")}
        multiple
        hidden
        onChange={handleSelect}
      />

      {sorted.length === 0 && !isUploading ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/10 p-8 text-sm text-muted-foreground transition-colors hover:bg-muted/20"
        >
          <ImagePlus className="h-6 w-6" aria-hidden="true" />
          <span>{labels.empty}</span>
          <span className="text-xs">{labels.add}</span>
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {sorted.map((img, i) => (
            <GalleryCard
              key={img.id}
              image={img}
              index={i}
              total={sorted.length}
              onMoveUp={() => move(i, -1)}
              onMoveDown={() => move(i, 1)}
              onDelete={() => handleDelete(img.id)}
              labels={labels}
              disabled={
                deleteFetcher.state !== "idle" ||
                reorderFetcher.state !== "idle"
              }
            />
          ))}

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isFull || isUploading}
            title={isFull ? labels.limitReached : labels.add}
            className={cn(
              "flex aspect-video flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/10 text-sm text-muted-foreground transition-colors hover:bg-muted/20",
              (isFull || isUploading) && "pointer-events-none opacity-50",
            )}
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ImagePlus className="h-5 w-5" aria-hidden="true" />
            )}
            <span className="text-xs">
              {isFull ? labels.limitReached : labels.add}
            </span>
          </button>
        </div>
      )}

      {progressLabel ? (
        <p className="text-xs text-muted-foreground">{progressLabel}</p>
      ) : null}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface GalleryCardProps {
  image: ProjectImage;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  labels: GalleryUploaderLabels;
  disabled: boolean;
}

function GalleryCard({
  image,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onDelete,
  labels,
  disabled,
}: GalleryCardProps): ReactNode {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-muted/10">
      <div className="aspect-video w-full overflow-hidden bg-muted">
        <img
          src={image.url}
          alt={image.caption ?? ""}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <IconBtn
          onClick={onMoveUp}
          disabled={disabled || index === 0}
          label={labels.moveUp}
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </IconBtn>
        <IconBtn
          onClick={onMoveDown}
          disabled={disabled || index === total - 1}
          label={labels.moveDown}
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </IconBtn>
        <IconBtn
          onClick={onDelete}
          disabled={disabled}
          label={labels.delete}
          variant="destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </IconBtn>
      </div>
      <div className="px-2 py-1 text-xs text-muted-foreground">
        #{index + 1}
      </div>
    </div>
  );
}

interface IconBtnProps {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  variant?: "default" | "destructive";
  children: ReactNode;
}

function IconBtn({
  onClick,
  disabled,
  label,
  variant = "default",
  children,
}: IconBtnProps): ReactNode {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center rounded-md bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background disabled:pointer-events-none disabled:opacity-40",
        variant === "destructive" && "hover:bg-destructive hover:text-destructive-foreground",
      )}
    >
      {children}
    </button>
  );
}

function mapServerError(
  message: string,
  errors: GalleryUploaderLabels["errors"],
): string {
  const m = message.toLowerCase();
  if (m.includes("too large") || m.includes("file_too_large")) {
    return errors.fileTooLarge;
  }
  if (m.includes("unsupported") || m.includes("media_type")) {
    return errors.unsupportedType;
  }
  if (m.includes("limit") || m.includes("media_limit")) {
    return errors.limitExceeded;
  }
  return errors.uploadFailed;
}
