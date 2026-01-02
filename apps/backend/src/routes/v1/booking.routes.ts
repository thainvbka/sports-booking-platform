import { Router } from "express";
import asyncHandler from "../../utils/asyncHandler";
import authenticate from "../../middlewares/authenticate";
import authorize from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import {
  createBookingSchema,
  createRecurringBookingSchema,
  confirmBookingSchema,
  ownerCancelBookingSchema,
  ownerGetBookingsQuerySchema,
} from "@sports-booking-platform/validation";
import {
  createBookingController,
  reviewBookingController,
  updateBookingController,
  cancelBookingController,
  createRecurringBookingController,
  reviewRecurringBookingController,
  getPlayerBookingsController,
  ownerConfirmBookingController,
  ownerCancelBookingController,
  ownerGetAllBookingsController,
  ownerGetBookingByIdController,
  ownerGetBookingStatsController,
  cancelRecurringBookingController,
  ownerConfirmRecurringBookingController,
  ownerCancelRecurringBookingController,
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

router.patch(
  "/:id", //bookingId
  authenticate,
  authorize(["PLAYER"]),
  asyncHandler(cancelBookingController)
);

router.patch(
  "/recurring/:id", //recurringBookingId
  authenticate,
  authorize(["PLAYER"]),
  asyncHandler(cancelRecurringBookingController)
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

//owner confirm booking
router.patch(
  "/confirm/:id", //bookingId
  authenticate,
  authorize(["OWNER"]),
  validate(confirmBookingSchema),
  asyncHandler(ownerConfirmBookingController)
);

//owner confirm recurring booking
router.patch(
  "/recurring/confirm/:id", //recurringBookingId
  authenticate,
  authorize(["OWNER"]),
  validate(confirmBookingSchema),
  asyncHandler(ownerConfirmRecurringBookingController)
);

//owner cancel booking
router.patch(
  "/cancel/:id", //bookingId
  authenticate,
  authorize(["OWNER"]),
  validate(ownerCancelBookingSchema),
  asyncHandler(ownerCancelBookingController)
);

//owner cancel recurring booking
router.patch(
  "/recurring/cancel/:id", //recurringBookingId
  authenticate,
  authorize(["OWNER"]),
  validate(ownerCancelBookingSchema),
  asyncHandler(ownerCancelRecurringBookingController)
);

//owner get booking stats
router.get(
  "/stats", //owner booking stats
  authenticate,
  authorize(["OWNER"]),
  asyncHandler(ownerGetBookingStatsController)
);
//owner get all bookings of his complex
router.get(
  "/all", //owner bookings
  authenticate,
  authorize(["OWNER"]),
  validate(ownerGetBookingsQuerySchema),
  asyncHandler(ownerGetAllBookingsController)
);

export default router;
