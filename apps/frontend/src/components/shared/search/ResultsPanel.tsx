import { type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/ui-utility/EmptyState";

interface ResultsPanelProps {
  isLoading: boolean;
  isEmpty: boolean;
  emptyTitle: string;
  emptyDescription: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  children: ReactNode;
}

export function ResultsPanel({
  isLoading,
  isEmpty,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  children,
}: ResultsPanelProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <ResultCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return <>{children}</>;
}

export function ResultCardSkeleton() {
  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden rounded-2xl border-border/70 p-0">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="mt-auto flex items-center justify-between border-t border-dashed border-border pt-3">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-2.5 w-10" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
    </Card>
  );
}
