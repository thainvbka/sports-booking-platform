import {
  AdminDetailDialog,
  DetailInfoCard,
  DetailSummaryRow,
} from "@/components/admin/details/AdminDetailDialog";
import { AdminFiltersBar } from "@/components/admin/shell/AdminFiltersBar";
import { AdminPageHeader } from "@/components/admin/shell/AdminPageHeader";
import { AdminTableSection } from "@/components/admin/shell/AdminTableSection";
import { StatsGrid } from "@/components/admin/StatsGrid";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  COMPLEX_STATUS_COLORS,
  COMPLEX_STATUS_LABELS,
  SPORT_TYPE_LABELS,
} from "@/lib/constants";
import { extractLegalDocumentUrls } from "@/lib/legal-docs";
import { useAdminComplexStore } from "@/store/admin/useAdminComplexStore";
import type { AdminComplex } from "@/types/admin.types";
import { formatPrice, formatDateVn } from "@/utils";
import {
  AlertTriangle,
  CheckCircle,
  Clock3,
  Eye,
  FileText,
  MapPin,
  MoreHorizontal,
  PauseCircle,
  Search,
  ShieldX,
  Star,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useDebounce } from "@/hooks/useDebounce";

export default function AdminComplexesPage() {
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

  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [selectedComplex, setSelectedComplex] = useState<AdminComplex | null>(
    null,
  );
  const [docDialogOpen, setDocDialogOpen] = useState(false);

  useEffect(() => {
    fetchComplexes();
  }, [fetchComplexes]);

  const debouncedSearchValue = useDebounce(searchValue, 500);

  useEffect(() => {
    if (debouncedSearchValue !== (filters.search || "")) {
      setFilters({ search: debouncedSearchValue });
    }
  }, [debouncedSearchValue, filters.search, setFilters]);

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


  const getSportLabel = (sportType: unknown) => {
    const key = String(sportType) as keyof typeof SPORT_TYPE_LABELS;
    return SPORT_TYPE_LABELS[key] || "Không xác định";
  };

  const openComplexDetail = (complex: AdminComplex) => {
    setSelectedComplex(complex);
    setDocDialogOpen(true);
  };

  const columns: Column<AdminComplex>[] = [
    {
      header: "Khu phức hợp",
      className: "w-72",
      cell: (complex) => (
        <div className="flex items-center gap-3">
          {complex.complex_image ? (
            <img
              src={complex.complex_image}
              className="size-10 rounded-lg border border-border/60 object-cover"
            />
          ) : (
            <div className="flex size-10 items-center justify-center rounded-lg border border-border/60 bg-muted/60 text-muted-foreground">
              <MapPin className="size-5" />
            </div>
          )}
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-sm font-bold">
              {complex.complex_name}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{complex.complex_address}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Chủ sở hữu",
      className: "w-52",
      cell: (complex) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <User className="size-3.5 text-primary" />
            <span className="truncate">{complex.owner.account.full_name}</span>
          </div>
          <span className="ml-5 truncate text-[10px] italic text-muted-foreground">
            {complex.owner.account.email}
          </span>
        </div>
      ),
    },
    {
      header: "Thông tin",
      className: "w-40",
      cell: (complex) => (
        <div className="flex flex-col gap-1 text-[10px]">
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="h-4 py-0 text-[9px]">
              {complex.total_subfields} sân con
            </Badge>
            {complex.avg_rating && (
              <div className="flex items-center gap-0.5 font-bold text-amber-600 dark:text-amber-400">
                <Star className="size-3 fill-current" />
                {Number(complex.avg_rating).toFixed(1)}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {complex.sport_types.map((type) => (
              <span key={type} className="text-muted-foreground">
                {getSportLabel(type)}
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      header: "Khoảng giá",
      className: "w-44",
      cell: (complex) => (
        <div className="flex flex-col text-[11px] font-medium tabular-nums">
          <span className="text-emerald-600 dark:text-emerald-400">
            {formatPrice(complex.min_price || 0)}
          </span>
          <span className="text-muted-foreground/60">đến</span>
          <span className="text-sky-600 dark:text-sky-400">
            {formatPrice(complex.max_price || 0)}
          </span>
        </div>
      ),
    },
    {
      header: "Trạng thái",
      className: "w-32",
      cell: (complex) => (
        <Badge
          className={`${COMPLEX_STATUS_COLORS[complex.status]} h-5 border-none py-0 text-[10px] shadow-none`}
        >
          {COMPLEX_STATUS_LABELS[complex.status]}
        </Badge>
      ),
    },
    {
      header: "",
      className: "w-12 text-right",
      cell: (complex) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal />
              <span className="sr-only">Mở menu hành động</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  openComplexDetail(complex);
                }}
              >
                <Eye /> Xem chi tiết
              </DropdownMenuItem>
              {complex.status === "PENDING" && (
                <>
                  <DropdownMenuItem
                    onSelect={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(complex.id, "ACTIVE");
                    }}
                    className="text-emerald-600 dark:text-emerald-400"
                  >
                    <CheckCircle /> Duyệt sân
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(complex.id, "REJECTED");
                    }}
                    className="text-rose-600 dark:text-rose-400"
                  >
                    <XCircle /> Từ chối
                  </DropdownMenuItem>
                </>
              )}
              {complex.status === "ACTIVE" && (
                <DropdownMenuItem
                  onSelect={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusUpdate(complex.id, "INACTIVE");
                  }}
                  className="text-amber-600 dark:text-amber-400"
                >
                  <AlertTriangle /> Tạm dừng hoạt động
                </DropdownMenuItem>
              )}
              {complex.status === "INACTIVE" && (
                <DropdownMenuItem
                  onSelect={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusUpdate(complex.id, "ACTIVE");
                  }}
                >
                  <CheckCircle /> Kích hoạt lại
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

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

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 lg:px-6">
      <AdminPageHeader
        index={2}
        title="Quản lý"
        titleAccent="khu phức hợp"
        description="Duyệt khu phức hợp thể thao đăng ký mới và điều phối trạng thái vận hành của toàn mạng lưới."
      />

      <StatsGrid items={statItems} />

      <AdminFiltersBar>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên khu phức hợp, chủ sở hữu..."
            className="h-9 pl-9"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <Select
          value={filters.status || "ALL"}
          onValueChange={(value) =>
            setFilters({ status: value === "ALL" ? undefined : value })
          }
        >
          <SelectTrigger className="h-9 w-full shrink-0 md:w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            {Object.entries(COMPLEX_STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AdminFiltersBar>

      <AdminTableSection
        index={3}
        eyebrow="Data · Table"
        title="Danh mục khu phức hợp"
        description="Nhấp vào một dòng để xem hồ sơ pháp lý và phê duyệt."
        count={totalComplexes}
        countLabel="khu"
      >
        <DataTable
          data={complexes}
          columns={columns}
          isLoading={isLoading}
          paginationStyle="search"
          onRowClick={(complex) => openComplexDetail(complex)}
          pagination={{
            page: queryParams.page,
            totalPages: pagination?.totalPages || 1,
            onPageChange: setPage,
          }}
          emptyMessage="Không tìm thấy khu phức hợp nào"
        />
      </AdminTableSection>

      <AdminDetailDialog
        open={docDialogOpen}
        onOpenChange={setDocDialogOpen}
        title={`Hồ sơ xác thực: ${selectedComplex?.complex_name || "-"}`}
        icon={FileText}
        statusLabel={
          selectedComplex
            ? COMPLEX_STATUS_LABELS[selectedComplex.status]
            : undefined
        }
        statusClassName={
          selectedComplex
            ? COMPLEX_STATUS_COLORS[selectedComplex.status]
            : undefined
        }
        contentClassName="max-w-3xl"
      >
        {selectedComplex && (
          <div className="max-h-[70vh] space-y-6 overflow-y-auto bg-background p-6">
            <DetailSummaryRow
              leftLabel="Tên khu phức hợp"
              leftValue={
                <p className="font-display text-lg font-bold italic tracking-tight text-foreground">
                  {selectedComplex.complex_name}
                </p>
              }
              rightLabel="Địa chỉ"
              rightValue={
                <p className="wrap-break-word max-w-80 text-xs font-medium text-foreground">
                  {selectedComplex.complex_address}
                </p>
              }
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DetailInfoCard
                label="Chủ sở hữu"
                value={selectedComplex.owner.account.full_name}
                helper={selectedComplex.owner.company_name}
              />
              <DetailInfoCard
                label="Liên hệ"
                value={selectedComplex.owner.account.email}
                helper={selectedComplex.owner.account.phone_number}
              />
              <DetailInfoCard
                label="Ngày đăng ký"
                value={formatDateVn(
                  selectedComplex.created_at,
                  "dd/MM/yyyy HH:mm",
                )}
              />
              <DetailInfoCard
                label="Số sân con"
                value={selectedComplex.total_subfields}
              />
              <DetailInfoCard
                label="Đánh giá trung bình"
                value={
                  selectedComplex.avg_rating
                    ? Number(selectedComplex.avg_rating).toFixed(1)
                    : "Chưa có"
                }
                helper={`Tổng đánh giá: ${selectedComplex.total_reviews || 0}`}
              />
              <DetailInfoCard
                label="Khoảng giá"
                value={`${formatPrice(selectedComplex.min_price || 0)} - ${formatPrice(selectedComplex.max_price || 0)}`}
              />
            </div>

            <div className="rounded-lg border border-border/60 p-4">
              <p className="mb-2 text-[10px] font-bold uppercase text-muted-foreground">
                Môn thể thao khả dụng
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedComplex.sport_types.length > 0 ? (
                  selectedComplex.sport_types.map((type) => (
                    <Badge key={type} variant="secondary">
                      {getSportLabel(type)}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Chưa có dữ liệu
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border/60 p-4">
              <p className="mb-2 text-[10px] font-bold uppercase text-muted-foreground">
                Tài liệu pháp lý
              </p>
              {selectedComplexDocUrls.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {selectedComplexDocUrls.map((docUrl, index) => (
                    <a
                      key={`${docUrl}-${index}`}
                      href={docUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group overflow-hidden rounded-md border border-border/60 bg-muted/20"
                    >
                      <div className="border-b border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground">
                        Tài liệu #{index + 1}
                      </div>
                      <img
                        src={docUrl}
                        alt={`Tài liệu pháp lý ${index + 1}`}
                        className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-border/70 bg-muted/20 p-3 text-xs text-muted-foreground">
                  Không tìm thấy ảnh tài liệu hợp lệ trong dữ liệu pháp lý.
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-border/60 pt-4">
              <Button variant="outline" onClick={() => setDocDialogOpen(false)}>
                Đóng
              </Button>
              {selectedComplex.status === "PENDING" && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleStatusUpdate(selectedComplex.id, "REJECTED");
                      setDocDialogOpen(false);
                    }}
                  >
                    <XCircle data-icon="inline-start" />
                    Từ chối
                  </Button>
                  <Button
                    onClick={() => {
                      handleStatusUpdate(selectedComplex.id, "ACTIVE");
                      setDocDialogOpen(false);
                    }}
                  >
                    <CheckCircle data-icon="inline-start" />
                    Phê duyệt ngay
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </AdminDetailDialog>

    </div>
  );
}
