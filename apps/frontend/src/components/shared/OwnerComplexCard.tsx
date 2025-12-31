import { Link } from "react-router-dom";
import type { ComplexBase } from "@/types";
import { ComplexStatus } from "@/types";
import { MapPin, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface OwnerComplexCardProps {
  complex: ComplexBase;
}

const statusConfig = {
  [ComplexStatus.PENDING]: {
    label: "Chờ duyệt",
    variant: "default" as const,
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  [ComplexStatus.ACTIVE]: {
    label: "Hoạt động",
    variant: "default" as const,
    className: "bg-green-100 text-green-800 border-green-200",
  },
  [ComplexStatus.REJECTED]: {
    label: "Bị từ chối",
    variant: "destructive" as const,
    className: "bg-red-100 text-red-800 border-red-200",
  },
  [ComplexStatus.DRAFT]: {
    label: "Nháp",
    variant: "secondary" as const,
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
  [ComplexStatus.INACTIVE]: {
    label: "Đã ngừng hoạt động",
    variant: "secondary" as const,
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
};

export function OwnerComplexCard({ complex }: OwnerComplexCardProps) {
  const status = statusConfig[complex.status];

  return (
    <Link to={`/owner/complexes/${complex.id}`} className="block group">
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
              <Building2 className="w-16 h-16" />
            </div>
          )}
        </div>
        <CardContent className="px-3 pb-3 pt-1 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-1 flex-1 min-w-0">
                {complex.complex_name}
              </h3>
              <Badge
                variant={status.variant}
                className={`shrink-0 ${status.className}`}
              >
                {status.label}
              </Badge>
            </div>

            <div className="flex items-start gap-1 text-xs text-muted-foreground">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="line-clamp-1">{complex.complex_address}</span>
            </div>
          </div>

          <div className="pt-2 border-t flex items-center justify-between text-xs mt-auto">
            <span className="text-muted-foreground">
              {complex._count?.sub_fields ?? 0} sân con
            </span>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              Quản lý
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
