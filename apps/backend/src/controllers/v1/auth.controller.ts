import { Request, Response } from "express";
import { signUp, logIn, logOut } from "../../services/v1/auth.service";
import { Created, SuccessResponse } from "../../utils/success.response";

export const signupController = async (req: Request, res: Response) => {
  const userData = req.body;
  const data = await signUp(userData);
  return new Created({
    message: "User created successfully",
    data: data,
  }).send(res);
};

export const loginController = async (req: Request, res: Response) => {
  const { email, password_hash } = req.body;
  const data = await logIn(email, password_hash);
  return new Created({
    message: "User logged in successfully",
    data: data,
  }).send(res);
};

export const logoutController = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  await logOut(refreshToken);
  return new SuccessResponse({
    message: "User logged out successfully",
  }).send(res);
};
