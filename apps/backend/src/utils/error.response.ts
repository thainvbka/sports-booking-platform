import { statusCodes, reasonPhrases } from "../configs";

interface ErrorResponse {
  name: string;
  status: number;
  message: string;
}

function errorResponse(
  name: string,
  message: string,
  status: number
): ErrorResponse {
  const error = new Error() as ErrorResponse;
  error.name = name;
  error.message = message;
  error.status = status;
  return error;
}

export function ConflictRequestError(
  message = reasonPhrases.CONFLICT,
  status = statusCodes.CONFLICT
) {
  return errorResponse("ConflictRequestError", message, status);
}

export function BadRequestError(
  message = reasonPhrases.BAD_REQUEST,
  status = statusCodes.BAD_REQUEST
) {
  return errorResponse("BadRequestError", message, status);
}

export function AuthFailureError(
  message = reasonPhrases.UNAUTHORIZED,
  status = statusCodes.UNAUTHORIZED
) {
  return errorResponse("AuthFailureError", message, status);
}

export function NotFoundError(
  message = reasonPhrases.NOT_FOUND,
  status = statusCodes.NOT_FOUND
) {
  return errorResponse("NotFoundError", message, status);
}

export function ForbiddenError(
  message = reasonPhrases.FORBIDDEN,
  status = statusCodes.FORBIDDEN
) {
  return errorResponse("ForbiddenError", message, status);
}
