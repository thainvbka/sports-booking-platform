import { prisma } from "@sports-booking-platform/db";
import {
  ConflictRequestError,
  UnauthorizedError,
} from "../../utils/error.response";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../../libs/jwt";
import { getAccessExpiryDate, getRefreshExpiryDate } from "../../helpers";

export const signUp = async (userData: any) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: userData.email }, { phone_number: userData.phone_number }],
    },
  });

  if (existingUser) {
    throw new ConflictRequestError("Email or phone number already exists");
  }

  const hashPassword = await bcrypt.hash(userData.password_hash, 10);

  const newUser = await prisma.user.create({
    data: {
      ...userData,
      password_hash: hashPassword,
    },
    select: {
      id: true,
      email: true,
      phone_number: true,
      full_name: true,
    },
  });

  const accessToken = generateAccessToken(newUser.id);
  const refreshToken = generateRefreshToken(newUser.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      user_id: newUser.id,
      expires_at: getRefreshExpiryDate(),
    },
  });

  return {
    user: newUser,
    accessToken,
    refreshToken,
  };
};

export const logIn = async (email: string, password_hash: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ConflictRequestError("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(
    password_hash,
    user.password_hash
  );

  if (!isPasswordValid) {
    throw new ConflictRequestError("Invalid email or password");
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      user_id: user.id,
      expires_at: getRefreshExpiryDate(),
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone_number: user.phone_number,
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

  const accessToken = generateAccessToken(storedToken.user_id);
  const newRefreshToken = generateRefreshToken(storedToken.user_id);
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
        user_id: storedToken.user_id,
        expires_at: newExpiry,
      },
    }),
  ]);

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};
