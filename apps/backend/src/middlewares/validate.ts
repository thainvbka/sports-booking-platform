import { NextFunction, Request, Response } from "express";
import { ZodError, ZodTypeAny } from "zod";

// Middleware này nhận một schema Zod làm đối số
export const validate =
  (schema: ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("=== VALIDATION DEBUG ===");
      console.log("req.body:", req.body);
      console.log("req.params:", req.params);

      // Parse và xác thực request body, params, và query
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if ((parsed as any).body) req.body = (parsed as any).body;
      if ((parsed as any).query) {
        Object.defineProperty(req, "query", {
          value: (parsed as any).query,
          writable: true,
          configurable: true,
        });
      }
      if ((parsed as any).params) {
        Object.defineProperty(req, "params", {
          value: (parsed as any).params,
          writable: true,
          configurable: true,
        });
      }
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("=== VALIDATION ERROR ===");
        console.error("Errors:", JSON.stringify(error.issues, null, 2));
        return next(error);
      }
      console.error("=== VALIDATION UNEXPECTED ERROR ===", error);
      next(error as any);
    }
  };
