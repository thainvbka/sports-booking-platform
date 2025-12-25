import { Request, Response } from "express";
import { SuccessResponse } from "../../utils/success.response";
import {
  createBooking,
  reviewBooking,
  updateBooking,
  cancelBooking,
} from "../../services/v1/booking.service";

export const createBookingController = async (req: Request, res: Response) => {
  const data = req.body; // { base_price, start_time, end_time,}
  const sub_field_id = req.params.id; // subfield id
  const booking = await createBooking(
    req.user?.profiles.playerId as string,
    data,
    sub_field_id
  );
  return new SuccessResponse({
    message: "Booking created successfully",
    data: { booking },
  }).send(res);
};

export const reviewBookingController = async (req: Request, res: Response) => {
  const booking_id = req.params.id;
  const booking = await reviewBooking(
    booking_id,
    req.user?.profiles.playerId as string
  );
  return new SuccessResponse({
    message: "Booking reviewed successfully",
    data: { booking },
  }).send(res);
};

export const updateBookingController = async (req: Request, res: Response) => {
  const booking_id = req.params.id;
  const data = req.body;
  const booking = await updateBooking(
    req.user?.profiles.playerId as string,
    data,
    booking_id
  );
  return new SuccessResponse({
    message: "Booking updated successfully",
    data: { booking },
  }).send(res);
};

export const cancelBookingController = async (req: Request, res: Response) => {
  const booking_id = req.params.id;
  await cancelBooking(booking_id, req.user?.profiles.playerId as string);
  return new SuccessResponse({
    message: "Booking canceled successfully",
    data: {},
  }).send(res);
};
