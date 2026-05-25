import { BookingStatus } from "@prisma/client";
import crypto from "crypto";
import { BOOKING_TIMEOUT } from "../../configs";
import { fetchAndCalculatePrice } from "../../helpers/pricing.helper";
import { formatVietnamTime } from "../../helpers/time.helper";
import { prisma } from "../../libs/prisma";
import { acquireLock, releaseLock } from "../../libs/redis";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/error.response";
import { CreateBookingInput } from "../../validations";
import {
  getBookingAddonSubtotal,
  normalizeBookingAddons,
  restoreAddonStockForBooking,
} from "./booking_addon.service";
import { sendNotificationIfNotExists } from "./notification.service";
import { invalidatePlayerRecommendation } from "./recommendation.service";

export interface filter {
  search?: string;
  status?: BookingStatus;
  start_date?: Date;
  end_date?: Date;
  min_price?: number;
  max_price?: number;
}

// Hard limit để tránh OOM — cần chuyển sang DB-level pagination trong tương lai
const QUERY_HARD_LIMIT = 500;

export const createBooking = async (
  player_id: string,
  data: CreateBookingInput,
  sub_field_id: string,
) => {
  const normalizedAddons = normalizeBookingAddons(data.addons ?? []);

  const player = await prisma.player.findUnique({
    where: { id: player_id, status: "ACTIVE" },
  });
  if (!player) {
    throw new ForbiddenError("You are not allowed to make a booking");
  }

  if (new Date(data.start_time) < new Date()) {
    throw new BadRequestError("Không thể đặt sân cho thời gian đã qua.");
  }

  const subField = await prisma.subField.findFirst({
    where: { id: sub_field_id, isDelete: false },
  });
  if (!subField) {
    throw new NotFoundError("Sub field not found");
  }

  const { totalPrice, breakdown } = await fetchAndCalculatePrice(
    sub_field_id,
    data.start_time,
    data.end_time,
  );

  console.log("Price Breakdown:::::", breakdown);
  console.log("Total Price:::::", totalPrice);

  const lockKey = `lock:booking:subfield:${sub_field_id}`;
  const lockValue = crypto.randomUUID();
  const lockTTL = 15; // 15 seconds

  const acquired = await acquireLock(lockKey, lockValue, lockTTL);
  if (!acquired) {
    throw new BadRequestError("Sân đang có nhiều người đặt cùng lúc. Vui lòng thử lại sau giây lát.");
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
    // 1. Pessimistic Lock on SubField row to prevent concurrent bookings
    await tx.$executeRaw`SELECT 1 FROM "SubField" WHERE id = ${sub_field_id}::uuid FOR UPDATE`;

    // 2. Check for overlapping bookings
    const overlappingBooking = await tx.booking.findFirst({
      where: {
        sub_field_id,
        OR: [
          { status: "PENDING", expires_at: { gt: new Date() } },
          { status: "COMPLETED" },
          { status: "CONFIRMED" },
        ],
        start_time: { lt: data.end_time },
        end_time: { gt: data.start_time },
      },
    });

    if (overlappingBooking) {
      if (overlappingBooking.player_id === player_id) {
        if (
          overlappingBooking.status === "COMPLETED" ||
          overlappingBooking.status === "CONFIRMED"
        ) {
          throw new BadRequestError(
            "Bạn đã đặt khung thời gian này. Vui lòng xem lại lịch sử đặt sân của bạn.",
          );
        }

        // PENDING và CHÍNH XÁC cùng thời gian → Gia hạn
        if (
          overlappingBooking.start_time.getTime() ===
            new Date(data.start_time).getTime() &&
          overlappingBooking.end_time.getTime() ===
            new Date(data.end_time).getTime()
        ) {
          const updatedBooking = await tx.booking.update({
            where: { id: overlappingBooking.id },
            data: {
              expires_at: new Date(Date.now() + BOOKING_TIMEOUT.INITIAL),
            },
            include: {
              booking_addons: {
                include: {
                  product: {
                    select: {
                      name: true,
                      image: true,
                    },
                  },
                },
              },
            },
          });

          return {
            message:
              "Đã tiếp tục phiên đặt sân trước đó! Vui lòng kiểm tra lại thông tin.",
            booking: updatedBooking,
          };
        }

        throw new BadRequestError(
          "Bạn đã đặt một khung giờ khác trùng với khung giờ này. Vui lòng kiểm tra lại lịch đặt sân.",
        );
      }

      throw new BadRequestError(
        `Đã có người đặt khoảng thời gian từ ${formatVietnamTime(
          overlappingBooking.start_time,
        )} đến ${formatVietnamTime(
          overlappingBooking.end_time,
        )} trên sân này. Vui lòng chọn khung giờ khác.`,
      );
    }

    const productIds = normalizedAddons.map((item) => item.product_id);
    const products = productIds.length
      ? await tx.product.findMany({
          where: {
            id: { in: productIds },
            complex_id: subField.complex_id,
            status: "ACTIVE",
          },
          select: {
            id: true,
            price: true,
            stock: true,
            sport_type: true,
          },
        })
      : [];

    const productMap = new Map(
      products
        .filter(
          (product) =>
            product.sport_type === null ||
            product.sport_type === subField.sport_type,
        )
        .map((product) => [product.id, product]),
    );

    console.log("Product Map:::::", productMap);

    const unavailableProductIds = normalizedAddons
      .filter((addon) => {
        const product = productMap.get(addon.product_id);
        return !product || product.stock < addon.quantity;
      })
      .map((addon) => addon.product_id);

    if (unavailableProductIds.length > 0) {
      throw new BadRequestError(
        `ADDON_OUT_OF_STOCK: Một số add-on đã hết hàng hoặc không khả dụng. Products: ${Array.from(
          new Set(unavailableProductIds),
        ).join(",")}`,
      );
    }

    const addonSubtotal = normalizedAddons.reduce((sum, addon) => {
      const product = productMap.get(addon.product_id);
      if (!product) return sum;
      return sum + Number(product.price) * addon.quantity;
    }, 0);

    const createdBooking = await tx.booking.create({
      data: {
        player_id,
        sub_field_id,
        start_time: data.start_time,
        end_time: data.end_time,
        total_price: totalPrice + addonSubtotal,
        status: "PENDING",
        expires_at: new Date(Date.now() + BOOKING_TIMEOUT.INITIAL),
      },
    });

    for (const addon of normalizedAddons) {
      const updated = await tx.product.updateMany({
        where: {
          id: addon.product_id,
          complex_id: subField.complex_id,
          status: "ACTIVE",
          stock: { gte: addon.quantity },
          OR: [{ sport_type: null }, { sport_type: subField.sport_type }],
        },
        data: {
          stock: { decrement: addon.quantity },
        },
      });

      if (updated.count === 0) {
        throw new BadRequestError(
          `ADDON_OUT_OF_STOCK: Một số add-on đã hết hàng trong lúc xác nhận. Product: ${addon.product_id}`,
        );
      }
    }

    if (normalizedAddons.length > 0) {
      await tx.bookingAddon.createMany({
        data: normalizedAddons.map((addon) => ({
          booking_id: createdBooking.id,
          product_id: addon.product_id,
          quantity: addon.quantity,
          unit_price: productMap.get(addon.product_id)!.price,
        })),
      });
    }

    const createdWithAddons = await tx.booking.findUnique({
      where: { id: createdBooking.id },
      include: {
        booking_addons: {
          include: {
            product: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!createdWithAddons) {
      throw new NotFoundError("Booking not found after creation");
    }

    return {
      message: "Đặt sân thành công! Vui lòng kiểm tra lại thông tin.",
      booking: createdWithAddons,
    };
  });

  return result;
  } finally {
    await releaseLock(lockKey, lockValue);
  }
};

export const getBookingCheckoutDetails = async (
  booking_id: string,
  player_id: string,
) => {
  const booking = await prisma.booking.findFirst({
    where: { id: booking_id, player_id, status: "PENDING" },
    include: {
      booking_addons: {
        include: {
          product: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
      sub_field: {
        include: {
          complex: {
            select: { complex_name: true, complex_address: true },
          },
        },
      },
    },
  });

  if (!booking) {
    throw new NotFoundError("Booking not found or cannot be reviewed");
  }

  if (new Date() > booking.expires_at) {
    await prisma.$transaction(async (tx) => {
      const canceled = await tx.booking.updateMany({
        where: { id: booking_id, status: "PENDING" },
        data: { status: "CANCELED" },
      });

      if (canceled.count > 0) {
        await restoreAddonStockForBooking(tx, booking_id);
      }
    });

    throw new BadRequestError("Booking has expired and been canceled");
  }

  const conflictBooking = await prisma.booking.findFirst({
    where: {
      sub_field_id: booking.sub_field_id,
      status: "CONFIRMED",
      id: { not: booking.id },
      start_time: { lt: booking.end_time },
      end_time: { gt: booking.start_time },
    },
  });

  if (conflictBooking) {
    throw new BadRequestError(
      "The selected time slot has just been booked by someone else",
    );
  }

  return {
    id: booking.id,
    start_time: booking.start_time,
    end_time: booking.end_time,
    total_price: booking.total_price,
    complex_name: booking.sub_field.complex.complex_name,
    complex_address: booking.sub_field.complex.complex_address,
    sport_type: booking.sub_field.sport_type,
    sub_field_name: booking.sub_field.sub_field_name,
    expires_at: booking.expires_at,
    booking_addons: booking.booking_addons.map((addon) => ({
      product_id: addon.product_id,
      product_name: addon.product.name,
      product_image: addon.product.image,
      quantity: addon.quantity,
      unit_price: addon.unit_price,
      line_total: Number(addon.unit_price) * addon.quantity,
    })),
  };
};

export const updateBooking = async (
  player_id: string,
  data: CreateBookingInput,
  booking_id: string,
) => {
  const player = await prisma.player.findUnique({
    where: { id: player_id, status: "ACTIVE" },
  });
  if (!player) {
    throw new ForbiddenError("You are not allowed to make a booking");
  }

  const existingBooking = await prisma.booking.findFirst({
    where: { id: booking_id, player_id, status: "PENDING" },
  });
  if (!existingBooking) {
    throw new NotFoundError("Booking not found or cannot be updated");
  }

  const { sub_field_id } = existingBooking;

  const { totalPrice } = await fetchAndCalculatePrice(
    sub_field_id,
    data.start_time,
    data.end_time,
  );
  const addonSubtotal = await getBookingAddonSubtotal(booking_id);

  console.log("Total Price:::::", totalPrice);

  const lockKey = `lock:booking:subfield:${sub_field_id}`;
  const lockValue = crypto.randomUUID();
  const lockTTL = 15;

  const acquired = await acquireLock(lockKey, lockValue, lockTTL);
  if (!acquired) {
    throw new BadRequestError("Sân đang có người thao tác. Vui lòng thử lại sau giây lát.");
  }

  try {
    return await prisma.$transaction(async (tx) => {
    // 1. Pessimistic Lock on SubField row
    await tx.$executeRaw`SELECT 1 FROM "SubField" WHERE id = ${sub_field_id}::uuid FOR UPDATE`;

    // 2. Check overlap inside transaction
    const overlappingBooking = await tx.booking.findFirst({
      where: {
        sub_field_id,
        id: { not: booking_id },
        OR: [
          { status: "PENDING", expires_at: { gt: new Date() } },
          { status: "CONFIRMED" },
        ],
        start_time: { lt: data.end_time },
        end_time: { gt: data.start_time },
      },
    });

    if (overlappingBooking) {
      throw new BadRequestError(
        `Đã có một booking khung giờ từ ${formatVietnamTime(
          overlappingBooking.start_time,
        )} đến ${formatVietnamTime(
          overlappingBooking.end_time,
        )}. Vui lòng chọn khung giờ khác.`,
      );
    }

    return await tx.booking.update({
      where: { id: booking_id },
      data: {
        player_id,
        sub_field_id,
        start_time: data.start_time,
        end_time: data.end_time,
        total_price: totalPrice + addonSubtotal,
        status: "PENDING",
        expires_at: new Date(Date.now() + BOOKING_TIMEOUT.INITIAL),
      },
    });
  });
  } finally {
    await releaseLock(lockKey, lockValue);
  }
};

export const cancelBooking = async (booking_id: string, player_id: string) => {
  const booking = await prisma.booking.findFirst({
    where: {
      id: booking_id,
      player_id,
      status: { in: ["PENDING", "COMPLETED", "CONFIRMED"] },
    },
    select: {
      id: true,
      status: true,
      start_time: true,
      sub_field: {
        select: {
          sub_field_name: true,
          complex: {
            select: {
              owner: {
                select: {
                  account_id: true,
                },
              },
              complex_name: true,
            },
          },
        },
      },
    },
  });

  if (!booking) {
    throw new NotFoundError("Booking not found or cannot be canceled");
  }

  if (booking.start_time <= new Date()) {
    throw new BadRequestError(
      "Cannot cancel a booking that has already started or passed",
    );
  }

  const canceledBooking = await prisma.$transaction(async (tx) => {
    if (booking.status === "PENDING") {
      const canceled = await tx.booking.updateMany({
        where: { id: booking_id, status: "PENDING" },
        data: { status: "CANCELED" },
      });

      if (canceled.count === 0) {
        throw new BadRequestError("Booking status has changed, please refresh");
      }

      await restoreAddonStockForBooking(tx, booking_id);
    } else {
      await tx.booking.updateMany({
        where: {
          id: booking_id,
          status: { in: ["COMPLETED", "CONFIRMED"] },
        },
        data: { status: "CANCELED" },
      });
    }

    const canceled = await tx.booking.findUnique({
      where: { id: booking_id },
    });

    if (!canceled) {
      throw new NotFoundError("Booking not found after cancel");
    }

    return canceled;
  });

  if (booking.status !== "PENDING") {
    await sendNotificationIfNotExists(booking.sub_field.complex.owner.account_id, {
      message: `Player đã hủy booking ${booking.sub_field.sub_field_name} tại ${booking.sub_field.complex.complex_name}.`,
      type: "BOOKING",
      target_role: "OWNER",
      link_to: "/owner/bookings",
    });
  }

  return canceledBooking;
};

export const ownerCancelBooking = async (
  booking_id: string,
  owner_id: string,
) => {
  const owner = await prisma.owner.findUnique({
    where: { id: owner_id, status: "ACTIVE" },
  });
  if (!owner) {
    throw new ForbiddenError("You are not allowed to cancel bookings");
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: booking_id,
      sub_field: { complex: { owner_id } },
    },
    select: {
      id: true,
      status: true,
      player: {
        select: {
          account_id: true,
        },
      },
      sub_field: {
        select: {
          sub_field_name: true,
          complex: {
            select: {
              complex_name: true,
            },
          },
        },
      },
    },
  });

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  if (booking.status === "CANCELED") {
    throw new BadRequestError(
      "Booking has already been canceled and cannot be canceled again",
    );
  }

  const canceledBooking = await prisma.$transaction(async (tx) => {
    if (booking.status === "PENDING") {
      const canceled = await tx.booking.updateMany({
        where: { id: booking_id, status: "PENDING" },
        data: { status: "CANCELED" },
      });

      if (canceled.count === 0) {
        throw new BadRequestError("Booking status has changed, please refresh");
      }

      await restoreAddonStockForBooking(tx, booking_id);
    } else {
      await tx.booking.updateMany({
        where: {
          id: booking_id,
          status: { in: ["COMPLETED", "CONFIRMED"] },
        },
        data: { status: "CANCELED" },
      });
    }

    const canceledBooking = await tx.booking.findUnique({
      where: { id: booking_id },
    });

    if (!canceledBooking) {
      throw new NotFoundError("Booking not found after cancel");
    }

    return canceledBooking;
  });

  await sendNotificationIfNotExists(booking.player.account_id, {
    message: `Booking ${booking.sub_field.sub_field_name} tại ${booking.sub_field.complex.complex_name} đã bị chủ sân hủy.`,
    type: "BOOKING",
    target_role: "PLAYER",
    link_to: "/bookings",
  });

  return canceledBooking;
};

export const ownerConfirmBooking = async (
  booking_id: string,
  owner_id: string,
) => {
  const owner = await prisma.owner.findUnique({
    where: { id: owner_id, status: "ACTIVE" },
  });
  if (!owner) {
    throw new ForbiddenError("You are not allowed to confirm bookings");
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: booking_id,
      sub_field: { complex: { owner_id } },
      status: "COMPLETED",
      payment: { status: "SUCCESS" },
    },
    select: {
      id: true,
      player_id: true,
      player: {
        select: {
          account_id: true,
        },
      },
      sub_field: {
        select: {
          sub_field_name: true,
          complex: {
            select: {
              complex_name: true,
            },
          },
        },
      },
    },
  });

  if (!booking) {
    throw new BadRequestError("Booking not found or cannot be confirmed");
  }

  const confirmedBooking = await prisma.booking.update({
    where: { id: booking_id },
    data: { status: "CONFIRMED" },
  });

  await sendNotificationIfNotExists(booking.player.account_id, {
    message: `Chủ sân đã xác nhận booking ${booking.sub_field.sub_field_name} tại ${booking.sub_field.complex.complex_name} của bạn.`,
    type: "BOOKING",
    target_role: "PLAYER",
    link_to: "/bookings",
  });

  // Invalidate recommendation cache so player sees fresh results
  invalidatePlayerRecommendation(booking.player_id).catch((err) =>
    console.error("[Recommendation] Failed to invalidate cache after confirm:", err),
  );

  return confirmedBooking;
};

