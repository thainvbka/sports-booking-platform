import { useMatchStore } from "@/store/useMatchStore";
import { type MatchStatus, type MyMatchType } from "@/types/match.type";
import { useEffect } from "react";

const PAGE_SIZE = 9;

interface UseMyMatchesProps {
  type: MyMatchType;
  status: MatchStatus | "ALL";
  page: number;
}

export function useMyMatches({ type, status, page }: UseMyMatchesProps) {
  const {
    matches,
    pagination,
    isLoading,
    error,
    myMatchesSummary,
    fetchMyMatches,
    leaveMatch,
  } = useMatchStore();

  useEffect(() => {
    void fetchMyMatches({
      type,
      status: status === "ALL" ? undefined : status,
      page,
      limit: PAGE_SIZE,
    });
  }, [type, status, page, fetchMyMatches]);

  useEffect(() => {
    const handleMatchNotification = () => {
      void fetchMyMatches({
        type,
        status: status === "ALL" ? undefined : status,
        page,
        limit: PAGE_SIZE,
      });
    };

    window.addEventListener("match_status_changed", handleMatchNotification);
    return () => {
      window.removeEventListener("match_status_changed", handleMatchNotification);
    };
  }, [type, status, page, fetchMyMatches]);

  const handleLeave = async (matchId: string) => {
    const result = await leaveMatch(matchId);
    if (!result) return;

    await fetchMyMatches({
      type,
      status: status === "ALL" ? undefined : status,
      page,
      limit: PAGE_SIZE,
    });
  };

  return {
    matches,
    pagination,
    isLoading,
    error,
    myMatchesSummary,
    handleLeave,
  };
}
