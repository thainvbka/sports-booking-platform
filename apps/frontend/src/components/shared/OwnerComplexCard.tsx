import { Link } from "react-router-dom";
import type { ComplexBase } from "@/types";
import { ComplexStatus } from "@/types";
import { MapPin, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OwnerComplexCardProps {
  complex: ComplexBase;
}

const statusConfig = {
  [ComplexStatus.PENDING]: {
    label: "Chờ duyệt",
    variant: "default" as const,
  },
  [ComplexStatus.ACTIVE]: {
    label: "Hoạt động",
    variant: "default" as const,
  },
  [ComplexStatus.REJECTED]: {
    label: "Bị từ chối",
    variant: "destructive" as const,
  },
  [ComplexStatus.DRAFT]: {
    label: "Nháp",
    variant: "secondary" as const,
  },
  [ComplexStatus.INACTIVE]: {
    label: "Không hoạt động",
    variant: "secondary" as const,
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
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {complex.complex_name}
            </h3>
            <Badge variant={status.variant} className="shrink-0">
              {status.label}
            </Badge>
          </div>

          <div className="flex items-start gap-1 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="line-clamp-1">{complex.complex_address}</span>
          </div>

          <div className="pt-2 border-t flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {complex._count.sub_fields} sân con
            </span>
            {complex.status === ComplexStatus.ACTIVE && (
              <Badge
                variant="outline"
                className="text-green-600 border-green-600"
              >
                Đang hoạt động
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
