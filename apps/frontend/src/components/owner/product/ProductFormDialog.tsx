import { Checkbox } from "@/components/ui/checkbox";
import { FormDialogShell } from "@/components/shared/dialogs/FormDialogShell";
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
import { SPORT_TYPE_LABELS } from "@/constants";
import { cn } from "@/lib/utils";
import type {
  ComplexListItem,
  CreateProductPayload,
  OwnerProduct,
  ProductStatus,
  ProductType,
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
  sport_types: SportType[];
  status: ProductStatus;
  type: ProductType;
}

const defaultFormState: ProductFormState = {
  complex_id: "",
  name: "",
  description: "",
  price: "",
  stock: "0",
  sport_types: [],
  status: "ACTIVE",
  type: "SALE",
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
        sport_types: product.sport_types || [],
        status: product.status,
        type: product.type || "SALE",
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
      sport_types: formState.sport_types,
      status: formState.status,
      type: formState.type,
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
    <FormDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? "Thêm sản phẩm mới" : "Cập nhật sản phẩm"}
      description={
        mode === "create"
          ? "Tạo SKU mới để bán kèm trong dòng vận hành."
          : "Điều chỉnh thông tin SKU theo nhu cầu kinh doanh."
      }
      icon={mode === "create" ? PackagePlus : Pencil}
      accentGradientClass="bg-gradient-to-r from-primary via-amber-500 to-primary"
      maxWidthClass="sm:max-w-2xl"
      formId="product-form"
      isSubmitting={!!isSubmitting}
      submitLabel={
        mode === "create" ? (
          <>
            <PackagePlus data-icon="inline-start" />
            Tạo sản phẩm
          </>
        ) : (
          <>
            <Pencil data-icon="inline-start" />
            Lưu thay đổi
          </>
        )
      }
    >

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
                <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <ShoppingBag className="size-3.5" />
                  Loại sản phẩm
                </Label>
                <Select
                  value={formState.type}
                  onValueChange={(selectedValue) =>
                    updateField("type", selectedValue as ProductType)
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="SALE">Bán sản phẩm (đồ uống, tất...)</SelectItem>
                      <SelectItem value="RENTAL">Cho thuê vật phẩm (vợt, bóng...)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-xs text-destructive">{errors.type}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Môn thể thao áp dụng
                </Label>
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3 flex flex-col gap-3">
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <Checkbox
                      checked={formState.sport_types.length === 0}
                      onCheckedChange={(checked) => {
                        if (checked) updateField("sport_types", []);
                      }}
                      disabled={isSubmitting}
                    />
                    <span className="text-foreground">Tất cả các môn (Dùng chung)</span>
                  </label>

                  <div className="h-px bg-border/60" />

                  <div className="grid grid-cols-2 gap-2.5">
                    {Object.entries(SPORT_TYPE_LABELS).map(([sportValue, label]) => {
                      const sport = sportValue as SportType;
                      const isChecked = formState.sport_types.includes(sport);
                      return (
                        <label
                          key={sport}
                          className="flex items-center gap-2 text-sm font-medium cursor-pointer hover:text-primary transition-colors text-foreground"
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateField("sport_types", [...formState.sport_types, sport]);
                              } else {
                                updateField(
                                  "sport_types",
                                  formState.sport_types.filter((s) => s !== sport),
                                );
                              }
                            }}
                            disabled={isSubmitting}
                          />
                          <span>{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                {errors.sport_types && (
                  <p className="text-xs text-destructive">
                    {errors.sport_types}
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

    </FormDialogShell>
  );
}
