import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types";
import type {
  Match,
  MatchDetail,
  Participant,
  MatchParticipantsResult,
  MyMatchesPaginatedResult,
  PublicMatchesPaginatedResult,
  CreateMatchInput,
  MatchParticipantsQuery,
  MyMatchesQuery,
  PublicMatchesQuery,
  MatchParticipantsSummary,
  Pagination,
} from "@/types/match.type";

export const getPublicMatches = async (
  query: PublicMatchesQuery = {},
): Promise<ApiResponse<PublicMatchesPaginatedResult<Match>>> => {
  const response = await api.get<ApiResponse<PublicMatchesPaginatedResult<Match>>>(
    "/public/matches",
    {
      params: query,
    },
  );

  return response.data;
};

export const getPublicMatchById = async (id: string): Promise<ApiResponse<{ match: MatchDetail }>> => {
  const response = await api.get<ApiResponse<{ match: MatchDetail }>>(
    `/public/matches/${id}`,
  );

  return response.data;
};

export const getMatchByIdForPlayer = async (id: string): Promise<ApiResponse<{ match: MatchDetail }>> => {
  const response = await api.get<ApiResponse<{ match: MatchDetail }>>(
    `/matches/${id}`,
  );

  return response.data;
};

export const createMatch = async (data: CreateMatchInput): Promise<ApiResponse<{ match: Match }>> => {
  const response = await api.post<ApiResponse<{ match: Match }>>(
    "/matches",
    data,
  );

  return response.data;
};

export const joinMatch = async (
  id: string,
  introduction?: string,
): Promise<ApiResponse<{ participant: Participant }>> => {
  const response = await api.post<ApiResponse<{ participant: Participant }>>(
    `/matches/${id}/join`,
    {
      introduction,
    },
  );

  return response.data;
};

export const leaveMatch = async (id: string): Promise<ApiResponse<{ participant: Participant }>> => {
  const response = await api.delete<ApiResponse<{ participant: Participant }>>(
    `/matches/${id}/join`,
  );

  return response.data;
};

export const getMyMatches = async (
  query: MyMatchesQuery = {},
): Promise<ApiResponse<MyMatchesPaginatedResult<Match>>> => {
  const response = await api.get<ApiResponse<MyMatchesPaginatedResult<Match>>>(
    "/matches/me",
    {
      params: query,
    },
  );

  return response.data;
};

export const getMatchParticipants = async (
  id: string,
  query: MatchParticipantsQuery = {},
): Promise<
  ApiResponse<{
    match: MatchParticipantsSummary;
    participants: Participant[];
    pagination: Pagination;
  }>
> => {
  const response = await api.get<
    ApiResponse<{
      match: MatchParticipantsSummary;
      participants: Participant[];
      pagination: Pagination;
    }>
  >(`/matches/${id}/participants`, {
    params: query,
  });

  return response.data;
};

export const acceptParticipant = async (
  matchId: string,
  participantId: string,
): Promise<ApiResponse<{ participant: Participant }>> => {
  const response = await api.patch<ApiResponse<{ participant: Participant }>>(
    `/matches/${matchId}/participants/${participantId}/accept`,
  );

  return response.data;
};

export const rejectParticipant = async (
  matchId: string,
  participantId: string,
): Promise<ApiResponse<{ participant: Participant }>> => {
  const response = await api.patch<ApiResponse<{ participant: Participant }>>(
    `/matches/${matchId}/participants/${participantId}/reject`,
  );

  return response.data;
};

export const closeMatch = async (id: string): Promise<ApiResponse<{ match: Match }>> => {
  const response = await api.patch<ApiResponse<{ match: Match }>>(
    `/matches/${id}/close`,
  );

  return response.data;
};

export const reopenMatch = async (id: string): Promise<ApiResponse<{ match: Match }>> => {
  const response = await api.patch<ApiResponse<{ match: Match }>>(
    `/matches/${id}/reopen`,
  );

  return response.data;
};

export const cancelMatch = async (id: string): Promise<ApiResponse<{ match: Match }>> => {
  const response = await api.patch<ApiResponse<{ match: Match }>>(
    `/matches/${id}/cancel`,
  );

  return response.data;
};

export const matchService = {
  getPublicMatches,
  getPublicMatchById,
  getMatchByIdForPlayer,
  createMatch,
  joinMatch,
  leaveMatch,
  getMyMatches,
  getMatchParticipants,
  acceptParticipant,
  rejectParticipant,
  closeMatch,
  reopenMatch,
  cancelMatch,
};
