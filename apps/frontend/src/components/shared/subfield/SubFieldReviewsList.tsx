import { ReviewerAvatar } from "@/components/shared/review/ReviewerAvatar";
import { EmptyState } from "@/components/shared/ui-utility/EmptyState";
import { LoadingState } from "@/components/shared/ui-utility/LoadingState";
import { PaginationBar } from "@/components/shared/ui-utility/PaginationBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import type { ReviewRatingFilter, ReviewSortBy } from "@/hooks/player/useSubfieldReviews";
import { cn } from "@/lib/utils";
import type { GetSubfieldReviewsResponse, PublicSubfieldReview } from "@/types";
import { getReviewerDisplayName } from "@/utils/review.util";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ImageIcon, RotateCcw } from "lucide-react";

interface ReviewsSummary {
  total: number;
  average: number;
  counts: Record<1 | 2 | 3 | 4 | 5, number>;
}

interface SubfieldReviewsListProps {
  reviews: PublicSubfieldReview[];
  isLoading: boolean;
  summary: ReviewsSummary;
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
  { value: "newest", label: "Gần đây nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "rating_desc", label: "Điểm cao trước" },
  { value: "rating_asc", label: "Điểm thấp trước" },
];

const RATING_OPTIONS: Array<{ value: ReviewRatingFilter; label: string }> = [
  { value: "all", label: "Tất cả sao" },
  { value: "5", label: "5 sao" },
  { value: "4", label: "4 sao" },
  { value: "3", label: "3 sao" },
  { value: "2", label: "2 sao" },
  { value: "1", label: "1 sao" },
];

const getStarBarColor = (star: number) => {
  if (star >= 4) return "bg-emerald-500";
  if (star === 3) return "bg-amber-500";
  return "bg-rose-500";
};
// Star ratings details panel

const renderStarsText = (rating: number) => {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
};


export function SubfieldReviewsList({
  reviews,
  isLoading,
  summary,
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
  const hasActiveFilter =
    ratingFilter !== "all" || hasImagesOnly || sortBy !== "newest";

  const distributionRows = [5, 4, 3, 2, 1].map((star) => {
    const count = summary.counts[star as 1 | 2 | 3 | 4 | 5] || 0;
    const percent = summary.total > 0 ? Math.round((count / summary.total) * 100) : 0;
    return { star, percent, count };
  });

  const resetFilters = () => {
    onRatingFilterChange("all");
    onHasImagesOnlyChange(false);
    onSortByChange("newest");
    onPageChange(1);
  };

  return (
    <Card className={cn("rounded-2xl border border-border/60 bg-card p-6 shadow-xs", className)}>
      {/* Header section with summary meta */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm sm:text-base uppercase font-bold text-foreground">Phản hồi từ người chơi</h2>
        <span className="text-xs text-muted-foreground font-medium">
          {summary.average > 0 ? summary.average.toFixed(1) : "0.0"}/5 • {summary.total} đánh giá
        </span>
      </div>

      {/* Dashboard điểm số */}
      <div className="mb-6 flex flex-col items-center gap-6 border-b border-border/60 pb-6 md:flex-row">
        <div className="text-center md:border-r md:border-border/60 md:pr-8 md:min-w-[120px]">
          <div className="text-4xl font-black text-foreground">
            {summary.average > 0 ? summary.average.toFixed(1) : "0.0"}
          </div>
          <div className="my-1 text-sm text-amber-400 font-medium">
            {renderStarsText(summary.average)}
          </div>
          <span className="text-xs text-muted-foreground">{summary.total} đánh giá</span>
        </div>
        
        {/* Progress bars */}
        <div className="flex w-full flex-1 flex-col gap-1.5">
          {distributionRows.map((row) => (
            <div key={row.star} className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="w-3 text-right font-medium">{row.star}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", getStarBarColor(row.star))}
                  style={{ width: `${row.percent}%` }}
                />
              </div>
              <span className="w-8 text-right font-semibold">{row.percent}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bộ lọc Review */}
      <div className="mb-6 flex flex-wrap gap-2 overflow-x-auto pb-1">
        <Select
          value={ratingFilter}
          onValueChange={(value) => onRatingFilterChange(value as ReviewRatingFilter)}
        >
          <SelectTrigger className="h-8 w-32 rounded-xl bg-card text-xs font-semibold border-border/80 cursor-pointer">
            <SelectValue placeholder="Tất cả sao" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {RATING_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-xs">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(value) => onSortByChange(value as ReviewSortBy)}
        >
          <SelectTrigger className="h-8 w-32 rounded-xl bg-card text-xs font-semibold border-border/80 cursor-pointer">
            <SelectValue placeholder="Gần đây nhất" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-xs">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Toggle
          variant="outline"
          size="sm"
          pressed={hasImagesOnly}
          onPressedChange={onHasImagesOnlyChange}
          className="h-8 rounded-xl px-3 text-xs font-semibold border-border/80 cursor-pointer data-[state=pressed]:bg-primary/10 data-[state=pressed]:text-primary"
          aria-label="Chỉ xem đánh giá có hình ảnh"
        >
          <ImageIcon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
          Có ảnh
        </Toggle>

        {hasActiveFilter ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-8 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          >
            <RotateCcw className="h-3 w-3 mr-1.5" />
            Đặt lại
          </Button>
        ) : null}
      </div>

      {/* Content body */}
      {isLoading ? (
        <LoadingState text="Đang tải đánh giá..." className="py-10" />
      ) : reviews.length === 0 ? (
        <EmptyState
          title={hasActiveFilter ? "Không có đánh giá phù hợp" : "Chưa có đánh giá"}
          description={
            hasActiveFilter
              ? "Hãy thử thay đổi bộ lọc để xem thêm nhận xét từ người chơi."
              : "Sân này chưa có đánh giá từ người chơi. Hãy là người đầu tiên chia sẻ trải nghiệm!"
          }
          actionLabel={hasActiveFilter ? "Xóa bộ lọc" : undefined}
          onAction={hasActiveFilter ? resetFilters : undefined}
          className="py-10"
        />
      ) : (
        /* List Comments (Grid 2 cột gọn gàng) */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {reviews.map((review) => {
            const name = getReviewerDisplayName(review, "Người chơi");
            
            return (
              <div
                key={review.id}
                className="flex gap-4 p-4 rounded-2xl border border-border/60 bg-card hover:bg-muted/30 transition duration-200"
              >
                <ReviewerAvatar
                  name={name}
                  avatar={review.player?.account?.avatar}
                  className="h-9 w-9 shrink-0 text-xs font-bold text-muted-foreground bg-muted"
                  fallbackClassName="bg-primary/10 text-primary font-semibold text-xs"
                />
                
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-foreground truncate">
                        {name}
                      </h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {format(new Date(review.created_at), "dd 'thg' M yyyy", { locale: vi })}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2.5 py-0.5 rounded-lg text-[11px] shrink-0 border border-amber-500/10">
                      {review.rating}★
                    </div>
                  </div>
                  
                  <p className="text-xs text-foreground/80 leading-relaxed italic pl-1.5 border-l-2 border-primary/20">
                    {review.comment ? `"${review.comment}"` : "Không có nhận xét chi tiết."}
                  </p>

                  {/* Images attachment if any */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {review.images.slice(0, 3).map((image, index) => (
                        <div
                          key={`review-img-${index}`}
                          className="relative h-12 w-12 overflow-hidden rounded-lg border border-border/70 bg-muted shrink-0"
                        >
                          <img
                            src={image}
                            alt="Review attachment"
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination component */}
      {pagination && pagination.totalPages > 1 ? (
        <PaginationBar
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          className="mt-6"
        />
      ) : null}
    </Card>
  );
}
