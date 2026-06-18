import type { MatchStatus, SportType } from "@/types/match.type";

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
