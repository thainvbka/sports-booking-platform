import { Response } from "express";
import { config } from "../configs";

export const cookieOptions = {
  httpOnly: true,
  secure: config.NODE_ENV === "production",
  sameSite: "strict" as const,
};

export const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie("refreshToken", token, cookieOptions);
};

export const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie("refreshToken", cookieOptions);
};
