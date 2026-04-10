import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/lib/types";

type BadgeVariant = BookingStatus;

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  confirmed: "bg-primary-light text-primary",
  arrived: "bg-warning-light text-warning",
  completed: "bg-success-light text-success",
  cancelled: "bg-bg text-text-secondary",
  no_show: "bg-error-light text-error",
};

const variantLabels: Record<BadgeVariant, string> = {
  confirmed: "Bestätigt",
  arrived: "Angekommen",
  completed: "Abgeschlossen",
  cancelled: "Storniert",
  no_show: "Nicht erschienen",
};

function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export { Badge, variantLabels, type BadgeProps, type BadgeVariant };
