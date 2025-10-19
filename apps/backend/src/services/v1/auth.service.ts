import { prisma } from "@sports-booking-platform/db";
import { ConflictRequestError } from "../../utils/error.response";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../../libs/jwt";

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
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
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
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
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
