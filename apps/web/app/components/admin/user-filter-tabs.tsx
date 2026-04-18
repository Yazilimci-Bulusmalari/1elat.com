import { cn } from "~/lib/utils";
import { useT } from "~/lib/i18n";

export type RoleFilter = "all" | "admin" | "user";
export type StatusFilter = "all" | "active" | "suspended";

interface UserFilterTabsProps {
  role: RoleFilter;
  status: StatusFilter;
  onRoleChange: (next: RoleFilter) => void;
  onStatusChange: (next: StatusFilter) => void;
}

interface PillGroupProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
}

function PillGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: PillGroupProps<T>) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div
        role="tablist"
        aria-label={label}
        className="inline-flex items-center gap-1 rounded-lg bg-muted p-1"
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(opt.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function UserFilterTabs({
  role,
  status,
  onRoleChange,
  onStatusChange,
}: UserFilterTabsProps) {
  const t = useT();
  return (
    <div className="flex flex-wrap items-end gap-4">
      <PillGroup<RoleFilter>
        label={t.admin.users.filters.roleLabel}
        value={role}
        onChange={onRoleChange}
        options={[
          { value: "all", label: t.admin.users.filters.role.all },
          { value: "admin", label: t.admin.users.filters.role.admin },
          { value: "user", label: t.admin.users.filters.role.user },
        ]}
      />
      <PillGroup<StatusFilter>
        label={t.admin.users.filters.statusLabel}
        value={status}
        onChange={onStatusChange}
        options={[
          { value: "all", label: t.admin.users.filters.status.all },
          { value: "active", label: t.admin.users.filters.status.active },
          { value: "suspended", label: t.admin.users.filters.status.suspended },
        ]}
      />
    </div>
  );
}
