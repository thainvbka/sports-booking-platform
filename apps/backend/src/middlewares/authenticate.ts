import { verifyAccessToken } from "../libs/jwt";
import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../utils/error.response";

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Access denied, no token provided");
  }

  const token = authHeader.split(" ")[1];

  const decoded = verifyAccessToken(token) as { userId: string };

  if (!decoded) {
    throw new UnauthorizedError("Invalid or expired token");
  }
  req.userId = decoded.userId;
  next();
};

export default authenticate;
