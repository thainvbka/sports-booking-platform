import { prisma, Prisma } from "@sports-booking-platform/db";
import {
  ConflictRequestError,
  UnauthorizedError,
  InternalServerError,
} from "../../utils/error.response";
import { JwtPayload } from "../../libs/jwt";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../../libs/jwt";
import { getAccessExpiryDate, getRefreshExpiryDate } from "../../helpers";
import { registerInput } from "@sports-booking-platform/validation/access.schema";
import { addRoleInput } from "@sports-booking-platform/validation/account.schema";
import { getUserRolesAndProfiles } from "../../helpers";
import { sendActivationEmail } from "../../libs/mailer";
import crypto from "crypto";
import { AnyNull } from "@sports-booking-platform/db/generated/prisma-client/internal/prismaNamespace";

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

  //tạo mã xác thực email
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // Hết hạn sau 24h

  //transaction tạo account và role account
  const newUser = await prisma.$transaction(async (tx) => {
    const account = await tx.account.create({
      data: {
        email: userData.email,
        password: hashPassword,
        full_name: userData.full_name,
        phone_number: userData.phone_number,
        avatar: userData.avatar,
        email_verified: false,
        verification_token: verificationToken,
        verification_expires_at: tokenExpiry,
      },
      // select: {
      //   id: true,
      //   email: true,
      //   full_name: true,
      //   phone_number: true,
      //   avatar: true,
      // },
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

  //gửi email xác thực
  sendActivationEmail(newUser.email, verificationToken).catch((error) => {
    console.error(
      `Failed to send activation email to ${newUser.email}: `,
      error
    );
  });

  //fetch roles và profiles
  // const { roles, profiles } = await getUserRolesAndProfiles(newUser.id);

  //tạo payload cho jwt
  // const jwtPayload: JwtPayload = {
  //   accountId: newUser.id,
  //   roles,
  //   profiles,
  // };

  // const accessToken = generateAccessToken(jwtPayload);
  // const refreshToken = generateRefreshToken(newUser.id);

  // await prisma.refreshToken.create({
  //   data: {
  //     token: refreshToken,
  //     account_id: newUser.id,
  //     expires_at: getRefreshExpiryDate(),
  //   },
  // });

  return {
    needVerify: true,
    // user: {
    //   ...newUser,
    //   roles,
    //   profiles,
    // },
  };
};

export const verifyEmail = async (token: string) => {
  const account = await prisma.account.findFirst({
    where: {
      verification_token: token,
      verification_expires_at: {
        gt: new Date(),
      },
    },
  });

  if (!account) {
    throw new ConflictRequestError("Invalid or expired verification token");
  }

  const updatedAccount = await prisma.account.update({
    where: {
      id: account.id,
    },
    data: {
      email_verified: true,
      verification_token: null,
      verification_expires_at: null,
    },
    select: {
      id: true,
      email: true,
      full_name: true,
      phone_number: true,
      avatar: true,
    },
  });

  //fetch roles và profiles
  const { roles, profiles } = await getUserRolesAndProfiles(updatedAccount.id);

  // tạo payload cho jwt
  const jwtPayload: JwtPayload = {
    accountId: updatedAccount.id,
    roles: roles as any,
    profiles: {
      playerId: profiles.player?.id,
      ownerId: profiles.owner?.id,
      adminId: profiles.admin?.id,
    },
  };

  const accessToken = generateAccessToken(jwtPayload);
  const refreshToken = generateRefreshToken(updatedAccount.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      account_id: updatedAccount.id,
      expires_at: getRefreshExpiryDate(),
    },
  });

  return {
    user: {
      ...updatedAccount,
      roles,
      profiles,
    },
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

  if (!user.email_verified) {
    throw new UnauthorizedError(
      "Account has not been activated. Please check your email."
    );
  }

  //fetch roles và profiles
  const { roles, profiles } = await getUserRolesAndProfiles(user.id);
  console.log(roles, profiles);
  //tạo payload cho jwt
  const jwtPayload: JwtPayload = {
    accountId: user.id,
    roles: roles as any,
    profiles: {
      playerId: profiles.player?.id,
      ownerId: profiles.owner?.id,
      adminId: profiles.admin?.id,
    },
  };

  const accessToken = generateAccessToken(jwtPayload);
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
      roles,
      profiles,
    },
    accessToken,
    refreshToken,
  };
};

export const logOut = async (refreshToken: string) => {
  const storedToken = await prisma.refreshToken.findUnique({
    where: {
      token: refreshToken,
    },
  });

  if (!storedToken) {
    throw new UnauthorizedError("Invalid refresh token");
  }
  return await prisma.refreshToken.delete({
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

  //fetch roles và profiles
  const { roles, profiles } = await getUserRolesAndProfiles(
    storedToken.account_id
  );

  //tạo payload cho jwt
  const jwtPayload: JwtPayload = {
    accountId: storedToken.account_id,
    roles: roles as any,
    profiles: {
      playerId: profiles.player?.id,
      ownerId: profiles.owner?.id,
      adminId: profiles.admin?.id,
    },
  };

  const accessToken = generateAccessToken(jwtPayload);
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
