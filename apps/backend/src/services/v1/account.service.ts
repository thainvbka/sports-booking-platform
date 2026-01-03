import { prisma } from "@sports-booking-platform/db";
import {
  ConflictRequestError,
  InternalServerError,
} from "../../utils/error.response";

import { addRoleInput } from "@sports-booking-platform/validation";

import { roleCreationStrategy } from "./auth.service";
import {
  generateAccessToken,
  generateRefreshToken,
  JwtPayload,
} from "../../libs/jwt";
import { getUserRolesAndProfiles } from "../../helpers";
import { getRefreshExpiryDate } from "../../helpers";

export const addRoleToAccount = async (
  accountId: string,
  roleData: addRoleInput
) => {
  const { role } = roleData;

  //kiểm tra xem đã có role chuẩn bị add chưa
  const checkRole = {
    PLAYER: () =>
      prisma.player.findUnique({
        where: { account_id: accountId },
      }),
    OWNER: () =>
      prisma.owner.findUnique({
        where: { account_id: accountId },
      }),
  };

  if (role !== "PLAYER" && role !== "OWNER") {
    throw new InternalServerError("Invalid role specified");
  }

  const hasRole = await checkRole[role]();

  if (hasRole) {
    throw new ConflictRequestError(`Account already has the role: ${role}`);
  }

  //thêm role mới vào account
  const createRole = roleCreationStrategy[role];
  if (!createRole) {
    throw new InternalServerError("Role creation strategy not found");
  }

  await createRole(prisma, accountId, roleData);

  // Lấy roles và profiles mới sau khi thêm role
  const { roles, profiles } = await getUserRolesAndProfiles(accountId);

  // Tạo JWT payload mới với roles mới
  const jwtPayload: JwtPayload = {
    accountId,
    roles: roles as ("PLAYER" | "OWNER" | "ADMIN")[],
    profiles: {
      playerId: profiles.player?.id,
      ownerId: profiles.owner?.id,
      adminId: profiles.admin?.id,
    },
  };

  // Tạo access token và refresh token mới
  const accessToken = generateAccessToken(jwtPayload);
  const refreshToken = generateRefreshToken(accountId);

  // Xóa refresh token cũ và tạo refresh token mới
  await prisma.refreshToken.deleteMany({
    where: { account_id: accountId },
  });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      account_id: accountId,
      expires_at: getRefreshExpiryDate(),
    },
  });

  return {
    message: `Role ${role} added successfully`,
    accessToken,
    refreshToken,
    user: {
      accountId,
      roles,
      profiles,
    },
  };
};
