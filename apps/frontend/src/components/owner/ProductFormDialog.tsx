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
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SPORT_TYPE_LABELS } from "@/lib/constants";
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
import { Loader2 } from "lucide-react";
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
  const [formState, setFormState] = useState<ProductFormState>(defaultFormState);
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
      sport_type:
        formState.sport_type === "NONE" ? null : formState.sport_type,
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

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm sản phẩm mới" : "Cập nhật sản phẩm"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Tạo mới sản phẩm để bán kèm trong hệ thống đặt sân"
              : "Điều chỉnh thông tin sản phẩm theo nhu cầu kinh doanh"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          {mode === "create" && (
            <div className="space-y-1.5">
              <Label>Cơ sở</Label>
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
                  <SelectItem value="NONE">Chọn cơ sở</SelectItem>
                  {complexes.map((complex) => (
                    <SelectItem key={complex.id} value={complex.id}>
                      {complex.complex_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.complex_id && (
                <p className="text-xs text-destructive">{errors.complex_id}</p>
              )}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="product-name">Tên sản phẩm</Label>
              <Input
                id="product-name"
                placeholder="Ví dụ: Nước suối 500ml"
                value={formState.name}
                onChange={(event) => updateField("name", event.target.value)}
                disabled={isSubmitting}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="product-description">Mô tả</Label>
              <Textarea
                id="product-description"
                placeholder="Mô tả ngắn về sản phẩm"
                rows={3}
                value={formState.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="product-price">Giá (VND)</Label>
              <Input
                id="product-price"
                type="number"
                min={1}
                placeholder="10000"
                value={formState.price}
                onChange={(event) => updateField("price", event.target.value)}
                disabled={isSubmitting}
              />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="product-stock">Tồn kho</Label>
              <Input
                id="product-stock"
                type="number"
                min={0}
                step={1}
                placeholder="0"
                value={formState.stock}
                onChange={(event) => updateField("stock", event.target.value)}
                disabled={isSubmitting}
              />
              {errors.stock && (
                <p className="text-xs text-destructive">{errors.stock}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Môn thể thao</Label>
              <Select
                value={formState.sport_type}
                onValueChange={(selectedValue) =>
                  updateField("sport_type", selectedValue as SportType | "NONE")
                }
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Áp dụng cho mọi môn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Tất cả môn</SelectItem>
                  {Object.entries(SPORT_TYPE_LABELS).map(([sportValue, label]) => (
                    <SelectItem key={sportValue} value={sportValue}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.sport_type && (
                <p className="text-xs text-destructive">{errors.sport_type}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Trạng thái</Label>
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
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-xs text-destructive">{errors.status}</p>
              )}
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="product-image">Ảnh sản phẩm</Label>
              <Input
                id="product-image"
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                JPG/PNG/WebP, tối đa 5MB.
              </p>
              {imagePreview ? (
                <div className="h-24 w-24 overflow-hidden rounded-md border bg-muted">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
            </div>
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
                  Đang xử lý...
                </>
              ) : mode === "create" ? (
                "Tạo sản phẩm"
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
