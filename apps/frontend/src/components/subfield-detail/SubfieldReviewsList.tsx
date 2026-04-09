import { RatingStars } from "@/components/shared/review/RatingStars";
import { ReviewerAvatar } from "@/components/shared/review/ReviewerAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import type { ReviewRatingFilter, ReviewSortBy } from "@/hooks/useSubfieldReviews";
import { cn } from "@/lib/utils";
import type { GetSubfieldReviewsResponse, PublicSubfieldReview } from "@/types";
import { getReviewerDisplayName } from "@/utils/review.utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SubfieldReviewsListProps {
  reviews: PublicSubfieldReview[];
  isLoading: boolean;
  totalReviews: number;
  ratingFilter: ReviewRatingFilter;
  hasImagesOnly: boolean;
  sortBy: ReviewSortBy;
  onRatingFilterChange: (value: ReviewRatingFilter) => void;
  onHasImagesOnlyChange: (value: boolean) => void;
  onSortByChange: (value: ReviewSortBy) => void;
  pagination: GetSubfieldReviewsResponse["pagination"] | null;
  onPageChange: (nextPage: number) => void;
  className?: string;
}

const SORT_OPTIONS: Array<{ value: ReviewSortBy; label: string }> = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "rating_desc", label: "Điểm cao trước" },
  { value: "rating_asc", label: "Điểm thấp trước" },
];

export function SubfieldReviewsList({
  reviews,
  isLoading,
  totalReviews,
  ratingFilter,
  hasImagesOnly,
  sortBy,
  onRatingFilterChange,
  onHasImagesOnlyChange,
  onSortByChange,
  pagination,
  onPageChange,
  className,
}: SubfieldReviewsListProps) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Đánh giá người chơi</h2>
          <p className="text-xs text-muted-foreground">{totalReviews} đánh giá</p>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="flex items-center gap-2">
          <Select
            value={ratingFilter}
            onValueChange={(value) => onRatingFilterChange(value as ReviewRatingFilter)}
          >
            <SelectTrigger className="h-8 w-32 bg-background text-xs">
              <SelectValue placeholder="Tất cả sao" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả sao</SelectItem>
              <SelectItem value="5">5 sao</SelectItem>
              <SelectItem value="4">4 sao</SelectItem>
              <SelectItem value="3">3 sao</SelectItem>
              <SelectItem value="2">2 sao</SelectItem>
              <SelectItem value="1">1 sao</SelectItem>
            </SelectContent>
          </Select>

          <Toggle
            variant="outline"
            size="sm"
            pressed={hasImagesOnly}
            onPressedChange={onHasImagesOnlyChange}
            className="shrink-0"
          >
            Có hình ảnh
          </Toggle>

          <Select value={sortBy} onValueChange={(value) => onSortByChange(value as ReviewSortBy)}>
            <SelectTrigger className="h-8 w-28 bg-background text-xs">
              <SelectValue placeholder="Mới nhất" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4 text-center text-sm text-muted-foreground">
            Đang tải đánh giá...
          </CardContent>
        </Card>
      ) : reviews.length === 0 ? (
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4 text-center text-sm text-muted-foreground">
            Chưa có đánh giá phù hợp bộ lọc hiện tại.
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60 shadow-sm">
          <CardContent className="divide-y p-0">
            {reviews.map((review) => {
              const reviewerName = getReviewerDisplayName(review, "Người chơi");

              return (
                <div key={review.id} className="flex items-start gap-2.5 px-4 py-3">
                  <ReviewerAvatar
                    name={reviewerName}
                    avatar={review.player?.account?.avatar}
                    className="h-8 w-8 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{reviewerName}</p>
                        <RatingStars
                          rating={review.rating}
                          className="mt-0.5"
                          iconClassName="h-3.5 w-3.5"
                        />
                      </div>
                      <p className="shrink-0 text-xs text-muted-foreground">
                        {format(new Date(review.created_at), "dd/MM/yyyy", {
                          locale: vi,
                        })}
                      </p>
                    </div>

                    {review.comment && (
                      <p className="mt-1.5 text-xs leading-relaxed text-foreground/80">
                        {review.comment}
                      </p>
                    )}

                    {review.images.length > 0 && (
                      <div className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                        {review.images.slice(0, 3).map((image, index) => (
                          <div
                            key={index}
                            className="aspect-video overflow-hidden rounded border"
                          >
                            <img src={image} alt="Review" className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-end gap-1.5  bg-muted/20 p-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2.5"
            onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
            disabled={pagination.page <= 1}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Trước
          </Button>

          <span className="px-1 text-xs text-muted-foreground">
            Trang {pagination.page}/{pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2.5"
            onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
            disabled={pagination.page >= pagination.totalPages}
          >
            Sau <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </section>
  );
}
