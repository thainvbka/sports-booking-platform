import { Link, useSearchParams } from "react-router-dom";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SubFieldCard } from "@/components/shared/SubFieldCard";
import type { ComplexDetail, SubField, PaginationMeta } from "@/types";
import {
  ArrowLeft,
  MapPin,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface ComplexDetailViewProps {
  mode: "owner" | "public";
  // Data
  complex: ComplexDetail | null;
  subfields: SubField[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  // Search & Pagination handlers
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  // Owner-specific components (render props pattern)
  headerActions?: React.ReactNode;
  statusAlerts?: React.ReactNode;
  addSubfieldButton?: React.ReactNode;
  emptyStateButton?: React.ReactNode;
  // Navigation
  backLink?: string;
  onBack?: () => void;
  backLabel: string;
}

export function ComplexDetailView({
  mode,
  complex,
  subfields,
  pagination,
  isLoading,
  error,
  searchTerm,
  onSearchChange,
  onPageChange,
  headerActions,
  statusAlerts,
  addSubfieldButton,
  emptyStateButton,
  backLink,
  onBack,
  backLabel,
}: ComplexDetailViewProps) {
  const [, setSearchParams] = useSearchParams();
  const isFirstRender = React.useRef(true);

  // Sync URL with pagination and search (skip first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!pagination) return;
    const params: Record<string, string> = {};
    if (pagination.page > 1) params.page = pagination.page.toString();
    if (searchTerm) params.search = searchTerm;
    setSearchParams(params, { replace: true });
  }, [pagination?.page, searchTerm, setSearchParams]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error or Not Found
  if (error || !complex) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold mb-2">Không tìm thấy khu phức hợp</h2>
        <p className="text-muted-foreground mb-6">
          {error ||
            "Khu phức hợp bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."}
        </p>
        {onBack ? (
          <Button onClick={onBack}>{backLabel}</Button>
        ) : backLink ? (
          <Link to={backLink}>
            <Button>{backLabel}</Button>
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Back Button */}
      {onBack ? (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-base text-muted-foreground hover:text-primary transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          {backLabel}
        </button>
      ) : backLink ? (
        <Link
          to={backLink}
          className="inline-flex items-center gap-2 text-base text-muted-foreground hover:text-primary transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          {backLabel}
        </Link>
      ) : null}

      {/* Temporary notice for testers */}
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 rounded mb-4">
        Khu phức hợp sẽ được <b>active</b> ngay khi tạo mới để tiện test các
        chức năng khác (chưa có chức năng duyệt của admin).
      </div>

      {/* Hero Image Section */}
      {complex.complex_image && (
        <div className="relative h-[350px] md:h-[450px] lg:h-[550px] -mx-4 md:-mx-8 lg:mx-0 rounded-none lg:rounded-2xl overflow-hidden shadow-xl">
          <img
            src={complex.complex_image}
            alt={complex.complex_name}
            className="w-full h-full object-cover"
          />
          {/* Multi-layer gradient for better text contrast */}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-br from-black/20 via-transparent to-black/20" />

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col justify-end">
            <div className="p-6 md:p-10 lg:p-12 space-y-3">
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white drop-shadow-2xl leading-tight">
                {complex.complex_name}
              </h1>
              <div className="flex items-start gap-3 text-white/95">
                <MapPin className="w-5 h-5 md:w-6 md:h-6 mt-1 shrink-0 drop-shadow-lg" />
                <span className="text-base md:text-lg lg:text-xl drop-shadow-lg leading-relaxed">
                  {complex.complex_address}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header (fallback when no image) */}
      {!complex.complex_image && (
        <div>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                {complex.complex_name}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground mt-2">
                <MapPin className="w-4 h-4" />
                <span>{complex.complex_address}</span>
              </div>
            </div>
            {/* Owner-specific actions (Edit/Delete buttons) */}
            {headerActions && (
              <div className="flex items-center gap-3">{headerActions}</div>
            )}
          </div>
        </div>
      )}

      {/* Owner Actions (when image exists) */}
      {complex.complex_image && headerActions && (
        <div className="flex items-center justify-end gap-3">
          {headerActions}
        </div>
      )}

      {/* Status alerts (Owner mode only) */}
      {statusAlerts}

      {/* SubFields Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {mode === "owner" ? "Danh Sách Sân Con" : "Các Sân Có Sẵn"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {mode === "owner"
                ? "Quản lý các sân và giá thuê trong khu phức hợp"
                : "Chọn sân phù hợp để đặt lịch"}
            </p>
          </div>
          {/* Add Subfield Button (Owner mode only) */}
          {addSubfieldButton}
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm sân con..."
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {subfields && subfields.length > 0 ? (
          <>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {subfields.map((subField) => (
                <SubFieldCard
                  key={subField.id}
                  subField={subField}
                  mode={mode === "owner" ? "owner" : "player"}
                  showComplexInfo={false}
                />
              ))}
            </div>
            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </Button>
                <span className="text-sm text-muted-foreground">
                  Trang {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl bg-muted/10">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium">
              {mode === "owner"
                ? "Chưa có sân con nào"
                : "Không có sân nào khả dụng"}
            </h3>
            <p className="text-muted-foreground max-w-sm text-center mt-1 mb-6">
              {mode === "owner"
                ? "Khu phức hợp này chưa có sân con nào. Hãy thêm sân con để bắt đầu nhận lịch đặt."
                : searchTerm
                ? "Không tìm thấy sân nào phù hợp. Thử tìm kiếm với từ khóa khác."
                : "Khu phức hợp này hiện chưa có sân nào để đặt."}
            </p>
            {emptyStateButton}
          </div>
        )}
      </div>
    </div>
  );
}
