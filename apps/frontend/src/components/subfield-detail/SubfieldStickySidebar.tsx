import { RatingStars } from "@/components/shared/review/RatingStars";
import { SubfieldPricingTabs } from "@/components/subfield-detail/SubfieldPricingTabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { PublicSubfieldDetail } from "@/types";
import { formatMinutesToTime, parseRuleTimeToMinutes } from "@/utils/time.utils";
import { Clock3, Users } from "lucide-react";
import { useMemo } from "react";

interface SubfieldStickySidebarProps {
  subfield: PublicSubfieldDetail;
  ratingAverage: number;
  ratingTotal: number;
  onBookNow: () => void;
}

export function SubfieldStickySidebar({
  subfield,
  ratingAverage,
  ratingTotal,
  onBookNow,
}: SubfieldStickySidebarProps) {
  const minPrice = useMemo(() => {
    const prices = (subfield.pricing_rules || []).map((rule) => Number(rule.base_price));
    if (prices.length === 0) return null;
    return Math.min(...prices);
  }, [subfield.pricing_rules]);

  const operatingHours = useMemo(() => {
    const starts: number[] = [];
    const ends: number[] = [];

    for (const rule of subfield.pricing_rules || []) {
      const startMin = parseRuleTimeToMinutes(rule.start_time);
      const endMin = parseRuleTimeToMinutes(rule.end_time);

      if (startMin !== null) starts.push(startMin);
      if (endMin !== null) ends.push(endMin);
    }

    if (starts.length === 0 || ends.length === 0) {
      return "--:-- - --:--";
    }

    return `${formatMinutesToTime(Math.min(...starts))} - ${formatMinutesToTime(Math.max(...ends))}`;
  }, [subfield.pricing_rules]);

  return (
    <div className="lg:sticky lg:top-20 space-y-0">
      <Card className="overflow-hidden border-border/60 shadow-sm">
        <CardContent className="space-y-3 p-4">
          <div>
            <p className="text-xs text-muted-foreground">Giá từ</p>
            <p className="text-2xl font-semibold text-foreground">
              {minPrice !== null ? `${Number(minPrice).toLocaleString("vi-VN")}đ/h` : "Chưa có giá"}
            </p>
          </div>

          <Button
            size="lg"
            className="h-10 w-full rounded-md text-sm font-semibold"
            onClick={onBookNow}
          >
            Đặt sân ngay
          </Button>
<div className="flex items-center gap-2">
  <RatingStars rating={Math.round(ratingAverage || 0)} iconClassName="h-4 w-4" />
  <p className="text-sm text-muted-foreground">
    {ratingAverage > 0 ? ratingAverage.toFixed(1) : "0.0"}
    <span className="ml-1">({ratingTotal} đánh giá)</span>
  </p>
</div>

<Separator />

<div className="space-y-2 text-sm">
  <div className="flex items-center justify-between">
    <span className="flex items-center gap-2 text-muted-foreground">
      <Users className="h-4 w-4" /> Sức chứa
    </span>
    <span className="font-medium">{subfield.capacity} người</span>
  </div>
  <div className="flex items-center justify-between">
    <span className="flex items-center gap-2 text-muted-foreground">
      <Clock3 className="h-4 w-4" /> Giờ hoạt động
    </span>
    <span className="font-medium">{operatingHours}</span>
  </div>
</div>

          <Separator className="my-3" />

          <div>
            <p className="mb-2 text-sm font-medium">Bảng giá theo ngày</p>
            <SubfieldPricingTabs pricingRules={subfield.pricing_rules || []} embedded />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
