import { addDays, addMonths, isBefore } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { BOOKING_TIMEOUT } from "../../configs";
import { calculatePrice } from "../../helpers/pricing.helper";
import {
  formatVietnamTime,
  getVietnamDayOfWeek,
  getVietnamMinutes,
  TIME_ZONE,
} from "../../helpers/time.helper";
import { prisma } from "../../libs/prisma";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/error.response";
import {
  CreateRecurringBookingInput,
  RecurringBookingType,
} from "../../validations";

export const createRecurringBookingService = async (
  player_id: string,
  data: CreateRecurringBookingInput,
  sub_field_id: string,
) => {
  // FIX: dùng toZonedTime thay vì getHours() để đảm bảo đúng múi giờ VN
  const vnStart = toZonedTime(data.start_time, TIME_ZONE);
  const vnEnd = toZonedTime(data.end_time, TIME_ZONE);
  const startHour = vnStart.getHours();
  const startMinute = vnStart.getMinutes();
  const endHour = vnEnd.getHours();
  const endMinute = vnEnd.getMinutes();

  // 1. Validate Player & SubField
  const player = await prisma.player.findUnique({
    where: { id: player_id, status: "ACTIVE" },
  });
  if (!player) throw new ForbiddenError("Player not active or found");

  const subField = await prisma.subField.findFirst({
    where: { id: sub_field_id, isDelete: false },
  });
  if (!subField) throw new NotFoundError("Sub field not found");

  // 2. Check overlap với recurring bookings đang active
  const existingRecurrings = await prisma.recurringBooking.findMany({
    where: {
      sub_field_id,
      status: { in: ["PENDING", "COMPLETED", "CONFIRMED"] },
      OR: [
        { start_date: { gte: data.start_date, lte: data.end_date } },
        { end_date: { gte: data.start_date, lte: data.end_date } },
        {
          AND: [
            { start_date: { lte: data.start_date } },
            { end_date: { gte: data.end_date } },
          ],
        },
      ],
    },
    include: {
      bookings: {
        take: 1,
        orderBy: { start_time: "asc" },
      },
    },
  });

  // FIX: dùng getVietnamMinutes thay vì getHours() để so sánh đúng múi giờ
  const newStartMin = startHour * 60 + startMinute;
  const newEndMin = endHour * 60 + endMinute;

  const existingRecurring = existingRecurrings.find((rb) => {
    const firstBooking = rb.bookings[0];
    if (!firstBooking) return false;

    const existingStartMin = getVietnamMinutes(firstBooking.start_time);
    const existingEndMin = getVietnamMinutes(firstBooking.end_time);

    return existingStartMin < newEndMin && existingEndMin > newStartMin;
  });

  if (existingRecurring) {
    if (existingRecurring.player_id === player_id) {
      if (
        existingRecurring.status === "COMPLETED" ||
        existingRecurring.status === "CONFIRMED"
      ) {
        throw new BadRequestError(
          "Bạn đã đặt khung thời gian này. Vui lòng xem lại lịch sử đặt sân của bạn.",
        );
      }

      // PENDING và CHÍNH XÁC cùng ngày + giờ → Gia hạn
      const firstBooking = existingRecurring.bookings[0];
      const existingStartMin = getVietnamMinutes(firstBooking.start_time);
      const existingEndMin = getVietnamMinutes(firstBooking.end_time);

      const sameTimeSlot =
        existingStartMin === newStartMin && existingEndMin === newEndMin;
      const sameDate =
        existingRecurring.start_date.getTime() ===
          new Date(data.start_date).getTime() &&
        existingRecurring.end_date.getTime() ===
          new Date(data.end_date).getTime();

      if (sameTimeSlot && sameDate) {
        await prisma.booking.updateMany({
          where: { recurring_booking_id: existingRecurring.id },
          data: {
            expires_at: new Date(Date.now() + BOOKING_TIMEOUT.RECURRING),
          },
        });

        const totalPrice = existingRecurring.bookings.reduce(
          (sum, b) => sum + Number(b.total_price),
          0,
        );

        return {
          message:
            "Đã tiếp tục phiên đặt sân trước đó! Vui lòng kiểm tra lại thông tin.",
          recurring_booking_id: existingRecurring.id,
          total_slots: existingRecurring.bookings.length,
          total_price: totalPrice,
        };
      }

      throw new BadRequestError(
        "Bạn đã đặt một khung giờ khác trùng giờ với khung giờ này. Vui lòng kiểm tra lại lịch đặt sân.",
      );
    }

    throw new BadRequestError(
      `Đã có một booking đặt vào khung giờ từ ${formatVietnamTime(
        existingRecurring.bookings[0].start_time,
      )} đến ${formatVietnamTime(
        existingRecurring.bookings[0].end_time,
      )}. Vui lòng chọn khung giờ khác.`,
    );
  }

  // 3. Tạo danh sách booking slots
  const bookingSlots: { start: Date; end: Date }[] = [];
  let currentDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);

  while (
    isBefore(currentDate, endDate) ||
    currentDate.getTime() === endDate.getTime()
  ) {
    // FIX: dùng fromZonedTime để tạo đúng UTC timestamp từ giờ VN
    const dateStr = currentDate.toISOString().split("T")[0];
    const slotStart = fromZonedTime(
      `${dateStr}T${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}:00`,
      TIME_ZONE,
    );
    const slotEnd = fromZonedTime(
      `${dateStr}T${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}:00`,
      TIME_ZONE,
    );

    bookingSlots.push({ start: slotStart, end: slotEnd });

    if (data.recurring_type === RecurringBookingType.WEEKLY) {
      currentDate = addDays(currentDate, 7);
    } else if (data.recurring_type === RecurringBookingType.MONTHLY) {
      currentDate = addMonths(currentDate, 1);
    }
  }

  if (bookingSlots.length === 0) {
    throw new BadRequestError(
      "No booking slots generated for provided date range",
    );
  }

  // 4. FIX N+1: batch fetch tất cả dữ liệu cần thiết trong 1 lần
  const firstSlotStart = bookingSlots[0].start;
  const lastSlotEnd = bookingSlots[bookingSlots.length - 1].end;

  const [existingBookings, allPricingRules] = await Promise.all([
    prisma.booking.findMany({
      where: {
        sub_field_id,
        OR: [
          { status: "PENDING", expires_at: { gt: new Date() } },
          { status: "CONFIRMED" },
        ],
        start_time: { lt: lastSlotEnd },
        end_time: { gt: firstSlotStart },
      },
    }),
    prisma.pricingRule.findMany({
      where: { sub_field_id },
    }),
  ]);

  // 5. Xử lý từng slot hoàn toàn trong memory
  const bookingsToCreate: any[] = [];
  let totalRecurringPrice = 0;

  for (const slot of bookingSlots) {
    if (slot.start < new Date()) {
      throw new BadRequestError(
        `Cannot create booking in the past: ${slot.start.toLocaleString()}`,
      );
    }

    // Check overlap trong memory thay vì query DB
    const overlapping = existingBookings.find(
      (b) => b.start_time < slot.end && b.end_time > slot.start,
    );

    if (overlapping) {
      throw new BadRequestError(
        `Slot at ${slot.start.toLocaleString()} is already booked. Recurring booking failed.`,
      );
    }

    // Tính giá trong memory — filter rules theo day_of_week
    const dayOfWeek = getVietnamDayOfWeek(slot.start);
    const rulesForDay = allPricingRules.filter(
      (r) => r.day_of_week === dayOfWeek,
    );

    if (!rulesForDay.length) {
      throw new BadRequestError(
        `No pricing rule found for ${slot.start.toDateString()}`,
      );
    }

    const { totalPrice: slotPrice } = calculatePrice(
      rulesForDay,
      slot.start,
      slot.end,
    );

    totalRecurringPrice += slotPrice;
    bookingsToCreate.push({
      start_time: slot.start,
      end_time: slot.end,
      total_price: slotPrice,
      status: "PENDING",
      expires_at: new Date(Date.now() + BOOKING_TIMEOUT.RECURRING),
    });
  }

  // 6. Transaction: lưu tất cả vào DB
  const result = await prisma.$transaction(async (tx) => {
    const recurringBooking = await tx.recurringBooking.create({
      data: {
        player_id,
        sub_field_id,
        recurrence_type: data.recurring_type,
        start_date: data.start_date,
        end_date: data.end_date,
        status: "PENDING",
      },
    });

    await tx.booking.createMany({
      data: bookingsToCreate.map((b) => ({
        ...b,
        player_id,
        sub_field_id,
        recurring_booking_id: recurringBooking.id,
      })),
    });

    return recurringBooking;
  });

  return {
    message: "Đặt sân định kỳ được tạo thành công",
    recurring_booking_id: result.id,
    total_slots: bookingsToCreate.length,
    total_price: totalRecurringPrice,
  };
};

