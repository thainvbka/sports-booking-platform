import { Router } from "express";
import asyncHandler from "../../utils/asyncHandler";
import authenticate from "../../middlewares/authenticate";
import authorize from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import {
  createBookingSchema,
  createRecurringBookingSchema,
} from "@sports-booking-platform/validation";
import {
  createBookingController,
  reviewBookingController,
  updateBookingController,
  cancelBookingController,
  createRecurringBookingController,
  reviewRecurringBookingController,
  getPlayerBookingsController,
} from "../../controllers/v1/booking.controller";

const router = Router();

/**
 * BOOKING Routes
 */
router.post(
  "/:id", //subfieldId
  authenticate,
  authorize(["PLAYER"]),
  validate(createBookingSchema),
  asyncHandler(createBookingController)
);

router.get(
  "/", //get all bookings of the player
  authenticate,
  authorize(["PLAYER"]),
  asyncHandler(getPlayerBookingsController)
);

router.get(
  "/review/:id", //bookingId
  authenticate,
  authorize(["PLAYER"]),
  asyncHandler(reviewBookingController)
);

router.put(
  "/:id", //bookingId
  authenticate,
  authorize(["PLAYER"]),
  validate(createBookingSchema),
  asyncHandler(updateBookingController)
);

router.delete(
  "/:id", //bookingId
  authenticate,
  authorize(["PLAYER"]),
  asyncHandler(cancelBookingController)
);

//recurring booking routes
router.post(
  "/recurring/:id", //subfieldId
  authenticate,
  authorize(["PLAYER"]),
  validate(createRecurringBookingSchema),
  asyncHandler(createRecurringBookingController)
);

router.get(
  "/recurring/review/:id", // recurringBookingId
  authenticate,
  authorize(["PLAYER"]),
  asyncHandler(reviewRecurringBookingController)
);

export default router;
