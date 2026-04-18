import { useEffect, useState, type ReactElement } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { useT } from "~/lib/i18n";
import type { ProjectImage } from "@1elat/shared";

interface MediaGalleryProps {
  images: ProjectImage[];
}

export function MediaGallery({ images }: MediaGalleryProps): ReactElement | null {
  const t = useT();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);

  useEffect(() => {
    if (activeIndex === null) return;
    function handleKey(e: KeyboardEvent): void {
      if (e.key === "Escape") setActiveIndex(null);
      if (e.key === "ArrowLeft")
        setActiveIndex((idx) =>
          idx === null ? idx : (idx - 1 + sorted.length) % sorted.length,
        );
      if (e.key === "ArrowRight")
        setActiveIndex((idx) =>
          idx === null ? idx : (idx + 1) % sorted.length,
        );
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, sorted.length]);

  if (sorted.length === 0) return null;

  const activeImage = activeIndex !== null ? sorted[activeIndex] : null;

  return (
    <>
      <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2">
        {sorted.map((img, idx) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setActiveIndex(idx)}
            className="shrink-0 snap-start overflow-hidden rounded-lg border border-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            aria-label={img.caption ?? `image ${idx + 1}`}
          >
            <img
              src={img.url}
              alt={img.caption ?? ""}
              className="h-48 w-auto object-cover sm:h-64"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {activeImage ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex(null);
            }}
            aria-label={t.projectDetail.gallery.close}
          >
            <X className="h-5 w-5" />
          </button>
          {sorted.length > 1 ? (
            <button
              type="button"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(
                  (idx) =>
                    idx === null
                      ? idx
                      : (idx - 1 + sorted.length) % sorted.length,
                );
              }}
              aria-label={t.projectDetail.gallery.prev}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          ) : null}
          <img
            src={activeImage.url}
            alt={activeImage.caption ?? ""}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {sorted.length > 1 ? (
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((idx) =>
                  idx === null ? idx : (idx + 1) % sorted.length,
                );
              }}
              aria-label={t.projectDetail.gallery.next}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
