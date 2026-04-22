import { RatingStars } from "@/components/shared/review/RatingStars";
import { SubfieldPricingTabs } from "@/components/subfield-detail/SubfieldPricingTabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { PublicSubfieldDetail } from "@/types";
import { formatMinutesToTime, parseRuleTimeToMinutes } from "@/utils/time.utils";
import { ArrowRight, Clock3, ShieldCheck, Users, Zap } from "lucide-react";
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
    <aside className="flex flex-col gap-4 xl:sticky xl:top-24">
      <Card className="relative overflow-hidden rounded-3xl border-border/70 bg-card shadow-card">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-accent-sport to-primary"
        />
        <div
          aria-hidden
          className="absolute -right-14 -top-14 size-48 rounded-full bg-primary/10 blur-3xl"
        />

        <CardHeader className="relative gap-2 px-6 pt-6 pb-0">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-accent-sport" />
                <span className="relative inline-flex size-1.5 rounded-full bg-accent-sport" />
              </span>
              Live · Đặt nhanh
            </span>
            <Badge
              variant="secondary"
              className="rounded-full border border-accent-sport/20 bg-accent-sport/10 px-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-sport"
            >
              <Zap data-icon="inline-start" className="text-accent-sport" />
              Hôm nay
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="relative flex flex-col gap-5 p-6 pt-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Giá từ
            </p>
            <div className="mt-1 flex items-baseline gap-1.5">
              {minPrice !== null ? (
                <>
                  <span className="font-display text-4xl leading-none font-black italic tracking-tight text-foreground">
                    {Number(minPrice).toLocaleString("vi-VN")}đ
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">/ giờ</span>
                </>
              ) : (
                <span className="font-display text-xl italic text-muted-foreground">
                  Đang cập nhật
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-surface-2/70 px-3 py-2">
            <RatingStars rating={Math.round(ratingAverage || 0)} iconClassName="h-4 w-4" />
            <span className="text-sm font-semibold text-foreground">
              {ratingAverage > 0 ? ratingAverage.toFixed(1) : "0.0"}
            </span>
            <span className="text-xs text-muted-foreground">
              ({ratingTotal} đánh giá)
            </span>
          </div>

          <Button
            size="lg"
            className="h-12 w-full rounded-2xl text-base font-semibold shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5"
            onClick={onBookNow}
            aria-label={`Đặt sân ${subfield.sub_field_name} ngay`}
          >
            Đặt sân ngay
            <ArrowRight data-icon="inline-end" />
          </Button>

          <Separator />

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <StatLine
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
              label="Sức chứa"
              value={`${subfield.capacity} người`}
            />
            <StatLine
              icon={<Clock3 className="h-4 w-4 text-muted-foreground" />}
              label="Mở cửa"
              value={operatingHours}
            />
          </dl>

          <div className="flex items-start gap-2 rounded-2xl border border-dashed border-border/70 bg-surface-2/40 px-3 py-2.5 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent-sport" />
            <p>
              Xác nhận ngay · Hủy linh hoạt theo chính sách sân. Giá đã bao gồm phí nền tảng.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-border/70 shadow-sm">
        <CardHeader className="gap-1 px-5 pt-5 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-base font-semibold">
              Bảng giá theo ngày
            </CardTitle>
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              T2 → CN
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Giá theo từng khung giờ.
          </p>
        </CardHeader>
        <CardContent className="px-5 pt-1 pb-5">
          <SubfieldPricingTabs pricingRules={subfield.pricing_rules || []} embedded />
        </CardContent>
      </Card>
    </aside>
  );
}

interface StatLineProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatLine({ icon, label, value }: StatLineProps) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-border/60 bg-card/50 p-2.5">
      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="truncate text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
