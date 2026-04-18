import type { ReactElement } from "react";
import { ArrowBigUp, Heart, UserPlus, UserCheck } from "lucide-react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export type EngagementKind = "upvote" | "like" | "follow";

interface EngagementButtonProps {
  kind: EngagementKind;
  active: boolean;
  count?: number;
  label: string;
  labelActive?: string;
  disabled?: boolean;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "secondary";
  onClick: () => void;
  showCount?: boolean;
  fullWidth?: boolean;
}

function IconFor({
  kind,
  active,
  className,
}: {
  kind: EngagementKind;
  active: boolean;
  className?: string;
}): ReactElement {
  if (kind === "upvote") {
    return (
      <ArrowBigUp
        className={cn(className, active ? "fill-current" : undefined)}
      />
    );
  }
  if (kind === "like") {
    return (
      <Heart className={cn(className, active ? "fill-current" : undefined)} />
    );
  }
  return active ? (
    <UserCheck className={className} />
  ) : (
    <UserPlus className={className} />
  );
}

export function EngagementButton({
  kind,
  active,
  count,
  label,
  labelActive,
  disabled,
  size = "default",
  variant = "outline",
  onClick,
  showCount = true,
  fullWidth = false,
}: EngagementButtonProps): ReactElement {
  const text = active && labelActive ? labelActive : label;
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        fullWidth ? "w-full" : undefined,
        active
          ? "border-accent-brand bg-accent-brand/10 text-accent-brand hover:bg-accent-brand/20"
          : undefined,
      )}
    >
      <IconFor kind={kind} active={active} />
      <span>{text}</span>
      {showCount && typeof count === "number" ? (
        <span className="ml-1 font-semibold">{count}</span>
      ) : null}
    </Button>
  );
}
