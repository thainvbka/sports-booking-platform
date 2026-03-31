import { Prisma } from "@prisma/client";
import {
  updateComplexRatingCache,
  updateSubfieldRatingCache,
} from "../../helpers/complexCache";
import { prisma } from "../../libs/prisma";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/error.response";
import {
  CreateReviewInput,
  ReviewQueryInput,
  UpdateReviewInput,
} from "../../validations";

/**
 * Player creates a review for a completed booking
 */
export const createReview = async (
  player_id: string,
  data: CreateReviewInput & { images?: string[] },
) => {
  const { booking_id, rating, comment, images } = data;

  const [booking, existingReview] = await Promise.all([
    prisma.booking.findFirst({
      where: {
        id: booking_id,
        player_id,
        status: "COMPLETED",
      },
      include: {
        sub_field: true,
      },
    }),
    prisma.review.findUnique({
      where: { booking_id },
    }),
  ]);

  if (!booking) {
    throw new BadRequestError(
      "Booking not found, not completed, or not yours to review.",
    );
  }

  if (existingReview) {
    throw new BadRequestError("This booking has already been reviewed.");
  }

  const review = await prisma.review.create({
    data: {
      booking_id,
      player_id,
      subfield_id: booking.sub_field_id,
      rating,
      comment,
      images: images || [],
    },
  });

  await Promise.all([
    updateSubfieldRatingCache(booking.sub_field_id),
    updateComplexRatingCache(booking.sub_field.complex_id),
  ]);

  return review;
};

/**
 * Player updates their own review
 */
export const updateReview = async (
  review_id: string,
  player_id: string,
  data: UpdateReviewInput & { images?: string[] },
) => {
  const existingReview = await prisma.review.findFirst({
    where: { id: review_id, player_id },
    include: { subfield: true },
  });

  if (!existingReview) {
    throw new NotFoundError("Review not found or not yours to update.");
  }

  const updatedReview = await prisma.review.update({
    where: { id: review_id },
    data: {
      rating: data.rating,
      comment: data.comment,
      images: data.images,
    },
  });

  if (data.rating !== undefined && data.rating !== existingReview.rating) {
    await Promise.all([
      updateSubfieldRatingCache(existingReview.subfield_id),
      updateComplexRatingCache(existingReview.subfield.complex_id),
    ]);
  }

  return updatedReview;
};

/**
 * Player deletes their own review
 */
export const deleteReview = async (review_id: string, player_id: string) => {
  const existingReview = await prisma.review.findFirst({
    where: { id: review_id, player_id },
    include: { subfield: true },
  });

  if (!existingReview) {
    throw new NotFoundError("Review not found or not yours to delete.");
  }

  await prisma.review.delete({
    where: { id: review_id },
  });

  await Promise.all([
    updateSubfieldRatingCache(existingReview.subfield_id),
    updateComplexRatingCache(existingReview.subfield.complex_id),
  ]);

  return { success: true };
};

/**
 * Owner deletes a review on their complex
 */
export const ownerDeleteReview = async (
  review_id: string,
  owner_id: string,
) => {
  const review = await prisma.review.findUnique({
    where: { id: review_id },
    include: {
      subfield: {
        include: { complex: true },
      },
    },
  });

  if (!review) {
    throw new NotFoundError("Review not found.");
  }

  if (review.subfield.complex.owner_id !== owner_id) {
    throw new ForbiddenError(
      "You do not have permission to delete this review.",
    );
  }

  await prisma.review.delete({
    where: { id: review_id },
  });

  await Promise.all([
    updateSubfieldRatingCache(review.subfield_id),
    updateComplexRatingCache(review.subfield.complex_id),
  ]);

  return { success: true };
};

/**
 * Get reviews for a specific subfield (Public with Filters)
 */
export const getSubfieldReviews = async (
  subfield_id: string,
  query: ReviewQueryInput,
) => {
  const { page, limit, rating, has_images, sort_by } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.ReviewWhereInput = { subfield_id };

  if (rating !== undefined) {
    where.rating = rating;
  }

  if (has_images) {
    where.NOT = { images: { equals: [] } };
  }

  let orderBy: Prisma.ReviewOrderByWithRelationInput = { created_at: "desc" };
  if (sort_by === "oldest") orderBy = { created_at: "asc" };
  if (sort_by === "rating_desc") orderBy = { rating: "desc" };
  if (sort_by === "rating_asc") orderBy = { rating: "asc" };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        player: {
          select: {
            account: {
              select: {
                full_name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);

  return {
    reviews,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
