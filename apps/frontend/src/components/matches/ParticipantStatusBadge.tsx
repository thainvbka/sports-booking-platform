import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  PARTICIPANT_STATUS_BADGE_CONFIG,
  type ParticipantStatus,
} from "@/types/match.type";

interface ParticipantStatusBadgeProps {
  status: ParticipantStatus;
  className?: string;
}

const PARTICIPANT_STATUS_DOT: Record<ParticipantStatus, string> = {
  PENDING: "bg-amber-500",
  ACCEPTED: "bg-emerald-500",
  REJECTED: "bg-rose-500",
  WITHDRAWN: "bg-slate-400",
  REMOVED: "bg-slate-400",
};

export function ParticipantStatusBadge({
  status,
  className,
}: ParticipantStatusBadgeProps) {
  const config = PARTICIPANT_STATUS_BADGE_CONFIG[status];

  return (
    <Badge
      className={cn(
        "gap-1.5 border px-2.5 py-1 text-xs font-semibold",
        config.className,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", PARTICIPANT_STATUS_DOT[status])} />
      {config.label}
    </Badge>
  );
}
