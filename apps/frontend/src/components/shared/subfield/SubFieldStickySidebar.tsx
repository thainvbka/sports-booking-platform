import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PublicSubfieldDetail, SubfieldProduct } from "@/types";
import { ArrowRight, Zap } from "lucide-react";
import { useMemo } from "react";

interface SubfieldStickySidebarProps {
  subfield: PublicSubfieldDetail;
  products?: SubfieldProduct[];
  ratingAverage: number;
  ratingTotal: number;
  onBookNow: () => void;
  className?: string;
}

export function SubfieldStickySidebar({
  subfield,
  products = [],
  onBookNow,
  className,
}: SubfieldStickySidebarProps) {
  const minPrice = useMemo(() => {
    const prices = (subfield.pricing_rules || []).map((rule) => Number(rule.base_price));
    if (prices.length === 0) return null;
    return Math.min(...prices);
  }, [subfield.pricing_rules]);

  const displayProducts = products;

  return (
    <aside className={cn("flex flex-col gap-6 lg:sticky lg:top-24 self-start w-full z-20", className)}>
      {/* Quick Booking CTA Card */}
      <Card className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs transition-all duration-300 hover:shadow-sm">
        {/* Top brand line */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-accent-sport to-primary"
        />
        {/* Glow background accent */}
        <div
          aria-hidden
          className="absolute -right-16 -top-16 size-48 rounded-full bg-primary/10 blur-3xl pointer-events-none"
        />

        <CardHeader className="relative gap-2 px-6 pt-6 pb-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <Zap className="h-3.5 w-3.5 fill-emerald-500/20 text-emerald-500" />
              Đặt nhanh
            </span>
            <Badge
              variant="secondary"
              className="rounded-lg border-0 bg-blue-500/10 hover:bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400"
            >
              Hôm nay
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="relative flex flex-col gap-5 p-6 pt-2">
          {/* Pricing Row */}
          <div className="space-y-1">
            <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
              Giá thuê sân từ
            </p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              {minPrice !== null ? (
                <>
                  <span className="font-display text-4xl font-black tracking-tight text-foreground leading-none">
                    {Number(minPrice).toLocaleString("vi-VN")}đ
                  </span>
                  <span className="text-xs text-muted-foreground font-bold uppercase">/ giờ</span>
                </>
              ) : (
                <span className="font-display text-xl font-bold italic text-muted-foreground">
                  Đang cập nhật
                </span>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <Button
            size="lg"
            className="h-12 w-full rounded-xl text-xs font-bold cursor-pointer bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white transition-all duration-200 shadow-md shadow-blue-500/10"
            onClick={onBookNow}
            aria-label="Đặt sân ngay"
          >
            ĐẶT SÂN NGAY
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Dịch vụ thêm (Upsell Items) - Only render if products exist */}
      {displayProducts.length > 0 && (
        <Card className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-foreground">Dịch vụ bổ sung</h3>
          <div className="flex flex-col gap-4">
            {displayProducts.map((product) => {
              const price = typeof product.price === "number" ? product.price : Number(product.price);
              
              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-3 rounded-xl p-2 transition hover:bg-muted/50 border border-transparent hover:border-border/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-lg bg-muted border border-border/60 shrink-0">
                      <img
                        src={product.image || "https://images.unsplash.com/photo-1519766304817-4f37bda74a27?w=80&h=80&fit=crop&q=80"}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1519766304817-4f37bda74a27?w=80&h=80&fit=crop&q=80";
                        }}
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{product.name}</h4>
                      <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                        {product.description || "Dịch vụ/sản phẩm chất lượng cao cho trận đấu."}
                      </p>
                      <span className="mt-1 block text-xs font-bold text-blue-600 dark:text-blue-400">
                        {price.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </aside>
  );
}
