import { ComplexFilters } from "@/components/owner/complex/ComplexFilters";
import { OwnerFilterShell } from "@/components/owner/OwnerFilterShell";
import { OwnerComplexCard } from "@/components/shared/complex/OwnerComplexCard";
import { PaginationBar } from "@/components/shared/ui-utility/PaginationBar";
import { Button } from "@/components/ui/button";
import { useComplexesFilters } from "@/hooks/owner/useComplexesFilters";
import { ComplexesHero } from "@/components/owner/complex/ComplexesHero";
import { EmptyComplexState } from "@/components/owner/complex/EmptyComplexState";
import { ComplexesSkeletonGrid } from "@/components/owner/complex/ComplexesSkeletonGrid";
import { X } from "lucide-react";

export function ComplexesPage() {
  const {
    complexes,
    pagination,
    isLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    statusCounts,
    visibleComplexes,
    totalPages,
    currentPage,
    goTo,
    hasComplexes,
    hasQuery,
    resetFilters,
  } = useComplexesFilters();

  return (
    <div className="flex flex-col gap-5 pb-10">
      {/* ── HERO ──────────────────────────────────────────────── */}
      <ComplexesHero
        pagination={pagination as { total: number } | null}
        complexesCount={complexes.length}
        statusCounts={statusCounts}
      />

      {/* ── TOOLBAR ───────────────────────────────────────────── */}
      <OwnerFilterShell
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Tìm kiếm khu phức hợp…"
        searchClassName="relative w-full md:max-w-sm"
        inline
      >
        <ComplexFilters
          value={statusFilter}
          isLoading={isLoading}
          onApply={setStatusFilter}
          onClear={() => setStatusFilter("ALL")}
        />
      </OwnerFilterShell>

      {/* ── LIST ──────────────────────────────────────────────── */}
      {isLoading && !hasComplexes ? (
        <ComplexesSkeletonGrid length={8} />
      ) : visibleComplexes.length > 0 ? (
        <>
          <div className="flex items-center justify-between gap-2 px-0.5">
            {hasQuery ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-7 rounded-full px-2 text-[11px] font-semibold"
              >
                <X data-icon="inline-start" />
                Đặt lại
              </Button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleComplexes.map((complex) => (
              <OwnerComplexCard key={complex.id} complex={complex} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && totalPages > 1 ? (
            <PaginationBar
              page={currentPage}
              totalPages={totalPages}
              onPageChange={goTo}
            />
          ) : null}
        </>
      ) : (
        <EmptyComplexState
          hasQuery={hasQuery}
          onReset={resetFilters}
        />
      )}
    </div>
  );
}