export const ownerGetBookingById = async (
  booking_id: string,
  owner_id: string,
) => {
  const owner = await prisma.owner.findUnique({
    where: { id: owner_id, status: "ACTIVE" },
  });
  if (!owner) {
    throw new ForbiddenError("You are not allowed to view bookings");
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: booking_id,
      sub_field: { complex: { owner_id } },
    },
    select: {
      id: true,
      start_time: true,
      end_time: true,
      total_price: true,
      status: true,
      booking_addons: {
        select: {
          product_id: true,
          quantity: true,
          unit_price: true,
          product: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
      player: {
        select: {
          account: {
            select: { full_name: true, phone_number: true },
          },
        },
      },
      sub_field: {
        select: {
          sub_field_name: true,
          sport_type: true,
          complex: {
            select: {
              owner_id: true,
              complex_name: true,
              complex_address: true,
            },
          },
        },
      },
    },
  });

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  if (booking.sub_field.complex.owner_id !== owner_id) {
    throw new ForbiddenError("You are not allowed to view this booking");
  }

  return booking;
};

export const getOwnerBookingStats = async (owner_id: string) => {
  const owner = await prisma.owner.findUnique({
    where: { id: owner_id, status: "ACTIVE" },
  });
  if (!owner) {
    throw new ForbiddenError("You are not allowed to view bookings");
  }

  const baseCondition = {
    sub_field: { complex: { owner_id } },
  };

  const [singleStats, recurringStats] = await Promise.all([
    prisma.booking.groupBy({
      by: ["status"],
      where: { ...baseCondition, recurring_booking_id: null },
      _count: { status: true },
    }),
    prisma.recurringBooking.groupBy({
      by: ["status"],
      where: baseCondition,
      _count: { status: true },
    }),
  ]);

  type StatusCount = Record<string, number>;
  const toMap = (
    stats: { status: string; _count: { status: number } }[],
  ): StatusCount =>
    stats.reduce((acc, s) => ({ ...acc, [s.status]: s._count.status }), {});

  const single = toMap(singleStats);
  const recurring = toMap(recurringStats);
  const get = (map: StatusCount, key: string) => map[key] ?? 0;

  return {
    total:
      Object.values(single).reduce((a, b) => a + b, 0) +
      Object.values(recurring).reduce((a, b) => a + b, 0),
    pending: get(single, "PENDING") + get(recurring, "PENDING"),
    confirmed: get(single, "CONFIRMED") + get(recurring, "CONFIRMED"),
    completed: get(single, "COMPLETED") + get(recurring, "COMPLETED"),
    canceled: get(single, "CANCELED") + get(recurring, "CANCELED"),
  };
};

