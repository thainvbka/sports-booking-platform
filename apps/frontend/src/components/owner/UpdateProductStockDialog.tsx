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
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nhập thêm kho</DialogTitle>
          <DialogDescription>
            Cập nhật nhanh số lượng tồn kho cho sản phẩm
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-sm font-medium">{product?.name || "-"}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Tồn kho hiện tại: {product?.stock ?? 0}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="increment-stock">Số lượng nhập thêm</Label>
            <Input
              id="increment-stock"
              type="number"
              min={1}
              step={1}
              value={incrementValue}
              onChange={(event) => setIncrementValue(event.target.value)}
              disabled={isSubmitting}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                "Cập nhật tồn kho"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
