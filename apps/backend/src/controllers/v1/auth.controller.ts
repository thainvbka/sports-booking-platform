import { Request, Response } from "express";
import {
  signUp,
  logIn,
  logOut,
  handlerRefreshToken,
} from "../../services/v1/auth.service";
import { Created, SuccessResponse } from "../../utils/success.response";
import { config } from "../../configs";

export const signupController = async (req: Request, res: Response) => {
  const userData = req.body;
  const data = await signUp(userData);

  res.cookie("refreshToken", data.refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "strict",
  });

  return new Created({
    message: "User created successfully",
    data: {
      user: data.user,
      accessToken: data.accessToken,
    },
  }).send(res);
};

export const loginController = async (req: Request, res: Response) => {
  const { email, password_hash } = req.body;
  const data = await logIn(email, password_hash);
  res.cookie("refreshToken", data.refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "strict",
  });
  return new Created({
    message: "User logged in successfully",
    data: {
      user: data.user,
      accessToken: data.accessToken,
    },
  }).send(res);
};

export const logoutController = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken as string;
  await logOut(refreshToken);
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "strict",
  });
  return new SuccessResponse({
    message: "User logged out successfully",
  }).send(res);
};

export const refreshTokenController = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken as string;
  const data = await handlerRefreshToken(refreshToken);
  res.cookie("refreshToken", data.refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "strict",
  });
  return new SuccessResponse({
    message: "Token refreshed successfully",
    data: {
      accessToken: data.accessToken,
    },
  }).send(res);
};
