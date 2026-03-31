import { Request, Response } from "express";
import {
  createReview,
  deleteReview,
  getSubfieldReviews,
  ownerDeleteReview,
  updateReview,
} from "../../services/v1/review.service";
import { SuccessResponse } from "../../utils/success.response";
import { reviewQuerySchema } from "../../validations";

/**
 * Player creates a review
 */
export const createReviewController = async (req: Request, res: Response) => {
  const playerId = req.user?.profiles.playerId as string;

  // Xử lý files theo kiểu object (fields) giống Complex
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const images = files?.images?.map((file) => file.path) || [];

  const review = await createReview(playerId, {
    ...req.body,
    images,
  });

  return new SuccessResponse({
    message: "Review created successfully",
    data: { review },
  }).send(res);
};

/**
 * Player updates their own review
 */
export const updateReviewController = async (req: Request, res: Response) => {
  const playerId = req.user?.profiles.playerId as string;
  const reviewId = req.params.id as string;

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const images = files?.images
    ? files.images.map((file) => file.path)
    : undefined;

  const review = await updateReview(reviewId, playerId, {
    ...req.body,
    images,
  });

  return new SuccessResponse({
    message: "Review updated successfully",
    data: { review },
  }).send(res);
};

/**
 * Player deletes their own review
 */
export const deleteReviewController = async (req: Request, res: Response) => {
  const playerId = req.user?.profiles.playerId as string;
  const reviewId = req.params.id as string;
  await deleteReview(reviewId, playerId);
  return new SuccessResponse({
    message: "Review deleted successfully",
    data: null,
  }).send(res);
};

/**
 * Owner deletes a review
 */
export const ownerDeleteReviewController = async (
  req: Request,
  res: Response,
) => {
  const ownerId = req.user?.profiles.ownerId as string;
  const reviewId = req.params.id as string;
  await ownerDeleteReview(reviewId, ownerId);
  return new SuccessResponse({
    message: "Review deleted by owner successfully",
    data: null,
  }).send(res);
};

/**
 * Public: Get reviews for a subfield (with filtering)
 */
export const getSubfieldReviewsController = async (
  req: Request,
  res: Response,
) => {
  const subfieldId = req.params.id as string;

  // Parse and validate query params
  const query = reviewQuerySchema.parse(req.query);

  const result = await getSubfieldReviews(subfieldId, query);

  return new SuccessResponse({
    message: "Reviews retrieved successfully",
    data: result,
  }).send(res);
};
