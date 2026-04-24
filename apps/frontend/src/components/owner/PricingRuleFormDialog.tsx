import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { TimeInput } from "@/components/ui/time-input";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  Clock,
  Coins,
  Loader2,
  Plus,
  Sparkles,
  Timer,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formatTimeFromBackend = (time: string | Date): string => {
  if (!time) return "";

  if (typeof time === "string") {
    if (/^\d{2}:\d{2}$/.test(time)) return time;
    if (/^\d{2}:\d{2}:\d{2}/.test(time)) return time.slice(0, 5);
    if (time.includes("T") && time.includes("Z")) {
      const timePart = time.split("T")[1].split("Z")[0];
      return timePart.slice(0, 5);
    }
    return time.slice(0, 5);
  }

  const date = new Date(time);
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const DAYS_OF_WEEK = [
  { value: 1, label: "T2", long: "Thứ 2" },
  { value: 2, label: "T3", long: "Thứ 3" },
  { value: 3, label: "T4", long: "Thứ 4" },
  { value: 4, label: "T5", long: "Thứ 5" },
  { value: 5, label: "T6", long: "Thứ 6" },
  { value: 6, label: "T7", long: "Thứ 7" },
  { value: 0, label: "CN", long: "Chủ nhật" },
];

const pricingRuleSchema = z.object({
  days: z.array(z.number()).min(1, "Chọn ít nhất 1 ngày"),
  time_slots: z
    .array(
      z
        .object({
          start_time: z
            .string()
            .regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Giờ chưa hợp lệ"),
          end_time: z
            .string()
            .regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Giờ chưa hợp lệ"),
          base_price: z
            .number()
            .min(0, "Giá phải lớn hơn hoặc bằng 0")
            .max(100000000, "Giá không được vượt quá 100 triệu"),
        })
        .refine((data) => data.start_time < data.end_time, {
          message: "Giờ bắt đầu phải trước giờ kết thúc",
          path: ["end_time"],
        }),
    )
    .min(1, "Phải có ít nhất 1 khung giờ"),
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
    start_time?: string;
    end_time?: string;
    base_price?: number;
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
      time_slots: [{ start_time: "", end_time: "", base_price: 0 }],
    },
  });

  const selectedDays = watch("days");
  const timeSlots = watch("time_slots") || [];

  useEffect(() => {
    if (open) {
      if (mode === "create" && currentDay !== undefined) {
        reset({
          days: [currentDay],
          time_slots: [{ start_time: "", end_time: "", base_price: 0 }],
        });
        setApplyToAll(false);
      } else if (mode === "edit" && initialData) {
        reset({
          days:
            initialData.day_of_week !== undefined
              ? [initialData.day_of_week]
              : [],
          time_slots:
            initialData.start_time && initialData.end_time
              ? [
                  {
                    start_time: formatTimeFromBackend(initialData.start_time),
                    end_time: formatTimeFromBackend(initialData.end_time),
                    base_price: initialData.base_price || 0,
                  },
                ]
              : [{ start_time: "", end_time: "", base_price: 0 }],
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
        current.filter((d) => d !== dayValue),
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
        DAYS_OF_WEEK.map((d) => d.value),
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
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[36rem]">
        <div
          aria-hidden
          className="h-1 w-full bg-gradient-to-r from-primary via-accent-sport to-primary"
        />

        <div className="flex flex-col gap-5 px-6 py-5">
          <DialogHeader className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <Clock className="size-5" />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <Badge
                  variant="outline"
                  className="h-5 w-fit gap-1 rounded-full border-primary/20 bg-primary/10 px-2 text-[9.5px] font-semibold uppercase tracking-[0.22em] text-primary"
                >
                  <Sparkles className="size-2.5" />
                  Pricing console ·{" "}
                  {mode === "create" ? "Tạo mới" : "Chỉnh sửa"}
                </Badge>
                <DialogTitle className="font-display text-lg font-black italic tracking-tight">
                  {mode === "create"
                    ? "Thêm khung giờ mới"
                    : "Chỉnh sửa khung giờ"}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {mode === "create"
                    ? "Gắn giá vào khung giờ cho từng ngày trong tuần."
                    : "Cập nhật lịch và giá cho khung giờ này."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form
            id="pricing-rule-form"
            onSubmit={handleSubmit(onFormSubmit)}
            className="flex flex-col gap-5"
          >
            {mode === "create" && (
              <section className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/30 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    <CalendarDays className="size-3.5" />
                    Áp dụng cho ngày
                  </Label>
                  <label
                    htmlFor="apply-all"
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      applyToAll
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border/70 bg-background text-muted-foreground hover:border-primary/30 hover:text-primary",
                    )}
                  >
                    <Checkbox
                      id="apply-all"
                      checked={applyToAll}
                      onCheckedChange={handleApplyToAllToggle}
                    />
                    Tất cả các ngày
                  </label>
                </div>

                <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {DAYS_OF_WEEK.map((day) => {
                    const checked = selectedDays?.includes(day.value);
                    return (
                      <label
                        key={day.value}
                        htmlFor={`day-${day.value}`}
                        className={cn(
                          "group relative flex cursor-pointer flex-col items-center gap-0.5 rounded-xl border px-2 py-2 text-xs font-semibold transition-all",
                          checked
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border/60 bg-background text-muted-foreground hover:border-primary/40 hover:text-primary",
                        )}
                      >
                        <Checkbox
                          id={`day-${day.value}`}
                          checked={checked}
                          onCheckedChange={() => handleDayToggle(day.value)}
                          className="sr-only"
                        />
                        <span className="font-display text-sm italic">
                          {day.label}
                        </span>
                        <span
                          className={cn(
                            "text-[9px] font-normal uppercase tracking-[0.14em]",
                            checked
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground/70",
                          )}
                        >
                          {day.long.split(" ")[1] ?? day.long}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {errors.days && (
                  <p className="text-xs text-destructive">
                    {errors.days.message}
                  </p>
                )}
              </section>
            )}

            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <Timer className="size-3.5" />
                  Các khung giờ · {timeSlots.length}
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full"
                  onClick={() => {
                    setValue("time_slots", [
                      ...timeSlots,
                      { start_time: "", end_time: "", base_price: 0 },
                    ]);
                  }}
                >
                  <Plus data-icon="inline-start" />
                  Thêm
                </Button>
              </div>

              <div className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
                {timeSlots.map((_, index) => {
                  const basePrice = watch(`time_slots.${index}.base_price`);
                  const startTime = watch(`time_slots.${index}.start_time`);
                  const endTime = watch(`time_slots.${index}.end_time`);
                  return (
                    <div
                      key={index}
                      className="group relative flex gap-3 overflow-hidden rounded-2xl border border-border/60 bg-card p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] transition-colors hover:border-primary/30"
                    >
                      <span
                        aria-hidden
                        className="absolute inset-y-3 left-0 w-0.5 rounded-r-full bg-gradient-to-b from-primary/60 via-primary/20 to-transparent"
                      />
                      <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-border/70 bg-muted/50 font-display text-xs font-bold italic text-muted-foreground tabular-nums">
                        {index + 1}
                      </span>

                      <div className="flex flex-1 flex-col gap-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1">
                            <Label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              Giờ bắt đầu
                            </Label>
                            <TimeInput
                              id={`time_slots.${index}.start_time`}
                              value={startTime}
                              onChange={(value) =>
                                setValue(
                                  `time_slots.${index}.start_time`,
                                  value,
                                )
                              }
                              className="h-9 tabular-nums"
                            />
                            {errors.time_slots?.[index]?.start_time && (
                              <p className="text-[11px] text-destructive">
                                {errors.time_slots[index]?.start_time?.message}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col gap-1">
                            <Label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              Giờ kết thúc
                            </Label>
                            <TimeInput
                              id={`time_slots.${index}.end_time`}
                              value={endTime}
                              onChange={(value) =>
                                setValue(`time_slots.${index}.end_time`, value)
                              }
                              className="h-9 tabular-nums"
                            />
                            {errors.time_slots?.[index]?.end_time && (
                              <p className="text-[11px] text-destructive">
                                {errors.time_slots[index]?.end_time?.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <Label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            <Coins className="size-3" />
                            Giá / giờ (VNĐ)
                          </Label>
                          <Input
                            id={`time_slots.${index}.base_price`}
                            type="number"
                            min="0"
                            step="1000"
                            {...register(`time_slots.${index}.base_price`, {
                              valueAsNumber: true,
                            })}
                            placeholder="300000"
                            className="h-9 tabular-nums"
                          />
                          {errors.time_slots?.[index]?.base_price && (
                            <p className="text-[11px] text-destructive">
                              {errors.time_slots[index]?.base_price?.message}
                            </p>
                          )}
                          {basePrice > 0 && (
                            <p className="font-display text-[11px] italic text-muted-foreground tabular-nums">
                              ≈ {formatPrice(basePrice)}/giờ
                            </p>
                          )}
                        </div>
                      </div>

                      {timeSlots.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => {
                            setValue(
                              "time_slots",
                              timeSlots.filter((_, i) => i !== index),
                            );
                          }}
                          aria-label="Xóa khung giờ"
                        >
                          <Trash2 />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>

              {errors.time_slots &&
                typeof errors.time_slots.message === "string" && (
                  <p className="text-xs text-destructive">
                    {errors.time_slots.message}
                  </p>
                )}
            </section>
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
              form="pricing-rule-form"
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
                  <Plus data-icon="inline-start" />
                  Tạo khung giờ
                </>
              ) : (
                <>
                  <Sparkles data-icon="inline-start" />
                  Cập nhật
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
