import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock } from "lucide-react";
import { formatPrice } from "@/services/mockData";
import { TimeInput } from "@/components/ui/time-input";

// Format time from backend (handles both string and Date)
// Always returns 24-hour format HH:MM for form input
const formatTimeFromBackend = (time: string | Date): string => {
  if (!time) return "";

  if (typeof time === "string") {
    // If already in HH:MM format
    if (/^\d{2}:\d{2}$/.test(time)) return time;

    // If in HH:MM:SS format
    if (/^\d{2}:\d{2}:\d{2}/.test(time)) return time.slice(0, 5);

    // If ISO string (e.g., "1970-01-01T21:00:00.000Z")
    if (time.includes("T") && time.includes("Z")) {
      // Extract time part: "1970-01-01T21:00:00.000Z" -> "21:00:00"
      const timePart = time.split("T")[1].split("Z")[0];
      return timePart.slice(0, 5); // "21:00:00" -> "21:00"
    }

    return time.slice(0, 5);
  }

  // If Date object, use UTC to avoid timezone conversion
  const date = new Date(time);
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const DAYS_OF_WEEK = [
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
  { value: 0, label: "Chủ nhật" },
];

const pricingRuleSchema = z
  .object({
    days: z.array(z.number()).min(1, "Chọn ít nhất 1 ngày"),
    start_time: z
      .string()
      .regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Định dạng HH:mm không hợp lệ"),
    end_time: z
      .string()
      .regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Định dạng HH:mm không hợp lệ"),
    base_price: z
      .number()
      .min(0, "Giá phải lớn hơn hoặc bằng 0")
      .max(100000000, "Giá không được vượt quá 100 triệu"),
  })
  .refine((data) => data.start_time < data.end_time, {
    message: "Giờ bắt đầu phải trước giờ kết thúc",
    path: ["end_time"],
  });

type PricingRuleFormData = z.infer<typeof pricingRuleSchema>;

interface PricingRuleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  currentDay?: number;
  initialData?: {
    id?: string;
    day_of_week?: number;
    start_time: string;
    end_time: string;
    base_price: number;
  };
  onSubmit: (data: PricingRuleFormData) => Promise<void>;
}

