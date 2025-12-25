import { Router } from "express";
import asyncHandler from "../../utils/asyncHandler";
import authenticate from "../../middlewares/authenticate";
import authorize from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import { createBookingSchema } from "@sports-booking-platform/validation";
import {
  createBookingController,
  reviewBookingController,
} from "../../controllers/v1/booking.controller";

const router = Router();

/**
 * BOOKING Routes
 */
router.post(
  "/:id", //subfieldId
  authenticate,
  authorize(["PLAYER", "ADMIN"]),
  validate(createBookingSchema),
  asyncHandler(createBookingController)
);

router.get(
  "/review/:id", //bookingId
  authenticate,
  authorize(["PLAYER", "ADMIN"]),
  asyncHandler(reviewBookingController)
);
export default router;
