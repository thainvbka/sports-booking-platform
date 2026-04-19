import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { MatchParticipantPreview } from "@/types/match.type";
import { getNameInitials } from "@/utils/review.utils";

interface MatchParticipantsAvatarGroupProps {
  participants?: MatchParticipantPreview[];
  slotsFilled: number;
  maxVisible?: number;
  className?: string;
}

const AVATAR_SHELL_CLASSES =
  "border-2 border-white/90 bg-linear-to-br from-emerald-50 to-slate-100 shadow-md ring-1 ring-emerald-200/50";

export function MatchParticipantsAvatarGroup({
  participants,
  slotsFilled,
  maxVisible = 4,
  className,
}: MatchParticipantsAvatarGroupProps) {
  const hasParticipantPreview = Boolean(participants && participants.length > 0);

  const fallbackParticipants = Array.from({
    length: Math.min(Math.max(slotsFilled, 0), maxVisible),
  }).map((_, index) => ({
    player_id: `fallback-${index}`,
    full_name: `Người chơi ${index + 1}`,
    avatar: null,
  }));

  const visibleParticipants = hasParticipantPreview
    ? (participants ?? []).slice(0, maxVisible)
    : fallbackParticipants;

  const totalParticipants = Math.max(slotsFilled, participants?.length ?? 0);
  const extraCount = Math.max(totalParticipants - visibleParticipants.length, 0);

  if (totalParticipants <= 0) {
    return (
      <div className={cn("text-xs text-slate-500", className)}>
        Chưa có người tham gia
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex -space-x-3">
        {visibleParticipants.map((participant) => (
          <Avatar key={participant.player_id} className={cn("h-8 w-8", AVATAR_SHELL_CLASSES)}>
            <AvatarImage
              src={participant.avatar ?? undefined}
              alt={participant.full_name}
            />
            <AvatarFallback className="text-[10px] font-semibold text-slate-700">
              {getNameInitials(participant.full_name, "Người chơi")}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>

      {extraCount > 0 ? (
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
          +{extraCount}
        </span>
      ) : null}
    </div>
  );
}
