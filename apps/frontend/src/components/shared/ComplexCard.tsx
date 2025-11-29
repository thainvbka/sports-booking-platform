import { Link } from "react-router-dom";
import type { Complex } from "@/types";
import { getSportTypeLabel, formatPrice } from "@/services/mockData";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ComplexCardProps {
  complex: Complex;
}

export function ComplexCard({ complex }: ComplexCardProps) {
  const sportTypes = [
    ...new Set(complex.sub_fields.map((sf) => sf.sport_type)),
  ];

  // Get price range across all sub-fields
  const allPrices = complex.sub_fields.flatMap((sf) =>
    sf.pricing_rules.map((pr) => pr.base_price)
  );
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);

  return (
    <Link to={`/complex/${complex.id}`} className="block group">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
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
        <CardContent className="p-3 space-y-2">
          <div>
            <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-1">
              {complex.complex_name}
            </h3>
            <div className="flex items-start gap-1 text-xs text-muted-foreground mt-1">
              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span className="line-clamp-1">{complex.complex_address}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
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

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {complex.sub_fields.length} sân
              </span>
              <span className="font-semibold text-primary text-sm">
                {formatPrice(minPrice)} - {formatPrice(maxPrice)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
