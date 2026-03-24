import { NextFunction, Request, Response } from "express";
import { JwtPayload, verifyAccessToken } from "../libs/jwt";
import { UnauthorizedError } from "../utils/error.response";

const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Access denied, no token provided");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyAccessToken(token) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    throw new UnauthorizedError("Invalid or expired token");
  }
};

export default authenticate;
