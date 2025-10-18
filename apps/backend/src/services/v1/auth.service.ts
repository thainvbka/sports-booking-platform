import { prisma } from "@sports-booking-platform/db";
import { ConflictRequestError } from "../../utils/error.response";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../../libs/jwt";
import { config } from "../../configs";

export const signup = async (userData: any) => {
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
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return {
    user: newUser,
    accessToken,
    refreshToken,
  };
};
