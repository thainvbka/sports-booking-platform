import jwt from "jsonwebtoken";
import { config } from "../configs";

export interface JwtPayload {
  accountId: string;
  roles: ("PLAYER" | "OWNER" | "ADMIN")[];
  profiles: {
    playerId?: string;
    ownerId?: string;
    adminId?: string;
  };
}

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRATION,
  });
};
export const generateRefreshToken = (accountId: string): string => {
  return jwt.sign({ accountId }, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRATION,
  });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.JWT_ACCESS_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET);
};
