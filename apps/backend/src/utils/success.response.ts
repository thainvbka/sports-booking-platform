import { Response } from "express";
import { reasonPhrases, statusCodes } from "../configs";

type SuccessResponseOptions = {
  message?: string;
  status?: number;
  reason?: string;
  data?: any;
};

export class SuccessResponse {
  public status: number;
  public message: string;
  public reason: string;
  public data?: any;

  constructor({
    message = reasonPhrases.OK,
    status = statusCodes.OK,
    reason = reasonPhrases.OK,
    data,
  }: SuccessResponseOptions = {}) {
    this.message = message;
    this.status = status;
    this.reason = reason;
    if (data !== undefined) {
      this.data = data;
    }
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public send(res: Response) {
    return res.status(this.status).json({
      success: true,
      status: this.status,
      code: this.status,
      message: this.message,
      reason: this.reason,
      data: this.data ?? null,
    });
  }
}

export class Created extends SuccessResponse {
  constructor(options: SuccessResponseOptions = {}) {
    super({
      ...options,
      status: statusCodes.CREATED,
      reason: reasonPhrases.CREATED,
    });
  }
}
