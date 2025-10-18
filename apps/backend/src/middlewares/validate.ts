import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/error.response";
import { ZodError, ZodTypeAny } from "zod";

// Middleware này nhận một schema Zod làm đối số
export const validate =
  (schema: ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse và xác thực request body, params, và query
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Invalid input data",
          error,
        });
      }
      next(error);
    }
  };
