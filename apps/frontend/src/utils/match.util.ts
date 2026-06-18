/**
 * Shared match-related utility functions.
 */

export interface MatchCountdown {
  label: string;
  urgent: boolean;
  expired: boolean;
}

/**
 * Calculates a human-readable countdown to a match join deadline.
 *
 * @param deadline - ISO datetime string for the deadline (or null for unlimited)
 * @param verbose  - When true, uses full Vietnamese labels ("3 ngày 4 giờ").
 *                   When false, uses compact labels ("3d 4h"). Default: false.
 */
export const getMatchCountdown = (
  deadline: string | null,
  verbose = false,
): MatchCountdown => {
  if (!deadline) {
    return { label: "Không giới hạn", urgent: false, expired: false };
  }

  const parsed = new Date(deadline).getTime();
  if (Number.isNaN(parsed)) {
    return { label: deadline, urgent: false, expired: false };
  }

  const diff = parsed - Date.now();
  if (diff <= 0) {
    return {
      label: verbose ? "Đã hết hạn" : "Hết hạn",
      urgent: true,
      expired: true,
    };
  }

  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  let label: string;
  if (verbose) {
    label =
      days > 0
        ? `${days} ngày ${hours} giờ`
        : hours > 0
          ? `${hours} giờ ${minutes} phút`
          : `${Math.max(minutes, 1)} phút`;
  } else {
    label =
      days > 0
        ? `${days}d ${hours}h`
        : hours > 0
          ? `${hours}h ${minutes}m`
          : `${Math.max(minutes, 1)}m`;
  }

  return { label, urgent: totalMinutes <= 180, expired: false };
};
