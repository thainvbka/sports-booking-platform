import type { AdminUser } from "@/types/admin.types";

export const getUserRoles = (user?: AdminUser | null): string[] => {
  if (!user) return [];
  const roles: string[] = [];
  if (user.admin) roles.push("ADMIN");
  if (user.owner) roles.push("OWNER");
  if (user.player) roles.push("PLAYER");
  return roles;
};

export const getUserStatus = (user?: AdminUser | null): string => {
  if (!user) return "ACTIVE";
  if (user.admin) return user.admin.status;
  if (user.owner) return user.owner.status;
  return user.player?.status || "ACTIVE";
};
