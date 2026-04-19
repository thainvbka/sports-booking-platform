import { ParticipantStatusBadge } from "@/components/matches/ParticipantStatusBadge";
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
import { MATCH_SKILL_LABELS, type Participant } from "@/types/match.type";
import { getNameInitials } from "@/utils/review.utils";
import { Check, Clock3, X } from "lucide-react";

interface ParticipantListProps {
  participants: Participant[];
  isLoading?: boolean;
  canModerate?: boolean;
  slotsFilled?: number;
  slotsNeeded?: number;
  onAccept?: (participantId: string) => void;
  onReject?: (participantId: string) => void;
}

const formatDateTime = (value: string | null) => {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("vi-VN");
};

export function ParticipantList({
  participants,
  isLoading,
  canModerate,
  slotsFilled,
  slotsNeeded,
  onAccept,
  onReject,
}: ParticipantListProps) {
  const hasRosterProgress =
    typeof slotsFilled === "number" && typeof slotsNeeded === "number" && slotsNeeded > 0;
  const rosterProgressPercent = hasRosterProgress
    ? Math.min((slotsFilled / slotsNeeded) * 100, 100)
    : 0;

  if (isLoading) {
    return (
      <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">
        Đang tải danh sách thành viên...
      </p>
    );
  }

  if (participants.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-500">
        Chưa có ai tham gia kèo này.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {hasRosterProgress ? (
        <div className="rounded-2xl border border-emerald-200 bg-linear-to-r from-emerald-50 to-white p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <p className="font-semibold text-emerald-700">Tiến độ đội hình</p>
            <p className="font-semibold text-emerald-800">
              {slotsFilled}/{slotsNeeded} người
            </p>
          </div>
          <div className="h-2.5 rounded-full bg-emerald-100">
            <div
              className="h-full rounded-full bg-linear-to-r from-emerald-500 to-green-600 transition-all"
              style={{ width: `${rosterProgressPercent}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-slate-600">Thành viên</TableHead>
              <TableHead className="text-slate-600">Giới thiệu</TableHead>
              <TableHead className="text-slate-600">Thời gian</TableHead>
              <TableHead className="text-slate-600">Trạng thái</TableHead>
              {canModerate ? (
                <TableHead className="text-right text-slate-600">Hành động</TableHead>
              ) : null}
            </TableRow>
          </TableHeader>

          <TableBody>
            {participants.map((participant) => {
              const canHandle = canModerate && participant.status === "PENDING";
              const fullName = participant.player.full_name || "Người chơi";

              return (
                <TableRow key={participant.id} className="hover:bg-slate-50/70">
                  <TableCell className="min-w-65">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 border border-slate-200">
                        <AvatarImage
                          src={participant.player.avatar ?? undefined}
                          alt={fullName}
                        />
                        <AvatarFallback className="bg-slate-100 text-xs font-semibold text-slate-700">
                          {getNameInitials(fullName, "Người chơi")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900">{fullName}</p>
                        <p className="text-xs text-slate-500">
                          {participant.player.phone ?? "Không có số điện thoại"}
                        </p>
                        {participant.player.skill_level ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-200 bg-emerald-50 text-xs text-emerald-700"
                          >
                            {MATCH_SKILL_LABELS[participant.player.skill_level]}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="max-w-70 align-top">
                    <p className="line-clamp-2 text-sm text-slate-700">
                      {participant.introduction || "Không có lời giới thiệu"}
                    </p>
                  </TableCell>

                  <TableCell className="align-top">
                    <div className="space-y-1 text-xs text-slate-500">
                      <p className="flex items-center gap-1.5">
                        <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                        Yêu cầu: {formatDateTime(participant.requested_at)}
                      </p>
                      <p>
                        Phản hồi: {participant.responded_at ? formatDateTime(participant.responded_at) : "Chưa"}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="align-top">
                    <ParticipantStatusBadge status={participant.status} />
                  </TableCell>

                  {canModerate ? (
                    <TableCell className="align-top">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onReject?.(participant.id)}
                          disabled={!canHandle}
                          className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        >
                          <X className="mr-1 h-3.5 w-3.5" />
                          Từ chối
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onAccept?.(participant.id)}
                          disabled={!canHandle}
                          className="bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          <Check className="mr-1 h-3.5 w-3.5" />
                          Chấp nhận
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
