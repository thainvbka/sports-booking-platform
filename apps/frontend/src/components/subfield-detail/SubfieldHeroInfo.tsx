import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { PublicSubfieldDetail } from "@/types";
import { getSportTypeLabel } from "@/utils";
import { formatMinutesToTime, parseRuleTimeToMinutes } from "@/utils/time.utils";
import { MapPin } from "lucide-react";
import { useMemo } from "react";

interface SubfieldHeroInfoProps {
  subfield: PublicSubfieldDetail;
  rating: number;
  reviewCount: number;
}

export function SubfieldHeroInfo({
  subfield,
  rating,
  reviewCount,
}: SubfieldHeroInfoProps) {
  const { openTime, closeTime } = useMemo(() => {
    const starts: number[] = [];
    const ends: number[] = [];

    for (const rule of subfield.pricing_rules || []) {
      const startMin = parseRuleTimeToMinutes(rule.start_time);
      const endMin = parseRuleTimeToMinutes(rule.end_time);

      if (startMin !== null) starts.push(startMin);
      if (endMin !== null) ends.push(endMin);
    }

    if (starts.length === 0 || ends.length === 0) {
      return { openTime: "--:--", closeTime: "--:--" };
    }

    return {
      openTime: formatMinutesToTime(Math.min(...starts)),
      closeTime: formatMinutesToTime(Math.max(...ends)),
    };
  }, [subfield.pricing_rules]);

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm">
      <CardContent className="p-0">
        <div className="relative aspect-16/7 overflow-hidden bg-muted">
          <img
            src={
              subfield.sub_field_image ||
              "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2070"
            }
            alt={subfield.sub_field_name}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/45 via-black/10 to-transparent" />
        </div>

        <div className="flex items-center gap-3 overflow-x-auto border-y bg-muted/20 px-4 py-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="shrink-0">
            {getSportTypeLabel(subfield.sport_type)}
          </Badge>
          <span className="shrink-0">★ {rating > 0 ? rating.toFixed(1) : "0.0"} ({reviewCount})</span>
          <span className="shrink-0">👥 {subfield.capacity} người</span>
          <span className="shrink-0">⏰ {openTime}-{closeTime}</span>
        </div>

        <div className="space-y-2.5 p-5">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {subfield.sub_field_name}
          </h1>

          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary/80" />
            <span className="leading-relaxed">
              {subfield.complex.complex_name} • {subfield.complex.complex_address}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
