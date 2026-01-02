import { Users, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingModal } from "@/components/shared/BookingModal";
import {
  getSportTypeLabel,
  formatPrice,
  getPriceRange,
} from "@/services/mockData";
import type { SubField } from "@/types";
import { Link } from "react-router-dom";

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
  // Use min_price from backend if available, otherwise try to get from pricing_rules
  const minPrice =
    subField.min_price ||
    (subField.pricing_rules.length > 0 ? getPriceRange(subField).min : 0);

  const cardContent = (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      {/* Image Section */}
      <div className="aspect-video overflow-hidden bg-muted relative">
        <img
          src={
            subField.sub_field_image ||
            "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=2070"
          }
          alt={subField.sub_field_name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <Badge className="absolute top-1 right-3 bg-white text-gray-900 hover:bg-white/90 border-none shadow-sm">
          {getSportTypeLabel(subField.sport_type)}
        </Badge>
      </div>

      {/* Content Section */}
      <CardContent className="p-2 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors flex-1 min-w-0"
            title={subField.sub_field_name}
          >
            {subField.sub_field_name}
          </h3>
          <div className="flex items-center gap-1 text-xs shrink-0">
            <Users className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span>{subField.capacity}</span>
          </div>
        </div>

        {showComplexInfo && subField.complex_name ? (
          <div className="flex items-start gap-1 text-xs text-muted-foreground min-h-[20px]">
            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span
              className="line-clamp-1"
              title={subField.complex_address || subField.complex_name}
            >
              {subField.complex_address
                ? `${subField.complex_name} • ${subField.complex_address}`
                : subField.complex_name}
            </span>
          </div>
        ) : (
          <div className="min-h-[20px]" />
        )}

        {/* Amenities (Mock) */}
        {/* <div className="flex flex-wrap gap-2 mb-3 mt-auto">
          <Badge variant="secondary" className="text-xs font-normal">
            Wifi
          </Badge>
          <Badge variant="secondary" className="text-xs font-normal">
            Gửi xe
          </Badge>
          <Badge variant="secondary" className="text-xs font-normal">
            Nước uống
          </Badge>
        </div> */}

        <div className="flex items-center justify-between pt-1 border-t mt-auto">
          <div>
            <p className="text-xs text-muted-foreground">Giá từ</p>
            {minPrice > 0 ? (
              <span className="font-semibold text-primary text-sm">
                {formatPrice(minPrice)}/h
              </span>
            ) : (
              <span className="text-xs text-muted-foreground italic">
                Chưa có giá
              </span>
            )}
          </div>
          {mode === "player" ? (
            <BookingModal
              subField={subField}
              trigger={
                <Button size="sm" className="h-8 text-xs">
                  Đặt sân ngay
                </Button>
              }
            />
          ) : (
            <span className="text-primary font-medium text-xs hover:underline">
              Xem chi tiết →
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (mode === "owner") {
    return (
      <Link to={`/owner/sub-fields/${subField.id}`} className="block group">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
