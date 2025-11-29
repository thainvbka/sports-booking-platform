import { prisma } from "@sports-booking-platform/db";
import { JwtPayload } from "../libs/jwt";
import { NotFoundError } from "../utils/error.response";

export const getUserRolesAndProfiles = async (
  accountId: string
): Promise<Omit<JwtPayload, "accountId">> => {
  const profiles = await prisma.account.findUnique({
    where: { id: accountId },
    select: {
      player: { select: { id: true } },
      owner: { select: { id: true } },
      admin: { select: { id: true } },
    },
  });

  if (!profiles) {
    throw new NotFoundError("Account not found");
  }

  const roles: JwtPayload["roles"] = [];
  const profileData: JwtPayload["profiles"] = {};

  if (profiles.player) {
    roles.push("PLAYER");
    profileData.playerId = profiles.player.id;
  }
  if (profiles.owner) {
    roles.push("OWNER");
    profileData.ownerId = profiles.owner.id;
  }
  if (profiles.admin) {
    roles.push("ADMIN");
    profileData.adminId = profiles.admin.id;
  }

  return { roles, profiles: profileData };
};
