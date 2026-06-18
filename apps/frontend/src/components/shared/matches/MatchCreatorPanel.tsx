import { ParticipantList } from "@/components/shared/matches/ParticipantList";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MATCH_STATUS_PROGRESS } from "@/utils/match-styles.util";
import { cn } from "@/lib/utils";
import type { MatchStatus } from "@/types/match.type";
import type { Participant } from "@/types/match.type";
import { ShieldX, Trophy, Unlock, Users } from "lucide-react";

// ── Private: RosterStat ──────────────────────────────────────────────────────
function RosterStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "success" | "warning" | "muted";
}) {
  const accentBg: Record<"success" | "warning" | "muted", string> = {
    success:
      "bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-700/50",
    warning:
      "bg-amber-50/70 border-amber-200 dark:bg-amber-950/40 dark:border-amber-700/50",
    muted: "bg-muted/50 border-border",
  };
  const accentText: Record<"success" | "warning" | "muted", string> = {
    success: "text-emerald-700 dark:text-emerald-300",
    warning: "text-amber-700 dark:text-amber-300",
    muted: "text-foreground",
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-xl border px-3 py-2.5",
        accentBg[accent],
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "font-display text-2xl font-black italic leading-none tabular-nums",
          accentText[accent],
        )}
      >
        {value}
      </span>
    </div>
  );
}

// ── Public: MatchCreatorPanel ─────────────────────────────────────────────────
export interface MatchCreatorPanelProps {
  status: MatchStatus;
  acceptedCount: number;
  pendingCount: number;
  slotsLeft: number;
  slotsFilled: number;
  slotsNeeded: number;
  participants: Participant[];
  isLoading: boolean;
  onAccept: (participantId: string) => void;
  onReject: (participantId: string) => void;
  onClose: () => void;
  onReopen: () => void;
  onCancel: () => void;
  /** Optional pagination bar rendered below participant list */
  paginationSlot?: React.ReactNode;
}

export function MatchCreatorPanel({
  status,
  acceptedCount,
  pendingCount,
  slotsLeft,
  slotsFilled,
  slotsNeeded,
  participants,
  isLoading,
  onAccept,
  onReject,
  onClose,
  onReopen,
  onCancel,
  paginationSlot,
}: MatchCreatorPanelProps) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border/70 px-5 py-4">
        <div>
          <CardTitle className="flex items-center gap-2 font-display italic">
            <Trophy className="size-4 text-primary" />
            Quản lý kèo
          </CardTitle>
          <CardDescription>
            Duyệt thành viên, đóng/mở kèo và cập nhật trạng thái.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-5 p-5">
        {/* Mini-scoreboard */}
        <div className="grid grid-cols-3 gap-2">
          <RosterStat label="Đã duyệt" value={acceptedCount} accent="success" />
          <RosterStat label="Chờ duyệt" value={pendingCount} accent="warning" />
          <RosterStat label="Chỗ trống" value={slotsLeft} accent="muted" />
        </div>

        {/* Progress strip */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">Tiến độ đội hình</span>
            <span className="font-display font-black italic tabular-nums">
              {slotsFilled}/{slotsNeeded}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                MATCH_STATUS_PROGRESS[status],
              )}
              style={{
                width: `${Math.min((slotsFilled / Math.max(slotsNeeded, 1)) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Moderation buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading || !["OPEN", "FULL"].includes(status)}
          >
            <ShieldX data-icon="inline-start" />
            Đóng kèo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onReopen}
            disabled={isLoading || status !== "CLOSED"}
          >
            <Unlock data-icon="inline-start" />
            Mở lại
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onCancel}
            disabled={
              isLoading || ["CANCELED", "COMPLETED", "EXPIRED"].includes(status)
            }
            className="ml-auto"
          >
            <ShieldX data-icon="inline-start" />
            Hủy kèo
          </Button>
        </div>

        <Separator />

        {/* Participants header */}
        <div className="flex items-center gap-2">
          <Users className="size-4 text-primary" />
          <h2 className="font-display text-sm font-bold italic text-foreground">
            Danh sách thành viên
          </h2>
        </div>

        <ParticipantList
          participants={participants}
          isLoading={isLoading}
          canModerate
          onAccept={onAccept}
          onReject={onReject}
          matchStatus={status}
        />

        {paginationSlot}
      </CardContent>
    </Card>
  );
}
