import { SportImage } from "@/components/shared/SportImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RecommendationItem } from "@/types";
import { formatPrice, getSportTypeLabel } from "@/utils";
import { ArrowRight, MapPin, Sparkles, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RecommendationCardProps {
  item: RecommendationItem;
  rank: number;
  variant?: "default" | "compact";
}

export function RecommendationCard({
  item,
  rank,
  variant = "default",
}: RecommendationCardProps) {
  const navigate = useNavigate();
  const sf = item.sub_field;

  if (!sf) return null;

  // Compact variant (SearchPage horizontal banner layout)
  if (variant === "compact") {
    return (
      <Card
        className="group relative flex w-[220px] shrink-0 cursor-pointer flex-col overflow-hidden rounded-xl border border-border/70 bg-card p-0 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
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

  // Default variant (HomePage grid layout)
  return (
    <Card
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card p-0",
        "shadow-card transition-all duration-300",
        "hover:-translate-y-1 hover:border-primary/40 hover:shadow-card-hover",
        "@container"
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

        {/* AI reason */}
        {item.reason && (
          <p className="line-clamp-2 border-t border-dashed border-border/80 pt-2.5 text-[11px] leading-relaxed text-muted-foreground italic">
            <Sparkles className="mr-1 inline size-3 text-primary/85" />
            {item.reason}
          </p>
        )}

        {/* Price & Actions */}
        <div className="mt-auto flex flex-col gap-2.5 border-t border-border/50 pt-3 @[260px]:flex-row @[260px]:items-center @[260px]:justify-between @[260px]:gap-2">
          <div className="flex flex-col">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground leading-none mb-1">
              Giá từ
            </span>
            {sf.price_min && Number(sf.price_min) > 0 ? (
              <span className="font-display text-sm font-bold text-primary leading-none">
                {formatPrice(Number(sf.price_min))}
                <span className="text-[10px] font-medium text-muted-foreground">
                  /h
                </span>
              </span>
            ) : (
              <span className="text-xs italic text-muted-foreground leading-none">
                Đang cập nhật
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 w-full @[260px]:w-auto @[260px]:justify-end">
            <Button
              variant="outline"
              size="sm"
              className="h-7 flex-1 @[260px]:flex-none rounded-full px-2.5 text-[11px] font-medium"
              onClick={() => navigate(`/subfields/${item.sub_field_id}`)}
            >
              Chi tiết
            </Button>
            <Button
              size="sm"
              className="h-7 flex-1 @[260px]:flex-none rounded-full bg-primary px-3 text-[11px] font-semibold text-primary-foreground hover:bg-primary/95"
              onClick={() => navigate(`/booking/${item.sub_field_id}`)}
            >
              Đặt ngay
              <ArrowRight className="ml-1 size-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
