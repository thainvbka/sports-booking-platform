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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SPORT_TYPE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type {
  ComplexListItem,
  CreateProductPayload,
  OwnerProduct,
  ProductStatus,
  SportType,
  UpdateProductPayload,
} from "@/types";
import {
  createProductFormSchema,
  updateProductFormSchema,
} from "@/validations";
import {
  Activity,
  Building2,
  Coins,
  ImagePlus,
  Loader2,
  PackagePlus,
  Pencil,
  ShoppingBag,
  Tag,
  Warehouse,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ProductFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  complexes: ComplexListItem[];
  product?: OwnerProduct | null;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    payload: CreateProductPayload | UpdateProductPayload,
    imageFile?: File | null,
  ) => Promise<void>;
}

interface ProductFormState {
  complex_id: string;
  name: string;
  description: string;
  price: string;
  stock: string;
  sport_type: SportType | "NONE";
  status: ProductStatus;
}

const defaultFormState: ProductFormState = {
  complex_id: "",
  name: "",
  description: "",
  price: "",
  stock: "0",
  sport_type: "NONE",
  status: "ACTIVE",
};

export function ProductFormDialog({
  open,
  mode,
  complexes,
  product,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: ProductFormDialogProps) {
  const [formState, setFormState] =
    useState<ProductFormState>(defaultFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && product) {
      setFormState({
        complex_id: product.complex_id,
        name: product.name,
        description: product.description || "",
        price: String(product.price),
        stock: String(product.stock),
        sport_type: product.sport_type || "NONE",
        status: product.status,
      });
      setImageFile(null);
      setImagePreview(product.image || "");
      setErrors({});
      return;
    }

    setFormState(defaultFormState);
    setImageFile(null);
    setImagePreview("");
    setErrors({});
  }, [open, mode, product]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const updateField = <K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K],
  ) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const normalizePayload = () => {
    const payload = {
      ...(mode === "create" ? { complex_id: formState.complex_id } : {}),
      name: formState.name,
      description: formState.description,
      price: formState.price,
      stock: formState.stock,
      sport_type: formState.sport_type === "NONE" ? null : formState.sport_type,
      status: formState.status,
    };

    return payload;
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = normalizePayload();

    const parsedResult =
      mode === "create"
        ? createProductFormSchema.safeParse(payload)
        : updateProductFormSchema.safeParse(payload);

    if (!parsedResult.success) {
      const flattened = parsedResult.error.flatten().fieldErrors;
      const nextErrors: Record<string, string> = {};

      Object.entries(flattened).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          nextErrors[field] = messages[0] as string;
        }
      });

      setErrors(nextErrors);
      return;
    }

    setErrors({});
    await onSubmit(parsedResult.data, imageFile);
    onOpenChange(false);
  };

  const handleImageFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] ?? null;

    setImageFile(file);

    if (!file) {
      setImagePreview(product?.image || "");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-2xl">
        <div
          aria-hidden
          className="h-1 w-full bg-gradient-to-r from-primary via-amber-500 to-primary"
        />

        <div className="flex flex-col gap-5 px-6 py-5">
          <DialogHeader className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                {mode === "create" ? (
                  <PackagePlus className="size-5" />
                ) : (
                  <Pencil className="size-5" />
                )}
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <Badge
                  variant="outline"
                  className="h-5 w-fit gap-1 rounded-full border-primary/20 bg-primary/10 px-2 text-[9.5px] font-semibold uppercase tracking-[0.22em] text-primary"
                >
                  <ShoppingBag className="size-2.5" />
                  Pro shop ·{" "}
                  {mode === "create" ? "SKU mới" : "Chỉnh sửa SKU"}
                </Badge>
                <DialogTitle className="font-display text-lg font-black italic tracking-tight">
                  {mode === "create" ? "Thêm sản phẩm mới" : "Cập nhật sản phẩm"}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {mode === "create"
                    ? "Tạo SKU mới để bán kèm trong dòng vận hành."
                    : "Điều chỉnh thông tin SKU theo nhu cầu kinh doanh."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form
            id="product-form"
            onSubmit={handleSave}
            className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto pr-1"
          >
            {mode === "create" && (
              <div className="flex flex-col gap-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <Building2 className="size-3.5" />
                  Cơ sở
                </Label>
                <Select
                  value={formState.complex_id || "NONE"}
                  onValueChange={(selectedValue) =>
                    updateField(
                      "complex_id",
                      selectedValue === "NONE" ? "" : selectedValue,
                    )
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn cơ sở" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="NONE">Chọn cơ sở</SelectItem>
                      {complexes.map((complex) => (
                        <SelectItem key={complex.id} value={complex.id}>
                          {complex.complex_name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.complex_id && (
                  <p className="text-xs text-destructive">
                    {errors.complex_id}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="product-name"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                <Tag className="size-3.5" />
                Tên sản phẩm
              </Label>
              <Input
                id="product-name"
                placeholder="Ví dụ: Nước suối 500ml"
                value={formState.name}
                onChange={(event) => updateField("name", event.target.value)}
                disabled={isSubmitting}
                className="h-10"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="product-description"
                className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                Mô tả
              </Label>
              <Textarea
                id="product-description"
                placeholder="Mô tả ngắn về sản phẩm"
                rows={3}
                value={formState.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                disabled={isSubmitting}
                className="resize-none"
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="product-price"
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                >
                  <Coins className="size-3.5" />
                  Giá (VND)
                </Label>
                <Input
                  id="product-price"
                  type="number"
                  min={1}
                  placeholder="10000"
                  value={formState.price}
                  onChange={(event) => updateField("price", event.target.value)}
                  disabled={isSubmitting}
                  className="h-10 tabular-nums"
                />
                {errors.price && (
                  <p className="text-xs text-destructive">{errors.price}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="product-stock"
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                >
                  <Warehouse className="size-3.5" />
                  Tồn kho
                </Label>
                <Input
                  id="product-stock"
                  type="number"
                  min={0}
                  step={1}
                  placeholder="0"
                  value={formState.stock}
                  onChange={(event) => updateField("stock", event.target.value)}
                  disabled={isSubmitting}
                  className="h-10 tabular-nums"
                />
                {errors.stock && (
                  <p className="text-xs text-destructive">{errors.stock}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Môn thể thao
                </Label>
                <Select
                  value={formState.sport_type}
                  onValueChange={(selectedValue) =>
                    updateField(
                      "sport_type",
                      selectedValue as SportType | "NONE",
                    )
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Áp dụng cho mọi môn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="NONE">Tất cả môn</SelectItem>
                      {Object.entries(SPORT_TYPE_LABELS).map(
                        ([sportValue, label]) => (
                          <SelectItem key={sportValue} value={sportValue}>
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.sport_type && (
                  <p className="text-xs text-destructive">
                    {errors.sport_type}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <Activity className="size-3.5" />
                  Trạng thái
                </Label>
                <Select
                  value={formState.status}
                  onValueChange={(selectedValue) =>
                    updateField("status", selectedValue as ProductStatus)
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="ACTIVE">Đang bán</SelectItem>
                      <SelectItem value="INACTIVE">Ngừng bán</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-xs text-destructive">{errors.status}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-border/70 bg-muted/30 p-4">
              <Label
                htmlFor="product-image"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                <ImagePlus className="size-3.5" />
                Ảnh sản phẩm
              </Label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div
                  className={cn(
                    "relative size-20 shrink-0 overflow-hidden rounded-xl border border-border/60",
                    imagePreview ? "bg-card" : "bg-muted/50",
                  )}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground">
                      <ImagePlus className="size-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 flex-col gap-1">
                  <Input
                    id="product-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    disabled={isSubmitting}
                    className="file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/15"
                  />
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    JPG/PNG/WebP, tối đa 5MB.
                  </p>
                </div>
              </div>
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
              form="product-form"
              disabled={isSubmitting}
              className="rounded-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                  Đang xử lý…
                </>
              ) : mode === "create" ? (
                <>
                  <PackagePlus data-icon="inline-start" />
                  Tạo sản phẩm
                </>
              ) : (
                <>
                  <Pencil data-icon="inline-start" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
