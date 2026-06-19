import { OwnerFilterActions, OwnerFilterActiveBadge } from "@/components/owner/OwnerFilterShell";
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
import { SPORT_TYPE_LABELS } from "@/constants";
import type { ComplexListItem, ProductStatus, SportType } from "@/types";
import {
  ownerProductFilterSchema,
  type OwnerProductFilterInput,
} from "@/validations";
import {
  Building2,
  Coins,
  Tag,
  Warehouse,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ProductFiltersProps {
  complexes: ComplexListItem[];
  value: Partial<OwnerProductFilterInput>;
  isLoading?: boolean;
  onApply: (filters: Partial<OwnerProductFilterInput>) => void;
  onClear: () => void;
}

interface ProductFilterFormState {
  complex_id: string;
  status: ProductStatus | "ALL";
  sport_type: SportType | "ALL";
  min_price: string;
  max_price: string;
  min_stock: string;
  max_stock: string;
}

const defaultFormState: ProductFilterFormState = {
  complex_id: "",
  status: "ALL",
  sport_type: "ALL",
  min_price: "",
  max_price: "",
  min_stock: "",
  max_stock: "",
};

export function ProductFilters({
  complexes,
  value,
  isLoading,
  onApply,
  onClear,
}: ProductFiltersProps) {
  const [formState, setFormState] =
    useState<ProductFilterFormState>(defaultFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormState({
      complex_id: value.complex_id || "",
      status: (value.status as ProductStatus | undefined) || "ALL",
      sport_type: (value.sport_type as SportType | undefined) || "ALL",
      min_price:
        value.min_price !== undefined && value.min_price !== null
          ? String(value.min_price)
          : "",
      max_price:
        value.max_price !== undefined && value.max_price !== null
          ? String(value.max_price)
          : "",
      min_stock:
        value.min_stock !== undefined && value.min_stock !== null
          ? String(value.min_stock)
          : "",
      max_stock:
        value.max_stock !== undefined && value.max_stock !== null
          ? String(value.max_stock)
          : "",
    });
  }, [value]);

  const updateField = <K extends keyof ProductFilterFormState>(
    key: K,
    fieldValue: ProductFilterFormState[K],
  ) => {
    setFormState((prev) => ({
      ...prev,
      [key]: fieldValue,
    }));
  };

  const handleApply = () => {
    const parsed = ownerProductFilterSchema.safeParse({
      complex_id: formState.complex_id || undefined,
      status: formState.status === "ALL" ? undefined : formState.status,
      sport_type:
        formState.sport_type === "ALL" ? undefined : formState.sport_type,
      min_price: formState.min_price,
      max_price: formState.max_price,
      min_stock: formState.min_stock,
      max_stock: formState.max_stock,
    });

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
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
    onApply(parsed.data);
  };

  const handleClear = () => {
    setFormState(defaultFormState);
    setErrors({});
    onClear();
  };

  const activeCount = [
    formState.complex_id,
    formState.status !== "ALL" ? formState.status : "",
    formState.sport_type !== "ALL" ? formState.sport_type : "",
    formState.min_price,
    formState.max_price,
    formState.min_stock,
    formState.max_stock,
  ].filter((v) => v !== "").length;

  return (
    <div className="flex flex-col gap-3">
      <OwnerFilterActiveBadge count={activeCount} />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <Label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <Building2 className="size-3" />
            Cơ sở
          </Label>
          <Select
            value={formState.complex_id || "ALL"}
            onValueChange={(selectedValue) =>
              updateField(
                "complex_id",
                selectedValue === "ALL" ? "" : selectedValue,
              )
            }
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tất cả cơ sở" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="ALL">Tất cả cơ sở</SelectItem>
                {complexes.map((complex) => (
                  <SelectItem key={complex.id} value={complex.id}>
                    {complex.complex_name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors.complex_id && (
            <p className="text-[11px] text-destructive">{errors.complex_id}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <Tag className="size-3" />
            Trạng thái
          </Label>
          <Select
            value={formState.status}
            onValueChange={(selectedValue) =>
              updateField("status", selectedValue as ProductStatus | "ALL")
            }
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="ACTIVE">Đang bán</SelectItem>
                <SelectItem value="INACTIVE">Ngừng bán</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Môn thể thao
          </Label>
          <Select
            value={formState.sport_type}
            onValueChange={(selectedValue) =>
              updateField("sport_type", selectedValue as SportType | "ALL")
            }
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tất cả môn" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="ALL">Tất cả môn</SelectItem>
                {Object.entries(SPORT_TYPE_LABELS).map(([sportValue, label]) => (
                  <SelectItem key={sportValue} value={sportValue}>
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <Coins className="size-3" />
            Khoảng giá (VND)
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              min={1}
              placeholder="Từ"
              value={formState.min_price}
              onChange={(event) => updateField("min_price", event.target.value)}
              disabled={isLoading}
              className="tabular-nums"
            />
            <Input
              type="number"
              min={1}
              placeholder="Đến"
              value={formState.max_price}
              onChange={(event) => updateField("max_price", event.target.value)}
              disabled={isLoading}
              className="tabular-nums"
            />
          </div>
          {errors.min_price && (
            <p className="text-[11px] text-destructive">{errors.min_price}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 xl:col-span-1">
          <Label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <Warehouse className="size-3" />
            Khoảng tồn kho
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              min={0}
              step={1}
              placeholder="Từ"
              value={formState.min_stock}
              onChange={(event) => updateField("min_stock", event.target.value)}
              disabled={isLoading}
              className="tabular-nums"
            />
            <Input
              type="number"
              min={0}
              step={1}
              placeholder="Đến"
              value={formState.max_stock}
              onChange={(event) => updateField("max_stock", event.target.value)}
              disabled={isLoading}
              className="tabular-nums"
            />
          </div>
          {errors.min_stock && (
            <p className="text-[11px] text-destructive">{errors.min_stock}</p>
          )}
        </div>

        <OwnerFilterActions
          onApply={handleApply}
          onClear={handleClear}
          isLoading={isLoading}
          clearDisabled={activeCount === 0}
          className="md:col-span-2 xl:col-span-3"
        />
      </div>
    </div>
  );
}
