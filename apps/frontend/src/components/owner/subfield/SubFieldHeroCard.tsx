import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SubfieldDetail } from "@/types";
import { getSportTypeLabel } from "@/utils";
import { Pencil, Ruler, Trash2, Users } from "lucide-react";

interface SubFieldHeroCardProps {
  subfield: SubfieldDetail;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export function SubFieldHeroCard({
  subfield,
  onEditClick,
  onDeleteClick,
}: SubFieldHeroCardProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-xs transition-all duration-300 hover:shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Side: Thumbnail + Info */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Thumbnail */}
          {subfield.sub_field_image ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border/70 shadow-2xs sm:w-36">
              <img
                src={subfield.sub_field_image}
                alt={subfield.sub_field_name}
                className="size-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          ) : null}

          {/* Identity Info */}
          <div className="flex flex-col gap-1.5">
            <h1 className="font-display text-xl font-black tracking-tight text-foreground sm:text-2xl">
              {subfield.sub_field_name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className="h-5 gap-1 rounded-full border-primary/20 bg-primary/5 px-2.5 text-[10px] font-bold uppercase tracking-wider text-primary"
              >
                <Ruler className="size-3" />
                {getSportTypeLabel(subfield.sport_type)}
              </Badge>
              <Badge
                variant="outline"
                className="h-5 gap-1 rounded-full border-border/80 bg-muted/40 px-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                <Users className="size-3" />
                {subfield.capacity} người
              </Badge>
            </div>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex flex-row items-center gap-2 sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onEditClick}
            className="h-9 rounded-xl border-border/80 bg-background/50 px-4 text-xs font-semibold hover:border-primary/40 hover:bg-primary/5 hover:text-primary cursor-pointer"
          >
            <Pencil className="mr-1.5 size-3.5" />
            Sửa thông tin
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDeleteClick}
            className="h-9 rounded-xl border-destructive/30 bg-destructive/5 px-4 text-xs font-semibold text-destructive hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
          >
            <Trash2 className="mr-1.5 size-3.5" />
            Xóa sân
          </Button>
        </div>
      </div>
    </section>
  );
}
