import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SubfieldProduct } from "@/types";
import { formatPrice } from "@/utils";
import { Minus, Plus } from "lucide-react";

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
      <p className="rounded-md border p-4 text-sm text-muted-foreground">
        Sân này chưa có add-on khả dụng. Bạn có thể tiếp tục xác nhận.
      </p>
    );
  }

  return (
    <Card className="rounded-md py-0 shadow-none">
      <CardContent className="divide-y p-0">
        {products.map((product) => {
          const quantity = addonQuantities[product.id] || 0;
          const isLowStock = product.stock <= 3;

          return (
            <div
              key={product.id}
              className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="h-16 w-16 overflow-hidden rounded-md bg-muted">
                  <img
                    src={
                      product.image ||
                      "https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=1170"
                    }
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold">{product.name}</p>
                  {product.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {product.description}
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <span className="font-medium text-primary">
                      {formatPrice(Number(product.price))}
                    </span>
                    <span className="text-muted-foreground">/ sản phẩm</span>
                  </div>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      isLowStock ? "text-orange-600" : "text-muted-foreground",
                    )}
                  >
                    Còn {product.stock} sản phẩm
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdateAddonQuantity(product, -1)}
                  disabled={quantity <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="w-10 text-center text-sm font-semibold">{quantity}</div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdateAddonQuantity(product, 1)}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
