import { PaginationBar } from "@/components/shared/ui-utility/PaginationBar";
import { TabsContent } from "@/components/ui/tabs";
import { type ReactNode } from "react";
import { ResultsPanel } from "./ResultsPanel";

interface PaginationState {
  page: number;
  totalPages: number;
}

interface SearchResultTabProps<T> {
  value: string;
  items: T[];
  pagination: PaginationState;
  isLoading: boolean;
  emptyTitle: string;
  emptyDescription: string;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  renderItem: (item: T) => ReactNode;
  gridKey?: string;
}

export function SearchResultTab<T,>({
  value,
  items,
  pagination,
  isLoading,
  emptyTitle,
  emptyDescription,
  hasActiveFilters,
  onClearFilters,
  onPageChange,
  renderItem,
  gridKey,
}: SearchResultTabProps<T>) {
  return (
    <TabsContent value={value} className="m-0">
      <ResultsPanel
        isLoading={isLoading}
        isEmpty={items.length === 0}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyActionLabel={hasActiveFilters ? "Xóa bộ lọc" : undefined}
        onEmptyAction={hasActiveFilters ? onClearFilters : undefined}
      >
        <div
          key={gridKey}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 motion-safe-stagger"
        >
          {items.map((item) => renderItem(item))}
        </div>
      </ResultsPanel>

      <PaginationBar
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={onPageChange}
      />
    </TabsContent>
  );
}
