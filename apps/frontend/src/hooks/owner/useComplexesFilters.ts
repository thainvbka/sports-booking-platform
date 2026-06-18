import { useMemo, useState } from "react";
import { useComplexStore } from "@/store/owner/useComplexStore";
import { ComplexStatus } from "@/types";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useUrlPageSync } from "@/hooks/useUrlPageSync";

export type StatusFilter = "ALL" | ComplexStatus;

export function useComplexesFilters() {
  const {
    complexes,
    pagination,
    isLoading,
    setPage,
    setSearch,
    queryParams,
    setParams,
  } = useComplexStore();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const { searchValue: searchTerm, setSearchValue: setSearchTerm } = useDebouncedSearch({
    initialValue: queryParams.search || "",
    onSearch: setSearch,
    delay: 500,
  });

  useUrlPageSync({
    page: queryParams.page,
    search: queryParams.search,
    onInit: ({ page, search }) => {
      setParams({ page, search });
    },
  });

  // Client-side status bucket counters
  const statusCounts = useMemo(() => {
    const counts: Record<ComplexStatus, number> = {
      [ComplexStatus.ACTIVE]: 0,
      [ComplexStatus.PENDING]: 0,
      [ComplexStatus.INACTIVE]: 0,
      [ComplexStatus.REJECTED]: 0,
      [ComplexStatus.DRAFT]: 0,
    };
    for (const c of complexes) {
      if (counts[c.status] !== undefined) {
        counts[c.status] = (counts[c.status] ?? 0) + 1;
      }
    }
    return counts;
  }, [complexes]);

  // Client-side status filter on top of server-paginated list.
  const visibleComplexes = useMemo(() => {
    if (statusFilter === "ALL") return complexes;
    return complexes.filter((c) => c.status === statusFilter);
  }, [complexes, statusFilter]);

  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.page ?? 1;

  const goTo = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setPage(page);
  };

  const hasComplexes = complexes.length > 0;
  const hasQuery = Boolean(searchTerm) || statusFilter !== "ALL";

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
  };

  return {
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
  };
}
