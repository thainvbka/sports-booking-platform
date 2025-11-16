import * as express from "express";
import { JwtPayload } from "../../libs/jwt";

declare global {
  namespace Express {
    export interface Request {
      user?: JwtPayload;
    }
  }
}
