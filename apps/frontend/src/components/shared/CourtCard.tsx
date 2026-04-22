import { SportImage } from "@/components/shared/SportImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PublicSubfield } from "@/types";
import { formatPrice, getPriceRange, getSportTypeLabel } from "@/utils";
import { ArrowRight, MapPin, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CourtCardProps {
  court: PublicSubfield;
}

export function CourtCard({ court }: CourtCardProps) {
  const navigate = useNavigate();

  const minPrice =
    court.min_price ||
    (court.pricing_rules.length > 0 ? getPriceRange(court).min : 0);

  return (
    <Card
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card p-0",
        "shadow-card transition-all duration-300",
        "hover:-translate-y-1 hover:border-primary/40 hover:shadow-card-hover",
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <SportImage
          src={court.sub_field_image}
          sportType={court.sport_type}
          title={court.sub_field_name}
          className="transition-transform duration-500 group-hover:scale-[1.05]"
        />

        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/55 via-transparent to-transparent"
          aria-hidden="true"
        />

        <div className="absolute left-3 right-3 top-3 flex items-center justify-between">
          <Badge className="rounded-full border-none bg-white/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-900 shadow-sm">
            {getSportTypeLabel(court.sport_type)}
          </Badge>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-accent-sport" />
              <span className="relative inline-flex size-1.5 rounded-full bg-accent-sport" />
            </span>
            Đang trống
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-1.5">
          <h3
            className="line-clamp-1 font-display text-lg font-bold leading-tight transition-colors group-hover:text-primary"
            title={court.sub_field_name}
          >
            {court.sub_field_name}
          </h3>
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span
              className="line-clamp-1"
              title={court.complex_address || court.complex_name || ""}
            >
              {court.complex_name || "Khu thể thao"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 items-stretch divide-x divide-dashed divide-border rounded-xl bg-secondary/70 px-1">
          <div className="flex flex-col items-start gap-0.5 px-3 py-2.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              <Users className="h-3 w-3" />
              Sức chứa
            </span>
            <span className="text-sm font-semibold text-foreground">
              {court.capacity} người
            </span>
          </div>
          <div className="flex flex-col items-start gap-0.5 px-3 py-2.5">
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
        </div>

        <div className="mt-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/subfields/${court.id}`)}
          >
            Chi tiết
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/booking/${court.id}`)}
          >
            Đặt ngay
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
