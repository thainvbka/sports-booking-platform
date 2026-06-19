import {
  FilterFieldWrapper,
  FilterSelectField,
  NumericRangeField,
  OwnerFilterActions,
  OwnerFilterActiveBadge,
} from "@/components/owner/OwnerFilterShell";
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

const STATUS_OPTIONS: Array<{ value: ProductStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "ACTIVE", label: "Đang bán" },
  { value: "INACTIVE", label: "Ngừng bán" },
];

const SPORT_OPTIONS: Array<{ value: SportType | "ALL"; label: string }> = [
  { value: "ALL", label: "Tất cả môn" },
  ...Object.entries(SPORT_TYPE_LABELS).map(([sportValue, label]) => ({
    value: sportValue as SportType,
    label,
  })),
];

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

  const complexOptions = [
    { value: "ALL", label: "Tất cả cơ sở" },
    ...complexes.map((c) => ({ value: c.id, label: c.complex_name })),
  ];

  return (
    <div className="flex flex-col gap-3">
      <OwnerFilterActiveBadge count={activeCount} />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <FilterFieldWrapper label="Cơ sở" icon={Building2}>
          <FilterSelectField
            value={formState.complex_id || "ALL"}
            onValueChange={(selectedValue) =>
              updateField(
                "complex_id",
                selectedValue === "ALL" ? "" : selectedValue,
              )
            }
            options={complexOptions}
            placeholder="Tất cả cơ sở"
            disabled={isLoading}
          />
          {errors.complex_id && (
            <p className="text-[11px] text-destructive">{errors.complex_id}</p>
          )}
        </FilterFieldWrapper>

        <FilterFieldWrapper label="Trạng thái" icon={Tag}>
          <FilterSelectField
            value={formState.status}
            onValueChange={(selectedValue) =>
              updateField("status", selectedValue as ProductStatus | "ALL")
            }
            options={STATUS_OPTIONS}
            placeholder="Tất cả trạng thái"
            disabled={isLoading}
          />
        </FilterFieldWrapper>

        <FilterFieldWrapper label="Môn thể thao">
          <FilterSelectField
            value={formState.sport_type}
            onValueChange={(selectedValue) =>
              updateField("sport_type", selectedValue as SportType | "ALL")
            }
            options={SPORT_OPTIONS}
            placeholder="Tất cả môn"
            disabled={isLoading}
          />
        </FilterFieldWrapper>

        <FilterFieldWrapper label="Khoảng giá (VND)" icon={Coins}>
          <NumericRangeField
            min={1}
            minValue={formState.min_price}
            maxValue={formState.max_price}
            onMinChange={(val) => updateField("min_price", val)}
            onMaxChange={(val) => updateField("max_price", val)}
            disabled={isLoading}
          />
          {errors.min_price && (
            <p className="text-[11px] text-destructive">{errors.min_price}</p>
          )}
        </FilterFieldWrapper>

        <FilterFieldWrapper label="Khoảng tồn kho" icon={Warehouse} className="xl:col-span-1">
          <NumericRangeField
            min={0}
            step={1}
            minValue={formState.min_stock}
            maxValue={formState.max_stock}
            onMinChange={(val) => updateField("min_stock", val)}
            onMaxChange={(val) => updateField("max_stock", val)}
            disabled={isLoading}
          />
          {errors.min_stock && (
            <p className="text-[11px] text-destructive">{errors.min_stock}</p>
          )}
        </FilterFieldWrapper>

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
