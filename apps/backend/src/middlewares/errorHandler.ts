import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { reasonPhrases, statusCodes } from "../configs";
import { ErrorResponse } from "../utils/error.response";

const getReasonByStatus = (status: number): string => {
  const matchedKey = Object.entries(statusCodes).find(
    ([, value]) => value === status,
  )?.[0] as keyof typeof reasonPhrases | undefined;

  if (!matchedKey) return reasonPhrases.INTERNAL_SERVER_ERROR;
  return reasonPhrases[matchedKey] ?? reasonPhrases.INTERNAL_SERVER_ERROR;
};

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(statusCodes.BAD_REQUEST).json({
      success: false,
      status: statusCodes.BAD_REQUEST,
      code: statusCodes.BAD_REQUEST,
      reason: reasonPhrases.BAD_REQUEST,
      message: "Invalid input data",
      errors: err.issues,
    });
  }

  let status = 500;
  let message = "Internal Server Error";

  if (err instanceof ErrorResponse) {
    status = err.status;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  const reason = getReasonByStatus(status);

  return res.status(status).json({
    success: false,
    status,
    code: status,
    reason,
    message,
  });
};

export default errorHandler;
