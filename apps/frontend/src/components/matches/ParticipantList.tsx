import { ParticipantStatusBadge } from "@/components/matches/ParticipantStatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { MATCH_SKILL_LABELS, type Participant } from "@/types/match.type";
import { getNameInitials } from "@/utils/review.utils";
import { Check, Clock3, Phone, X } from "lucide-react";

interface ParticipantListProps {
  participants: Participant[];
  isLoading?: boolean;
  canModerate?: boolean;
  onAccept?: (participantId: string) => void;
  onReject?: (participantId: string) => void;
}

const formatDateTime = (value: string | null) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function ParticipantList({
  participants,
  isLoading,
  canModerate,
  onAccept,
  onReject,
}: ParticipantListProps) {
  if (isLoading) {
    return (
      <LoadingState text="Đang tải danh sách thành viên..." className="py-8" />
    );
  }

  if (participants.length === 0) {
    return (
      <EmptyState
        title="Chưa có thành viên"
        description="Hiện chưa có ai gửi yêu cầu tham gia kèo này."
        className="py-10"
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/70">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Thành viên
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Giới thiệu
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Thời gian
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Trạng thái
              </TableHead>
              {canModerate ? (
                <TableHead className="w-44 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Hành động
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>

          <TableBody>
            {participants.map((participant) => {
              const canHandle =
                canModerate && participant.status === "PENDING";
              const fullName = participant.player.full_name || "Người chơi";

              return (
                <TableRow
                  key={participant.id}
                  className={cn(
                    "transition-colors",
                    canHandle && "bg-amber-50/30 hover:bg-amber-50/50",
                  )}
                >
                  <TableCell className="min-w-60 align-top">
                    <div className="flex items-start gap-3">
                      <Avatar className="size-9 shrink-0 ring-1 ring-border">
                        <AvatarImage
                          src={participant.player.avatar ?? undefined}
                          alt={fullName}
                        />
                        <AvatarFallback className="bg-muted text-[11px] font-semibold">
                          {getNameInitials(fullName, "Người chơi")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex min-w-0 flex-col gap-1">
                        <p className="truncate font-semibold text-foreground">
                          {fullName}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Phone className="size-3" />
                            {participant.player.phone ?? "—"}
                          </span>
                          {participant.player.skill_level ? (
                            <Badge
                              variant="outline"
                              className="border-emerald-200 bg-emerald-50 text-[10.5px] text-emerald-700"
                            >
                              {
                                MATCH_SKILL_LABELS[
                                  participant.player.skill_level
                                ]
                              }
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="max-w-72 align-top">
                    <p className="line-clamp-2 text-sm text-foreground/80">
                      {participant.introduction || (
                        <span className="text-muted-foreground">
                          Không có lời giới thiệu
                        </span>
                      )}
                    </p>
                  </TableCell>

                  <TableCell className="align-top">
                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="size-3 text-muted-foreground/70" />
                        <span className="tabular-nums">
                          {formatDateTime(participant.requested_at)}
                        </span>
                      </span>
                      <span className="text-[11px] text-muted-foreground/70">
                        {participant.responded_at
                          ? `PH: ${formatDateTime(participant.responded_at)}`
                          : "Chưa phản hồi"}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="align-top">
                    <ParticipantStatusBadge status={participant.status} />
                  </TableCell>

                  {canModerate ? (
                    <TableCell className="min-w-40 align-top">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onReject?.(participant.id)}
                          disabled={!canHandle}
                          className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        >
                          <X data-icon="inline-start" />
                          Từ chối
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onAccept?.(participant.id)}
                          disabled={!canHandle}
                        >
                          <Check data-icon="inline-start" />
                          Duyệt
                        </Button>
                      </div>
                    </TableCell>
                  ) : null}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
