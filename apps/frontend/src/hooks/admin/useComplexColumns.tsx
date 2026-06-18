import type { Column } from "@/components/shared/ui-utility/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { COMPLEX_STATUS_COLORS, COMPLEX_STATUS_LABELS } from "@/lib/constants";
import type { AdminComplex } from "@/types/admin.types";
import { formatPrice, sportLabel } from "@/utils";
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  MapPin,
  MoreHorizontal,
  Star,
  User,
  XCircle,
} from "lucide-react";

interface UseComplexColumnsProps {
  onViewDetail: (complex: AdminComplex) => void;
  onStatusUpdate: (id: string, status: string) => void;
}

export function useComplexColumns({
  onViewDetail,
  onStatusUpdate,
}: UseComplexColumnsProps) {
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
                {sportLabel(type)}
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
                  onViewDetail(complex);
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
                      onStatusUpdate(complex.id, "ACTIVE");
                    }}
                    className="text-emerald-600 dark:text-emerald-400"
                  >
                    <CheckCircle /> Duyệt sân
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusUpdate(complex.id, "REJECTED");
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
                    onStatusUpdate(complex.id, "INACTIVE");
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
                    onStatusUpdate(complex.id, "ACTIVE");
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

  return columns;
}
