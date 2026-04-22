// MatchParticipantsAvatarGroup.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { MatchParticipantPreview } from "@/types/match.type";
import { getNameInitials } from "@/utils/review.utils";

interface Props {
  participants?: MatchParticipantPreview[];
  slotsFilled: number;
  maxVisible?: number;
  className?: string;
}

export function MatchParticipantsAvatarGroup({
  participants,
  slotsFilled,
  maxVisible = 4,
  className,
}: Props) {
  const total = Math.max(slotsFilled, participants?.length ?? 0);

  if (total <= 0) {
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>
        Chưa có người tham gia
      </p>
    );
  }

  const fallback = Array.from({ length: Math.min(total, maxVisible) }).map(
    (_, i) => ({ player_id: `fb-${i}`, full_name: `Người chơi ${i + 1}`, avatar: null }),
  );

  const visible = (participants && participants.length > 0 ? participants : fallback).slice(
    0,
    maxVisible,
  );
  const extra = Math.max(total - visible.length, 0);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex -space-x-2">
        {visible.map((p) => (
          <Avatar
            key={p.player_id}
            className="h-7 w-7 border-2 border-white ring-1 ring-border shadow-sm"
          >
            <AvatarImage src={p.avatar ?? undefined} alt={p.full_name} />
            <AvatarFallback className="bg-muted text-[10px] font-semibold text-muted-foreground">
              {getNameInitials(p.full_name, "?")}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      {extra > 0 && (
        <span className="text-xs font-semibold text-muted-foreground">+{extra}</span>
      )}
    </div>
  );
}