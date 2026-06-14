import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SingleBooking } from "@/utils";

interface ReviewSectionInlineProps {
  booking: SingleBooking;
  canCreate: boolean;
  hasExisting: boolean;
  onEditClick: () => void;
}

export function ReviewSectionInline({
  booking,
  canCreate,
  hasExisting,
  onEditClick,
}: ReviewSectionInlineProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!hasExisting && !canCreate) return null;

  if (hasExisting && booking.review) {
    return (
      <div
        className="rounded-lg bg-amber-50 border border-amber-200 p-3 transition-all cursor-pointer group animate-fade-in dark:bg-amber-950/30 dark:border-amber-700/50"
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star className="size-4 fill-amber-400 text-amber-400 animate-pulse" />
            <span className="font-semibold text-amber-800 dark:text-amber-300">
              {booking.review.rating}/5 sao
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEditClick();
            }}
            className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Chỉnh sửa
          </Button>
        </div>
        {showDetails && booking.review.comment && (
          <p className="text-xs text-amber-700 dark:text-amber-400 italic mt-2 animate-fade-in">
            "{booking.review.comment}"
          </p>
        )}
      </div>
    );
  }

  if (canCreate) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onEditClick}
        className="w-full justify-center"
      >
        <Star className="size-4" data-icon="inline-start" />
        Thêm đánh giá
      </Button>
    );
  }

  return null;
}
