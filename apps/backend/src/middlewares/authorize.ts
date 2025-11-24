import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../utils/error.response";

const authorize = (allowedRoles: ("PLAYER" | "OWNER" | "ADMIN")[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log("--- DEBUG AUTHORIZE ---");
    console.log("Method:", req.method);
    console.log("URL:", req.originalUrl);
    console.log("User Roles:", req.user?.roles);
    console.log("Required Roles:", allowedRoles);
    console.log("-----------------------");
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
