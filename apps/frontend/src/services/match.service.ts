import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types";
import type {
  Match,
  MatchBooking,
  MatchCreator,
  MatchDetail,
  MatchParticipantPreview,
  MatchParticipantsResult,
  MatchParticipantsSummary,
  MatchSortOption,
  MatchStatus,
  MyMatchType,
  MyMatchesPaginatedResult,
  PaginatedResult,
  Pagination,
  Participant,
  ParticipantStatus,
  PublicMatchesPaginatedResult,
  SkillLevel,
  SportType,
  CreateMatchInput,
  MatchParticipantsQuery,
  MyMatchesQuery,
  PublicMatchesQuery,
  RawMatchDetail,
} from "@/types/match.type";


const EMPTY_BOOKING: MatchBooking = {
  id: "",
  start_time: "",
  end_time: "",
  sub_field_id: "",
  sub_field_name: "",
  complex_id: "",
  complex_name: "",
  complex_address: "",
};

const EMPTY_CREATOR: MatchCreator = {
  player_id: "",
  full_name: "",
  avatar: null,
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const asString = (value: unknown, fallback: string = ""): string => {
  return typeof value === "string" ? value : fallback;
};

const asNullableString = (value: unknown): string | null => {
  return typeof value === "string" ? value : null;
};

const asNumber = (value: unknown, fallback: number = 0): number => {
  return typeof value === "number" ? value : fallback;
};

const toParticipantPreviewList = (
  rawParticipants: unknown,
): MatchParticipantPreview[] => {
  if (!Array.isArray(rawParticipants)) {
    return [];
  }

  return rawParticipants
    .map((item) => {
      const raw = isRecord(item) ? item : {};
      const rawPlayer = isRecord(raw.player) ? raw.player : {};
      const rawAccount = isRecord(rawPlayer.account) ? rawPlayer.account : {};

      const playerId = asString(
        raw.player_id,
        asString(rawPlayer.id, asString(raw.id)),
      );
      const fullName = asString(
        raw.full_name,
        asString(rawPlayer.full_name, asString(rawAccount.full_name)),
      );
      const avatar = asNullableString(
        raw.avatar ?? rawPlayer.avatar ?? rawAccount.avatar,
      );

      if (!playerId || !fullName) {
        return null;
      }

      return {
        player_id: playerId,
        full_name: fullName,
        avatar,
      };
    })
    .filter((participant): participant is MatchParticipantPreview =>
      Boolean(participant),
    );
};

const toParticipantsSummary = (rawSummary: unknown): MatchParticipantsSummary => {
  const raw = isRecord(rawSummary) ? rawSummary : {};

  return {
    id: asString(raw.id),
    title: asString(raw.title),
    status: (raw.status ?? "OPEN") as MatchStatus,
    slots_needed: asNumber(raw.slots_needed, 0),
    slots_filled: asNumber(raw.slots_filled, 0),
  };
};

const toMatch = (
  raw: Partial<Match> & { my_participation_status?: ParticipantStatus | null },
): Match => {
  const slotsNeeded = asNumber(raw.slots_needed, 0);
  const slotsFilled = asNumber(raw.slots_filled, 0);

  return {
    id: asString(raw.id),
    status: (raw.status ?? "OPEN") as MatchStatus,
    sport_type: (raw.sport_type ?? "FOOTBALL") as SportType,
    skill_level: (raw.skill_level ?? null) as SkillLevel | null,
    title: asString(raw.title),
    description: (raw.description ?? null) as string | null,
    slots_needed: slotsNeeded,
    slots_filled: slotsFilled,
    slots_left:
      typeof raw.slots_left === "number"
        ? raw.slots_left
        : Math.max(slotsNeeded - slotsFilled, 0),
    join_deadline: (raw.join_deadline ?? null) as string | null,
    created_at: asString(raw.created_at),
    booking: (raw.booking as MatchBooking | undefined) ?? EMPTY_BOOKING,
    creator: (raw.creator as MatchCreator | undefined) ?? EMPTY_CREATOR,
    my_participation_status: raw.my_participation_status ?? null,
    participants_preview: toParticipantPreviewList(
      (raw as { participants_preview?: unknown; participants?: unknown })
        .participants_preview ??
        (raw as { participants?: unknown }).participants,
    ),
  };
};

const toMatchDetail = (raw: RawMatchDetail): MatchDetail => {
  const match = toMatch(raw as Partial<Match>);
  const { slots_left: _slotsLeft, ...withoutSlotsLeft } = match;
  void _slotsLeft;

  const participantSummary = raw.participant_summary
    ? {
        accepted_count: asNumber(raw.participant_summary.accepted_count, 0),
        pending_count: asNumber(raw.participant_summary.pending_count, 0),
        slots_left: asNumber(raw.participant_summary.slots_left, 0),
      }
    : undefined;

  return {
    ...withoutSlotsLeft,
    updated_at: asString(raw.updated_at),
    accepted_count:
      typeof raw.accepted_count === "number"
        ? raw.accepted_count
        : raw.participant_summary?.accepted_count ?? 0,
    pending_count:
      typeof raw.pending_count === "number"
        ? raw.pending_count
        : raw.participant_summary?.pending_count ?? 0,
    participant_summary: participantSummary,
  };
};

const toParticipant = (
  rawParticipant: unknown,
  fallbackMatchId?: string,
): Participant => {
  const raw = isRecord(rawParticipant) ? rawParticipant : {};
  const rawPlayer = isRecord(raw.player) ? raw.player : {};

  const playerId = asString(raw.player_id, asString(rawPlayer.id));

  return {
    id: asString(raw.id),
    match_id: asString(raw.match_id, fallbackMatchId ?? ""),
    player_id: playerId,
    status: (raw.status ?? "PENDING") as ParticipantStatus,
    introduction: asNullableString(raw.introduction),
    requested_at: asString(raw.requested_at, asString(raw.created_at)),
    created_at: asString(raw.created_at, asString(raw.requested_at)),
    responded_at: asNullableString(raw.responded_at),
    left_at: asNullableString(raw.left_at),
    player: {
      id: asString(rawPlayer.id, playerId),
      full_name: asString(rawPlayer.full_name),
      avatar: asNullableString(rawPlayer.avatar),
      skill_level: (rawPlayer.skill_level ?? null) as SkillLevel | null,
      phone: asNullableString(rawPlayer.phone),
    },
  };
};

export const getPublicMatches = async (
  query: PublicMatchesQuery = {},
): Promise<PublicMatchesPaginatedResult<Match>> => {
  const response = await api.get<ApiResponse<PublicMatchesPaginatedResult<Match>>>(
    "/public/matches",
    {
      params: query,
    },
  );

  const payload = response.data.data;

  return {
    ...payload,
    items: payload.items.map((item) => toMatch(item)),
  };
};

export const getPublicMatchById = async (id: string): Promise<MatchDetail> => {
  const response = await api.get<ApiResponse<{ match: RawMatchDetail }>>(
    `/public/matches/${id}`,
  );

  return toMatchDetail(response.data.data.match);
};

export const getMatchByIdForPlayer = async (id: string): Promise<MatchDetail> => {
  const response = await api.get<ApiResponse<{ match: RawMatchDetail }>>(
    `/matches/${id}`,
  );

  return toMatchDetail(response.data.data.match);
};

export const createMatch = async (data: CreateMatchInput): Promise<Match> => {
  const response = await api.post<
    ApiResponse<{ match: Partial<Match> & { my_participation_status?: ParticipantStatus | null } }>
  >(
    "/matches",
    data,
  );

  return toMatch(response.data.data.match);
};

export const joinMatch = async (
  id: string,
  introduction?: string,
): Promise<Participant> => {
  const response = await api.post<ApiResponse<{ participant: unknown }>>(
    `/matches/${id}/join`,
    {
      introduction,
    },
  );

  return toParticipant(response.data.data.participant, id);
};

export const leaveMatch = async (id: string): Promise<Participant> => {
  const response = await api.delete<ApiResponse<{ participant: unknown }>>(
    `/matches/${id}/join`,
  );

  return toParticipant(response.data.data.participant, id);
};

export const getMyMatches = async (
  query: MyMatchesQuery = {},
): Promise<MyMatchesPaginatedResult<Match>> => {
  const response = await api.get<ApiResponse<MyMatchesPaginatedResult<Match>>>(
    "/matches/me",
    {
      params: query,
    },
  );

  const payload = response.data.data;

  return {
    ...payload,
    items: payload.items.map((item) => toMatch(item)),
  };
};

export const getMatchParticipants = async (
  id: string,
  query: MatchParticipantsQuery = {},
): Promise<MatchParticipantsResult> => {
  const response = await api.get<
    ApiResponse<{
      match: unknown;
      participants: unknown[];
      pagination: Pagination;
    }>
  >(`/matches/${id}/participants`, {
    params: query,
  });

  return {
    match: toParticipantsSummary(response.data.data.match),
    items: response.data.data.participants.map((participant) =>
      toParticipant(participant, id),
    ),
    pagination: response.data.data.pagination,
  };
};

export const acceptParticipant = async (
  matchId: string,
  participantId: string,
): Promise<Participant> => {
  const response = await api.patch<ApiResponse<{ participant: unknown }>>(
    `/matches/${matchId}/participants/${participantId}/accept`,
  );

  return toParticipant(response.data.data.participant, matchId);
};

export const rejectParticipant = async (
  matchId: string,
  participantId: string,
): Promise<Participant> => {
  const response = await api.patch<ApiResponse<{ participant: unknown }>>(
    `/matches/${matchId}/participants/${participantId}/reject`,
  );

  return toParticipant(response.data.data.participant, matchId);
};

export const closeMatch = async (id: string): Promise<Match> => {
  const response = await api.patch<
    ApiResponse<{ match: Partial<Match> & { my_participation_status?: ParticipantStatus | null } }>
  >(
    `/matches/${id}/close`,
  );

  return toMatch(response.data.data.match);
};

export const reopenMatch = async (id: string): Promise<Match> => {
  const response = await api.patch<
    ApiResponse<{ match: Partial<Match> & { my_participation_status?: ParticipantStatus | null } }>
  >(
    `/matches/${id}/reopen`,
  );

  return toMatch(response.data.data.match);
};

export const cancelMatch = async (id: string): Promise<Match> => {
  const response = await api.patch<
    ApiResponse<{ match: Partial<Match> & { my_participation_status?: ParticipantStatus | null } }>
  >(
    `/matches/${id}/cancel`,
  );

  return toMatch(response.data.data.match);
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
