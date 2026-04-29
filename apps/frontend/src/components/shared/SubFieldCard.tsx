import { ImageFallback } from "@/components/shared/ImageFallback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SubField } from "@/types";
import { formatPrice, getPriceRange, getSportTypeLabel } from "@/utils";
import { ArrowUpRight, MapPin, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface SubFieldCardProps {
  subField: SubField & { complex_name?: string; complex_address?: string };
  showComplexInfo?: boolean;
  mode?: "player" | "owner";
}

export function SubFieldCard({
  subField,
  showComplexInfo = false,
  mode = "player",
}: SubFieldCardProps) {
  const navigate = useNavigate();

  const minPrice =
    subField.min_price ||
    (subField.pricing_rules.length > 0 ? getPriceRange(subField).min : 0);

  const cardContent = (
    <Card
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card p-0",
        "shadow-card transition-all duration-300",
        "hover:-translate-y-1 hover:border-primary/40 hover:shadow-card-hover",
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {subField.sub_field_image ? (
          <img
            src={subField.sub_field_image}
            alt={subField.sub_field_name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <ImageFallback
            sportType={subField.sport_type}
            title={subField.sub_field_name}
            className="rounded-none"
          />
        )}

        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/55 via-transparent to-transparent"
          aria-hidden="true"
        />

        <div className="absolute left-3 right-3 top-3 flex items-center justify-between gap-2">
          <Badge className="rounded-full border-none bg-white/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-900 shadow-sm">
            {getSportTypeLabel(subField.sport_type)}
          </Badge>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            <Users className="h-3 w-3" />
            {subField.capacity} người
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-col gap-1">
          <h3
            className="line-clamp-1 font-display text-base font-bold leading-tight transition-colors group-hover:text-primary"
            title={subField.sub_field_name}
          >
            {subField.sub_field_name}
          </h3>

          {showComplexInfo && subField.complex_name ? (
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span
                className="line-clamp-1"
                title={subField.complex_address || subField.complex_name}
              >
                {subField.complex_address
                  ? `${subField.complex_name} • ${subField.complex_address}`
                  : subField.complex_name}
              </span>
            </div>
          ) : null}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-dashed border-border pt-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Giá từ
            </span>
            {minPrice > 0 ? (
              <span className="font-display text-sm font-bold text-primary">
                {formatPrice(minPrice)}
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

          {mode === "player" ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/subfields/${subField.id}`)}
              >
                Chi tiết
              </Button>
              <Button
                size="sm"
                onClick={() => navigate(`/booking/${subField.id}`)}
              >
                Đặt ngay
                {/* <ArrowRight data-icon="inline-end" /> */}
              </Button>
            </div>
          ) : (
            <span
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-full",
                "bg-foreground text-background transition-all",
                "group-hover:bg-primary group-hover:scale-110",
              )}
              aria-hidden="true"
            >
              <ArrowUpRight className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>
    </Card>
  );

  if (mode === "owner") {
    return (
      <Link
        to={`/owner/sub-fields/${subField.id}`}
        className="group block h-full"
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
