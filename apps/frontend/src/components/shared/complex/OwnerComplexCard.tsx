import { COMPLEX_STATUS_LABELS } from "@/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ComplexBase } from "@/types";
import { ComplexStatus } from "@/types";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  MinusCircle,
  PencilLine,
  ShieldAlert,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

interface OwnerComplexCardProps {
  complex: ComplexBase;
}

type StatusMeta = {
  label: string;
  icon: LucideIcon;
  chip: string; // for the floating badge on image
  bar: string; // left accent bar on footer
  dot: string;
};

const STATUS_META: Record<ComplexStatus, StatusMeta> = {
  [ComplexStatus.ACTIVE]: {
    label: COMPLEX_STATUS_LABELS[ComplexStatus.ACTIVE],
    icon: CheckCircle2,
    chip: "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
  },
  [ComplexStatus.PENDING]: {
    label: COMPLEX_STATUS_LABELS[ComplexStatus.PENDING],
    icon: Clock,
    chip: "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
  },
  [ComplexStatus.REJECTED]: {
    label: COMPLEX_STATUS_LABELS[ComplexStatus.REJECTED],
    icon: XCircle,
    chip: "border-rose-500/40 bg-rose-500/15 text-rose-700 dark:text-rose-300",
    bar: "bg-rose-500",
    dot: "bg-rose-500",
  },
  [ComplexStatus.DRAFT]: {
    label: COMPLEX_STATUS_LABELS[ComplexStatus.DRAFT],
    icon: PencilLine,
    chip: "border-border bg-background/90 text-muted-foreground",
    bar: "bg-muted-foreground",
    dot: "bg-muted-foreground",
  },
  [ComplexStatus.INACTIVE]: {
    label: COMPLEX_STATUS_LABELS[ComplexStatus.INACTIVE],
    icon: MinusCircle,
    chip: "border-slate-500/40 bg-slate-500/15 text-slate-700 dark:text-slate-300",
    bar: "bg-slate-500",
    dot: "bg-slate-500",
  },
};

const FALLBACK: StatusMeta = {
  label: "Không rõ",
  icon: ShieldAlert,
  chip: "border-border bg-background/90 text-muted-foreground",
  bar: "bg-muted-foreground",
  dot: "bg-muted-foreground",
};

export function OwnerComplexCard({ complex }: OwnerComplexCardProps) {
  const status = STATUS_META[complex.status] ?? FALLBACK;
  const StatusIcon = status.icon;
  const subFieldCount = complex._count?.sub_fields ?? 0;

  return (
    <Link
      to={`/owner/complexes/${complex.id}`}
      className="group relative block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`Xem chi tiết ${complex.complex_name}`}
    >
      <Card
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 p-0 shadow-card transition-all duration-300",
          "group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-card-hover",
        )}
      >
        {/* left accent */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 w-0.5 opacity-80",
            status.bar,
          )}
        />

        {/* ── Image ─────────────────────────────────────────────── */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {complex.complex_image ? (
            <img
              src={complex.complex_image}
              alt={complex.complex_name}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-muted/60 via-muted to-muted/80 text-muted-foreground">
              <Building2 className="size-12 opacity-40" />
            </div>
          )}

          {/* bottom gradient + subfield count pill */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
          />

          {/* subfield count (bottom-left) */}
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-full border border-white/25 bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
            <span className="tabular-nums">{subFieldCount}</span>
            <span className="opacity-80">sân con</span>
          </div>

          {/* status chip (top-right) */}
          <Badge
            variant="outline"
            className={cn(
              "absolute right-2.5 top-2.5 gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] backdrop-blur-md",
              status.chip,
            )}
          >
            <StatusIcon className="size-2.5" />
            {status.label}
          </Badge>

          {/* arrow hotspot */}
          <span className="absolute right-2.5 bottom-2.5 flex size-8 translate-y-2 items-center justify-center rounded-full bg-white text-slate-900 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="size-4" />
          </span>
        </div>

        {/* ── Body ──────────────────────────────────────────────── */}
        <CardContent className="flex flex-1 flex-col gap-2.5 px-4 pb-3 pt-3">
          <h3 className="line-clamp-1 font-display text-base font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
            {complex.complex_name}
          </h3>

          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/70" />
            <span className="line-clamp-2 leading-snug">
              {complex.complex_address}
            </span>
          </div>
        </CardContent>

        {/* ── Footer ────────────────────────────────────────────── */}
        <CardFooter className="mt-auto flex items-center justify-between gap-2 border-t border-border/60 bg-muted/30 px-4 py-2.5">
          <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <span
              aria-hidden
              className={cn("size-1.5 rounded-full", status.dot)}
            />
            ID · {complex.id.slice(0, 6).toUpperCase()}
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
            Quản lý
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
