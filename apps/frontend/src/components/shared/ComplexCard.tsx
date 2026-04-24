import { SportImage } from "@/components/shared/SportImage";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Complex, SportType } from "@/types";
import { formatPrice, getSportTypeLabel } from "@/utils";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

interface ComplexCardProps {
  complex: Complex;
}

interface ComplexCachedData {
  sport_types?: SportType[];
  min_price: number | null;
  max_price: number | null;
  total_subfields?: number;
}

interface ComplexWithCached extends Complex {
  _cached?: ComplexCachedData;
}

export function ComplexCard({ complex }: ComplexCardProps) {
  const complexWithCached = complex as ComplexWithCached;
  const cachedData = complexWithCached._cached;
  const useCached = Boolean(cachedData);

  let sportTypes: SportType[];
  let minPrice: number | null;
  let hasValidPrices: boolean;
  let subfieldCount: number;
  let primarySportType: SportType | undefined;

  if (useCached && cachedData) {
    sportTypes = cachedData.sport_types || [];
    primarySportType = sportTypes[0];
    minPrice = cachedData.min_price;
    hasValidPrices = minPrice !== null;
    subfieldCount = cachedData.total_subfields || 0;
  } else {
    sportTypes = [...new Set(complex.sub_fields.map((sf) => sf.sport_type))];
    primarySportType = sportTypes[0];

    const allPrices = complex.sub_fields
      .flatMap((sf) => sf.pricing_rules.map((pr) => pr.base_price))
      .filter((price) => price > 0);

    minPrice = allPrices.length > 0 ? Math.min(...allPrices) : null;
    hasValidPrices = minPrice !== null;
    subfieldCount = complex.sub_fields.length;
  }

  return (
    <Link
      to={`/complexes/${complex.id}`}
      className="group block h-full focus:outline-none"
    >
      <Card
        className={cn(
          "relative flex h-full flex-col gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card p-0",
          "shadow-card transition-all duration-300",
          "group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-card-hover",
          "group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2",
        )}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <SportImage
            src={complex.complex_image}
            sportType={primarySportType}
            title={complex.complex_name}
            className="transition-transform duration-500 group-hover:scale-[1.06]"
          />

          <div
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-950/35 to-transparent"
            aria-hidden="true"
          />

          <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-2">
            {primarySportType ? (
              <Badge className="rounded-full border-none bg-white/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-900 shadow-sm">
                {getSportTypeLabel(primarySportType)}
              </Badge>
            ) : (
              <span />
            )}

            <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-sport" />
              {subfieldCount} sân
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5">
            <h3 className="line-clamp-2 font-display text-lg font-bold leading-snug text-white drop-shadow-sm">
              {complex.complex_name}
            </h3>
            <p className="mt-1.5 flex items-start gap-1.5 text-xs text-white/80">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">{complex.complex_address}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-5">
          {sportTypes.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {sportTypes.slice(0, 4).map((type) => (
                <Badge
                  key={type}
                  variant="secondary"
                  className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium"
                >
                  {getSportTypeLabel(type)}
                </Badge>
              ))}
              {sportTypes.length > 4 ? (
                <Badge
                  variant="secondary"
                  className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium"
                >
                  +{sportTypes.length - 4}
                </Badge>
              ) : null}
            </div>
          ) : (
            <p className="text-xs italic text-muted-foreground">Chưa có sân</p>
          )}

          <div className="mt-auto flex items-center justify-between border-t border-dashed border-border/80 pt-3">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Giá từ
              </span>
              {hasValidPrices ? (
                <span className="font-display text-base font-bold text-foreground">
                  {formatPrice(minPrice!)}
                  <span className="ml-1 text-xs font-medium text-muted-foreground">
                    /giờ
                  </span>
                </span>
              ) : (
                <span className="text-sm italic text-muted-foreground">
                  Đang cập nhật
                </span>
              )}
            </div>

            <span
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-full",
                "bg-foreground text-background transition-all",
                "group-hover:bg-primary group-hover:scale-110",
              )}
              aria-hidden="true"
            >
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
