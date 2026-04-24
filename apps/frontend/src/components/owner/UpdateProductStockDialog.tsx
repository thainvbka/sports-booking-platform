import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OwnerProduct, UpdateProductStockPayload } from "@/types";
import { updateProductStockFormSchema } from "@/validations";
import {
  ArrowRight,
  Loader2,
  PackagePlus,
  TrendingUp,
  Warehouse,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface UpdateProductStockDialogProps {
  open: boolean;
  product?: OwnerProduct | null;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: UpdateProductStockPayload) => Promise<void>;
}

export function UpdateProductStockDialog({
  open,
  product,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: UpdateProductStockDialogProps) {
  const [incrementValue, setIncrementValue] = useState("1");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setIncrementValue("1");
    setError(null);
  }, [open, product?.id]);

  const parsedIncrement = useMemo(() => {
    const num = Number(incrementValue);
    return Number.isFinite(num) && num > 0 ? Math.floor(num) : 0;
  }, [incrementValue]);

  const currentStock = product?.stock ?? 0;
  const projectedStock = currentStock + parsedIncrement;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = updateProductStockFormSchema.safeParse({
      increment: incrementValue,
    });

    if (!parsed.success) {
      const issue = parsed.error.flatten().fieldErrors.increment?.[0];
      setError(issue || "Dữ liệu không hợp lệ");
      return;
    }

    setError(null);
    await onSubmit(parsed.data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-md">
        <div
          aria-hidden
          className="h-1 w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500"
        />

        <div className="flex flex-col gap-5 px-6 py-5">
          <DialogHeader className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-100 text-emerald-600">
                <PackagePlus className="size-5" />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <Badge
                  variant="outline"
                  className="h-5 w-fit gap-1 rounded-full border-emerald-300/50 bg-emerald-100 px-2 text-[9.5px] font-semibold uppercase tracking-[0.22em] text-emerald-700"
                >
                  <TrendingUp className="size-2.5" />
                  Restock
                </Badge>
                <DialogTitle className="font-display text-lg font-black italic tracking-tight">
                  Nhập thêm kho
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Cộng nhanh số lượng tồn kho cho sản phẩm.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form
            id="restock-form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/30 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Sản phẩm
                  </span>
                  <span className="truncate font-display text-sm font-bold italic text-foreground">
                    {product?.name || "-"}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="gap-1 rounded-full border-border/70 bg-background"
                >
                  <Warehouse className="size-3" />
                  <span className="font-display italic tabular-nums">
                    {currentStock}
                  </span>
                </Badge>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-emerald-300/40 bg-emerald-50/60 px-3 py-2">
                <div className="flex flex-col">
                  <span className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Hiện tại
                  </span>
                  <span className="font-display text-base font-bold italic tabular-nums text-foreground">
                    {currentStock}
                  </span>
                </div>
                <ArrowRight className="size-4 text-muted-foreground" />
                <div className="flex flex-col items-end">
                  <span className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
                    Sau khi nhập
                  </span>
                  <span className="font-display text-base font-bold italic tabular-nums text-emerald-700">
                    {projectedStock}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="increment-stock"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                <PackagePlus className="size-3.5" />
                Số lượng nhập thêm
              </Label>
              <Input
                id="increment-stock"
                type="number"
                min={1}
                step={1}
                value={incrementValue}
                onChange={(event) => setIncrementValue(event.target.value)}
                disabled={isSubmitting}
                className="h-10 tabular-nums"
                aria-invalid={Boolean(error)}
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          </form>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-full"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              form="restock-form"
              disabled={isSubmitting}
              className="rounded-full bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-emerald-500"
            >
              {isSubmitting ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                  Đang cập nhật…
                </>
              ) : (
                <>
                  <PackagePlus data-icon="inline-start" />
                  Cập nhật tồn kho
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
