import { prisma, Prisma } from "@sports-booking-platform/db";
import {
  ConflictRequestError,
  UnauthorizedError,
  InternalServerError,
  BadRequestError,
} from "../../utils/error.response";
import { JwtPayload } from "../../libs/jwt";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../../libs/jwt";
import { getAccessExpiryDate, getRefreshExpiryDate } from "../../helpers";
import { registerInput } from "@sports-booking-platform/validation";
import { addRoleInput } from "@sports-booking-platform/validation";
import { getUserRolesAndProfiles } from "../../helpers";
import { sendActivationEmail, sendResetPasswordEmail } from "../../libs/mailer";
import crypto from "crypto";

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
      throw new InternalServerError("Dữ liệu không hợp lệ cho vai trò OWNER");
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
    throw new ConflictRequestError("Email hoặc số điện thoại đã được sử dụng");
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
        `Tạo vai trò cho '${userData.role}' chưa được triển khai.`
      );
    }

    await createRoleAccount(tx, account.id, userData);
    return account;
  });

  //gửi email xác thực
  sendActivationEmail(newUser.email, verificationToken).catch((error) => {
    console.error(`Gửi email kích hoạt đến ${newUser.email} thất bại: `, error);
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
    throw new ConflictRequestError("Mã xác thực không hợp lệ hoặc đã hết hạn");
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
    throw new ConflictRequestError("Email hoặc mật khẩu không đúng");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ConflictRequestError("Email hoặc mật khẩu không đúng");
  }

  if (!user.email_verified) {
    throw new UnauthorizedError(
      "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email của bạn."
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
    throw new UnauthorizedError("Refresh token không hợp lệ");
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
    throw new UnauthorizedError("Refresh token không hợp lệ");
  }

  if (storedToken.expires_at < new Date()) {
    throw new UnauthorizedError("Refresh token đã hết hạn");
  }
  if (storedToken.revoked) {
    throw new UnauthorizedError("Refresh token đã bị thu hồi");
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

export const forgotPassword = async (email: string) => {
  //check tồn tại email đã đăng ký
  const account = await prisma.account.findUnique({
    where: {
      email,
      email_verified: true,
    },
    select: {
      email: true,
    },
  });
  if (!account) {
    throw new ConflictRequestError(
      "Email chưa được đăng ký hoặc chưa được kích hoạt"
    );
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // Hết hạn sau 15 phút

  await prisma.account.update({
    where: {
      email,
    },
    data: {
      reset_password_token: resetToken,
      reset_password_expires_at: tokenExpiry,
    },
  });

  //gửi email chứa link reset password
  sendResetPasswordEmail(email, resetToken).catch((error) => {
    console.error(`Gửi email đặt lại mật khẩu đến ${email} thất bại: `, error);
  });

  return { message: "Đã gửi email đặt lại mật khẩu." };
};

export const resetPassword = async (token: string, new_password: string) => {
  const account = await prisma.account.findFirst({
    where: {
      reset_password_token: token,
      reset_password_expires_at: {
        gt: new Date(),
      },
    },
  });

  if (!account) {
    throw new BadRequestError(
      "Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn"
    );
  }

  const hashPassword = await bcrypt.hash(new_password, 10);

  await prisma.account.update({
    where: {
      id: account.id,
    },
    data: {
      password: hashPassword,
      reset_password_token: null,
      reset_password_expires_at: null,
    },
  });

  return { message: "Đặt lại mật khẩu thành công." };
};

export const getCurrentUser = async (accountId: string) => {
  const account = await prisma.account.findUnique({
    where: {
      id: accountId,
    },
    select: {
      id: true,
      email: true,
      full_name: true,
      phone_number: true,
      avatar: true,
    },
  });

  if (!account) {
    throw new UnauthorizedError("Tài khoản không tồn tại");
  }

  const { roles, profiles } = await getUserRolesAndProfiles(accountId);

  return {
    id: account.id,
    email: account.email,
    full_name: account.full_name,
    phone_number: account.phone_number,
    avatar: account.avatar,
    roles,
    profiles,
  };
};