// Helper dùng chung để format recurring booking
const formatRecurringBooking = (
  recurring: any,
  includePlayer: boolean = false,
) => {
  const total_price = recurring.bookings.reduce(
    (sum: number, b: any) => sum + Number(b.total_price),
    0,
  );

  const earliestExpiration =
    recurring.status === "PENDING"
      ? recurring.bookings
          .filter((b: any) => b.status === "PENDING")
          .reduce(
            (earliest: Date | null, b: any) => {
              if (!earliest || b.expires_at < earliest) return b.expires_at;
              return earliest;
            },
            null as Date | null,
          )
      : null;

  return {
    id: recurring.id,
    type: "RECURRING" as const,
    start_date: recurring.start_date,
    end_date: recurring.end_date,
    recurrence_type: recurring.recurrence_type,
    status: recurring.status,
    total_slots: recurring.bookings.length,
    total_price,
    sub_field_name: recurring.sub_field.sub_field_name,
    sport_type: recurring.sub_field.sport_type,
    complex_name: recurring.sub_field.complex.complex_name,
    complex_address: recurring.sub_field.complex.complex_address,
    expires_at: earliestExpiration,
    created_at: recurring.created_at,
    bookings: recurring.bookings.map((b: any) => ({
      id: b.id,
      start_time: b.start_time,
      end_time: b.end_time,
      total_price: b.total_price,
      status: b.status,
      review: b.review
        ? {
            id: b.review.id,
            booking_id: b.review.booking_id,
            player_id: b.review.player_id,
            subfield_id: b.review.subfield_id,
            rating: b.review.rating,
            comment: b.review.comment,
            images: b.review.images,
            created_at: b.review.created_at,
            updated_at: b.review.updated_at,
          }
        : null,
    })),
    ...(includePlayer && {
      player_name: recurring.player.account.full_name,
      player_phone: recurring.player.account.phone_number,
    }),
  };
};

