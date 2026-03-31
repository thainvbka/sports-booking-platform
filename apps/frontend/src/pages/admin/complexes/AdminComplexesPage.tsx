import {
  AdminDetailDialog,
  DetailInfoCard,
  DetailSummaryRow,
} from "@/components/admin/details/AdminDetailDialog";
import { StatsGrid } from "@/components/admin/StatsGrid";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
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
import { useAdminComplexStore } from "@/store/admin/useAdminComplexStore";
import type { AdminComplex } from "@/types/admin.types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  AlertTriangle,
  CheckCircle,
  Clock3,
  Eye,
  FileText,
  MapPin,
  MoreVertical,
  PauseCircle,
  Search,
  ShieldX,
  Star,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== (filters.search || "")) {
        setFilters({ search: searchValue });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue, filters.search, setFilters]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateComplexStatus(id, status);
      toast.success(
        `Đã cập nhật trạng thái sân bóng thành ${COMPLEX_STATUS_LABELS[status]}`,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể cập nhật trạng thái";
      toast.error(message);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
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
      header: "Sân bóng",
      className: "w-72",
      cell: (complex) => (
        <div className="flex items-center gap-3">
          {complex.complex_image ? (
            <img
              src={complex.complex_image}
              className="size-10 rounded-md object-cover border"
            />
          ) : (
            <div className="size-10 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 border">
              <MapPin className="size-5" />
            </div>
          )}
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-bold text-sm truncate">
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
          <div className="flex items-center gap-1.5 font-medium text-xs">
            <User className="w-3.5 h-3.5 text-blue-500" />
            <span className="truncate">{complex.owner.account.full_name}</span>
          </div>
          <span className="text-[10px] text-muted-foreground ml-5 truncate italic">
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
            <Badge variant="outline" className="text-[9px] py-0 h-4">
              {complex.total_subfields} sân con
            </Badge>
            {complex.avg_rating && (
              <div className="flex items-center gap-0.5 text-yellow-600 font-bold">
                <Star className="size-3 fill-yellow-600" />
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
        <div className="flex flex-col text-[11px] font-medium">
          <span className="text-green-700">
            {formatPrice(complex.min_price || 0)}
          </span>
          <span className="text-slate-400">đến</span>
          <span className="text-blue-700">
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
          className={`${COMPLEX_STATUS_COLORS[complex.status]} border-none text-[10px] py-0 h-5 shadow-none`}
        >
          {COMPLEX_STATUS_LABELS[complex.status]}
        </Badge>
      ),
    },
    {
      header: "Hành động",
      className: "w-20",
      cell: (complex) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={(e) => {
              e.stopPropagation();
              openComplexDetail(complex);
            }}
          >
            <Eye className="size-4 text-blue-500" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {complex.status === "PENDING" && (
                <>
                  <DropdownMenuItem
                    onSelect={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(complex.id, "ACTIVE");
                    }}
                    className="text-green-600"
                  >
                    <CheckCircle className="size-4 mr-2" /> Duyệt sân
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(complex.id, "REJECTED");
                    }}
                    className="text-red-600"
                  >
                    <XCircle className="size-4 mr-2" /> Từ chối
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
                  className="text-orange-600"
                >
                  <AlertTriangle className="size-4 mr-2" /> Tạm dừng hoạt động
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
                  <CheckCircle className="size-4 mr-2" /> Kích hoạt lại
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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

  return (
    <div className="px-4 lg:px-6 space-y-6 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Sân bóng</h1>
        <p className="text-sm text-muted-foreground">
          Duyệt sân bóng mới và quản lý trạng thái hoạt động của các khu phức
          hợp thể thao.
        </p>
      </div>

      <StatsGrid items={statItems} />

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên sân bóng..."
            className="pl-9 h-9 border-slate-200 shadow-none"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={filters.status || "ALL"}
            onValueChange={(value) =>
              setFilters({ status: value === "ALL" ? undefined : value })
            }
          >
            <SelectTrigger className="w-45 h-9 border-slate-200 shadow-none">
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
        </div>
      </div>

      <DataTable
        data={complexes}
        columns={columns}
        isLoading={isLoading}
        onRowClick={(complex) => openComplexDetail(complex)}
        pagination={{
          page: queryParams.page,
          totalPages: pagination?.totalPages || 1,
          onPageChange: setPage,
        }}
        emptyMessage="Không tìm thấy sân bóng nào"
      />

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
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto bg-white">
            <DetailSummaryRow
              leftLabel="Tên khu phức hợp"
              leftValue={
                <p className="text-lg font-bold text-slate-900">
                  {selectedComplex.complex_name}
                </p>
              }
              rightLabel="Địa chỉ"
              rightValue={
                <p className="text-xs font-medium text-slate-700 max-w-80 wrap-break-word">
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
                value={format(
                  new Date(selectedComplex.created_at),
                  "dd/MM/yyyy HH:mm",
                  { locale: vi },
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

            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">
                Môn thể thao khả dụng
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedComplex.sport_types.length > 0 ? (
                  selectedComplex.sport_types.map((type) => (
                    <Badge
                      key={type}
                      variant="secondary"
                      className="bg-slate-100 text-slate-700"
                    >
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

            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">
                Tài liệu pháp lý (JSON)
              </p>
              <pre className="p-3 bg-slate-50 rounded-md border text-xs font-mono overflow-x-auto">
                {JSON.stringify(selectedComplex.verification_docs, null, 2)}
              </pre>
            </div>

            <div className="pt-2 border-t flex flex-wrap justify-end gap-2">
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
                    Từ chối
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleStatusUpdate(selectedComplex.id, "ACTIVE");
                      setDocDialogOpen(false);
                    }}
                  >
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
