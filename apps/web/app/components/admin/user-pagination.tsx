import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useT } from "~/lib/i18n";

interface UserPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (next: number) => void;
}

export function UserPagination({
  page,
  totalPages,
  onPageChange,
}: UserPaginationProps) {
  const t = useT();
  if (totalPages <= 1) return null;

  const display = t.admin.users.pagination.pageOf
    .replace("{page}", String(page))
    .replace("{total}", String(totalPages));

  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      <span className="text-sm text-muted-foreground">{display}</span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          {t.admin.users.pagination.previous}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          {t.admin.users.pagination.next}
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
