import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/error.response";
import { ZodError, ZodTypeAny } from "zod";

// Middleware này nhận một schema Zod làm đối số
export const validate =
  (schema: ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse và xác thực request body, params, và query
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      if ((parsed as any).body) req.body = (parsed as any).body;
      if ((parsed as any).query) req.query = (parsed as any).query as any;
      if ((parsed as any).params) req.params = (parsed as any).params as any;
      return next();
    } catch (error) {
      if (error instanceof ZodError) return next(error);
      next(error as any);
    }
  };
