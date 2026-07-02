import { JoinMatchDialog } from "@/components/shared/matches/JoinMatchDialog";
import { MatchActionPanel } from "@/components/shared/matches/MatchActionPanel";
import { MatchCreatorPanel } from "@/components/shared/matches/MatchCreatorPanel";
import { MatchDetailHero } from "@/components/shared/matches/MatchDetailHero";
import { MatchInfoCard } from "@/components/shared/matches/MatchInfoCard";
import { EmptyState } from "@/components/shared/ui-utility/EmptyState";
import { LoadingState } from "@/components/shared/ui-utility/LoadingState";
import { PaginationBar } from "@/components/shared/ui-utility/PaginationBar";
import { SPORT_TYPE_LABELS } from "@/constants";
import { useAuthStore } from "@/store/useAuthStore";
import { useMatchStore } from "@/store/useMatchStore";
import { MATCH_LEAVABLE_PARTICIPATION_STATUSES } from "@/types/match.type";
import { getMatchCountdown } from "@/utils/match.util";
import { getPlayerProfileId } from "@/utils/userProfile.util";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

const PARTICIPANTS_PAGE_SIZE = 10;

export function MatchDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuthStore();

  const {
    currentMatch,
    participants,
    participantsMatch,
    participantsPagination,
    isLoading,
    isLoadingDetail,
    isLoadingParticipants,
    fetchMatchById,
    fetchParticipants,
    joinMatch,
    leaveMatch,
    acceptParticipant,
    rejectParticipant,
    closeMatch,
    reopenMatch,
    cancelMatch,
    clearMatchDetail,
  } = useMatchStore();

  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [participantPage, setParticipantPage] = useState(1);

  const isPlayerRole = Boolean(user?.roles.includes("PLAYER"));
  const playerId = getPlayerProfileId(user);
  const canUsePlayerScope = Boolean(isAuthenticated && isPlayerRole && playerId);
  const detailScope: "public" | "player" = canUsePlayerScope ? "player" : "public";

  useEffect(() => {
    if (!id) return;
    void fetchMatchById(id, detailScope);

    return () => {
      clearMatchDetail();
    };
  }, [id, detailScope, fetchMatchById, clearMatchDetail]);

  const isCreator = useMemo(() => {
    if (!currentMatch || !playerId || currentMatch.id !== id) return false;
    return currentMatch.creator.player_id === playerId;
  }, [currentMatch, playerId, id]);

  useEffect(() => {
    if (!id || !isCreator) return;
    void fetchParticipants(id, { page: participantPage, limit: PARTICIPANTS_PAGE_SIZE });
  }, [id, isCreator, participantPage, fetchParticipants]);

  const refreshCurrentMatch = useCallback(async () => {
    if (!id) return;
    const promises: Promise<void>[] = [fetchMatchById(id, detailScope)];
    if (isCreator) {
      promises.push(
        fetchParticipants(id, { page: participantPage, limit: PARTICIPANTS_PAGE_SIZE }),
      );
    }
    await Promise.all(promises);
  }, [id, fetchMatchById, detailScope, isCreator, fetchParticipants, participantPage]);

  useEffect(() => {
    const handleMatchNotification = (e: Event) => {
      const notif = (e as CustomEvent).detail;
      if (notif.link_to === `/matches/${id}`) void refreshCurrentMatch();
    };
    window.addEventListener("match_status_changed", handleMatchNotification);
    return () => window.removeEventListener("match_status_changed", handleMatchNotification);
  }, [id, refreshCurrentMatch]);

  // Handlers 
  const handleJoin = async (introduction?: string) => {
    if (!id) return false;
    const result = await joinMatch(id, introduction);
    if (!result) return false;
    await fetchMatchById(id, "player");
    return true;
  };
  const handleLeave = async () => {
    if (!id) return;
    if (await leaveMatch(id)) await refreshCurrentMatch();
  };
  const handleAccept = async (participantId: string) => {
    if (!id) return;
    if (await acceptParticipant(id, participantId)) await refreshCurrentMatch();
  };
  const handleReject = async (participantId: string) => {
    if (!id) return;
    if (await rejectParticipant(id, participantId)) await refreshCurrentMatch();
  };
  const handleClose = async () => {
    if (!id) return;
    if (await closeMatch(id)) await refreshCurrentMatch();
  };
  const handleReopen = async () => {
    if (!id) return;
    if (await reopenMatch(id)) await refreshCurrentMatch();
  };
  const handleCancel = async () => {
    if (!id) return;
    if (await cancelMatch(id)) await refreshCurrentMatch();
  };

  // Guards 
  if (!id) {
    return (
      <div className="page-shell-compact py-16">
        <EmptyState
          title="ID kèo không hợp lệ"
          description="Liên kết bạn truy cập không chứa mã kèo hợp lệ. Hãy quay lại danh sách để chọn lại kèo."
          actionLabel="Về danh sách kèo"
          onAction={() => { window.location.href = "/matches"; }}
        />
      </div>
    );
  }

  if (isLoadingDetail && !currentMatch) {
    return (
      <div className="page-shell py-20">
        <LoadingState text="Đang tải chi tiết kèo..." className="py-16" />
      </div>
    );
  }

  if (!currentMatch) {
    return (
      <div className="page-shell-compact py-16">
        <EmptyState
          title="Không tìm thấy kèo"
          description="Kèo bạn đang tìm không tồn tại hoặc đã bị gỡ khỏi hệ thống."
          actionLabel="Về danh sách kèo"
          onAction={() => { window.location.href = "/matches"; }}
        />
      </div>
    );
  }

  // Derived state 
  const isDeadlinePassed = currentMatch.join_deadline
    ? new Date(currentMatch.join_deadline).getTime() <= Date.now()
    : false;
  const isStarted = currentMatch.booking.start_time
    ? new Date(currentMatch.booking.start_time).getTime() <= Date.now()
    : false;

  const canJoin =
    canUsePlayerScope &&
    !isCreator &&
    currentMatch.status === "OPEN" &&
    (!currentMatch.my_participation_status ||
      ["WITHDRAWN", "REJECTED", "REMOVED"].includes(currentMatch.my_participation_status)) &&
    !isDeadlinePassed &&
    !isStarted;

  const canLeave =
    canUsePlayerScope &&
    !isCreator &&
    (currentMatch.status === "OPEN" || currentMatch.status === "FULL") &&
    Boolean(
      currentMatch.my_participation_status &&
        MATCH_LEAVABLE_PARTICIPATION_STATUSES.includes(currentMatch.my_participation_status),
    ) &&
    !isStarted;

  const creatorName = currentMatch.creator.full_name || "Creator";
  const sportLabel = SPORT_TYPE_LABELS[currentMatch.sport_type] ?? currentMatch.sport_type;
  const slotsFilled = participantsMatch?.slots_filled ?? currentMatch.slots_filled;
  const slotsNeeded = participantsMatch?.slots_needed ?? currentMatch.slots_needed;
  const fillPercent = Math.min((slotsFilled / Math.max(slotsNeeded, 1)) * 100, 100);
  const slotsLeft =
    currentMatch.participant_summary?.slots_left ??
    Math.max(currentMatch.slots_needed - currentMatch.slots_filled, 0);
  const countdown = getMatchCountdown(currentMatch.join_deadline, true);

  const actionHint =
    isAuthenticated && isPlayerRole && playerId
      ? isCreator
        ? "Bạn là người tạo kèo. Dùng khối bên dưới để duyệt thành viên và đóng/mở kèo."
        : currentMatch.my_participation_status
          ? null
          : isStarted
            ? "Kèo đấu này đã bắt đầu, không thể tham gia nữa."
            : isDeadlinePassed
              ? "Thời hạn đăng ký tham gia kèo này đã trôi qua."
              : currentMatch.status !== "OPEN"
                ? "Kèo hiện không ở trạng thái mở, nên bạn chưa thể gửi yêu cầu tham gia."
                : "Bạn có thể gửi yêu cầu tham gia ngay."
      : null;

  // Render 
  return (
    <div className="flex min-h-[60vh] flex-col bg-background">
      <MatchDetailHero
        title={currentMatch.title}
        description={currentMatch.description}
        sportLabel={sportLabel}
        sportType={currentMatch.sport_type}
        status={currentMatch.status}
        startTime={currentMatch.booking.start_time}
        endTime={currentMatch.booking.end_time}
        subFieldName={currentMatch.booking.sub_field_name}
        complexName={currentMatch.booking.complex_name}
        joinDeadline={currentMatch.join_deadline}
        countdown={countdown}
        creatorName={creatorName}
        creatorAvatar={currentMatch.creator.avatar}
        slotsFilled={slotsFilled}
        slotsNeeded={slotsNeeded}
        fillPercent={fillPercent}
        participantsPreview={currentMatch.participants_preview}
      />

      <section className="page-shell py-10">
        {isCreator ? (
          <MatchCreatorPanel
            status={currentMatch.status}
            acceptedCount={currentMatch.accepted_count}
            pendingCount={currentMatch.pending_count}
            slotsLeft={slotsLeft}
            slotsFilled={slotsFilled}
            slotsNeeded={slotsNeeded}
            participants={participants}
            isLoading={isLoading}
            isLoadingParticipants={isLoadingParticipants}
            onAccept={handleAccept}
            onReject={handleReject}
            onClose={handleClose}
            onReopen={handleReopen}
            onCancel={handleCancel}
            paginationSlot={
              participantsPagination && Math.max(participantsPagination.total_pages, 1) > 1 ? (
                <PaginationBar
                  page={participantsPagination.page}
                  totalPages={Math.max(participantsPagination.total_pages, 1)}
                  onPageChange={setParticipantPage}
                  disabled={isLoading}
                />
              ) : null
            }
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="flex min-w-0 flex-col gap-6">
              <MatchInfoCard
                startTime={currentMatch.booking.start_time}
                endTime={currentMatch.booking.end_time}
                joinDeadline={currentMatch.join_deadline}
                countdown={countdown}
                subFieldName={currentMatch.booking.sub_field_name}
                complexName={currentMatch.booking.complex_name}
                complexAddress={currentMatch.booking.complex_address}
                creatorName={creatorName}
              />
            </div>
            <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
              <MatchActionPanel
                isAuthenticated={isAuthenticated}
                isPlayerRole={isPlayerRole}
                playerId={playerId}
                canJoin={canJoin}
                canLeave={canLeave}
                isLoading={isLoading}
                participationStatus={currentMatch.my_participation_status}
                actionHint={actionHint}
                onOpenJoin={() => setJoinDialogOpen(true)}
                onLeave={handleLeave}
              />
            </aside>
          </div>
        )}

        <JoinMatchDialog
          open={joinDialogOpen}
          onOpenChange={setJoinDialogOpen}
          onConfirm={handleJoin}
          isSubmitting={isLoading}
        />
      </section>
    </div>
  );
}
