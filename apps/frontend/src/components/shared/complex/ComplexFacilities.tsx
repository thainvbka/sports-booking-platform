import React from "react";
import { LayoutGrid, Trophy, Tag, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatChipProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}

function StatChip({ icon, label, value, sub, highlight }: StatChipProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border px-3 py-2.5 backdrop-blur-sm transition-colors",
        highlight
          ? "border-accent-sport/30 bg-accent-sport/10"
          : "border-white/10 bg-white/[0.05] hover:border-white/20",
      )}
    >
      <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
        <span className="truncate">{label}</span>
        {icon}
      </div>
      <div className="mt-1 truncate font-display text-lg leading-none font-black text-white">
        {value}
      </div>
      {sub ? (
        <div className="mt-0.5 truncate text-[11px] text-white/60">{sub}</div>
      ) : null}
    </div>
  );
}

interface ComplexFacilitiesProps {
  totalSubfields: number;
  sportSummary: string;
  sportSub?: string;
  priceMinLabel: string;
  priceMinSub?: string;
  maxCapacityLabel: string;
  maxCapacitySub?: string;
}

export function ComplexFacilities({
  totalSubfields,
  sportSummary,
  sportSub,
  priceMinLabel,
  priceMinSub,
  maxCapacityLabel,
  maxCapacitySub,
}: ComplexFacilitiesProps) {
  return (
    <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 w-full">
      <StatChip
        label="Sân con"
        value={String(totalSubfields)}
        sub="trong khu"
        icon={<LayoutGrid className="h-3.5 w-3.5 text-accent-sport" />}
        highlight
      />
      <StatChip
        label="Môn"
        value={sportSummary}
        sub={sportSub}
        icon={<Trophy className="h-3.5 w-3.5 text-white/70" />}
      />
      <StatChip
        label="Giá thuê"
        value={priceMinLabel}
        sub={priceMinSub}
        icon={<Tag className="h-3.5 w-3.5 text-white/70" />}
      />
      <StatChip
        label="Sức chứa"
        value={maxCapacityLabel}
        sub={maxCapacitySub}
        icon={<Users className="h-3.5 w-3.5 text-white/70" />}
      />
    </dl>
  );
}
