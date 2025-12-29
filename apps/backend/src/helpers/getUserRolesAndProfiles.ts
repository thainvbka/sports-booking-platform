import { prisma } from "@sports-booking-platform/db";
import { NotFoundError } from "../utils/error.response";
import stripe from "../libs/stripe";

export const getUserRolesAndProfiles = async (accountId: string) => {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: {
      player: true,
      owner: true,
      admin: true,
    },
  });

  if (!account) {
    throw new NotFoundError("Account not found");
  }

  const roles: string[] = [];
  const profileData: { owner?: any; player?: any; admin?: any } = {};

  if (account.player) {
    roles.push("PLAYER");
    profileData.player = {
      id: account.player.id,
      status: account.player.status,
    };
  }
  if (account.owner) {
    roles.push("OWNER");
    profileData.owner = {
      id: account.owner.id,
      company_name: account.owner.company_name,
      status: account.owner.status,
      stripe_account_id: account.owner.stripe_account_id,
      stripe_onboarding_complete: account.owner.stripe_onboarding_complete,
    };
  }
  if (account.admin) {
    roles.push("ADMIN");
    profileData.admin = {
      id: account.admin.id,
      status: account.admin.status,
    };
  }

  return { roles, profiles: profileData };
};
