import { prisma } from "@sports-booking-platform/db";
import {
  ConflictRequestError,
  InternalServerError,
} from "../../utils/error.response";

import { addRoleInput } from "@sports-booking-platform/validation";

import { roleCreationStrategy } from "./auth.service";

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

  return { message: `Role ${role} added successfully` };
};
