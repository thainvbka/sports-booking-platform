import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MATCH_STATUS_BADGE_CONFIG, type MatchStatus } from "@/types/match.type";

interface MatchStatusBadgeProps {
  status: MatchStatus;
  className?: string;
}

export function MatchStatusBadge({ status, className }: MatchStatusBadgeProps) {
  const config = MATCH_STATUS_BADGE_CONFIG[status];

  return (
    <Badge
      className={cn(
        "gap-1.5 border px-2.5 py-1 text-xs font-semibold shadow-sm",
        config.container,
        className,
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", config.dot)} />
      {config.label}
    </Badge>
  );
}
