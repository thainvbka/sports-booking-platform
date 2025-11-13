import { statusCodes, reasonPhrases } from "../configs";

export class ErrorResponse extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ConflictRequestError extends ErrorResponse {
  constructor(message = reasonPhrases.CONFLICT, status = statusCodes.CONFLICT) {
    super(message, status);
  }
}

export class BadRequestError extends ErrorResponse {
  constructor(
    message = reasonPhrases.BAD_REQUEST,
    status = statusCodes.BAD_REQUEST
  ) {
    super(message, status);
  }
}
export class NotFoundError extends ErrorResponse {
  constructor(
    message = reasonPhrases.NOT_FOUND,
    status = statusCodes.NOT_FOUND
  ) {
    super(message, status);
  }
}

export class UnauthorizedError extends ErrorResponse {
  constructor(
    message = reasonPhrases.UNAUTHORIZED,
    status = statusCodes.UNAUTHORIZED
  ) {
    super(message, status);
  }
}

export class ForbiddenError extends ErrorResponse {
  constructor(
    message = reasonPhrases.FORBIDDEN,
    status = statusCodes.FORBIDDEN
  ) {
    super(message, status);
  }
}

export class InternalServerError extends ErrorResponse {
  constructor(
    message = reasonPhrases.INTERNAL_SERVER_ERROR,
    status = statusCodes.INTERNAL_SERVER_ERROR
  ) {
    super(message, status);
  }
}
