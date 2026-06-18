import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatMatchDateTime, formatMatchTimeRange } from "@/utils/time.util";
import type { MatchCountdown } from "@/utils/match.util";
import {
  CalendarClock,
  Clock,
  MapPin,
  Timer,
  UserRound,
} from "lucide-react";

// ── Private: InfoRow ─────────────────────────────────────────────────────────
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-1 px-5 py-3.5 sm:grid-cols-[auto_120px_1fr]">
      <span className="mt-0.5">{icon}</span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:self-center">
        {label}
      </span>
      <div className="col-span-full text-sm text-foreground sm:col-span-1">
        {value}
      </div>
    </div>
  );
}

// ── Public: MatchInfoCard ────────────────────────────────────────────────────
export interface MatchInfoCardProps {
  startTime: string | null;
  endTime: string | null;
  joinDeadline: string | null;
  countdown: MatchCountdown;
  subFieldName: string;
  complexName: string;
  complexAddress: string;
  creatorName: string;
}

export function MatchInfoCard({
  startTime,
  endTime,
  joinDeadline,
  countdown,
  subFieldName,
  complexName,
  complexAddress,
  creatorName,
}: MatchInfoCardProps) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardHeader className="border-b border-border/70 px-5 py-4">
        <CardTitle className="font-display italic">Thông tin trận</CardTitle>
        <CardDescription>
          Lịch thi đấu, địa điểm và thông tin chủ kèo.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-0 p-0">
        <InfoRow
          icon={<CalendarClock className="size-4 text-primary" />}
          label="Thi đấu"
          value={
            <span className="font-display tabular-nums">
              {formatMatchTimeRange(startTime, endTime)}
            </span>
          }
        />
        <Separator />
        <InfoRow
          icon={<Clock className="size-4 text-amber-500" />}
          label="Hạn tham gia"
          value={
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-display tabular-nums">
                {formatMatchDateTime(joinDeadline)}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[11px]",
                  countdown.expired
                    ? "status-surface-error"
                    : countdown.urgent
                      ? "status-surface-warning"
                      : "status-surface-success",
                )}
              >
                <Timer data-icon="inline-start" />
                {countdown.label}
              </Badge>
            </div>
          }
        />
        <Separator />
        <InfoRow
          icon={<MapPin className="size-4 text-rose-500" />}
          label="Địa điểm"
          value={
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold">{subFieldName}</span>
              <span className="text-sm text-muted-foreground">{complexName}</span>
              <span className="text-xs text-muted-foreground/80">
                {complexAddress}
              </span>
            </div>
          }
        />
        <Separator />
        <InfoRow
          icon={<UserRound className="size-4 text-indigo-500" />}
          label="Chủ kèo"
          value={<span className="font-semibold">{creatorName}</span>}
        />
      </CardContent>
    </Card>
  );
}
