import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { reasonPhrases, statusCodes } from "../configs";

const getReasonByStatus = (status: number): string => {
  const matchedKey = Object.entries(statusCodes).find(
    ([, value]) => value === status,
  )?.[0] as keyof typeof reasonPhrases | undefined;

  if (!matchedKey) return reasonPhrases.INTERNAL_SERVER_ERROR;
  return reasonPhrases[matchedKey] ?? reasonPhrases.INTERNAL_SERVER_ERROR;
};

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Xử lý lỗi từ Zod (lỗi xác thực)
  if (err instanceof ZodError) {
    return res.status(statusCodes.BAD_REQUEST).json({
      success: false,
      status: statusCodes.BAD_REQUEST,
      code: statusCodes.BAD_REQUEST,
      reason: reasonPhrases.BAD_REQUEST,
      message: "Invalid input data",
      data: null,
      errors: err.issues,
    });
  }

  // Xử lý các lỗi khác
  const status = (err as any)?.status ?? 500;
  const message = (err as any)?.message ?? "Internal Server Error";
  const reason = getReasonByStatus(status);

  return res.status(status).json({
    success: false,
    status,
    code: status,
    reason,
    message,
    data: null,
  });
};

export default errorHandler;
