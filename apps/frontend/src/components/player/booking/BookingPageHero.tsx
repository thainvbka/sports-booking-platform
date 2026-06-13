import { ImageFallback } from "@/components/shared/ui-utility/ImageFallback";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { PublicSubfieldDetail } from "@/types";
import { getSportTypeLabel } from "@/utils";
import { MapPin, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";

interface BookingPageHeroProps {
  subfield: PublicSubfieldDetail;
}

export function BookingPageHero({ subfield }: BookingPageHeroProps) {
  return (
    <>
      {/* ── Breadcrumb ──────────────────────────────────────────── */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Trang chủ</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/complexes/${subfield.complex.id}`}>
                {subfield.complex.complex_name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/subfields/${subfield.id}`}>
                {subfield.sub_field_name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Đặt sân</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-start gap-5">
        {/* left block */}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border/80 bg-background/70 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.26em] text-muted-foreground backdrop-blur-sm">
            <span className="relative inline-flex size-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-accent-sport/70" />
              <span className="relative inline-block size-1.5 rounded-full bg-accent-sport" />
            </span>
            Matchday · Booking slip
          </span>

          <div className="flex flex-col gap-1">
            <h1 className="leading-[1.05] tracking-tight text-foreground sm:text-4xl lg:text-5xl text-title">
              Đặt sân{" "}
              <span className="bg-gradient-to-br from-primary via-primary to-accent-sport bg-clip-text italic text-transparent">
                {subfield.sub_field_name}
              </span>
            </h1>
            <p className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground sm:text-[15px]">
              <MapPin className="size-4 shrink-0 text-primary/70" />
              <span className="font-semibold text-foreground/85">
                {subfield.complex.complex_name}
              </span>
              <span className="text-muted-foreground/60">·</span>
              <span className="truncate">
                {subfield.complex.complex_address}
              </span>
            </p>
          </div>

          {/* Meta chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge
              variant="outline"
              className="gap-1.5 rounded-full border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary"
            >
              {getSportTypeLabel(subfield.sport_type)}
            </Badge>
            <Badge
              variant="outline"
              className="gap-1.5 rounded-full border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-sm"
            >
              <Users data-icon="inline-start" />
              Sức chứa {subfield.capacity}
            </Badge>
            <Badge
              variant="outline"
              className="gap-1.5 rounded-full border-accent-sport/30 bg-accent-sport/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-sport backdrop-blur-sm"
            >
              <ShieldCheck data-icon="inline-start" />
              Giữ chỗ tức thì
            </Badge>
          </div>
        </div>

        {/* right thumb */}
        <div className="relative hidden size-28 shrink-0 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm sm:block md:size-32">
          {subfield.sub_field_image ? (
            <img
              src={subfield.sub_field_image}
              alt={subfield.sub_field_name}
              className="size-full object-cover"
            />
          ) : (
            <ImageFallback
              title={subfield.sub_field_name}
              showLabel={false}
              className="rounded-none"
            />
          )}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent"
          />
          <span className="absolute bottom-2 left-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/95">
            Pitch · {subfield.sub_field_name}
          </span>
        </div>
      </header>
    </>
  );
}
