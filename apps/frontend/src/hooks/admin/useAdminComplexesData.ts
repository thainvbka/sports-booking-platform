import { useAdminComplexStore } from "@/store/admin/useAdminComplexStore";
import { extractLegalDocumentUrls } from "@/lib/legal-docs";
import { COMPLEX_STATUS_LABELS } from "@/lib/constants";
import { toast } from "sonner";
import { CheckCircle, Clock3, PauseCircle, ShieldX } from "lucide-react";
import { useState } from "react";
import type { AdminComplex } from "@/types/admin.types";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useUrlPageSync } from "@/hooks/useUrlPageSync";

export function useAdminComplexesData() {
  const {
    complexes,
    pagination,
    stats,
    isLoading,
    filters,
    queryParams,
    fetchComplexes,
    setFilters,
    setPage,
    updateComplexStatus,
  } = useAdminComplexStore();

  const [selectedComplex, setSelectedComplex] = useState<AdminComplex | null>(
    null,
  );
  const [docDialogOpen, setDocDialogOpen] = useState(false);

  const { searchValue, setSearchValue } = useDebouncedSearch({
    initialValue: filters.search || "",
    onSearch: (val) => setFilters({ search: val || undefined }),
    delay: 500,
  });

  useUrlPageSync({
    page: queryParams.page,
    search: filters.search,
    onInit: ({ page, search }) => {
      if (search) {
        setFilters({ search });
        if (page > 1) {
          setPage(page);
        }
      } else if (page > 1) {
        setPage(page);
      } else {
        fetchComplexes();
      }
    },
  });

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateComplexStatus(id, status);
      toast.success(
        `Đã cập nhật trạng thái khu phức hợp thành ${COMPLEX_STATUS_LABELS[status]}`,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể cập nhật trạng thái";
      toast.error(message);
    }
  };

  const openComplexDetail = (complex: AdminComplex) => {
    setSelectedComplex(complex);
    setDocDialogOpen(true);
  };

  const statItems = [
    {
      label: "Đang hoạt động",
      value: stats.active,
      icon: CheckCircle,
      color: "green" as const,
    },
    {
      label: "Chờ duyệt",
      value: stats.pending,
      icon: Clock3,
      color: "orange" as const,
    },
    {
      label: "Tạm dừng",
      value: stats.inactive,
      icon: PauseCircle,
      color: "red" as const,
    },
    {
      label: "Đã từ chối",
      value: stats.rejected,
      icon: ShieldX,
      color: "slate" as const,
    },
  ];

  const totalComplexes =
    pagination?.total ??
    stats.active + stats.pending + stats.inactive + stats.rejected;

  const selectedComplexDocUrls = selectedComplex
    ? extractLegalDocumentUrls(selectedComplex.verification_docs)
    : [];

  return {
    complexes,
    pagination,
    isLoading,
    filters,
    queryParams,
    setFilters,
    setPage,
    searchValue,
    setSearchValue,
    selectedComplex,
    setSelectedComplex,
    docDialogOpen,
    setDocDialogOpen,
    handleStatusUpdate,
    openComplexDetail,
    statItems,
    totalComplexes,
    selectedComplexDocUrls,
  };
}
