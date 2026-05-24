import { ImageFallback } from "@/components/shared/ImageFallback";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PRODUCT_TYPE_COLORS, PRODUCT_TYPE_LABELS } from "@/lib/constants";
import type { SubfieldProduct } from "@/types";
import { formatPrice } from "@/utils";
import { Flame, Minus, Package, Plus } from "lucide-react";

interface BookingAddonsStepProps {
  hasUpsellStep: boolean;
  products: SubfieldProduct[];
  addonQuantities: Record<string, number>;
  onUpdateAddonQuantity: (product: SubfieldProduct, delta: number) => void;
}

export function BookingAddonsStep({
  hasUpsellStep,
  products,
  addonQuantities,
  onUpdateAddonQuantity,
}: BookingAddonsStepProps) {
  if (!hasUpsellStep) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-dashed border-border/70 bg-surface-2/40 p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Package className="size-4" />
        </span>
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-semibold text-foreground">
            Sân này chưa có add-on khả dụng
          </p>
          <p className="text-xs text-muted-foreground">
            Bạn có thể tiếp tục sang bước xác nhận để chốt đơn.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-xs text-muted-foreground">
        Gợi ý các trang bị thường được cầu thủ đặt cùng. Có thể điều chỉnh số
        lượng hoặc bỏ qua.
      </p>

      <ul className="flex flex-col gap-2">
        {products.map((product) => {
          const quantity = addonQuantities[product.id] || 0;
          const isSelected = quantity > 0;
          const isLowStock = product.stock <= 3;

          return (
            <li
              key={product.id}
              className={cn(
                "group relative flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/70 p-3 transition-colors sm:flex-row sm:items-center sm:gap-4",
                isSelected && "border-primary/40 bg-primary/5",
              )}
            >
              {/* Thumb */}
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted sm:size-[72px]">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <ImageFallback
                    title={product.name}
                    showLabel={false}
                    className="rounded-none"
                  />
                )}
              </div>

              {/* Info */}
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {product.name}
                  </p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-4 rounded-full px-1.5 py-0 text-[9px] font-bold uppercase tracking-[0.12em]",
                      PRODUCT_TYPE_COLORS[product.type],
                    )}
                  >
                    {PRODUCT_TYPE_LABELS[product.type]}
                  </Badge>
                </div>
                {product.description && (
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {product.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-0.5">
                  <span className="font-display text-sm font-bold italic tabular-nums text-primary">
                    {formatPrice(Number(product.price))}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {product.type === "RENTAL" ? "/ lượt thuê" : "/ sản phẩm"}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.14em]",
                      isLowStock
                        ? "bg-amber-100/80 text-amber-800"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {isLowStock ? <Flame className="size-3" /> : null}
                    Còn {product.stock}
                  </span>
                </div>
              </div>

              {/* Quantity stepper */}
              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <div
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border border-border/70 bg-background p-1 shadow-sm",
                    isSelected && "border-primary/40",
                  )}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-7 rounded-full"
                    onClick={() => onUpdateAddonQuantity(product, -1)}
                    disabled={quantity <= 0}
                    aria-label="Giảm số lượng"
                  >
                    <Minus />
                  </Button>
                  <span className="min-w-6 text-center font-display text-sm font-black italic tabular-nums">
                    {quantity}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-7 rounded-full"
                    onClick={() => onUpdateAddonQuantity(product, 1)}
                    disabled={quantity >= product.stock}
                    aria-label="Tăng số lượng"
                  >
                    <Plus />
                  </Button>
                </div>

                {isSelected ? (
                  <span className="font-display text-sm font-bold italic tabular-nums text-primary">
                    {formatPrice(Number(product.price) * quantity)}
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
