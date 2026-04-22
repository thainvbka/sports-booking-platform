import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import { SubFieldCard } from "@/components/shared/SubFieldCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ComplexDetail, PaginationMeta, SubField } from "@/types";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
  TriangleAlert,
} from "lucide-react";
import React, { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

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
  onRetry?: () => void;
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
  onRetry,
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
      <LoadingState
        text="Đang tải chi tiết khu phức hợp..."
        className="h-[50vh] border-0 bg-transparent"
      />
    );
  }

  // Error or Not Found
  if (error || !complex) {
    const hasError = Boolean(error);
    const fallbackAction = onBack
      ? onBack
      : backLink
        ? () => {
            window.location.href = backLink;
          }
        : undefined;

    const primaryAction = hasError && onRetry ? onRetry : fallbackAction;
    const primaryLabel = hasError && onRetry ? "Thử lại" : fallbackAction ? backLabel : undefined;

    return (
      <EmptyState
        title={hasError ? "Không thể tải khu phức hợp" : "Không tìm thấy khu phức hợp"}
        description={
          error ||
          "Khu phức hợp bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
        }
        actionLabel={primaryLabel}
        onAction={primaryAction}
        className="py-20"
      />
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Back Button */}
      {onBack ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Button>
      ) : backLink ? (
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link to={backLink}>
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </Button>
      ) : null}

      {/* Temporary notice for testers (owner mode only) */}
      {mode === "owner" ? (
        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <TriangleAlert className="h-4 w-4 text-amber-700" />
          <AlertDescription className="text-sm">
            Khu phức hợp sẽ được <b>active</b> ngay khi tạo mới để tiện test các
            chức năng khác (chưa có chức năng duyệt của admin).
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Hero Image Section */}
      {complex.complex_image && (
        <div className="relative h-87.5 md:h-112.5 lg:h-137.5 -mx-4 md:-mx-8 lg:mx-0 rounded-none lg:rounded-2xl overflow-hidden shadow-xl">
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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              {mode === "owner" ? "Danh Sách Sân Con" : "Các Sân Có Sẵn"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {mode === "owner"
                ? "Quản lý các sân và giá thuê trong khu phức hợp"
                : "Chọn sân phù hợp để đặt lịch"}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-primary/20 bg-primary/8 text-primary"
              >
                {pagination?.total ?? subfields.length} sân con
              </Badge>

              {searchTerm ? (
                <Badge
                  variant="outline"
                  className="max-w-52 border-border bg-background text-muted-foreground"
                >
                  <span className="truncate">Từ khóa: {searchTerm}</span>
                </Badge>
              ) : null}
            </div>
          </div>
          {/* Add Subfield Button (Owner mode only) */}
          {addSubfieldButton}
        </div>

        {/* Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-2/70 p-3">
          <div className="relative w-full max-w-md flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm sân con..."
              className="bg-background pl-9"
              value={searchTerm}
              aria-label="Tìm kiếm sân con"
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            {searchTerm ? (
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => onSearchChange("")}
              >
                Xóa tìm kiếm
              </Button>
            ) : null}

            {pagination ? (
              <Badge
                variant="outline"
                className="border-border bg-background text-muted-foreground"
              >
                Trang {pagination.page}/{Math.max(pagination.totalPages, 1)}
              </Badge>
            ) : null}
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
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-2/60 px-3 py-2">
                <p className="text-sm text-muted-foreground">
                  Hiển thị {subfields.length}/{pagination.total} sân trong trang này.
                </p>

                <div className="flex items-center gap-2">
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
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <EmptyState
              title={
                mode === "owner"
                  ? "Chưa có sân con nào"
                  : "Không có sân nào khả dụng"
              }
              description={
                mode === "owner"
                  ? "Khu phức hợp này chưa có sân con nào. Hãy thêm sân con để bắt đầu nhận lịch đặt."
                  : searchTerm
                    ? "Không tìm thấy sân nào phù hợp. Thử tìm kiếm với từ khóa khác."
                    : "Khu phức hợp này hiện chưa có sân nào để đặt."
              }
              actionLabel={
                mode === "public" && searchTerm ? "Xóa từ khóa" : undefined
              }
              onAction={
                mode === "public" && searchTerm
                  ? () => {
                      onSearchChange("");
                    }
                  : undefined
              }
              icon={<MapPin className="h-8 w-8 text-muted-foreground/60" />}
              className="py-16"
            />
            {emptyStateButton ? (
              <div className="flex justify-center">{emptyStateButton}</div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
