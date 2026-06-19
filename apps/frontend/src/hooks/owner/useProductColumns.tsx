import type { Column } from "@/components/shared/ui-utility/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PRODUCT_STATUS_COLORS,
  PRODUCT_STATUS_LABELS,
  PRODUCT_TYPE_COLORS,
  PRODUCT_TYPE_LABELS,
  SPORT_TYPE_LABELS,
} from "@/constants";
import { cn } from "@/lib/utils";
import type { OwnerProduct } from "@/types";
import { formatPrice } from "@/utils";
import {
  MoreVertical,
  Package2,
  PackagePlus,
  Pencil,
  PowerOff,
  Tag,
  ToggleLeft,
} from "lucide-react";

interface UseProductColumnsProps {
  isSubmitting: boolean;
  onEdit: (product: OwnerProduct) => void;
  onUpdateStock: (product: OwnerProduct) => void;
  onToggleStatus: (product: OwnerProduct) => void;
  lowStockThreshold?: number;
}

export function useProductColumns({
  isSubmitting,
  onEdit,
  onUpdateStock,
  onToggleStatus,
  lowStockThreshold = 5,
}: UseProductColumnsProps) {
  const columns: Column<OwnerProduct>[] = [
    {
      header: "Sản phẩm",
      className: "w-64",
      cell: (product) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <Package2 className="size-4 opacity-50" />
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold">
              {product.name}
            </span>
            <span className="line-clamp-1 text-xs text-muted-foreground">
              {product.description || "Không có mô tả"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Cơ sở",
      className: "w-48",
      cell: (product) => (
        <span className="line-clamp-2 text-sm font-medium">
          {product.complex.complex_name}
        </span>
      ),
    },
    {
      header: "Môn thể thao",
      className: "w-36 whitespace-nowrap",
      cell: (product) => (
        <Badge
          variant="outline"
          className="h-5 gap-1 rounded-full border-border/60 bg-background/70 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
        >
          <Tag className="size-2.5" />
          {!product.sport_types || product.sport_types.length === 0
            ? "Tất cả"
            : product.sport_types.map((sport) => SPORT_TYPE_LABELS[sport]).join(", ")}
        </Badge>
      ),
    },
    {
      header: "Giá",
      className: "w-32 whitespace-nowrap text-right",
      cell: (product) => (
        <div className="text-right">
          <span className="font-display text-sm font-black italic tabular-nums tracking-tight text-foreground">
            {formatPrice(product.price)}
          </span>
        </div>
      ),
    },
    {
      header: "Tồn kho",
      className: "w-32 whitespace-nowrap",
      cell: (product) => {
        const lowStock = product.stock <= lowStockThreshold;
        const empty = product.stock === 0;
        return (
          <div className="flex items-center gap-1.5">
            <span
              aria-hidden
              className={cn(
                "size-1.5 rounded-full",
                empty
                  ? "bg-rose-500"
                  : lowStock
                  ? "bg-amber-500"
                  : "bg-emerald-500",
              )}
            />
            <span className="font-display text-sm font-bold italic tabular-nums tracking-tight">
              {product.stock}
            </span>
            {empty ? (
              <Badge
                variant="outline"
                className="h-4 rounded-full px-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 status-surface-error"
              >
                Hết
              </Badge>
            ) : lowStock ? (
              <Badge
                variant="outline"
                className="h-4 rounded-full px-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 status-surface-warning"
              >
                Sắp hết
              </Badge>
            ) : null}
          </div>
        );
      },
    },
    {
      header: "Loại",
      className: "w-32 whitespace-nowrap",
      cell: (product) => (
        <Badge
          className={cn(
            "h-6 rounded-full px-2.5 text-[10.5px] font-semibold uppercase tracking-[0.14em]",
            PRODUCT_TYPE_COLORS[product.type],
          )}
        >
          {PRODUCT_TYPE_LABELS[product.type]}
        </Badge>
      ),
    },
    {
      header: "Trạng thái",
      className: "w-32 whitespace-nowrap",
      cell: (product) => (
        <Badge
          className={cn(
            "h-6 rounded-full px-2.5 text-[10.5px] font-semibold uppercase tracking-[0.14em]",
            PRODUCT_STATUS_COLORS[product.status],
          )}
        >
          {PRODUCT_STATUS_LABELS[product.status]}
        </Badge>
      ),
    },
    {
      header: "",
      className: "w-12",
      cell: (product) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Thao tác"
              disabled={isSubmitting}
            >
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem
              onClick={() => onEdit(product)}
              className="cursor-pointer gap-2"
            >
              <Pencil className="size-3.5 text-muted-foreground" />
              Sửa thông tin
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onUpdateStock(product)}
              className="cursor-pointer gap-2"
            >
              <PackagePlus className="size-3.5 text-muted-foreground" />
              Nhập thêm kho
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onToggleStatus(product)}
              className={cn(
                "cursor-pointer gap-2",
                product.status === "ACTIVE"
                  ? "text-rose-700 focus:text-rose-700 dark:text-rose-400 dark:focus:text-rose-400"
                  : "text-emerald-700 focus:text-emerald-700 dark:text-emerald-400 dark:focus:text-emerald-400",
              )}
            >
              {product.status === "ACTIVE" ? (
                <PowerOff className="size-3.5" />
              ) : (
                <ToggleLeft className="size-3.5" />
              )}
              {product.status === "ACTIVE"
                ? "Tạm dừng bán"
                : "Bật bán trở lại"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return columns;
}
