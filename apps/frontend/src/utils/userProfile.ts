import type { User } from "@/types";

const firstNonEmpty = (...values: Array<string | undefined>): string | undefined => {
  return values.find((value) => typeof value === "string" && value.length > 0);
};

export const getPlayerProfileId = (user: User | null | undefined): string | undefined => {
  return firstNonEmpty(user?.profiles?.playerId, user?.profiles?.player?.id);
};

export const getOwnerProfileId = (user: User | null | undefined): string | undefined => {
  return firstNonEmpty(user?.profiles?.ownerId, user?.profiles?.owner?.id);
};

export const getAdminProfileId = (user: User | null | undefined): string | undefined => {
  return firstNonEmpty(user?.profiles?.adminId, user?.profiles?.admin?.id);
};
