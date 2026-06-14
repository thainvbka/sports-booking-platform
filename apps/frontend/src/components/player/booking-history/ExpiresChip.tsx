import { format } from "date-fns";
import { AlarmClock } from "lucide-react";

interface ExpiresChipProps {
  expiresAt: string;
}

export function ExpiresChip({ expiresAt }: ExpiresChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] animate-pulse status-surface-warning">
      <AlarmClock className="size-3" />
      Hết hạn {format(new Date(expiresAt), "HH:mm dd/MM")}
    </span>
  );
}
