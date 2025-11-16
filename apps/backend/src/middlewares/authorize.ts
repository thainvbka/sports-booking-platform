import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../utils/error.response";

const authorize = (allowedRoles: ("PLAYER" | "OWNER" | "ADMIN")[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      throw new ForbiddenError("Access denied");
    }

    const hasRole = user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      throw new ForbiddenError(
        "You do not have permission to access this resource"
      );
    }

    next();
  };
};

export default authorize;
