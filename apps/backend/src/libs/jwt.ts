import jwt from "jsonwebtoken";
import { config } from "../configs";
import { verify } from "crypto";

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRATION,
  });
};
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRATION,
  });
};

export const verifyAccessToken = (token: string): jwt.JwtPayload => {
  return jwt.verify(token, config.JWT_ACCESS_SECRET) as jwt.JwtPayload;
};

export const verifyRefreshToken = (token: string): jwt.JwtPayload => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as jwt.JwtPayload;
};
