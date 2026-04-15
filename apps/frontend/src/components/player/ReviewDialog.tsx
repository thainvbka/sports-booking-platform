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
import { reviewService } from "@/services/review.service";
import type { BookingResponse } from "@/types";
import {
  createReviewFormSchema,
  type CreateReviewFormInput,
} from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Star, Upload, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ReviewDialogProps {
  open: boolean;
  booking: BookingResponse | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (bookingId: string) => void;
}

type SelectedImage = {
  id: string;
  file: File;
  previewUrl: string;
};

const MAX_REVIEW_IMAGES = 5;

export function ReviewDialog({
  open,
  booking,
  onOpenChange,
  onSuccess,
}: ReviewDialogProps) {
  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateReviewFormInput>({
    resolver: zodResolver(createReviewFormSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rating = watch("rating");
  const comment = watch("comment") || "";

  useEffect(() => {
    if (!open) return;

    reset({ rating: 0, comment: "" });
    setHoveredRating(0);
    setSelectedImages([]);
  }, [open, reset, booking?.id]);

  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });
    };
  }, [selectedImages]);

  const imageCountText = useMemo(
    () => `${selectedImages.length}/${MAX_REVIEW_IMAGES} ảnh`,
    [selectedImages.length],
  );

  const handleSelectImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const remainingSlots = MAX_REVIEW_IMAGES - selectedImages.length;

    if (remainingSlots <= 0) {
      toast.error(`Chỉ được chọn tối đa ${MAX_REVIEW_IMAGES} ảnh`);
      event.target.value = "";
      return;
    }

    if (imageFiles.length !== files.length) {
      toast.error("Một số file không phải ảnh đã bị bỏ qua");
    }

    const acceptedImages = imageFiles.slice(0, remainingSlots).map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    if (imageFiles.length > remainingSlots) {
      toast.error(`Chỉ được chọn tối đa ${MAX_REVIEW_IMAGES} ảnh`);
    }

    setSelectedImages((prev) => [...prev, ...acceptedImages]);
    event.target.value = "";
  };

  const removeImage = (id: string) => {
    setSelectedImages((prev) => {
      const imageToRemove = prev.find((image) => image.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }

      return prev.filter((image) => image.id !== id);
    });
  };

  const handleRatingClick = (nextRating: number) => {
    setValue("rating", nextRating, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onSubmit = async (data: CreateReviewFormInput) => {
    if (!booking || booking.type !== "SINGLE") {
      toast.error("Chỉ hỗ trợ đánh giá cho booking đơn lẻ");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("booking_id", booking.id);
      formData.append("rating", String(data.rating));

      const normalizedComment = data.comment?.trim();
      if (normalizedComment) {
        formData.append("comment", normalizedComment);
      }

      selectedImages.forEach((image) => {
        formData.append("images", image.file);
      });

      await reviewService.createReview(formData);

      toast.success("Đánh giá sân thành công");
      onSuccess?.(booking.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Create review failed", error);
      toast.error("Không thể gửi đánh giá. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Đánh giá sân</DialogTitle>
          <DialogDescription>
            Chia sẻ trải nghiệm của bạn sau khi sử dụng sân
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="rounded-md border bg-muted/30 p-3 text-sm">
            <p className="font-medium text-foreground">{booking?.complex_name || "-"}</p>
            <p className="text-muted-foreground mt-1">
              {booking?.sub_field_name || "-"}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Rating *</Label>
            <div
              className="flex items-center gap-1"
              onMouseLeave={() => setHoveredRating(0)}
            >
              {Array.from({ length: 5 }, (_, index) => {
                const starValue = index + 1;
                const isActive = (hoveredRating || rating || 0) >= starValue;

                return (
                  <button
                    key={starValue}
                    type="button"
                    className="rounded-sm p-1 transition-transform hover:scale-110"
                    onMouseEnter={() => setHoveredRating(starValue)}
                    onClick={() => handleRatingClick(starValue)}
                    disabled={isSubmitting}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        isActive
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            {errors.rating && (
              <p className="text-xs text-destructive">{errors.rating.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-comment">Comment (không bắt buộc)</Label>
            <Textarea
              id="review-comment"
              placeholder="Chia sẻ cảm nhận của bạn về sân..."
              rows={4}
              maxLength={500}
              disabled={isSubmitting}
              value={comment}
              onChange={(event) =>
                setValue("comment", event.target.value, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Tối đa 500 ký tự</p>
              <p className="text-xs text-muted-foreground">{comment.length}/500</p>
            </div>
            {errors.comment && (
              <p className="text-xs text-destructive">{errors.comment.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="review-images">Hình ảnh</Label>
              <p className="text-xs text-muted-foreground">{imageCountText}</p>
            </div>

            <Input
              id="review-images"
              type="file"
              accept="image/*"
              multiple
              disabled={isSubmitting || selectedImages.length >= MAX_REVIEW_IMAGES}
              onChange={handleSelectImages}
            />

            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Upload className="h-3.5 w-3.5" />
              Tối đa 5 ảnh, định dạng JPG/PNG/WebP
            </p>

            {selectedImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {selectedImages.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square overflow-hidden rounded-md border"
                  >
                    <img
                      src={image.previewUrl}
                      alt="Review preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute right-1 top-1 rounded-full bg-black/65 p-1 text-white hover:bg-black/80"
                      disabled={isSubmitting}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
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
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Gửi đánh giá"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
