import { BookingStatus } from "@prisma/client";
import { BOOKING_TIMEOUT } from "../../configs";
import { fetchAndCalculatePrice } from "../../helpers/pricing.helper";
import { formatVietnamTime } from "../../helpers/time.helper";
import { prisma } from "../../libs/prisma";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/error.response";
import { CreateBookingInput } from "../../validations";

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

  const overlappingBooking = await prisma.booking.findFirst({
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
        const updatedBooking = await prisma.booking.update({
          where: { id: overlappingBooking.id },
          data: { expires_at: new Date(Date.now() + BOOKING_TIMEOUT.INITIAL) },
        });

        return {
          message:
            "Đã tiếp tục phiên đặt sân trước đó! Vui lòng kiểm tra lại thông tin.",
          booking_id: updatedBooking.id,
          start_time: updatedBooking.start_time,
          end_time: updatedBooking.end_time,
          total_price: updatedBooking.total_price,
          status: updatedBooking.status,
          expires_at: updatedBooking.expires_at,
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

  const { totalPrice, breakdown } = await fetchAndCalculatePrice(
    sub_field_id,
    data.start_time,
    data.end_time,
  );

  console.log("Price Breakdown:::::", breakdown);
  console.log("Total Price:::::", totalPrice);

  const booking = await prisma.booking.create({
    data: {
      player_id,
      sub_field_id,
      start_time: data.start_time,
      end_time: data.end_time,
      total_price: totalPrice,
      status: "PENDING",
      expires_at: new Date(Date.now() + BOOKING_TIMEOUT.INITIAL),
    },
  });

  return {
    message: "Đặt sân thành công! Vui lòng kiểm tra lại thông tin.",
    booking,
  };
};

export const reviewBooking = async (booking_id: string, player_id: string) => {
  const booking = await prisma.booking.findFirst({
    where: { id: booking_id, player_id, status: "PENDING" },
    include: {
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
    await prisma.booking.update({
      where: { id: booking_id },
      data: { status: "CANCELED" },
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

  const overlappingBooking = await prisma.booking.findFirst({
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

  const { totalPrice } = await fetchAndCalculatePrice(
    sub_field_id,
    data.start_time,
    data.end_time,
  );

  console.log("Total Price:::::", totalPrice);

  return await prisma.booking.update({
    where: { id: booking_id },
    data: {
      player_id,
      sub_field_id,
      start_time: data.start_time,
      end_time: data.end_time,
      total_price: totalPrice,
      status: "PENDING",
      expires_at: new Date(Date.now() + BOOKING_TIMEOUT.INITIAL),
    },
  });
};

export const cancelBooking = async (booking_id: string, player_id: string) => {
  const booking = await prisma.booking.findFirst({
    where: {
      id: booking_id,
      player_id,
      status: { in: ["PENDING", "COMPLETED", "CONFIRMED"] },
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

  return await prisma.booking.update({
    where: { id: booking_id },
    data: { status: "CANCELED" },
  });
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
  });

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  if (booking.status === "CANCELED") {
    throw new BadRequestError(
      "Booking has already been canceled and cannot be canceled again",
    );
  }

  return await prisma.booking.update({
    where: { id: booking_id },
    data: { status: "CANCELED" },
  });
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
  });

  if (!booking) {
    throw new BadRequestError("Booking not found or cannot be confirmed");
  }

  return await prisma.booking.update({
    where: { id: booking_id },
    data: { status: "CONFIRMED" },
  });
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

// FIX: 10 COUNT queries → 2 groupBy queries
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
    },
    orderBy: { start_time: "desc" as const },
  },
};

export const getPlayerBookings = async (
  player_id: string,
  page = 1,
  limit = 8,
) => {
  const player = await prisma.player.findUnique({
    where: { id: player_id, status: "ACTIVE" },
  });
  if (!player) {
    throw new ForbiddenError("You are not allowed to view bookings");
  }

  const [singleBookings, recurringBookings] = await Promise.all([
    prisma.booking.findMany({
      where: { player_id, recurring_booking_id: null },
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
      },
      orderBy: { created_at: "desc" },
      take: QUERY_HARD_LIMIT,
    }),
    prisma.recurringBooking.findMany({
      where: { player_id },
      select: recurringBookingSelect,
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
  }));

  const formattedRecurring = recurringBookings.map((r) =>
    formatRecurringBooking(r, false),
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
    whereCondition.OR = [
      {
        sub_field: {
          complex: {
            complex_name: { contains: filter.search, mode: "insensitive" },
          },
        },
      },
      {
        sub_field: {
          sub_field_name: { contains: filter.search, mode: "insensitive" },
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
