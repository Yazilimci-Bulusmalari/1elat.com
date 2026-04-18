import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import { useT } from "~/lib/i18n";

interface UserSearchBarProps {
  initialValue: string;
  onChange: (value: string) => void;
  debounceMs?: number;
}

export function UserSearchBar({
  initialValue,
  onChange,
  debounceMs = 300,
}: UserSearchBarProps) {
  const t = useT();
  const [value, setValue] = useState(initialValue);
  const lastEmittedRef = useRef(initialValue);

  useEffect(() => {
    setValue(initialValue);
    lastEmittedRef.current = initialValue;
  }, [initialValue]);

  useEffect(() => {
    if (value === lastEmittedRef.current) return;
    const handle = setTimeout(() => {
      lastEmittedRef.current = value;
      onChange(value);
    }, debounceMs);
    return () => clearTimeout(handle);
  }, [value, debounceMs, onChange]);

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t.admin.users.searchPlaceholder}
        className="h-10 pl-9"
        aria-label={t.admin.users.searchPlaceholder}
      />
    </div>
  );
}
