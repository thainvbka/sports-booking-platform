import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecommendationCard } from "@/components/player/RecommendationCard";
import { useRecommendations } from "@/hooks/useRecommendations";
import { cn } from "@/lib/utils";
import type { RecommendationItem } from "@/types";
import { formatPrice, getSportTypeLabel } from "@/utils";
import {
  ArrowRight,
  MapPin,
  RefreshCw,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function RecommendedCourts() {
  const { data, loading, error, refetch } = useRecommendations();

  // Don't render anything if hook determined user isn't a player
  if (!loading && !error && !data) return null;

  const isPersonalized = data?.type === "PERSONALIZED";
  const subtitle = isPersonalized
    ? "Dựa trên thói quen đặt sân của bạn"
    : "Những sân được nhiều người yêu thích nhất";

  return (
    <section className="relative overflow-hidden bg-background py-16 sm:py-20">
      {/* Background decoration */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-primary/[0.04] blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 size-64 rounded-full bg-accent-sport/[0.03] blur-3xl"
        aria-hidden="true"
      />

      <div className="page-shell relative">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex items-center justify-center rounded-lg p-1.5",
                  isPersonalized
                    ? "bg-primary/10 text-primary"
                    : "bg-amber-500/10 text-amber-600",
                )}
              >
                {isPersonalized ? (
                  <Sparkles className="size-4" />
                ) : (
                  <TrendingUp className="size-4" />
                )}
              </div>
              <span
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-[0.22em]",
                  isPersonalized ? "text-primary" : "text-amber-600",
                )}
              >
                {isPersonalized ? "Dành riêng cho bạn" : "Phổ biến nhất"}
              </span>
            </div>

            <h2 className="mt-3 leading-tight tracking-tight text-foreground sm:text-4xl text-title">
              {isPersonalized ? (
                <>
                  Sân phù hợp với{" "}
                  <span className="italic text-primary">phong cách</span> của
                  bạn.
                </>
              ) : (
                <>
                  Sân được yêu thích{" "}
                  <span className="italic text-primary">nhiều nhất.</span>
                </>
              )}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <RecommendationSkeletons />
        ) : error ? (
          <RecommendationError onRetry={refetch} />
        ) : data && data.items.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 motion-safe-stagger">
            {data.items.map((item, index) => (
              <RecommendationCard key={item.sub_field_id} item={item} rank={index + 1} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/* Skeleton loading                                                            */
/* -------------------------------------------------------------------------- */

function RecommendationSkeletons() {
  return (
    <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card
          key={i}
          className="flex flex-col overflow-hidden rounded-2xl border border-border/70 p-0"
        >
          <Skeleton className="aspect-[16/10] rounded-none" />
          <div className="flex flex-col gap-3 p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 rounded-lg" />
            <Skeleton className="h-4 w-full" />
            <div className="mt-auto flex gap-2">
              <Skeleton className="h-8 flex-1 rounded-md" />
              <Skeleton className="h-8 flex-1 rounded-md" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Error state                                                                 */
/* -------------------------------------------------------------------------- */

function RecommendationError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-border bg-secondary/30 px-6 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Sparkles className="size-5 text-muted-foreground" />
      </div>
      <p className="mt-4 font-display text-lg font-semibold text-foreground">
        Không tải được gợi ý
      </p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Đã xảy ra lỗi khi tải danh sách gợi ý. Vui lòng thử lại.
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mt-5 rounded-full"
        onClick={onRetry}
      >
        <RefreshCw data-icon="inline-start" />
        Thử lại
      </Button>
    </div>
  );
}
