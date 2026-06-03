import { MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSportTypeLabel } from "@/utils";
import type { SportType } from "@/types";

interface ComplexHeaderProps {
  complexName: string;
  complexAddress: string;
  sportTypes?: SportType[];
  avgRating?: number | null;
}

export function ComplexHeader({
  complexName,
  complexAddress,
  sportTypes = [],
  avgRating,
}: ComplexHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-accent-sport opacity-70" />
          <span className="relative inline-flex size-2 rounded-full bg-accent-sport" />
        </span>
        <span>Khu phức hợp thể thao</span>
        {sportTypes.length > 0 && (
          <>
            <span className="h-px w-6 bg-white/20" />
            {sportTypes.slice(0, 2).map((sport) => (
              <Badge
                key={sport}
                variant="secondary"
                className="rounded-full border-0 bg-white/10 px-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm"
              >
                {getSportTypeLabel(sport)}
              </Badge>
            ))}
            {sportTypes.length > 2 && (
              <Badge
                variant="secondary"
                className="rounded-full border-0 bg-white/10 px-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm"
              >
                +{sportTypes.length - 2}
              </Badge>
            )}
          </>
        )}
      </div>

      <h1 className="leading-[1.05] tracking-tight italic sm:text-4xl lg:text-5xl text-title font-black text-white">
        {complexName}
      </h1>

      <div className="flex items-center gap-3 text-white/80 flex-wrap">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-sport" />
          <p className="text-sm leading-relaxed">
            <span className="text-white/85">{complexAddress}</span>
          </p>
        </div>
        {avgRating !== undefined && avgRating !== null && (
          <div className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs text-amber-400 backdrop-blur-sm">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-white">
              {Number(avgRating).toFixed(1)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
