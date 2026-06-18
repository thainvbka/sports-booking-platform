import { Skeleton } from "@/components/ui/skeleton";

interface ComplexesSkeletonGridProps {
  length?: number;
}

export function ComplexesSkeletonGrid({
  length = 8,
}: ComplexesSkeletonGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 overflow-hidden rounded-2xl border border-border/60 bg-card p-0 shadow-sm"
        >
          <Skeleton className="aspect-[16/10] w-full rounded-none" />
          <div className="flex flex-col gap-2 px-4 pb-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="mt-2 h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
