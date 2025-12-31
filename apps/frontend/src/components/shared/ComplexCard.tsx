import { Link } from "react-router-dom";
import type { Complex, SportType } from "@/types";
import { getSportTypeLabel, formatPrice } from "@/services/mockData";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ComplexCardProps {
  complex: Complex;
}

export function ComplexCard({ complex }: ComplexCardProps) {
  // Use cached data if available (for public API), otherwise calculate from sub_fields
  const useCached = "_cached" in complex && complex._cached;

  let sportTypes: SportType[];
  let minPrice: number | null;
  let maxPrice: number | null;
  let hasValidPrices: boolean;
  let subfieldCount: number;

  if (useCached) {
    // Use pre-calculated cached data from backend
    const cached = (complex as any)._cached;
    sportTypes = (cached.sport_types || []) as SportType[];
    minPrice = cached.min_price;
    maxPrice = cached.max_price;
    hasValidPrices = minPrice !== null && maxPrice !== null;
    subfieldCount = cached.total_subfields || 0;
  } else {
    // Calculate from sub_fields (for owner API)
    sportTypes = [...new Set(complex.sub_fields.map((sf) => sf.sport_type))];

    const allPrices = complex.sub_fields
      .flatMap((sf) => sf.pricing_rules.map((pr) => pr.base_price))
      .filter((price) => price > 0);

    minPrice = allPrices.length > 0 ? Math.min(...allPrices) : null;
    maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : null;
    hasValidPrices = minPrice !== null && maxPrice !== null;
    subfieldCount = complex.sub_fields.length;
  }

  return (
    <Link to={`/complexes/${complex.id}`} className="block group h-full">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
        <div className="aspect-video overflow-hidden bg-muted">
          {complex.complex_image ? (
            <img
              src={complex.complex_image}
              alt={complex.complex_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </div>
        <CardContent className="p-1 flex-1 flex flex-col">
          <div className="overflow-hidden">
            <h3 className="font-bold text-base group-hover:text-primary transition-colors line-clamp-1">
              {complex.complex_name}
            </h3>
            <div className="flex items-start gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span className="line-clamp-1">{complex.complex_address}</span>
            </div>
          </div>


          {sportTypes.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 min-h-[28px] max-h-[56px] overflow-hidden">
              {sportTypes.map((type) => (
                <Badge
                  key={type}
                  variant="secondary"
                  className="text-xs px-1.5 py-0"
                >
                  {getSportTypeLabel(type)}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[28px]">
              <span className="text-xs text-muted-foreground italic">
                Chưa có sân
              </span>
            </div>
          )}


          <div className="pt-1 border-t mt-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {subfieldCount} sân
              </span>
              {hasValidPrices ? (
                <span className="font-semibold text-primary text-sm">
                  {minPrice === maxPrice
                    ? formatPrice(minPrice!)
                    : `${formatPrice(minPrice!)}/h - ${formatPrice(
                        maxPrice!
                      )}/h`}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  Chưa có giá
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
