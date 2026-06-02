import { SportImage } from "@/components/shared/SportImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
/* Recommendation Card                                                         */
/* -------------------------------------------------------------------------- */

interface RecommendationCardProps {
  item: RecommendationItem;
  rank: number;
}

function RecommendationCard({ item, rank }: RecommendationCardProps) {
  const navigate = useNavigate();
  const sf = item.sub_field;

  if (!sf) return null;

  return (
    <Card
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card p-0",
        "shadow-card transition-all duration-300",
        "hover:-translate-y-1 hover:border-primary/40 hover:shadow-card-hover",
      )}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <SportImage
          src={sf.sub_field_image}
          sportType={sf.sport_type}
          title={sf.sub_field_name}
          className="transition-transform duration-500 group-hover:scale-[1.05]"
        />

        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/55 via-transparent to-transparent"
          aria-hidden="true"
        />

        {/* Badges */}
        <div className="absolute left-3 right-3 top-3 flex items-center justify-between">
          <Badge className="rounded-full border-none bg-white/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-900 shadow-sm">
            {getSportTypeLabel(sf.sport_type)}
          </Badge>

          <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/55 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
            #{rank}
          </span>
        </div>

        {/* Rating overlay */}
        {sf.avg_rating !== null && sf.avg_rating !== undefined && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-slate-950/60 px-2 py-1 backdrop-blur-sm">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-semibold text-white">
              {Number(sf.avg_rating).toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <h3
            className="line-clamp-1 font-display text-[15px] font-bold leading-tight transition-colors group-hover:text-primary"
            title={sf.sub_field_name}
          >
            {sf.sub_field_name}
          </h3>
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 size-3 shrink-0" />
            <span className="line-clamp-1" title={sf.complex?.complex_name}>
              {sf.complex?.complex_name || "Khu thể thao"}
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="rounded-lg bg-secondary/70 px-3 py-2">
          {sf.price_min && Number(sf.price_min) > 0 ? (
            <span className="font-display text-sm font-bold text-primary">
              {formatPrice(Number(sf.price_min))}
              <span className="ml-0.5 text-[11px] font-medium text-muted-foreground">
                /h
              </span>
            </span>
          ) : (
            <span className="text-xs italic text-muted-foreground">
              Đang cập nhật
            </span>
          )}
        </div>

        {/* AI reason */}
        {item.reason && (
          <p className="line-clamp-2 text-[12px] leading-relaxed text-muted-foreground italic">
            <Sparkles className="mr-1 inline size-3 text-primary" />
            {item.reason}
          </p>
        )}

        {/* Actions */}
        <div className="mt-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/subfields/${item.sub_field_id}`)}
          >
            Chi tiết
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/booking/${item.sub_field_id}`)}
          >
            Đặt ngay
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

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
