import { statusCodes, reasonPhrases } from "../configs";
import { Response } from "express";

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
    if (data) {
      this.data = data;
    }
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public send(res: Response) {
    return res.status(this.status).json({
      message: this.message,
      reason: this.reason,
      data: this.data,
    });
  }
}

export class CREATED extends SuccessResponse {
  constructor(options: SuccessResponseOptions = {}) {
    super({
      ...options,
      status: statusCodes.CREATED,
      reason: reasonPhrases.CREATED,
    });
  }
}
