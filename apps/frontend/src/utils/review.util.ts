import type { PublicSubfieldReview } from "@/types";

const REVIEWER_FALLBACK_NAME = "Người chơi";

export const getReviewerDisplayName = (
  review?: Pick<PublicSubfieldReview, "player"> | null,
  fallbackName = REVIEWER_FALLBACK_NAME,
) => {
  const fullName = review?.player?.account?.full_name?.trim();
  return fullName && fullName.length > 0 ? fullName : fallbackName;
};

export const getNameInitials = (
  name?: string | null,
  fallbackName = REVIEWER_FALLBACK_NAME,
) => {
  const normalizedName = (name || fallbackName).trim();
  const parts = normalizedName.split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "NG";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
};
