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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Trophy } from "lucide-react";
import { createMatch } from "@/services/match.service";
import { createMatchFormSchema, type CreateMatchFormValues } from "@/validations";
import type { BookingResponse } from "@/types";

interface CreateMatchDialogProps {
  open: boolean;
  booking: BookingResponse | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateMatchDialog({
  open,
  booking,
  onOpenChange,
  onSuccess,
}: CreateMatchDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateMatchFormValues>({
    resolver: zodResolver(createMatchFormSchema),
    defaultValues: {
      title: "",
      description: "Tìm đối giao hữu vui vẻ, giao lưu cọ xát lành mạnh.",
      slots_needed: 1,
      skill_level: "INTERMEDIATE",
      join_deadline: "",
    },
  });

  const skillLevel = watch("skill_level");

  useEffect(() => {
    if (open && booking) {
      const defaultTitle = `Giao hữu tại ${booking.complex_name}`;
      
      // Calculate a default deadline: 2 hours before the start time
      let defaultDeadline = "";
      if (booking.type === "SINGLE") {
        const startTime = new Date(booking.start_time);
        const deadlineDate = new Date(startTime.getTime() - 2 * 60 * 60 * 1000);
        // Format to YYYY-MM-DDTHH:MM
        defaultDeadline = deadlineDate.toISOString().slice(0, 16);
      }

      reset({
        title: defaultTitle,
        description: "Tìm đối giao hữu vui vẻ, giao lưu cọ xát lành mạnh.",
        slots_needed: 1,
        skill_level: "INTERMEDIATE",
        join_deadline: defaultDeadline,
      });
    }
  }, [open, booking, reset]);

  const onSubmit = async (data: CreateMatchFormValues) => {
    if (!booking) return;

    setIsSubmitting(true);

    try {
      await createMatch({
        booking_id: booking.id,
        title: data.title,
        description: data.description || undefined,
        slots_needed: Number(data.slots_needed),
        skill_level: data.skill_level || undefined,
        join_deadline: data.join_deadline ? new Date(data.join_deadline).toISOString() : undefined,
      });

      toast.success("Tạo kèo giao hữu thành công!");
      onSuccess?.();
      onOpenChange(false);
    } catch (error: unknown) {
      console.error("Create match failed", error);
      const apiError = error as { message?: string };
      toast.error(apiError?.message || "Không thể tạo kèo. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full p-6 rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-2xl">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <Trophy className="size-5 text-amber-500 animate-pulse" />
            Tạo kèo giao hữu
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Công khai lịch đặt sân này lên bảng tin để tìm kiếm đồng đội hoặc đối thủ ghép trận.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-3">
          {/* Booking Info */}
          <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 text-xs space-y-1.5 text-left">
            <div className="font-bold text-foreground">{booking?.complex_name}</div>
            <div className="text-muted-foreground">{booking?.sub_field_name}</div>
            {booking && booking.type === "SINGLE" && (
              <div className="text-primary font-medium">
                🕒 {new Date(booking.start_time).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})} - {new Date(booking.end_time).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})} ({new Date(booking.start_time).toLocaleDateString("vi-VN")})
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5 text-left">
            <Label htmlFor="title" className="text-xs font-semibold">Tiêu đề kèo *</Label>
            <Input
              id="title"
              placeholder="Nhập tiêu đề hấp dẫn..."
              {...register("title")}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Slots & Skill */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="slots_needed" className="text-xs font-semibold">Số slot cần tuyển *</Label>
              <Input
                id="slots_needed"
                type="number"
                min={1}
                max={30}
                {...register("slots_needed", { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.slots_needed && (
                <p className="text-xs text-destructive">{errors.slots_needed.message}</p>
              )}
            </div>

            <div className="space-y-1.5 text-left">
              <Label htmlFor="skill_level" className="text-xs font-semibold">Trình độ yêu cầu</Label>
              <Select
                value={skillLevel || undefined}
                onValueChange={(value) => setValue("skill_level", value as "BEGINNER" | "INTERMEDIATE" | "ADVANCED")}
                disabled={isSubmitting}
              >
                <SelectTrigger id="skill_level" className="w-full">
                  <SelectValue placeholder="Chọn trình độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Cơ bản (Beginner)</SelectItem>
                  <SelectItem value="INTERMEDIATE">Khá (Intermediate)</SelectItem>
                  <SelectItem value="ADVANCED">Chuyên nghiệp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Join Deadline */}
          <div className="space-y-1.5 text-left">
            <Label htmlFor="join_deadline" className="text-xs font-semibold">Hạn đăng ký ghép trận</Label>
            <Input
              id="join_deadline"
              type="datetime-local"
              {...register("join_deadline")}
              disabled={isSubmitting}
            />
            {errors.join_deadline && (
              <p className="text-xs text-destructive">{errors.join_deadline.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5 text-left">
            <Label htmlFor="description" className="text-xs font-semibold">Mô tả chi tiết</Label>
            <Textarea
              id="description"
              placeholder="Ví dụ: Giao lưu trà đá, chia tiền sân nhẹ nhàng..."
              rows={3}
              {...register("description")}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-semibold">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo kèo...
                </>
              ) : (
                "Tạo kèo ngay"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