const recurringBookingSelect = {
  id: true,
  recurrence_type: true,
  start_date: true,
  end_date: true,
  status: true,
  created_at: true,
  sub_field: {
    select: {
      sub_field_name: true,
      sport_type: true,
      complex: {
        select: { complex_name: true, complex_address: true },
      },
    },
  },
  bookings: {
    select: {
      id: true,
      start_time: true,
      end_time: true,
      total_price: true,
      status: true,
      expires_at: true,
      review: {
        select: {
          id: true,
          booking_id: true,
          player_id: true,
          subfield_id: true,
          rating: true,
          comment: true,
          images: true,
          created_at: true,
          updated_at: true,
        },
      },
    },
    orderBy: { start_time: "desc" as const },
  },
};

export const getPlayerBookings = async (
  player_id: string,
  page = 1,
  limit = 9,
  status?: BookingStatus,
) => {
  const player = await prisma.player.findUnique({
    where: { id: player_id, status: "ACTIVE" },
  });
  if (!player) {
    throw new ForbiddenError("You are not allowed to view bookings");
  }

  const [singleBookings, recurringBookings, singleSummary, recurringSummary] =
    await Promise.all([
    prisma.booking.findMany({
      where: {
        player_id,
        recurring_booking_id: null,
        ...(status ? { status } : {}),
      },
      select: {
        id: true,
        start_time: true,
        end_time: true,
        total_price: true,
        status: true,
        expires_at: true,
        created_at: true,
        review: {
          select: {
            id: true,
            booking_id: true,
            player_id: true,
            subfield_id: true,
            rating: true,
            comment: true,
            images: true,
            created_at: true,
            updated_at: true,
          },
        },
        sub_field: {
          select: {
            sub_field_name: true,
            sport_type: true,
            complex: {
              select: { complex_name: true, complex_address: true },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: QUERY_HARD_LIMIT,
    }),
    prisma.recurringBooking.findMany({
      where: {
        player_id,
        ...(status ? { status } : {}),
      },
      select: recurringBookingSelect,
      orderBy: { created_at: "desc" },
      take: QUERY_HARD_LIMIT,
    }),
    prisma.booking.groupBy({
      by: ["status"],
      where: {
        player_id,
        recurring_booking_id: null,
      },
      _count: { status: true },
    }),
    prisma.recurringBooking.groupBy({
      by: ["status"],
      where: { player_id },
      _count: { status: true },
    }),
  ]);

  const formattedSingle = singleBookings.map((b) => ({
    id: b.id,
    type: "SINGLE" as const,
    start_time: b.start_time,
    end_time: b.end_time,
    total_price: b.total_price,
    status: b.status,
    sub_field_name: b.sub_field.sub_field_name,
    sport_type: b.sub_field.sport_type,
    complex_name: b.sub_field.complex.complex_name,
    complex_address: b.sub_field.complex.complex_address,
    expires_at: b.expires_at,
    created_at: b.created_at,
    review: b.review,
  }));

  const formattedRecurring = recurringBookings.map((r) =>
    formatRecurringBooking(r, false),
  );

  const allBookings = [...formattedSingle, ...formattedRecurring].sort(
    (a, b) => b.created_at.getTime() - a.created_at.getTime(),
  );

  const total = allBookings.length;
  const skip = (page - 1) * limit;
  const statusSummary = {
    PENDING: 0,
    CONFIRMED: 0,
    COMPLETED: 0,
    CANCELED: 0,
  };

  for (const item of singleSummary) {
    statusSummary[item.status] += item._count.status;
  }
  for (const item of recurringSummary) {
    statusSummary[item.status] += item._count.status;
  }

  const totalSummary =
    statusSummary.PENDING +
    statusSummary.CONFIRMED +
    statusSummary.COMPLETED +
    statusSummary.CANCELED;

  return {
    bookings: allBookings.slice(skip, skip + limit),
    summary: {
      total: totalSummary,
      by_status: statusSummary,
    },
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const ownerGetAllBookings = async (
  owner_id: string,
  page = 1,
  limit = 8,
  filter: Partial<filter> = {},
) => {
  const owner = await prisma.owner.findUnique({
    where: { id: owner_id, status: "ACTIVE" },
  });
  if (!owner) {
    throw new ForbiddenError("You are not allowed to view bookings");
  }

  const whereCondition: any = {
    sub_field: { complex: { owner_id } },
  };

  if (filter.search?.trim()) {
    const searchStr = filter.search.trim();
    whereCondition.OR = [
      {
        sub_field: {
          complex: {
            complex_name: { contains: searchStr, mode: "insensitive" },
          },
        },
      },
      {
        sub_field: {
          sub_field_name: { contains: searchStr, mode: "insensitive" },
        },
      },
      {
        player: {
          account: {
            full_name: { contains: searchStr, mode: "insensitive" },
          },
        },
      },
      {
        player: {
          account: {
            phone_number: { contains: searchStr, mode: "insensitive" },
          },
        },
      },
    ];
  }

  if (filter.status) {
    whereCondition.status = filter.status;
  }

  // FIX: date filter không còn bị bỏ trống
  if (filter.start_date || filter.end_date) {
    whereCondition.start_time = {};
    if (filter.start_date) {
      whereCondition.start_time.gte = new Date(filter.start_date);
    }
    if (filter.end_date) {
      const end = new Date(filter.end_date);
      end.setUTCHours(23, 59, 59, 999);
      whereCondition.start_time.lte = end;
    }
  }

  const [singleBookings, recurringBookings] = await Promise.all([
    prisma.booking.findMany({
      where: { ...whereCondition, recurring_booking_id: null },
      select: {
        id: true,
        start_time: true,
        end_time: true,
        total_price: true,
        status: true,
        expires_at: true,
        created_at: true,
        sub_field: {
          select: {
            sub_field_name: true,
            sport_type: true,
            complex: {
              select: { complex_name: true, complex_address: true },
            },
          },
        },
        player: {
          select: {
            account: {
              select: { full_name: true, phone_number: true },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: QUERY_HARD_LIMIT,
    }),
    prisma.recurringBooking.findMany({
      where: whereCondition,
      select: {
        ...recurringBookingSelect,
        player: {
          select: {
            account: {
              select: { full_name: true, phone_number: true },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: QUERY_HARD_LIMIT,
    }),
  ]);

  const formattedSingle = singleBookings.map((b) => ({
    id: b.id,
    type: "SINGLE" as const,
    start_time: b.start_time,
    end_time: b.end_time,
    total_price: b.total_price,
    status: b.status,
    sub_field_name: b.sub_field.sub_field_name,
    sport_type: b.sub_field.sport_type,
    complex_name: b.sub_field.complex.complex_name,
    complex_address: b.sub_field.complex.complex_address,
    expires_at: b.expires_at,
    created_at: b.created_at,
    player_name: b.player.account.full_name,
    player_phone: b.player.account.phone_number,
  }));

  const formattedRecurring = recurringBookings.map((r) =>
    formatRecurringBooking(r, true),
  );

  const allBookings = [...formattedSingle, ...formattedRecurring].sort(
    (a, b) => b.created_at.getTime() - a.created_at.getTime(),
  );

  const total = allBookings.length;
  const skip = (page - 1) * limit;

  return {
    bookings: allBookings.slice(skip, skip + limit),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
