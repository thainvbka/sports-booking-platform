import { Request, Response } from "express";
import {
  signUp,
  verifyEmail,
  logIn,
  logOut,
  handlerRefreshToken,
  forgotPassword,
  resetPassword,
} from "../../services/v1/auth.service";
import { Created, SuccessResponse } from "../../utils/success.response";
import { config } from "../../configs";

export const signupController = async (req: Request, res: Response) => {
  const userData = req.body;
  const data = await signUp(userData);

  // res.cookie("refreshToken", data.refreshToken, {
  //   httpOnly: true,
  //   secure: config.NODE_ENV === "production",
  //   sameSite: "strict",
  // });

  return new Created({
    message: "User created successfully",
    data: {
      // user: data.user,
      // accessToken: data.accessToken,
      needVerify: data.needVerify,
    },
  }).send(res);
};

export const verifyEmailController = async (req: Request, res: Response) => {
  const { token } = req.params as { token: string };
  const data = await verifyEmail(token);

  res.cookie("refreshToken", data.refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "strict",
  });

  return new SuccessResponse({
    message: "Email verified successfully",
    data: {
      user: data.user,
      accessToken: data.accessToken,
    },
  }).send(res);
};

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const data = await logIn(email, password);
  res.cookie("refreshToken", data.refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "strict",
  });
  return new SuccessResponse({
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

export const forgotPasswordController = async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await forgotPassword(email);
  return new SuccessResponse({
    message: "Password reset link sent to email successfully",
    data: result,
  }).send(res);
};

export const resetPasswordController = async (req: Request, res: Response) => {
  const { new_password } = req.body;
  const { token } = req.params as { token: string };
  const result = await resetPassword(token, new_password);
  return new SuccessResponse({
    message: "Password reset successfully",
    data: result,
  }).send(res);
};
