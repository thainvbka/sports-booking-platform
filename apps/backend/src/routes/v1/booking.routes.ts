import { Router } from "express";
import asyncHandler from "../../utils/asyncHandler";
import authenticate from "../../middlewares/authenticate";
import authorize from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import { createBookingSchema } from "@sports-booking-platform/validation";
import {
  createBookingController,
  reviewBookingController,
  updateBookingController,
  cancelBookingController,
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

export default router;
