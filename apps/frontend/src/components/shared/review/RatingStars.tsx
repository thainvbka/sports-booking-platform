import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  max?: number;
  className?: string;
  iconClassName?: string;
  filledClassName?: string;
  emptyClassName?: string;
}

export function RatingStars({
  rating,
  max = 5,
  className,
  iconClassName,
  filledClassName = "fill-yellow-400 text-yellow-400",
  emptyClassName = "text-slate-300",
}: RatingStarsProps) {
  const roundedRating = Math.max(0, Math.min(max, Math.round(rating)));

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: max }, (_, index) => {
        const isFilled = index < roundedRating;

        return (
          <Star
            key={`${index}-${roundedRating}`}
            className={cn("h-4 w-4", iconClassName, isFilled ? filledClassName : emptyClassName)}
          />
        );
      })}
    </div>
  );
}
