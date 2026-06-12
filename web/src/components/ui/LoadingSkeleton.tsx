import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded bg-gray-100", className)}
      aria-hidden
    />
  );
}

export function ListRowSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between border-b border-border px-6 py-[18px]">
          <Skeleton className="h-[15px] w-[55%]" />
          <Skeleton className="h-[14px] w-4" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="px-6 pt-5 space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded border border-border p-5">
          <Skeleton className="mb-3 h-[15px] w-[60%]" />
          <div className="flex gap-5">
            <Skeleton className="h-7 w-8" />
            <Skeleton className="h-7 w-8" />
          </div>
        </div>
      ))}
    </div>
  );
}
