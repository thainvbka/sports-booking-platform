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

export const MATCH_DEFAULT_SORT: MatchSortOption = "created_at:desc";

export const MY_MATCH_TYPES = ["created", "joined", "pending"] as const;

export type MyMatchType = (typeof MY_MATCH_TYPES)[number];

export const MY_MATCH_TYPE_LABELS: Record<MyMatchType, string> = {
  created: "Kèo tôi tạo",
  joined: "Kèo đã vào",
  pending: "Đang chờ duyệt",
};

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
  BEGINNER: "status-surface-success",
  INTERMEDIATE: "border-teal-200 bg-teal-50 text-teal-700",
  ADVANCED: "status-surface-error",
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
    container: "bg-emerald-100 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-600",
  },
  FULL: {
    label: "Đủ người",
    container: "bg-rose-100 text-rose-800 border-rose-200",
    dot: "bg-rose-600",
  },
  CLOSED: {
    label: "Đã đóng",
    container: "status-surface-neutral",
    dot: "bg-slate-500",
  },
  EXPIRED: {
    label: "Hết hạn",
    container: "bg-orange-100 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
  },
  CANCELED: {
    label: "Đã hủy",
    container: "bg-rose-100 text-rose-700 border-rose-200",
    dot: "bg-rose-600",
  },
  COMPLETED: {
    label: "Hoàn thành",
    container: "bg-teal-100 text-teal-700 border-teal-200",
    dot: "bg-teal-600",
  },
};

export const MATCH_STATUS_OPTIONS: MatchStatus[] = [
  "OPEN",
  "FULL",
  "CLOSED",
  "EXPIRED",
  "CANCELED",
  "COMPLETED",
];

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
    className: "status-surface-neutral",
  },
  REMOVED: {
    label: "Đã loại",
    className: "status-surface-neutral",
  },
};

export const MATCH_LEAVABLE_PARTICIPATION_STATUSES: ParticipantStatus[] = [
  "PENDING",
  "ACCEPTED",
];

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

export interface MatchParticipantPreview {
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
  participants_preview?: MatchParticipantPreview[];
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

export interface PublicMatchesSummary {
  total: number;
  open: number;
  almostFull: number;
  totalSlotsLeft: number;
}

export interface PublicMatchesPaginatedResult<T> extends PaginatedResult<T> {
  summary: PublicMatchesSummary;
}

export interface MyMatchesSummary {
  created: number;
  joined: number;
  pending: number;
}

export interface MyMatchesPaginatedResult<T> extends PaginatedResult<T> {
  summary: MyMatchesSummary;
}

export interface MatchParticipantsResult extends PaginatedResult<Participant> {
  match: MatchParticipantsSummary;
}

/**
 * Gradient accent bar for status (used on hero top border & card top bar).
 */
export const MATCH_STATUS_ACCENT: Record<MatchStatus, string> = {
  OPEN: "from-accent-sport to-emerald-400",
  FULL: "from-amber-400 to-amber-300",
  CLOSED: "from-slate-400 to-slate-300",
  EXPIRED: "from-orange-400 to-orange-300",
  CANCELED: "from-rose-500 to-rose-400",
  COMPLETED: "from-blue-500 to-cyan-400",
};

/**
 * Solid progress bar colour for status.
 */
export const MATCH_STATUS_PROGRESS: Record<MatchStatus, string> = {
  OPEN: "bg-accent-sport",
  FULL: "bg-amber-500",
  CLOSED: "bg-slate-400",
  EXPIRED: "bg-orange-500",
  CANCELED: "bg-rose-500",
  COMPLETED: "bg-blue-500",
};

/**
 * Sport badge tint for light backgrounds (cards, panels).
 */
export const MATCH_SPORT_TINT_LIGHT: Record<SportType, string> = {
  FOOTBALL:
    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700/50",
  BASKETBALL:
    "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-700/50",
  TENNIS:
    "bg-lime-100 text-lime-700 border-lime-200 dark:bg-lime-950/40 dark:text-lime-300 dark:border-lime-700/50",
  BADMINTON:
    "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-700/50",
  VOLLEYBALL:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700/50",
  PICKLEBALL:
    "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-700/50",
};

/**
 * Sport badge tint for dark hero backgrounds.
 */
export const MATCH_SPORT_TINT_DARK: Record<SportType, string> = {
  FOOTBALL: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30",
  BASKETBALL: "bg-orange-500/20 text-orange-200 border-orange-400/30",
  TENNIS: "bg-lime-500/20 text-lime-200 border-lime-400/30",
  BADMINTON: "bg-sky-500/20 text-sky-200 border-sky-400/30",
  VOLLEYBALL: "bg-amber-500/20 text-amber-200 border-amber-400/30",
  PICKLEBALL: "bg-teal-500/20 text-teal-200 border-teal-400/30",
};

