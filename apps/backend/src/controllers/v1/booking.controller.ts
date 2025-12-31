import { Request, Response } from "express";
import { SuccessResponse } from "../../utils/success.response";
import {
  createBooking,
  reviewBooking,
  updateBooking,
  cancelBooking,
  getPlayerBookings,
  ownerCancelBooking,
  ownerConfirmBooking,
  ownerGetAllBookings,
  ownerGetBookingById,
  getOwnerBookingStats,
} from "../../services/v1/booking.service";
import type { filter } from "../../services/v1/booking.service";
import { ownerBookingFilterSchema } from "@sports-booking-platform/validation";

import {
  createRecurringBookingService,
  reviewRecurringBookingService,
} from "../../services/v1/recurring_booking.service";

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

//player thể hủy booking
export const cancelBookingController = async (req: Request, res: Response) => {
  const booking_id = req.params.id;
  await cancelBooking(booking_id, req.user?.profiles.playerId as string);
  return new SuccessResponse({
    message: "Booking canceled successfully",
    data: {},
  }).send(res);
};

// Recurring booking controllers
export const createRecurringBookingController = async (
  req: Request,
  res: Response
) => {
  const data = req.body; // { start_time, end_time, start_date, end_date, recurring_type }
  const sub_field_id = req.params.id; // subfield id
  const recurringBooking = await createRecurringBookingService(
    req.user?.profiles.playerId as string,
    data,
    sub_field_id
  );
  return new SuccessResponse({
    message: "Recurring booking created successfully",
    data: { recurringBooking },
  }).send(res);
};

export const reviewRecurringBookingController = async (
  req: Request,
  res: Response
) => {
  const booking_id = req.params.id; // recurringBookingId
  const result = await reviewRecurringBookingService(
    booking_id,
    req.user?.profiles.playerId as string
  );
  return new SuccessResponse({
    message: "Recurring booking reviewed successfully",
    data: result,
  }).send(res);
};

export const getPlayerBookingsController = async (
  req: Request,
  res: Response
) => {
  const playerId = req.user?.profiles.playerId as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;
  const result = await getPlayerBookings(playerId, page, limit);
  return new SuccessResponse({
    message: "Player bookings retrieved successfully",
    data: result,
  }).send(res);
};

//owner
export const ownerConfirmBookingController = async (
  req: Request,
  res: Response
) => {
  const booking_id = req.params.id;
  const ownerId = req.user?.profiles.ownerId as string;
  const result = await ownerConfirmBooking(booking_id, ownerId);
  return new SuccessResponse({
    message: "Booking confirmed successfully",
    data: result,
  }).send(res);
};

export const ownerCancelBookingController = async (
  req: Request,
  res: Response
) => {
  const booking_id = req.params.id;
  const ownerId = req.user?.profiles.ownerId as string;
  const result = await ownerCancelBooking(booking_id, ownerId);
  return new SuccessResponse({
    message: "Booking canceled successfully",
    data: result,
  }).send(res);
};

export const ownerGetAllBookingsController = async (
  req: Request,
  res: Response
) => {
  const ownerId = req.user?.profiles.ownerId as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;

  // Parse and validate filter using Zod schema
  let filterParams: filter = {};

  if (req.query.filter) {
    const parsedFilter = JSON.parse(req.query.filter as string);
    // Validate with Zod schema
    const validatedFilter = ownerBookingFilterSchema.parse(parsedFilter);

    // Convert to service filter format
    filterParams = {
      search: validatedFilter.search,
      status: validatedFilter.status as any,
      start_date: validatedFilter.start_date,
      end_date: validatedFilter.end_date,
      min_price: validatedFilter.min_price,
      max_price: validatedFilter.max_price,
    };
  }

  const result = await ownerGetAllBookings(ownerId, page, limit, filterParams);
  return new SuccessResponse({
    message: "Owner bookings retrieved successfully",
    data: result,
  }).send(res);
};

//owner get booking by id
export const ownerGetBookingByIdController = async (
  req: Request,
  res: Response
) => {
  const owner_id = req.user?.profiles.ownerId as string;
  const booking_id = req.params.id;
  const booking = await ownerGetBookingById(booking_id, owner_id);
  return new SuccessResponse({
    message: "Owner booking retrieved successfully",
    data: { booking },
  }).send(res);
};

//owner get booking stats
export const ownerGetBookingStatsController = async (
  req: Request,
  res: Response
) => {
  const owner_id = req.user?.profiles.ownerId as string;
  const stats = await getOwnerBookingStats(owner_id);
  return new SuccessResponse({
    message: "Owner booking stats retrieved successfully",
    data: stats,
  }).send(res);
};

