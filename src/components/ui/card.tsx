import { cn } from "@/lib/utils";
import { type HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  clickable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, clickable = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[8px] border border-border bg-surface p-6 shadow-sm",
          clickable &&
            "cursor-pointer transition-shadow duration-150 hover:shadow-md",
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

export { Card, type CardProps };