export const cancelRecurringBookingService = async (
  user_id: string,
  recurring_booking_id: string,
  user_type: "PLAYER" | "OWNER",
) => {
  if (user_type === "PLAYER") {
    const player = await prisma.player.findUnique({
      where: { id: user_id, status: "ACTIVE" },
    });
    if (!player) throw new ForbiddenError("Player not active or found");

    const recurringBooking = await prisma.recurringBooking.findFirst({
      where: {
        id: recurring_booking_id,
        player_id: user_id,
        status: "PENDING",
      },
    });
    if (!recurringBooking)
      throw new NotFoundError("Recurring booking not found or inaccessible");
  } else if (user_type === "OWNER") {
    const owner = await prisma.owner.findUnique({
      where: { id: user_id, status: "ACTIVE" },
    });
    if (!owner) throw new ForbiddenError("Owner not active or found");

    const recurringBooking = await prisma.recurringBooking.findFirst({
      where: {
        id: recurring_booking_id,
        sub_field: { complex: { owner_id: user_id } },
      },
    });
    if (!recurringBooking)
      throw new NotFoundError(
        "Recurring booking not found or not owned by this owner",
      );
  }

  await prisma.booking.updateMany({
    where: { recurring_booking_id },
    data: { status: "CANCELED" },
  });

  return await prisma.recurringBooking.update({
    where: { id: recurring_booking_id },
    data: { status: "CANCELED" },
  });
};

