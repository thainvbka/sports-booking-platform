export type MatchStatus =
  | "OPEN"
  | "FULL"
  | "CLOSED"
  | "EXPIRED"
  | "CANCELED"
  | "COMPLETED";

export type ParticipantStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN"
  | "REMOVED";

export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type SportType =
  | "FOOTBALL"
  | "BASKETBALL"
  | "TENNIS"
  | "BADMINTON"
  | "VOLLEYBALL"
  | "PICKLEBALL";

export const MATCH_SPORT_TYPES: SportType[] = [
  "FOOTBALL",
  "BASKETBALL",
  "TENNIS",
  "BADMINTON",
  "VOLLEYBALL",
  "PICKLEBALL",
];

export const MATCH_SKILL_LEVELS: SkillLevel[] = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
];

export const MATCH_SORT_OPTIONS = [
  "created_at:desc",
  "start_time:asc",
  "start_time:desc",
] as const;

export type MatchSortOption = (typeof MATCH_SORT_OPTIONS)[number];

export const MATCH_SKILL_LABELS: Record<SkillLevel, string> = {
  BEGINNER: "Mới bắt đầu",
  INTERMEDIATE: "Trung cấp",
  ADVANCED: "Nâng cao",
};

export const MATCH_SORT_LABELS: Record<MatchSortOption, string> = {
  "created_at:desc": "Mới nhất",
  "start_time:asc": "Bắt đầu tăng dần",
  "start_time:desc": "Bắt đầu giảm dần",
};

export const MATCH_SKILL_BADGE_STYLES: Record<SkillLevel, string> = {
  BEGINNER: "border-emerald-200 bg-emerald-50 text-emerald-700",
  INTERMEDIATE: "border-blue-200 bg-blue-50 text-blue-700",
  ADVANCED: "border-purple-200 bg-purple-50 text-purple-700",
};

export const MATCH_STATUS_BADGE_CONFIG: Record<
  MatchStatus,
  {
    label: string;
    container: string;
    dot: string;
  }
> = {
  OPEN: {
    label: "Đang mở",
    container: "bg-green-100 text-green-800 border-green-200",
    dot: "bg-green-600",
  },
  FULL: {
    label: "Đủ người",
    container: "bg-blue-100 text-blue-800 border-blue-200",
    dot: "bg-blue-600",
  },
  CLOSED: {
    label: "Đã đóng",
    container: "bg-gray-100 text-gray-600 border-gray-200",
    dot: "bg-gray-500",
  },
  EXPIRED: {
    label: "Hết hạn",
    container: "bg-orange-100 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
  },
  CANCELED: {
    label: "Đã hủy",
    container: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-600",
  },
  COMPLETED: {
    label: "Hoàn thành",
    container: "bg-purple-100 text-purple-700 border-purple-200",
    dot: "bg-purple-600",
  },
};

export const PARTICIPANT_STATUS_BADGE_CONFIG: Record<
  ParticipantStatus,
  {
    label: string;
    className: string;
  }
> = {
  PENDING: {
    label: "Chờ duyệt",
    className: "border-amber-200 bg-amber-100 text-amber-700",
  },
  ACCEPTED: {
    label: "Đã chấp nhận",
    className: "border-green-200 bg-green-100 text-green-700",
  },
  REJECTED: {
    label: "Đã từ chối",
    className: "border-red-200 bg-red-100 text-red-700",
  },
  WITHDRAWN: {
    label: "Đã rút",
    className: "border-slate-200 bg-slate-100 text-slate-600",
  },
  REMOVED: {
    label: "Đã loại",
    className: "border-slate-200 bg-slate-100 text-slate-600",
  },
};

export interface MatchBooking {
  id: string;
  start_time: string; // ISO datetime
  end_time: string;
  sub_field_id: string;
  sub_field_name: string;
  complex_id: string;
  complex_name: string;
  complex_address: string;
}

export interface MatchCreator {
  player_id: string;
  full_name: string;
  avatar: string | null;
}

export interface Match {
  id: string;
  status: MatchStatus;
  sport_type: SportType;
  skill_level: SkillLevel | null;
  title: string;
  description: string | null;
  slots_needed: number;
  slots_filled: number;
  slots_left: number;
  join_deadline: string | null;
  created_at: string;
  booking: MatchBooking;
  creator: MatchCreator;
  my_participation_status: ParticipantStatus | null;
}

// Detail has additional counts
export interface MatchDetail extends Omit<Match, "slots_left"> {
  updated_at: string;
  accepted_count: number;
  pending_count: number;
  participant_summary?: {
    accepted_count: number;
    pending_count: number;
    slots_left: number;
  };
}

export interface Participant {
  id: string;
  match_id: string;
  player_id: string;
  status: ParticipantStatus;
  introduction: string | null;
  requested_at: string;
  created_at: string;
  responded_at: string | null;
  left_at: string | null;
  player: {
    id: string;
    full_name: string;
    avatar: string | null;
    skill_level: SkillLevel | null;
    phone: string | null;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
}

export interface MatchParticipantsSummary {
  id: string;
  title: string;
  status: MatchStatus;
  slots_needed: number;
  slots_filled: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: Pagination;
}

export interface MatchParticipantsResult extends PaginatedResult<Participant> {
  match: MatchParticipantsSummary;
}
