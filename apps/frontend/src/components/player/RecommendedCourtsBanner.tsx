import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { RecommendationCard } from "@/components/player/RecommendationCard";
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
            <RecommendationCard key={item.sub_field_id} item={item} rank={index + 1} variant="compact" />
          ))}
        </div>
      ) : null}
    </div>
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
