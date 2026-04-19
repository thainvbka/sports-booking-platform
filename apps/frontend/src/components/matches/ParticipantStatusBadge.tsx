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

export function ParticipantStatusBadge({
  status,
  className,
}: ParticipantStatusBadgeProps) {
  const config = PARTICIPANT_STATUS_BADGE_CONFIG[status];

  return (
    <Badge
      className={cn(
        "border px-2.5 py-1 text-xs font-semibold",
        config.className,
        className,
      )}
    >
      {config.label}
    </Badge>
  );
}
