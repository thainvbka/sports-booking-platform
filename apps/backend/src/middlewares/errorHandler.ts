import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Xử lý lỗi từ Zod (lỗi xác thực)
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Invalid input data",
      issue: err.issues,
    });
  }

  // Xử lý các lỗi khác
  const status = (err as any)?.status ?? 500;
  const message = (err as any)?.message ?? "Internal Server Error";

  return res.status(status).json({
    code: status,
    message: message,
  });
};

export default errorHandler;
