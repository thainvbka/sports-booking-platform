import { Router } from "express";
import {
  acceptMatchParticipantController,
  cancelMatchController,
  closeMatchController,
  createMatchController,
  getMatchParticipantsController,
  getMyMatchesController,
  joinMatchController,
  leaveMatchController,
  rejectMatchParticipantController,
  reopenMatchController,
} from "../../controllers/v1/match.controller";
import authenticate from "../../middlewares/authenticate";
import authorize from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import asyncHandler from "../../utils/asyncHandler";
import {
  createMatchSchema,
  getMatchParticipantsQuerySchema,
  getMyMatchesQuerySchema,
  joinMatchSchema,
  matchIdParamSchema,
  participantActionSchema,
} from "../../validations";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(["PLAYER"]),
  validate(createMatchSchema),
  asyncHandler(createMatchController),
);

router.get(
  "/me",
  authenticate,
  authorize(["PLAYER"]),
  validate(getMyMatchesQuerySchema),
  asyncHandler(getMyMatchesController),
);

router.post(
  "/:id/join",
  authenticate,
  authorize(["PLAYER"]),
  validate(joinMatchSchema),
  asyncHandler(joinMatchController),
);

router.delete(
  "/:id/join",
  authenticate,
  authorize(["PLAYER"]),
  validate(matchIdParamSchema),
  asyncHandler(leaveMatchController),
);

router.get(
  "/:id/participants",
  authenticate,
  authorize(["PLAYER"]),
  validate(getMatchParticipantsQuerySchema),
  asyncHandler(getMatchParticipantsController),
);

router.patch(
  "/:id/participants/:participantId/accept",
  authenticate,
  authorize(["PLAYER"]),
  validate(participantActionSchema),
  asyncHandler(acceptMatchParticipantController),
);

router.patch(
  "/:id/participants/:participantId/reject",
  authenticate,
  authorize(["PLAYER"]),
  validate(participantActionSchema),
  asyncHandler(rejectMatchParticipantController),
);

router.patch(
  "/:id/close",
  authenticate,
  authorize(["PLAYER"]),
  validate(matchIdParamSchema),
  asyncHandler(closeMatchController),
);

router.patch(
  "/:id/reopen",
  authenticate,
  authorize(["PLAYER"]),
  validate(matchIdParamSchema),
  asyncHandler(reopenMatchController),
);

router.patch(
  "/:id/cancel",
  authenticate,
  authorize(["PLAYER"]),
  validate(matchIdParamSchema),
  asyncHandler(cancelMatchController),
);

export default router;
