import { getRefreshExpiryDate, getUserRolesAndProfiles, uploadAccountAvatar } from "../../helpers";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../libs/jwt";
import { prisma, Prisma } from "../../libs/prisma";
import {
  BadRequestError,
  ConflictRequestError,
  NotFoundError,
} from "../../utils/error.response";
import { addRoleInput } from "../../validations";
import { roleCreationStrategy, getJwtPayloadAndRoles } from "./auth.service";

type PrismaTransactionClient = Prisma.TransactionClient;

// ── Add Role ────────────────────────────────────────────────────
export const addRoleToAccount = async (
  accountId: string,
  roleData: addRoleInput,
) => {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: {
      player: true,
      owner: true,
      admin: true,
    },
  });

  if (!account) {
    throw new NotFoundError("Tài khoản không tồn tại");
  }

  const existingRoles: string[] = [];
  if (account.player) existingRoles.push("PLAYER");
  if (account.owner) existingRoles.push("OWNER");
  if (account.admin) existingRoles.push("ADMIN");

  if (existingRoles.includes(roleData.role)) {
    throw new ConflictRequestError(
      `Tài khoản đã có vai trò ${roleData.role}`,
    );
  }

  await prisma.$transaction(async (tx: PrismaTransactionClient) => {
    const createRole =
      roleCreationStrategy[
        roleData.role as keyof typeof roleCreationStrategy
      ];
    if (!createRole) {
      throw new BadRequestError("Vai trò không hợp lệ");
    }
    await createRole(tx, accountId, roleData);
  });

  // Tạo token mới với roles cập nhật
  const { jwtPayload, roles, profiles } =
    await getJwtPayloadAndRoles(accountId);

  const accessToken = generateAccessToken(jwtPayload);
  const refreshToken = generateRefreshToken(accountId);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      account_id: accountId,
      expires_at: getRefreshExpiryDate(),
    },
  });

  return {
    message: `Đã thêm vai trò ${roleData.role} thành công`,
    user: {
      id: account.id,
      email: account.email,
      full_name: account.full_name,
      phone_number: account.phone_number,
      avatar: account.avatar,
      roles,
      profiles,
    },
    accessToken,
    refreshToken,
  };
};

// ── Update Profile ──────────────────────────────────────────────
interface UpdateProfileData {
  full_name?: string;
  phone_number?: string;
  company_name?: string; // Owner only
}

export const updateProfile = async (
  accountId: string,
  data: UpdateProfileData,
  files?: { [fieldname: string]: Express.Multer.File[] },
) => {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: {
      owner: true,
    },
  });

  if (!account) {
    throw new NotFoundError("Tài khoản không tồn tại");
  }

  // Check phone number uniqueness if changed
  if (data.phone_number && data.phone_number !== account.phone_number) {
    const existingPhone = await prisma.account.findFirst({
      where: {
        phone_number: data.phone_number,
        id: { not: accountId },
      },
    });
    if (existingPhone) {
      throw new ConflictRequestError("Số điện thoại đã được sử dụng");
    }
  }

  // Upload avatar if provided
  let avatarUrl: string | undefined;
  if (files) {
    const uploadRes = await uploadAccountAvatar(files, accountId);
    avatarUrl = uploadRes.avatar;
  }

  // Update account info
  const updateData: Prisma.AccountUpdateInput = {};
  if (data.full_name) updateData.full_name = data.full_name;
  if (data.phone_number) updateData.phone_number = data.phone_number;
  if (avatarUrl) updateData.avatar = avatarUrl;

  const updatedAccount = await prisma.account.update({
    where: { id: accountId },
    data: updateData,
  });

  // Update owner company_name if provided and user is an owner
  if (data.company_name && account.owner) {
    await prisma.owner.update({
      where: { account_id: accountId },
      data: { company_name: data.company_name },
    });
  }

  // Get updated roles and profiles
  const { roles, profiles } = await getUserRolesAndProfiles(accountId);

  return {
    user: {
      id: updatedAccount.id,
      email: updatedAccount.email,
      full_name: updatedAccount.full_name,
      phone_number: updatedAccount.phone_number,
      avatar: updatedAccount.avatar,
      roles,
      profiles,
    },
  };
};
