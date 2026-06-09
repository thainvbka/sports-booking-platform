import type {
  CreateMatchInput,
  MatchParticipantsQuery,
  MyMatchesQuery,
  PublicMatchesQuery,
} from "@/services/match.service";
import {
  acceptParticipant as acceptParticipantRequest,
  cancelMatch as cancelMatchRequest,
  closeMatch as closeMatchRequest,
  createMatch as createMatchRequest,
  getMatchByIdForPlayer,
  getMatchParticipants,
  getMyMatches,
  getPublicMatchById,
  getPublicMatches,
  joinMatch as joinMatchRequest,
  leaveMatch as leaveMatchRequest,
  rejectParticipant as rejectParticipantRequest,
  reopenMatch as reopenMatchRequest,
} from "@/services/match.service";
import type {
  Match,
  MatchDetail,
  MatchParticipantsSummary,
  MyMatchesSummary,
  Pagination,
  Participant,
} from "@/types/match.type";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface MatchStoreState {
  matches: Match[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
  myMatchesSummary: MyMatchesSummary | null;

  currentMatch: MatchDetail | null;
  isLoadingDetail: boolean;

  participants: Participant[];
  participantsMatch: MatchParticipantsSummary | null;
  participantsPagination: Pagination | null;

  fetchPublicMatches: (query?: PublicMatchesQuery) => Promise<void>;
  fetchMatchById: (id: string, scope?: "public" | "player") => Promise<void>;
  fetchMyMatches: (query?: MyMatchesQuery) => Promise<void>;
  fetchParticipants: (id: string, query?: MatchParticipantsQuery) => Promise<void>;

  createMatch: (data: CreateMatchInput) => Promise<Match | null>;
  joinMatch: (id: string, introduction?: string) => Promise<Participant | null>;
  leaveMatch: (id: string) => Promise<Participant | null>;
  acceptParticipant: (
    matchId: string,
    participantId: string,
  ) => Promise<Participant | null>;
  rejectParticipant: (
    matchId: string,
    participantId: string,
  ) => Promise<Participant | null>;
  closeMatch: (id: string) => Promise<Match | null>;
  reopenMatch: (id: string) => Promise<Match | null>;
  cancelMatch: (id: string) => Promise<Match | null>;

  reset: () => void;
}

const INITIAL_STATE = {
  matches: [] as Match[],
  pagination: null as Pagination | null,
  isLoading: false,
  error: null as string | null,
  myMatchesSummary: null as MyMatchesSummary | null,
  currentMatch: null as MatchDetail | null,
  isLoadingDetail: false,
  participants: [] as Participant[],
  participantsMatch: null as MatchParticipantsSummary | null,
  participantsPagination: null as Pagination | null,
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "object" && error !== null) {
    const maybeAxiosError = error as {
      message?: unknown;
      response?: {
        data?: {
          message?: unknown;
        };
      };
    };

    const apiMessage = maybeAxiosError.response?.data?.message;
    if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
      return apiMessage;
    }

    if (
      typeof maybeAxiosError.message === "string" &&
      maybeAxiosError.message.trim().length > 0
    ) {
      return maybeAxiosError.message;
    }
  }

  return fallback;
};

const upsertParticipant = (
  participants: Participant[],
  participant: Participant,
): Participant[] => {
  const index = participants.findIndex((item) => item.id === participant.id);

  if (index === -1) {
    return [participant, ...participants];
  }

  const existing = participants[index];
  const next = [...participants];
  next[index] = {
    ...existing,
    ...participant,
    player: {
      ...existing.player,
      ...participant.player,
      id: participant.player.id || existing.player.id,
      full_name: participant.player.full_name || existing.player.full_name,
    },
  };

  return next;
};

const mergeMatchToState = (
  state: MatchStoreState,
  updatedMatch: Match,
): void => {
  const index = state.matches.findIndex((item) => item.id === updatedMatch.id);

  if (index !== -1) {
    state.matches[index] = updatedMatch;
  }

  if (state.currentMatch?.id === updatedMatch.id) {
    const { slots_left, ...matchForDetail } = updatedMatch;
    void slots_left;
    state.currentMatch = {
      ...state.currentMatch,
      ...matchForDetail,
    };
  }
};

