import { RatingStars } from "@/components/shared/review/RatingStars";
import { ReviewerAvatar } from "@/components/shared/review/ReviewerAvatar";
import { EmptyState } from "@/components/shared/ui-utility/EmptyState";
import { LoadingState } from "@/components/shared/ui-utility/LoadingState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import { buildPageList } from "@/utils";
import { getReviewerDisplayName } from "@/utils/review.utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ImageIcon, RotateCcw } from "lucide-react";
import type { MouseEvent } from "react";

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
  { value: "newest", label: "Mới nhất" },
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
    <section className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <span className="h-px w-6 bg-border-strong" />
            Match reports
          </div>
          <h2 className="mt-1.5 font-display text-2xl leading-tight font-black tracking-tight italic md:text-3xl">
            Phản hồi từ người chơi
          </h2>
        </div>

        {hasActiveFilter ? (
          <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
            <RotateCcw data-icon="inline-start" />
            Đặt lại bộ lọc
          </Button>
        ) : null}
      </div>

      <Card className="rounded-2xl border-border/70 bg-card shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:gap-6 md:p-5">
          <div className="flex items-center gap-4 md:w-52 md:shrink-0 md:flex-col md:items-start md:gap-1">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-4xl leading-none font-black italic text-foreground md:text-5xl">
                {summary.average > 0 ? summary.average.toFixed(1) : "0.0"}
              </span>
              <span className="font-display text-lg font-semibold text-muted-foreground/70">
                /5
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <RatingStars
                rating={summary.average}
                iconClassName="h-3.5 w-3.5"
              />
              <p className="text-[11px] text-muted-foreground">
                {summary.total} đánh giá
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            {distributionRows.map((row) => (
              <div
                key={row.star}
                className="grid grid-cols-[1.75rem_1fr_3rem] items-center gap-2.5"
              >
                <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                  {row.star}★
                </span>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-primary to-accent-sport transition-[width] duration-500"
                    style={{ width: `${row.percent}%` }}
                  />
                </div>
                <span className="text-right text-[11px] text-muted-foreground tabular-nums">
                  {row.count}
                  <span className="ml-1 text-muted-foreground/50">
                    ({row.percent}%)
                  </span>
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-surface-2/60 p-2">
        <span className="flex items-center gap-2 pl-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-px w-4 bg-border-strong" />
          Lọc
        </span>

        <Select
          value={ratingFilter}
          onValueChange={(value) => onRatingFilterChange(value as ReviewRatingFilter)}
        >
          <SelectTrigger className="h-8 w-32 rounded-full bg-background text-xs">
            <SelectValue placeholder="Tất cả sao" />
          </SelectTrigger>
          <SelectContent>
            {RATING_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
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
          className="h-8 rounded-full px-3 text-xs"
          aria-label="Chỉ xem đánh giá có hình ảnh"
        >
          <ImageIcon data-icon="inline-start" />
          Có hình
        </Toggle>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:inline">
            Sắp xếp
          </span>
          <Select
            value={sortBy}
            onValueChange={(value) => onSortByChange(value as ReviewSortBy)}
          >
            <SelectTrigger className="h-8 w-32 rounded-full bg-background text-xs">
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
        <ul
          key={`reviews-list-${pagination?.page ?? 1}-${ratingFilter}-${sortBy}-${hasImagesOnly}-${reviews.map((r) => r.id).join(",")}`}
          className="flex flex-col gap-2.5 motion-safe-stagger"
        >
          {reviews.map((review) => (
            <ReviewClip key={review.id} review={review} />
          ))}
        </ul>
      )}

      {pagination && pagination.totalPages > 1 ? (
        <ReviewsPaginationBar
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      ) : null}
    </section>
  );
}

interface ReviewClipProps {
  review: PublicSubfieldReview;
}

function ReviewClip({ review }: ReviewClipProps) {
  const reviewerName = getReviewerDisplayName(review, "Người chơi");

  return (
    <li>
      <Card className="rounded-xl border-border/70 bg-card shadow-none transition-colors hover:border-primary/30">
        <CardContent className="flex gap-3 p-4">
          <ReviewerAvatar
            name={reviewerName}
            avatar={review.player?.account?.avatar}
            className="size-9 shrink-0"
            fallbackClassName="bg-primary/10 text-primary"
          />

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {reviewerName}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {format(new Date(review.created_at), "dd MMM yyyy", { locale: vi })}
                </p>
              </div>

              <div className="flex items-center gap-1.5 rounded-full border border-border/70 bg-surface-2/60 px-2 py-0.5">
                <span className="font-display text-sm font-black italic text-foreground tabular-nums">
                  {review.rating}
                </span>
                <RatingStars rating={review.rating} iconClassName="h-3 w-3" />
              </div>
            </div>

            {review.comment ? (
              <p className="text-sm leading-relaxed text-foreground/85">
                {review.comment}
              </p>
            ) : null}

            {review.images.length > 0 ? (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {review.images.slice(0, 4).map((image, index) => (
                  <div
                    key={`${review.id}-image-${index}`}
                    className="relative size-16 overflow-hidden rounded-lg border border-border/70"
                  >
                    <img
                      src={image}
                      alt="Review attachment"
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </li>
  );
}

interface ReviewsPaginationBarProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function ReviewsPaginationBar({
  page,
  totalPages,
  onPageChange,
}: ReviewsPaginationBarProps) {
  const pageItems = buildPageList(page, totalPages);

  const go = (event: MouseEvent, target: number) => {
    event.preventDefault();
    if (target < 1 || target > totalPages || target === page) return;
    onPageChange(target);
  };

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={page === 1}
            className={cn(page === 1 && "pointer-events-none opacity-50")}
            onClick={(event) => go(event, page - 1)}
          />
        </PaginationItem>

        {pageItems.map((item, idx) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href="#"
                isActive={item === page}
                onClick={(event) => go(event, item)}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={page === totalPages}
            className={cn(
              page === totalPages && "pointer-events-none opacity-50",
            )}
            onClick={(event) => go(event, page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
