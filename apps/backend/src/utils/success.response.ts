import { statusCodes, reasonPhrases } from "../configs";

interface SuccessResponse {
  message?: string;
  status: number;
  reason: string;
  metaData?: any;
}

function successResponse(
  message?: string,
  status?: number,
  reason?: string,
  metaData?: any
): SuccessResponse {
  const response: SuccessResponse = {
    message: message ? message : reason,
    status: status ? status : statusCodes.OK,
    reason: reason ? reason : reasonPhrases.OK,
  };
  if (metaData) {
    response.metaData = metaData;
  }
  return response;
}

export function OK(
  message?: string,
  status = statusCodes.OK,
  reason = reasonPhrases.OK,
  metaData?: any
) {
  return successResponse(message, status, reason, metaData);
}

export function Created(
  message?: string,
  status = statusCodes.CREATED,
  reason = reasonPhrases.CREATED,
  metaData?: any
) {
  return successResponse(message, status, reason, metaData);
}
