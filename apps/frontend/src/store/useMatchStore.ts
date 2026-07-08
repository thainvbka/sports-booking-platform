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
  PublicMatchesSummary,
  CreateMatchInput,
  MatchParticipantsQuery,
  MyMatchesQuery,
  PublicMatchesQuery,
} from "@/types";
import { create } from "zustand";

interface MatchStoreState {
  matches: Match[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
  myMatchesSummary: MyMatchesSummary | null;
  publicMatchesSummary: PublicMatchesSummary | null;

  currentMatch: MatchDetail | null;
  isLoadingDetail: boolean;

  participants: Participant[];
  participantsMatch: MatchParticipantsSummary | null;
  participantsPagination: Pagination | null;
  isLoadingParticipants: boolean;

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

  clearMatchDetail: () => void;
  reset: () => void;
}

const INITIAL_STATE = {
  matches: [] as Match[],
  pagination: null as Pagination | null,
  isLoading: false,
  error: null as string | null,
  myMatchesSummary: null as MyMatchesSummary | null,
  publicMatchesSummary: null as PublicMatchesSummary | null,
  currentMatch: null as MatchDetail | null,
  isLoadingDetail: false,
  participants: [] as Participant[],
  participantsMatch: null as MatchParticipantsSummary | null,
  participantsPagination: null as Pagination | null,
  isLoadingParticipants: false,
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

export const useMatchStore = create<MatchStoreState>((set) => ({
  ...INITIAL_STATE,

  fetchPublicMatches: async (query = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await getPublicMatches(query);
      set({
        matches: res.data.items,
        pagination: res.data.pagination,
        publicMatchesSummary: res.data.summary,
      });
    } catch (error) {
      set({ error: getErrorMessage(error, "Khong the tai danh sach tran dau cong khai") });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMatchById: async (id, scope = "public") => {
    set({ isLoadingDetail: true, error: null });
    try {
      const res =
        scope === "player"
          ? await getMatchByIdForPlayer(id)
          : await getPublicMatchById(id);
      set({ currentMatch: res.data.match });
    } catch (error) {
      set({ error: getErrorMessage(error, "Khong the tai chi tiet tran dau") });
    } finally {
      set({ isLoadingDetail: false });
    }
  },

  fetchMyMatches: async (query = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await getMyMatches(query);
      set({
        matches: res.data.items,
        pagination: res.data.pagination,
        myMatchesSummary: res.data.summary,
      });
    } catch (error) {
      set({ error: getErrorMessage(error, "Khong the tai danh sach tran dau cua ban") });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchParticipants: async (id, query = {}) => {
    set({ isLoadingParticipants: true, error: null });
    try {
      const res = await getMatchParticipants(id, query);
      set({
        participantsMatch: res.data.match,
        participants: res.data.participants,
        participantsPagination: res.data.pagination,
      });
    } catch (error) {
      set({ error: getErrorMessage(error, "Khong the tai danh sach nguoi tham gia") });
    } finally {
      set({ isLoadingParticipants: false });
    }
  },

  createMatch: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await createMatchRequest(data);
      const createdMatch = res.data.match;
      set((state) => {
        const nextMatches = [createdMatch, ...state.matches];
        const nextPagination = state.pagination
          ? {
              ...state.pagination,
              total_items: state.pagination.total_items + 1,
              total_pages: Math.ceil((state.pagination.total_items + 1) / state.pagination.limit),
              has_next: (state.pagination.page * state.pagination.limit) < (state.pagination.total_items + 1),
            }
          : null;
        return { matches: nextMatches, pagination: nextPagination };
      });
      return createdMatch;
    } catch {
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  joinMatch: async (id, introduction) => {
    set({ isLoading: true, error: null });
    try {
      const res = await joinMatchRequest(id, introduction);
      return res.data.participant;
    } catch {
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  leaveMatch: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await leaveMatchRequest(id);
      return res.data.participant;
    } catch {
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  acceptParticipant: async (matchId, participantId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await acceptParticipantRequest(matchId, participantId);
      return res.data.participant;
    } catch {
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  rejectParticipant: async (matchId, participantId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await rejectParticipantRequest(matchId, participantId);
      return res.data.participant;
    } catch {
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  closeMatch: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await closeMatchRequest(id);
      const updatedMatch = res.data.match;
      set((state) => {
        const nextCurrentMatch =
          state.currentMatch?.id === id
            ? { ...state.currentMatch, status: "CLOSED" as const }
            : state.currentMatch;
        const nextMatches = state.matches.map((m) =>
          m.id === id ? { ...m, status: "CLOSED" as const } : m,
        );
        return { currentMatch: nextCurrentMatch, matches: nextMatches };
      });
      return updatedMatch;
    } catch {
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  reopenMatch: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await reopenMatchRequest(id);
      const updatedMatch = res.data.match;
      set((state) => {
        const nextCurrentMatch =
          state.currentMatch?.id === id
            ? { ...state.currentMatch, status: updatedMatch.status }
            : state.currentMatch;
        const nextMatches = state.matches.map((m) =>
          m.id === id ? { ...m, status: updatedMatch.status } : m,
        );
        return { currentMatch: nextCurrentMatch, matches: nextMatches };
      });
      return updatedMatch;
    } catch {
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  cancelMatch: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await cancelMatchRequest(id);
      const updatedMatch = res.data.match;
      set((state) => {
        const nextCurrentMatch =
          state.currentMatch?.id === id
            ? { ...state.currentMatch, status: "CANCELED" as const }
            : state.currentMatch;
        const nextMatches = state.matches.map((m) =>
          m.id === id ? { ...m, status: "CANCELED" as const } : m,
        );
        return { currentMatch: nextCurrentMatch, matches: nextMatches };
      });
      return updatedMatch;
    } catch {
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  clearMatchDetail: () => {
    set({
      currentMatch: null,
      participants: [],
      participantsMatch: null,
      participantsPagination: null,
    });
  },

  reset: () => {
    set(INITIAL_STATE);
  },
}));
