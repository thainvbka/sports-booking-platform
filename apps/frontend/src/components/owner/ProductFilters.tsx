import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SPORT_TYPE_LABELS } from "@/lib/constants";
import type {
    ComplexListItem,
    ProductStatus,
    SportType,
} from "@/types";
import {
    ownerProductFilterSchema,
    type OwnerProductFilterInput,
} from "@/validations";
import { Filter, RotateCcw } from "lucide-react";
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

  return (
    <Card className="border-none shadow-sm bg-white">
      <CardContent className="pt-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Cơ sở</Label>
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
                <SelectItem value="ALL">Tất cả cơ sở</SelectItem>
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

          <div className="space-y-1.5">
            <Label>Trạng thái</Label>
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
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Môn thể thao</Label>
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
                <SelectItem value="ALL">Tất cả môn</SelectItem>
                {Object.entries(SPORT_TYPE_LABELS).map(([sportValue, label]) => (
                  <SelectItem key={sportValue} value={sportValue}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Khoảng giá (VND)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                min={1}
                placeholder="Từ"
                value={formState.min_price}
                onChange={(event) => updateField("min_price", event.target.value)}
                disabled={isLoading}
              />
              <Input
                type="number"
                min={1}
                placeholder="Đến"
                value={formState.max_price}
                onChange={(event) => updateField("max_price", event.target.value)}
                disabled={isLoading}
              />
            </div>
            {errors.min_price && (
              <p className="text-xs text-destructive">{errors.min_price}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Khoảng tồn kho</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                min={0}
                step={1}
                placeholder="Từ"
                value={formState.min_stock}
                onChange={(event) => updateField("min_stock", event.target.value)}
                disabled={isLoading}
              />
              <Input
                type="number"
                min={0}
                step={1}
                placeholder="Đến"
                value={formState.max_stock}
                onChange={(event) => updateField("max_stock", event.target.value)}
                disabled={isLoading}
              />
            </div>
            {errors.min_stock && (
              <p className="text-xs text-destructive">{errors.min_stock}</p>
            )}
          </div>

          <div className="flex items-end gap-2 md:col-span-2 xl:col-span-3">
            <Button onClick={handleApply} disabled={isLoading}>
              <Filter className="h-4 w-4 mr-2" />
              Áp dụng lọc
            </Button>
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={isLoading}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
