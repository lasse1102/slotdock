import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[6px] bg-gradient-to-r from-bg to-border",
        className
      )}
    />
  );
}

export { Skeleton, type SkeletonProps };