export function PricingRuleFormDialog({
  open,
  onOpenChange,
  mode,
  currentDay,
  initialData,
  onSubmit,
}: PricingRuleFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applyToAll, setApplyToAll] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PricingRuleFormData>({
    resolver: zodResolver(pricingRuleSchema),
    defaultValues: {
      days: currentDay !== undefined ? [currentDay] : [],
      start_time: initialData?.start_time || "",
      end_time: initialData?.end_time || "",
      base_price: initialData?.base_price || 0,
    },
  });

  const selectedDays = watch("days");

  useEffect(() => {
    if (open) {
      if (mode === "create" && currentDay !== undefined) {
        reset({
          days: [currentDay],
          start_time: "",
          end_time: "",
          base_price: 0,
        });
        setApplyToAll(false);
      } else if (mode === "edit" && initialData) {
        reset({
          days:
            initialData.day_of_week !== undefined
              ? [initialData.day_of_week]
              : [],
          start_time: formatTimeFromBackend(initialData.start_time),
          end_time: formatTimeFromBackend(initialData.end_time),
          base_price: initialData.base_price,
        });
        setApplyToAll(false);
      }
    }
  }, [open, mode, currentDay, initialData, reset]);

  const handleDayToggle = (dayValue: number) => {
    const current = selectedDays || [];
    if (current.includes(dayValue)) {
      setValue(
        "days",
        current.filter((d) => d !== dayValue)
      );
    } else {
      setValue("days", [...current, dayValue]);
    }
    setApplyToAll(false);
  };

  const handleApplyToAllToggle = (checked: boolean) => {
    setApplyToAll(checked);
    if (checked) {
      setValue(
        "days",
        DAYS_OF_WEEK.map((d) => d.value)
      );
    } else if (currentDay !== undefined) {
      setValue("days", [currentDay]);
    }
  };

  const onFormSubmit = async (data: PricingRuleFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to submit pricing rule:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle>
                {mode === "create"
                  ? "Thêm khung giờ mới"
                  : "Chỉnh sửa khung giờ"}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {mode === "create"
                  ? "Tạo khung giờ và giá cho sân con"
                  : "Cập nhật thông tin khung giờ"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Days Selection */}
          {mode === "create" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Áp dụng cho ngày</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="apply-all"
                    checked={applyToAll}
                    onCheckedChange={handleApplyToAllToggle}
                  />
                  <label
                    htmlFor="apply-all"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Tất cả các ngày
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day.value}`}
                      checked={selectedDays?.includes(day.value)}
                      onCheckedChange={() => handleDayToggle(day.value)}
                    />
                    <label
                      htmlFor={`day-${day.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {day.label}
                    </label>
                  </div>
                ))}
              </div>
              {errors.days && (
                <p className="text-sm text-red-600">{errors.days.message}</p>
              )}
            </div>
          )}

          {/* Time Range */}
          <div className="space-y-4">
            {/* Quick Time Selection */}
            <div>
              <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Chọn nhanh khung giờ phổ biến
              </Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                <Button
                  type="button"
                  variant={
                    watch("start_time") === "06:00" &&
                    watch("end_time") === "08:00"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className="text-xs h-9"
                  onClick={() => {
                    setValue("start_time", "06:00");
                    setValue("end_time", "08:00");
                  }}
                >
                  6-8h
                </Button>
                <Button
                  type="button"
                  variant={
                    watch("start_time") === "08:00" &&
                    watch("end_time") === "10:00"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className="text-xs h-9"
                  onClick={() => {
                    setValue("start_time", "08:00");
                    setValue("end_time", "10:00");
                  }}
                >
                  8-10h
                </Button>
                <Button
                  type="button"
                  variant={
                    watch("start_time") === "10:00" &&
                    watch("end_time") === "12:00"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className="text-xs h-9"
                  onClick={() => {
                    setValue("start_time", "10:00");
                    setValue("end_time", "12:00");
                  }}
                >
                  10-12h
                </Button>
                <Button
                  type="button"
                  variant={
                    watch("start_time") === "14:00" &&
                    watch("end_time") === "16:00"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className="text-xs h-9"
                  onClick={() => {
                    setValue("start_time", "14:00");
                    setValue("end_time", "16:00");
                  }}
                >
                  14-16h
                </Button>
                <Button
                  type="button"
                  variant={
                    watch("start_time") === "16:00" &&
                    watch("end_time") === "18:00"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className="text-xs h-9"
                  onClick={() => {
                    setValue("start_time", "16:00");
                    setValue("end_time", "18:00");
                  }}
                >
                  16-18h
                </Button>
                <Button
                  type="button"
                  variant={
                    watch("start_time") === "18:00" &&
                    watch("end_time") === "20:00"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className="text-xs h-9"
                  onClick={() => {
                    setValue("start_time", "18:00");
                    setValue("end_time", "20:00");
                  }}
                >
                  18-20h
                </Button>
                <Button
                  type="button"
                  variant={
                    watch("start_time") === "20:00" &&
                    watch("end_time") === "22:00"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className="text-xs h-9"
                  onClick={() => {
                    setValue("start_time", "20:00");
                    setValue("end_time", "22:00");
                  }}
                >
                  20-22h
                </Button>
                <Button
                  type="button"
                  variant={
                    watch("start_time") === "22:00" &&
                    watch("end_time") === "23:59"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className="text-xs h-9"
                  onClick={() => {
                    setValue("start_time", "22:00");
                    setValue("end_time", "23:59");
                  }}
                >
                  22-24h
                </Button>
              </div>
            </div>

            {/* Manual Time Input */}
            <div>
              <Label className="text-sm font-medium mb-2">
                Hoặc tùy chỉnh giờ
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="start_time"
                    className="text-xs text-muted-foreground"
                  >
                    Giờ bắt đầu
                  </Label>
                  <TimeInput
                    id="start_time"
                    value={watch("start_time")}
                    onChange={(value) => setValue("start_time", value)}
                  />
                  {errors.start_time && (
                    <p className="text-sm text-red-600">
                      {errors.start_time.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="end_time"
                    className="text-xs text-muted-foreground"
                  >
                    Giờ kết thúc
                  </Label>
                  <TimeInput
                    id="end_time"
                    value={watch("end_time")}
                    onChange={(value) => setValue("end_time", value)}
                  />
                  {errors.end_time && (
                    <p className="text-sm text-red-600">
                      {errors.end_time.message}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                💡 <span>Gõ số trực tiếp: 8 → 08:00, hoặc 830 → 08:30</span>
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="base_price">Giá (VNĐ)</Label>
            <Input
              id="base_price"
              type="number"
              min="0"
              step="1000"
              {...register("base_price", { valueAsNumber: true })}
              placeholder="300000"
            />
            {errors.base_price && (
              <p className="text-sm text-red-600">
                {errors.base_price.message}
              </p>
            )}
            {watch("base_price") > 0 && (
              <p className="text-sm text-muted-foreground">
                ≈ {formatPrice(watch("base_price"))}
              </p>
            )}
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
              {isSubmitting
                ? "Đang xử lý..."
                : mode === "create"
                ? "Tạo khung giờ"
                : "Cập nhật"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