export const useMatchStore = create<MatchStoreState>()(
  immer((set, get) => ({
    ...INITIAL_STATE,

    fetchPublicMatches: async (query = {}) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const result = await getPublicMatches(query);

        set((state) => {
          state.matches = result.items;
          state.pagination = result.pagination;
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error = getErrorMessage(
            error,
            "Khong the tai danh sach tran dau cong khai",
          );
          state.isLoading = false;
        });
      }
    },

    fetchMatchById: async (id, scope = "public") => {
      set((state) => {
        state.isLoadingDetail = true;
        state.error = null;
      });

      try {
        const match =
          scope === "player"
            ? await getMatchByIdForPlayer(id)
            : await getPublicMatchById(id);

        set((state) => {
          state.currentMatch = match;
          state.isLoadingDetail = false;
        });
      } catch (error) {
        set((state) => {
          state.error = getErrorMessage(error, "Khong the tai chi tiet tran dau");
          state.isLoadingDetail = false;
        });
      }
    },

    fetchMyMatches: async (query = {}) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const result = await getMyMatches(query);

        set((state) => {
          state.matches = result.items;
          state.pagination = result.pagination;
          state.myMatchesSummary = result.summary;
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error = getErrorMessage(
            error,
            "Khong the tai danh sach tran dau cua ban",
          );
          state.isLoading = false;
        });
      }
    },

    fetchParticipants: async (id, query = {}) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const result = await getMatchParticipants(id, query);

        set((state) => {
          state.participantsMatch = result.match;
          state.participants = result.items;
          state.participantsPagination = result.pagination;
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error = getErrorMessage(
            error,
            "Khong the tai danh sach nguoi tham gia",
          );
          state.isLoading = false;
        });
      }
    },

    createMatch: async (data) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const createdMatch = await createMatchRequest(data);

        set((state) => {
          state.matches = [createdMatch, ...state.matches];

          if (state.pagination) {
            state.pagination.total_items += 1;
            state.pagination.total_pages = Math.ceil(
              state.pagination.total_items / state.pagination.limit,
            );
            state.pagination.has_next =
              state.pagination.page * state.pagination.limit <
              state.pagination.total_items;
          }

          state.isLoading = false;
        });

        return createdMatch;
      } catch (error) {
        set((state) => {
          state.error = getErrorMessage(error, "Khong the tao tran dau");
          state.isLoading = false;
        });

        return null;
      }
    },

    joinMatch: async (id, introduction) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const participant = await joinMatchRequest(id, introduction);

        set((state) => {
          if (state.currentMatch?.id === id && participant.status === "PENDING") {
            state.currentMatch.pending_count += 1;
            state.currentMatch.my_participation_status = "PENDING";
          }

          state.participants = upsertParticipant(state.participants, participant);
          state.isLoading = false;
        });

        return participant;
      } catch (error) {
        set((state) => {
          state.error = getErrorMessage(error, "Khong the gui yeu cau tham gia");
          state.isLoading = false;
        });

        return null;
      }
    },

    leaveMatch: async (id) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const participant = await leaveMatchRequest(id);

        set((state) => {
          const previousParticipant = state.participants.find(
            (item) => item.id === participant.id,
          );

          if (
            state.currentMatch?.id === id &&
            previousParticipant?.status === "PENDING"
          ) {
            state.currentMatch.pending_count = Math.max(
              0,
              state.currentMatch.pending_count - 1,
            );
            state.currentMatch.my_participation_status = null;
          }

          if (
            state.currentMatch?.id === id &&
            previousParticipant?.status === "ACCEPTED"
          ) {
            state.currentMatch.accepted_count = Math.max(
              0,
              state.currentMatch.accepted_count - 1,
            );
            state.currentMatch.slots_filled = Math.max(
              0,
              state.currentMatch.slots_filled - 1,
            );

            if (state.currentMatch.status === "FULL") {
              state.currentMatch.status = "OPEN";
            }

            state.currentMatch.my_participation_status = null;
          }

          const match = state.matches.find((item) => item.id === id);
          if (match && previousParticipant?.status === "ACCEPTED") {
            match.slots_filled = Math.max(0, match.slots_filled - 1);
            match.slots_left = Math.max(match.slots_needed - match.slots_filled, 0);
            if (match.status === "FULL") {
              match.status = "OPEN";
            }
          }

          state.participants = upsertParticipant(state.participants, participant);
          state.isLoading = false;
        });

        return participant;
      } catch (error) {
        set((state) => {
          state.error = getErrorMessage(error, "Khong the roi tran dau");
          state.isLoading = false;
        });

        return null;
      }
    },

    acceptParticipant: async (matchId, participantId) => {
      const previous = {
        matches: get().matches,
        currentMatch: get().currentMatch,
        participants: get().participants,
      };

      set((state) => {
        state.isLoading = true;
        state.error = null;

        const target = state.participants.find((item) => item.id === participantId);
        const shouldAdjustSlots = target?.status === "PENDING";

        if (target) {
          target.status = "ACCEPTED";
          target.responded_at = new Date().toISOString();
        }

        if (state.currentMatch?.id === matchId && shouldAdjustSlots) {
          state.currentMatch.pending_count = Math.max(
            0,
            state.currentMatch.pending_count - 1,
          );
          state.currentMatch.accepted_count += 1;
          state.currentMatch.slots_filled = Math.min(
            state.currentMatch.slots_needed,
            state.currentMatch.slots_filled + 1,
          );

          if (state.currentMatch.slots_filled >= state.currentMatch.slots_needed) {
            state.currentMatch.status = "FULL";
          }
        }

        const match = state.matches.find((item) => item.id === matchId);
        if (match && shouldAdjustSlots) {
          match.slots_filled = Math.min(match.slots_needed, match.slots_filled + 1);
          match.slots_left = Math.max(match.slots_needed - match.slots_filled, 0);

          if (match.slots_filled >= match.slots_needed) {
            match.status = "FULL";
          }
        }
      });

      try {
        const participant = await acceptParticipantRequest(matchId, participantId);

        set((state) => {
          state.participants = upsertParticipant(state.participants, participant);
          state.isLoading = false;
        });

        return participant;
      } catch (error) {
        set((state) => {
          state.matches = previous.matches;
          state.currentMatch = previous.currentMatch;
          state.participants = previous.participants;
          state.error = getErrorMessage(error, "Khong the chap nhan nguoi tham gia");
          state.isLoading = false;
        });

        return null;
      }
    },

    rejectParticipant: async (matchId, participantId) => {
      const previous = {
        currentMatch: get().currentMatch,
        participants: get().participants,
      };

      set((state) => {
        state.isLoading = true;
        state.error = null;

        const target = state.participants.find((item) => item.id === participantId);
        const shouldAdjustPending = target?.status === "PENDING";

        if (target) {
          target.status = "REJECTED";
          target.responded_at = new Date().toISOString();
        }

        if (state.currentMatch?.id === matchId && shouldAdjustPending) {
          state.currentMatch.pending_count = Math.max(
            0,
            state.currentMatch.pending_count - 1,
          );
        }
      });

      try {
        const participant = await rejectParticipantRequest(matchId, participantId);

        set((state) => {
          state.participants = upsertParticipant(state.participants, participant);
          state.isLoading = false;
        });

        return participant;
      } catch (error) {
        set((state) => {
          state.currentMatch = previous.currentMatch;
          state.participants = previous.participants;
          state.error = getErrorMessage(error, "Khong the tu choi nguoi tham gia");
          state.isLoading = false;
        });

        return null;
      }
    },

    closeMatch: async (id) => {
      const previous = {
        matches: get().matches,
        currentMatch: get().currentMatch,
      };

      set((state) => {
        state.isLoading = true;
        state.error = null;

        const match = state.matches.find((item) => item.id === id);
        if (match) {
          match.status = "CLOSED";
        }

        if (state.currentMatch?.id === id) {
          state.currentMatch.status = "CLOSED";
        }
      });

      try {
        const updatedMatch = await closeMatchRequest(id);

        set((state) => {
          mergeMatchToState(state, updatedMatch);
          state.isLoading = false;
        });

        return updatedMatch;
      } catch (error) {
        set((state) => {
          state.matches = previous.matches;
          state.currentMatch = previous.currentMatch;
          state.error = getErrorMessage(error, "Khong the dong tran dau");
          state.isLoading = false;
        });

        return null;
      }
    },

    reopenMatch: async (id) => {
      const previous = {
        matches: get().matches,
        currentMatch: get().currentMatch,
      };

      set((state) => {
        state.isLoading = true;
        state.error = null;

        const match = state.matches.find((item) => item.id === id);
        if (match) {
          match.status = match.slots_filled >= match.slots_needed ? "FULL" : "OPEN";
        }

        if (state.currentMatch?.id === id) {
          state.currentMatch.status =
            state.currentMatch.slots_filled >= state.currentMatch.slots_needed
              ? "FULL"
              : "OPEN";
        }
      });

      try {
        const updatedMatch = await reopenMatchRequest(id);

        set((state) => {
          mergeMatchToState(state, updatedMatch);
          state.isLoading = false;
        });

        return updatedMatch;
      } catch (error) {
        set((state) => {
          state.matches = previous.matches;
          state.currentMatch = previous.currentMatch;
          state.error = getErrorMessage(error, "Khong the mo lai tran dau");
          state.isLoading = false;
        });

        return null;
      }
    },

    cancelMatch: async (id) => {
      const previous = {
        matches: get().matches,
        currentMatch: get().currentMatch,
      };

      set((state) => {
        state.isLoading = true;
        state.error = null;

        const match = state.matches.find((item) => item.id === id);
        if (match) {
          match.status = "CANCELED";
        }

        if (state.currentMatch?.id === id) {
          state.currentMatch.status = "CANCELED";
        }
      });

      try {
        const updatedMatch = await cancelMatchRequest(id);

        set((state) => {
          mergeMatchToState(state, updatedMatch);
          state.isLoading = false;
        });

        return updatedMatch;
      } catch (error) {
        set((state) => {
          state.matches = previous.matches;
          state.currentMatch = previous.currentMatch;
          state.error = getErrorMessage(error, "Khong the huy tran dau");
          state.isLoading = false;
        });

        return null;
      }
    },

    reset: () => {
      set((state) => {
        state.matches = [];
        state.pagination = null;
        state.isLoading = false;
        state.error = null;
        state.myMatchesSummary = null;
        state.currentMatch = null;
        state.isLoadingDetail = false;
        state.participants = [];
        state.participantsMatch = null;
        state.participantsPagination = null;
      });
    },
  })),
);