export const reviewRecurringBookingService = async (
  recurring_booking_id: string,
  player_id: string,
) => {
  const recurringBooking = await prisma.recurringBooking.findFirst({
    where: { id: recurring_booking_id, player_id },
    include: {
      sub_field: {
        include: {
          complex: {
            select: { complex_name: true, complex_address: true },
          },
        },
      },
      bookings: true,
    },
  });

  if (!recurringBooking || recurringBooking.bookings.length === 0) {
    throw new NotFoundError("Recurring booking not found or invalid");
  }

  const firstBooking = recurringBooking.bookings[0];

  if (new Date() > firstBooking.expires_at) {
    await prisma.$transaction([
      prisma.recurringBooking.update({
        where: { id: recurring_booking_id },
        data: { status: "CANCELED" },
      }),
      prisma.booking.updateMany({
        where: { recurring_booking_id },
        data: { status: "CANCELED" },
      }),
    ]);
    throw new BadRequestError("Recurring booking session has expired");
  }

  // Check conflict: 1 query với OR thay vì N queries
  const conflictConditions = recurringBooking.bookings.map((slot) => ({
    AND: [
      { start_time: { lt: slot.end_time } },
      { end_time: { gt: slot.start_time } },
    ],
  }));

  const conflictBooking = await prisma.booking.findFirst({
    where: {
      sub_field_id: recurringBooking.sub_field_id,
      status: "CONFIRMED",
      OR: conflictConditions,
    },
  });

  if (conflictBooking) {
    throw new BadRequestError(
      `One of the slots (around ${conflictBooking.start_time.toLocaleString()}) has been booked by someone else.`,
    );
  }

  const totalAmount = recurringBooking.bookings.reduce(
    (sum, item) => sum + Number(item.total_price),
    0,
  );

  return {
    id: recurringBooking.id,
    complex_name: recurringBooking.sub_field.complex.complex_name,
    complex_address: recurringBooking.sub_field.complex.complex_address,
    sub_field_name: recurringBooking.sub_field.sub_field_name,
    sport_type: recurringBooking.sub_field.sport_type,
    start_date: recurringBooking.start_date,
    end_date: recurringBooking.end_date,
    recurrence_type: recurringBooking.recurrence_type,
    total_slots: recurringBooking.bookings.length,
    total_price: totalAmount,
    slots: recurringBooking.bookings.map((b) => ({
      id: b.id,
      startTime: b.start_time,
      endTime: b.end_time,
      price: b.total_price,
    })),
    expires_at: firstBooking.expires_at,
  };
};

export const ownerConfirmRecurringBookingService = async (
  recurring_booking_id: string,
  owner_id: string,
) => {
  const owner = await prisma.owner.findUnique({
    where: { id: owner_id, status: "ACTIVE" },
  });
  if (!owner) throw new NotFoundError("Owner not active or found");

  const recurringBooking = await prisma.recurringBooking.findFirst({
    where: {
      id: recurring_booking_id,
      sub_field: { complex: { owner_id } },
      status: "COMPLETED",
      bookings: { some: { status: "COMPLETED" } },
    },
  });

  if (!recurringBooking) {
    throw new NotFoundError(
      "Recurring booking not found or inaccessible by owner",
    );
  }

  await prisma.booking.updateMany({
    where: { recurring_booking_id, status: "COMPLETED" },
    data: { status: "CONFIRMED" },
  });

  return await prisma.recurringBooking.update({
    where: { id: recurring_booking_id },
    data: { status: "CONFIRMED" },
  });
};
