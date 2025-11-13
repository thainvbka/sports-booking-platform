import { prisma, Prisma } from "@sports-booking-platform/db";
import {
  ConflictRequestError,
  UnauthorizedError,
  InternalServerError,
} from "../../utils/error.response";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../../libs/jwt";
import { getAccessExpiryDate, getRefreshExpiryDate } from "../../helpers";
import { registerInput } from "@sports-booking-platform/validation/access.schema";
import { addRoleInput } from "@sports-booking-platform/validation/account.schema";

type PrismaTransactionClient = Prisma.TransactionClient;

export const roleCreationStrategy = {
  PLAYER: async (tx: PrismaTransactionClient, accountId: string) => {
    await tx.player.create({
      data: {
        account_id: accountId,
        status: "ACTIVE",
      },
    });
  },
  OWNER: async (
    tx: PrismaTransactionClient,
    accountId: string,
    data: registerInput | addRoleInput
  ) => {
    // type guard để TypeScript hiểu data này có company_name
    if (data.role !== "OWNER") {
      throw new InternalServerError("Invalid data provided for OWNER role");
    }
    await tx.owner.create({
      data: {
        account_id: accountId,
        company_name: data.company_name,
        status: "ACTIVE",
      },
    });
  },
  ADMIN: async (tx: PrismaTransactionClient, accountId: string) => {
    await tx.admin.create({
      data: {
        account_id: accountId,
        status: "ACTIVE",
      },
    });
  },
};

export const signUp = async (userData: registerInput) => {
  const existingUser = await prisma.account.findFirst({
    where: {
      OR: [{ email: userData.email }, { phone_number: userData.phone_number }],
    },
  });

  if (existingUser) {
    throw new ConflictRequestError("Email or phone number already exists");
  }

  const hashPassword = await bcrypt.hash(userData.password, 10);

  //transaction tạo account và role account
  const newUser = await prisma.$transaction(async (tx) => {
    const account = await tx.account.create({
      data: {
        email: userData.email,
        password: hashPassword,
        full_name: userData.full_name,
        phone_number: userData.phone_number,
        avatar: userData.avatar,
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone_number: true,
        avatar: true,
      },
    });

    const createRoleAccount = roleCreationStrategy[userData.role];

    if (!createRoleAccount) {
      //schema có role mới nhưng strategy chưa cập nhật
      throw new InternalServerError(
        `Role creation for '${userData.role}' is not implemented.`
      );
    }

    await createRoleAccount(tx, account.id, userData);
    return account;
  });

  const accessToken = generateAccessToken(newUser.id);
  const refreshToken = generateRefreshToken(newUser.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      account_id: newUser.id,
      expires_at: getRefreshExpiryDate(),
    },
  });

  return {
    user: newUser,
    accessToken,
    refreshToken,
  };
};

export const logIn = async (email: string, password: string) => {
  const user = await prisma.account.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ConflictRequestError("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ConflictRequestError("Invalid email or password");
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      account_id: user.id,
      expires_at: getRefreshExpiryDate(),
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone_number: user.phone_number,
      avatar: user.avatar,
    },
    accessToken,
    refreshToken,
  };
};

export const logOut = async (refreshToken: string) => {
  return await prisma.refreshToken.deleteMany({
    where: {
      token: refreshToken,
    },
  });
};

export const handlerRefreshToken = async (refreshToken: string) => {
  const storedToken = await prisma.refreshToken.findUnique({
    where: {
      token: refreshToken,
    },
  });

  if (!storedToken) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  if (storedToken.expires_at < new Date()) {
    throw new UnauthorizedError("Refresh token has expired");
  }
  if (storedToken.revoked) {
    throw new UnauthorizedError("Refresh token has been revoked");
  }

  const accessToken = generateAccessToken(storedToken.account_id);
  const newRefreshToken = generateRefreshToken(storedToken.account_id);
  const newExpiry = getRefreshExpiryDate();
  await prisma.$transaction([
    prisma.refreshToken.update({
      where: {
        token: refreshToken,
      },
      data: {
        revoked: true,
      },
    }),
    prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        account_id: storedToken.account_id,
        expires_at: newExpiry,
      },
    }),
  ]);

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};
