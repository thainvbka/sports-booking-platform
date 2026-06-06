import { prisma } from "../../libs/prisma";
import {
  ConflictRequestError,
  InternalServerError,
} from "../../utils/error.response";

import { addRoleInput } from "../../validations";

import { getRefreshExpiryDate } from "../../helpers";
import {
  generateAccessToken,
  generateRefreshToken,
  JwtPayload,
} from "../../libs/jwt";
import { roleCreationStrategy, getJwtPayloadAndRoles } from "./auth.service";
export const addRoleToAccount = async (
  accountId: string,
  roleData: addRoleInput,
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

  // Lấy roles, profiles và tạo JWT payload mới sau khi thêm role
  const { jwtPayload, roles, profiles } = await getJwtPayloadAndRoles(accountId);

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
