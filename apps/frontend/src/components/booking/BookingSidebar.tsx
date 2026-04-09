import { RatingStars } from "@/components/shared/review/RatingStars";
import { ReviewerAvatar } from "@/components/shared/review/ReviewerAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PublicSubfieldDetail, PublicSubfieldReview } from "@/types";
import { formatPrice } from "@/utils";
import { getReviewerDisplayName } from "@/utils/review.utils";
import { Clock3, Users } from "lucide-react";

interface BookingSidebarProps {
  subfield: PublicSubfieldDetail;
  customStartTime: string;
  customEndTime: string;
  bookingFieldPrice: number;
  addonSubtotal: number;
  totalPrice: number;
  bookingType: "single" | "recurring";
  reviewSummary: {
    total: number;
    average: number;
  };
  reviewSnippets: PublicSubfieldReview[];
  onViewAllReviews: () => void;
}

export function BookingSidebar({
  subfield,
  customStartTime,
  customEndTime,
  bookingFieldPrice,
  addonSubtotal,
  totalPrice,
  bookingType,
  reviewSummary,
  reviewSnippets,
  onViewAllReviews,
}: BookingSidebarProps) {
  return (
    <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tóm tắt đơn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Sức chứa {subfield.capacity} người</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock3 className="h-4 w-4" />
            <span>
              {customStartTime || "--:--"} - {customEndTime || "--:--"}
            </span>
          </div>

          <div className="rounded-md border bg-muted/30 p-3">
            <div className="flex items-center justify-between">
              <span>Tiền sân</span>
              <span>{formatPrice(bookingFieldPrice)}</span>
            </div>
            {bookingType === "single" && (
              <div className="mt-1 flex items-center justify-between">
                <span>Add-on</span>
                <span>{formatPrice(addonSubtotal)}</span>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between border-t pt-2 text-base font-semibold">
              <span>Tổng tạm tính</span>
              <span className="text-primary">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Đánh giá nổi bật</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reviewSummary.total > 0 ? (
            <div className="rounded-md border bg-muted/40 p-3 text-sm">
              <RatingStars
                rating={Math.round(reviewSummary.average)}
                className="mb-1"
                iconClassName="h-3.5 w-3.5"
                filledClassName="fill-primary text-primary"
                emptyClassName="text-muted-foreground/40"
              />
              <p className="font-semibold text-foreground">
                {reviewSummary.average.toFixed(1)} ({reviewSummary.total} đánh giá)
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Chưa có đánh giá cho sân này.</p>
          )}

          {reviewSnippets.slice(0, 3).map((review) => {
            const reviewerName = getReviewerDisplayName(review, "Người chơi");

            return (
              <div key={review.id} className="rounded-md border p-3">
                <div className="flex items-start gap-3">
                  <ReviewerAvatar
                    name={reviewerName}
                    avatar={review.player?.account?.avatar}
                    className="h-8 w-8 border"
                    fallbackClassName="text-[10px] font-semibold"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{reviewerName}</p>
                    <RatingStars
                      rating={review.rating}
                      className="mt-1 gap-0.5"
                      iconClassName="h-3.5 w-3.5"
                      filledClassName="fill-primary text-primary"
                      emptyClassName="text-muted-foreground/40"
                    />
                    {review.comment && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <Button variant="ghost" size="sm" className="w-full" onClick={onViewAllReviews}>
            Xem tất cả đánh giá
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
