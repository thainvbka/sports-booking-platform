import { RatingStars } from "@/components/shared/review/RatingStars";
import { ReviewerAvatar } from "@/components/shared/review/ReviewerAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { PublicSubfieldDetail, PublicSubfieldReview } from "@/types";
import { formatPrice } from "@/utils";
import { getReviewerDisplayName } from "@/utils/review.util";
import {
  ArrowUpRight,
  CalendarClock,
  Clock3,
  Receipt,
  Repeat2,
  Sparkles,
  Users,
} from "lucide-react";

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
  const isRecurring = bookingType === "recurring";
  const timeRange =
    customStartTime && customEndTime
      ? `${customStartTime} – ${customEndTime}`
      : "--:-- – --:--";

  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
      {/* ── Order summary ──────────────────────────────────────── */}
      <Card className="relative overflow-hidden border-border/70 shadow-sm">
        {/* decorative ticket notch */}
        <span
          aria-hidden
          className="pointer-events-none absolute -left-2 top-16 size-4 rounded-full border border-border/70 bg-background"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-2 top-16 size-4 rounded-full border border-border/70 bg-background"
        />

        <CardHeader className="border-b border-dashed border-border/60 pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Hóa đơn tạm tính
              </span>
              <CardTitle className="font-display text-lg font-bold italic tracking-tight">
                Tóm tắt đơn
              </CardTitle>
            </div>
            <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <Receipt className="size-4" />
            </span>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 pt-4 text-sm">
          {/* Meta chips */}
          <div className="flex flex-col gap-2">
            <MetaRow
              icon={isRecurring ? Repeat2 : CalendarClock}
              label="Hình thức"
              value={isRecurring ? "Đặt định kỳ" : "Đặt một lần"}
              accent
            />
            <MetaRow
              icon={Clock3}
              label="Khung giờ"
              value={timeRange}
            />
            <MetaRow
              icon={Users}
              label="Sức chứa"
              value={`${subfield.capacity} người`}
            />
          </div>

          <Separator className="border-dashed" />

          {/* Price breakdown */}
          <div className="flex flex-col gap-1.5 text-sm">
            <PriceLine
              label="Tiền sân"
              value={formatPrice(bookingFieldPrice)}
            />
            {!isRecurring && (
              <PriceLine label="Add-on" value={formatPrice(addonSubtotal)} />
            )}
          </div>

          {/* Total */}
          <div className="relative rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/12 via-primary/8 to-accent-sport/10 p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-primary/80">
                Tổng tạm tính
              </span>
              <Sparkles className="size-3.5 text-primary/70" />
            </div>
            <p className="mt-1 italic tabular-nums tracking-tight text-primary text-title">
              {formatPrice(totalPrice)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Chưa bao gồm phí dịch vụ thanh toán (nếu có).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Highlighted reviews ────────────────────────────────── */}
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Tiếng nói cầu thủ
              </span>
              <CardTitle className="font-display text-base font-bold italic tracking-tight">
                Đánh giá nổi bật
              </CardTitle>
            </div>
            {reviewSummary.total > 0 ? (
              <div className="flex flex-col items-end leading-none">
                <span className="font-display text-2xl font-black italic tabular-nums text-foreground">
                  {reviewSummary.average.toFixed(1)}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {reviewSummary.total} review
                </span>
              </div>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          {reviewSummary.total > 0 ? (
            <RatingStars rating={Math.round(reviewSummary.average)} />
          ) : (
            <p className="rounded-xl border border-dashed border-border/70 bg-surface-2/40 px-3 py-3 text-center text-xs text-muted-foreground">
              Chưa có đánh giá cho sân này. Hãy là người đầu tiên để lại dấu
              ấn sau khi đá xong.
            </p>
          )}

          {reviewSnippets.slice(0, 2).map((review) => {
            const reviewerName = getReviewerDisplayName(review, "Người chơi");

            return (
              <div
                key={review.id}
                className="rounded-xl border border-border/70 bg-card/80 p-3"
              >
                <div className="flex items-start gap-3">
                  <ReviewerAvatar
                    name={reviewerName}
                    avatar={review.player?.account?.avatar}
                    className="size-8 border"
                    fallbackClassName="text-[10px] font-semibold"
                  />

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">
                        {reviewerName}
                      </p>
                      <RatingStars rating={review.rating} />
                    </div>
                    {review.comment && (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onViewAllReviews}
          >
            Xem tất cả đánh giá
            <ArrowUpRight data-icon="inline-end" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────
function MetaRow({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm",
        accent
          ? "border-primary/25 bg-primary/5"
          : "border-border/60 bg-surface-2/40",
      )}
    >
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon
          className={cn(
            "size-4 shrink-0",
            accent ? "text-primary" : "text-muted-foreground/80",
          )}
        />
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
          {label}
        </span>
      </span>
      <span
        className={cn(
          "truncate text-right font-semibold",
          accent ? "text-primary" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function PriceLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}
