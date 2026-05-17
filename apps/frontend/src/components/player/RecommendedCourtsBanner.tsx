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
  ChevronLeft,
  ChevronRight,
  MapPin,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Compact horizontal recommendation banner for the SearchPage.
 * Renders as a scrollable strip of mini-cards with arrow navigation.
 */
export function RecommendedCourtsBanner() {
  const { data, loading, error } = useRecommendations();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  const scroll = useCallback(
    (direction: "left" | "right") => {
      const el = scrollRef.current;
      if (!el) return;
      const distance = el.clientWidth * 0.65;
      el.scrollBy({
        left: direction === "left" ? -distance : distance,
        behavior: "smooth",
      });
      // Update buttons after animation
      setTimeout(updateScrollButtons, 350);
    },
    [updateScrollButtons],
  );

  // Don't render if not a player or no data
  if (!loading && !error && !data) return null;
  if (error) return null;

  const isPersonalized = data?.type === "PERSONALIZED";

  return (
    <div className="relative rounded-2xl border border-border/70 bg-card p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
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
              <Sparkles className="size-3.5" />
            ) : (
              <TrendingUp className="size-3.5" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              {isPersonalized
                ? "✨ Gợi ý dành riêng cho bạn"
                : "🔥 Sân phổ biến nhất"}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {isPersonalized
                ? "Dựa trên thói quen đặt sân của bạn"
                : "Được nhiều người yêu thích"}
            </span>
          </div>
        </div>

        {/* Scroll buttons */}
        {!loading && data && data.items.length > 3 && (
          <div className="hidden items-center gap-1 sm:flex">
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={cn(
                "flex size-7 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground transition",
                "hover:bg-secondary hover:text-foreground",
                "disabled:pointer-events-none disabled:opacity-30",
              )}
              aria-label="Cuộn sang trái"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={cn(
                "flex size-7 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground transition",
                "hover:bg-secondary hover:text-foreground",
                "disabled:pointer-events-none disabled:opacity-30",
              )}
              aria-label="Cuộn sang phải"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Scrollable cards */}
      {loading ? (
        <div className="mt-4 flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <BannerCardSkeleton key={i} />
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <div
          ref={scrollRef}
          onScroll={updateScrollButtons}
          className="scroll-smooth-snap mt-4 flex gap-3 overflow-x-auto pb-1 scrollbar-hide"
        >
          {data.items.map((item, index) => (
            <BannerCard key={item.sub_field_id} item={item} rank={index + 1} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Banner Card (compact)                                                       */
/* -------------------------------------------------------------------------- */

interface BannerCardProps {
  item: RecommendationItem;
  rank: number;
}

function BannerCard({ item, rank }: BannerCardProps) {
  const navigate = useNavigate();
  const sf = item.sub_field;

  if (!sf) return null;

  return (
    <Card
      className={cn(
        "group relative flex w-[220px] shrink-0 cursor-pointer flex-col overflow-hidden rounded-xl border border-border/70 bg-card p-0",
        "shadow-sm transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
      )}
      onClick={() => navigate(`/subfields/${item.sub_field_id}`)}
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <SportImage
          src={sf.sub_field_image}
          sportType={sf.sport_type}
          title={sf.sub_field_name}
          className="transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/50 via-transparent to-transparent"
          aria-hidden="true"
        />

        {/* Sport badge */}
        <Badge className="absolute left-2 top-2 rounded-full border-none bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-900 shadow-sm">
          {getSportTypeLabel(sf.sport_type)}
        </Badge>

        {/* Rank */}
        <span className="absolute right-2 top-2 inline-flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
          {rank}
        </span>

        {/* Rating */}
        {sf.avg_rating !== null && sf.avg_rating !== undefined && (
          <div className="absolute bottom-2 left-2 flex items-center gap-0.5 rounded-full bg-slate-950/55 px-1.5 py-0.5 backdrop-blur-sm">
            <Star className="size-2.5 fill-amber-400 text-amber-400" />
            <span className="text-[10px] font-semibold text-white">
              {Number(sf.avg_rating).toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h4
          className="line-clamp-1 text-[13px] font-semibold leading-tight text-foreground transition-colors group-hover:text-primary"
          title={sf.sub_field_name}
        >
          {sf.sub_field_name}
        </h4>

        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="size-2.5 shrink-0" />
          <span className="line-clamp-1">{sf.complex?.complex_name}</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-1.5">
          {sf.price_min && Number(sf.price_min) > 0 ? (
            <span className="font-display text-xs font-bold text-primary">
              {formatPrice(Number(sf.price_min))}
              <span className="text-[10px] font-medium text-muted-foreground">
                /h
              </span>
            </span>
          ) : (
            <span className="text-[11px] italic text-muted-foreground">
              —
            </span>
          )}

          <Button
            size="sm"
            variant="ghost"
            className="h-6 rounded-full px-2 text-[11px]"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/booking/${item.sub_field_id}`);
            }}
          >
            Đặt
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>

        {/* AI reason */}
        {item.reason && (
          <p className="line-clamp-1 border-t border-dashed border-border pt-1.5 text-[10px] italic text-muted-foreground">
            <Sparkles className="mr-0.5 inline size-2.5 text-primary/70" />
            {item.reason}
          </p>
        )}
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                    */
/* -------------------------------------------------------------------------- */

function BannerCardSkeleton() {
  return (
    <Card className="flex w-[220px] shrink-0 flex-col overflow-hidden rounded-xl border-border/70 p-0">
      <Skeleton className="aspect-[16/9] rounded-none" />
      <div className="flex flex-col gap-2 p-3">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>
      </div>
    </Card>
  );
}
