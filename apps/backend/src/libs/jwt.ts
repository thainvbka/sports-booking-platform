import jwt from "jsonwebtoken";
import { config } from "../configs";

export const generateAccessToken = (accountId: string): string => {
  return jwt.sign({ accountId }, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRATION,
  });
};
export const generateRefreshToken = (accountId: string): string => {
  return jwt.sign({ accountId }, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRATION,
  });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, config.JWT_ACCESS_SECRET);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET);
};
