import { prisma } from "@sports-booking-platform/db";
import {
  CreateRecurringBookingInput,
  RecurringBookingType,
} from "@sports-booking-platform/validation";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/error.response";
import {
  getVietnamDayOfWeek,
  getVietnamMinutes,
  getRawMinutes,
} from "../../helpers/time.helper";
import {
  addDays,
  addMonths,
  isBefore,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";

/**
 * 
 Frontend cần gửi:

start_time: Ví dụ 2024-01-01T19:00:00.000Z (Chỉ quan tâm giờ: 19:00).

end_time: Ví dụ 2024-01-01T20:30:00.000Z (Chỉ quan tâm giờ: 20:30).

start_date: 2024-01-01.

end_date: 2024-02-01.

recurring_type: WEEKLY.

Hệ thống sẽ tự động sinh ra các booking vào ngày 1/1, 8/1, 15/1, 22/1, 29/1 lúc 19:00.
 */

export const createRecurringBookingService = async (
  player_id: string,
  data: CreateRecurringBookingInput,
  sub_field_id: string
) => {
  // 1. Validate SubField & Player
  const player = await prisma.player.findUnique({
    where: { id: player_id, status: "ACTIVE" },
  });
  if (!player) throw new ForbiddenError("Player not active or found");

  const subField = await prisma.subField.findFirst({
    where: { id: sub_field_id, isDelete: false },
  });
  if (!subField) throw new NotFoundError("Sub field not found");

  // Kiểm tra xem user này có đang pending một yêu cầu y hệt không? Nếu có thì không tạo mới, mà gia hạn thời gian giữ chỗ
  const existingRecurring = await prisma.recurringBooking.findFirst({
    where: {
      player_id, //cùng player
      sub_field_id,
      recurrence_type: data.recurring_type,
      // So sánh ngày bắt đầu/kết thúc
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
      status: {
        in: ["PENDING", "COMPLETED", "CONFIRMED"],
      },
    },
    include: {
      bookings: true, // Lấy booking con để tính lại tổng tiền
    },
  });

  if (existingRecurring) {
    //nếu đã thanh toán hoặc xác nhận thì báo lỗi xem lại ở trang lịch sử
    if (
      existingRecurring.status === "COMPLETED" ||
      existingRecurring.status === "CONFIRMED"
    ) {
      throw new BadRequestError(
        "Bạn đã đặt khung thời gian này. Vui lòng xem lại lịch sử đặt sân của bạn."
      );
    }
    //  Nếu tìm thấy -> Gia hạn thời gian giữ chỗ cho tất cả booking con
    // (Cho thêm 15 phút nữa để thanh toán)
    await prisma.booking.updateMany({
      where: { recurring_booking_id: existingRecurring.id },
      data: { expires_at: new Date(Date.now() + 3 * 60 * 1000) },
    });

    //  Tính lại tổng tiền (để trả về FE hiển thị)
    const totalPrice = existingRecurring.bookings.reduce(
      (sum, b) => sum + Number(b.total_price),
      0
    );

    //  Trả về luôn (Không tạo mới nữa)
    return {
      message: "Đã tiếp tục phiên đặt chỗ định kỳ trước đó",
      recurring_booking_id: existingRecurring.id,
      total_slots: existingRecurring.bookings.length,
      total_price: totalPrice,
    };
  }

  // 2. Tạo danh sách các ngày cần đặt (Booking Slots)
  const bookingSlots: { start: Date; end: Date }[] = [];

  let currentDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);

  // Lấy giờ và phút từ input (ví dụ: 19:00 - 20:30)
  const startHour = data.start_time.getHours();
  const startMinute = data.start_time.getMinutes();
  const endHour = data.end_time.getHours();
  const endMinute = data.end_time.getMinutes();

  // Vòng lặp tạo ngày
  while (
    isBefore(currentDate, endDate) ||
    currentDate.getTime() === endDate.getTime()
  ) {
    // Tạo object Date cụ thể cho ngày hiện tại trong vòng lặp
    // Set giờ phút của ngày đó theo giờ mẫu
    const slotStart = setMinutes(
      setHours(new Date(currentDate), startHour),
      startMinute
    );
    const slotEnd = setMinutes(
      setHours(new Date(currentDate), endHour),
      endMinute
    );

    bookingSlots.push({ start: slotStart, end: slotEnd });

    // Tăng ngày tiếp theo dựa trên loại lặp lại
    if (data.recurring_type === RecurringBookingType.WEEKLY) {
      currentDate = addDays(currentDate, 7);
    } else if (data.recurring_type === RecurringBookingType.MONTHLY) {
      currentDate = addMonths(currentDate, 1);
    }
  }

  if (bookingSlots.length === 0) {
    throw new BadRequestError("No booking slots generated provided date range");
  }

  // 3. Xử lý từng Slot: Check trùng & Tính tiền
  // chuẩn bị data để insert bulk
  const bookingsToCreate: any[] = [];
  let totalRecurringPrice = 0;

  // duyệt từng slot
  for (const slot of bookingSlots) {
    //giờ bắt đầu phải lớn hơn giờ hiện tại
    if (slot.start < new Date()) {
      throw new BadRequestError(
        `Cannot create booking in the past: ${slot.start.toLocaleString()}`
      );
    }
    // Check Trùng Lịch
    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        sub_field_id: sub_field_id,
        OR: [
          { status: "PENDING", expires_at: { gt: new Date() } }, // Chỉ tính các booking pending còn hạn
          { status: "CONFIRMED" },
        ],
        AND: [
          { start_time: { lt: slot.end } },
          { end_time: { gt: slot.start } },
        ],
      },
    });

    if (overlappingBooking) {
      // Nếu chỉ cần 1 ngày bị trùng, báo lỗi ngay và hủy toàn bộ thao tác
      throw new BadRequestError(
        `Slot at ${slot.start.toLocaleString()} is already booked. Recurring booking failed.`
      );
    }

    //  Tính Tiền
    // Tái sử dụng logic tìm rule giống createBooking
    const dayOfWeek = getVietnamDayOfWeek(slot.start);

    // Tìm rule khớp với ngày thứ...
    const rules = await prisma.pricingRule.findMany({
      where: { sub_field_id: sub_field_id, day_of_week: dayOfWeek },
    });

    if (!rules.length) {
      throw new BadRequestError(
        `No pricing rule found for ${slot.start.toDateString()}`
      );
    }

    const slotStartMin = getVietnamMinutes(slot.start);
    const slotEndMin = getVietnamMinutes(slot.end);

    const matchedRule = rules.find((rule) => {
      const ruleStartMin = getRawMinutes(rule.start_time);
      const ruleEndMin = getRawMinutes(rule.end_time);
      return slotStartMin >= ruleStartMin && slotEndMin <= ruleEndMin;
    });

    if (!matchedRule) {
      throw new BadRequestError(
        `Time slot ${slot.start.toLocaleTimeString()} is out of operating hours`
      );
    }

    // Tính giá cho slot này
    const durationHours = (slotEndMin - slotStartMin) / 60;
    const slotPrice = Number(matchedRule.base_price) * durationHours;

    totalRecurringPrice += slotPrice;

    // Push vào mảng chờ tạo
    bookingsToCreate.push({
      start_time: slot.start,
      end_time: slot.end,
      total_price: slotPrice,
      status: "PENDING", // Trạng thái ban đầu
      expires_at: new Date(Date.now() + 3 * 60 * 1000), // Cho 3 phút để thanh toán cả cụm
    });
  }

  // 4. Transaction: Lưu tất cả vào DB
  const result = await prisma.$transaction(async (tx) => {
    //  Tạo RecurringBooking Cha
    const recurringBooking = await tx.recurringBooking.create({
      data: {
        player_id,
        sub_field_id,
        recurrence_type: data.recurring_type,
        start_date: data.start_date,
        end_date: data.end_date,
        status: "PENDING",
        recurrence_detail: {
          day_of_week: getVietnamDayOfWeek(data.start_time),
          start_time: `${startHour}:${startMinute}`,
          end_time: `${endHour}:${endMinute}`,
        }, // Lưu chi tiết để hiển thị UI
      },
    });

    // Tạo các Booking Con
    // Map mảng data đã chuẩn bị ở trên để thêm các khóa ngoại
    const childBookingsData = bookingsToCreate.map((b) => ({
      ...b,
      player_id,
      sub_field_id,
      recurring_booking_id: recurringBooking.id, // Liên kết với cha
    }));

    // createMany nhanh hơn create trong vòng lặp
    await tx.booking.createMany({
      data: childBookingsData,
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
  user_type: "PLAYER" | "OWNER"
) => {
  if (user_type === "PLAYER") {
    // Check player
    const player = await prisma.player.findUnique({
      where: { id: user_id, status: "ACTIVE" },
    });
    if (!player) throw new ForbiddenError("Player not active or found");

    // Validate Recurring Booking belongs to player
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
    // Check owner
    const owner = await prisma.owner.findUnique({
      where: { id: user_id, status: "ACTIVE" },
    });
    if (!owner) throw new ForbiddenError("Owner not active or found");

    // Validate Recurring Booking belongs to owner's complex
    const recurringBooking = await prisma.recurringBooking.findFirst({
      where: {
        id: recurring_booking_id,
        sub_field: {
          complex: {
            owner_id: user_id,
          },
        },
      },
    });

    if (!recurringBooking)
      throw new NotFoundError(
        "Recurring booking not found or not owned by this owner"
      );
  }

  // Tìm các Booking Con hợp lệ để hủy
  await prisma.booking.updateMany({
    where: {
      recurring_booking_id: recurring_booking_id,
    },
    data: { status: "CANCELED" },
  });
  // Cập nhật trạng thái Recurring Booking
  await prisma.recurringBooking.update({
    where: { id: recurring_booking_id },
    data: { status: "CANCELED" },
  });
  return {
    message:
      "Recurring booking cancelled successfully. Refunds processed if applicable.",
  };
};

export const reviewRecurringBookingService = async (
  recurring_booking_id: string,
  player_id: string
) => {
  // 1. Lấy thông tin Recurring Booking và tất cả các Booking con
  const recurringBooking = await prisma.recurringBooking.findFirst({
    where: {
      id: recurring_booking_id,
      player_id: player_id,
      // status: "PENDING", // Giả sử RecurringBooking cũng có status PENDING khi mới tạo
    },
    include: {
      sub_field: {
        include: {
          complex: {
            select: {
              complex_name: true,
              complex_address: true,
            },
          },
        },
      },
      bookings: true, // Lấy toàn bộ danh sách booking con để check
    },
  });

  if (!recurringBooking || recurringBooking.bookings.length === 0) {
    throw new NotFoundError("Recurring booking not found or invalid");
  }

  // 2. Kiểm tra hết hạn (Expired Check)
  // Vì các booking con được tạo cùng lúc, chỉ cần check cái đầu tiên là biết cả dây có hết hạn chưa
  const firstBooking = recurringBooking.bookings[0];

  if (new Date() > firstBooking.expires_at) {
    // Nếu quá hạn, Hủy toàn bộ dây
    await prisma.$transaction([
      prisma.recurringBooking.update({
        where: { id: recurring_booking_id },
        data: { status: "CANCELED" },
      }),
      prisma.booking.updateMany({
        where: { recurring_booking_id: recurring_booking_id },
        data: { status: "CANCELED" },
      }),
    ]);
    throw new BadRequestError("Recurring booking session has expired");
  }

  // 3. Kiểm tra xung đột (Double Check Conflict)
  // Phòng trường hợp trong lúc PENDING, Admin hoặc hệ thống khác đã CONFIRM một slot nào đó chen ngang

  // Tạo mảng điều kiện OR khổng lồ để check 1 lần duy nhất trong DB
  // Logic: Tìm booking nào CONFIRMED mà trùng giờ với BẤT KỲ slot nào trong danh sách của mình
  const conflictConditions = recurringBooking.bookings.map((slot) => ({
    AND: [
      { start_time: { lt: slot.end_time } }, // Start < End
      { end_time: { gt: slot.start_time } }, // End > Start
    ],
  }));

  const conflictBooking = await prisma.booking.findFirst({
    where: {
      sub_field_id: recurringBooking.sub_field_id,
      status: "CONFIRMED", // Chỉ sợ thằng đã trả tiền rồi
      OR: conflictConditions, // Kiểm tra trùng với bất kỳ slot nào
    },
  });

  if (conflictBooking) {
    // Nếu tìm thấy dù chỉ 1 slot bị trùng -> Báo lỗi ngay
    // Có thể nâng cao bằng cách báo cụ thể ngày nào bị trùng
    throw new BadRequestError(
      `One of the slots (around ${conflictBooking.start_time.toLocaleString()}) has been booked by someone else.`
    );
  }

  // 4. Tính toán tổng tiền (để hiển thị lần cuối)
  const totalAmount = recurringBooking.bookings.reduce(
    (sum, item) => sum + Number(item.total_price),
    0
  );

  // 5. Trả về dữ liệu đã Clean để Frontend hiển thị
  return {
    id: recurringBooking.id,
    complex_name: recurringBooking.sub_field.complex.complex_name,
    complex_address: recurringBooking.sub_field.complex.complex_address,
    sub_field_name: recurringBooking.sub_field.sub_field_name,
    sport_type: recurringBooking.sub_field.sport_type,

    // Thông tin định kỳ
    start_date: recurringBooking.start_date,
    end_date: recurringBooking.end_date,
    recurrence_type: recurringBooking.recurrence_type,

    // Tổng số buổi & Tổng tiền
    total_slots: recurringBooking.bookings.length,
    total_price: totalAmount,

    // Danh sách chi tiết các buổi (để user review lại ngày giờ)
    slots: recurringBooking.bookings.map((b) => ({
      id: b.id,
      startTime: b.start_time,
      endTime: b.end_time,
      price: b.total_price,
    })),

    expires_at: firstBooking.expires_at, // Thời hạn thanh toán
  };
};

export const ownerConfirmRecurringBookingService = async (
  recurring_booking_id: string,
  owner_id: string
) => {
  //check owner
  const owner = await prisma.owner.findUnique({
    where: { id: owner_id, status: "ACTIVE" },
  });
  if (!owner) throw new NotFoundError("Owner not active or found");

  //check recurring booking là thuộc sở hữu của owner
  const recurringBooking = await prisma.recurringBooking.findFirst({
    where: {
      id: recurring_booking_id,
      sub_field: {
        complex: {
          owner_id: owner_id,
        },
      },
      status: "COMPLETED",
      bookings: {
        some: {
          status: "COMPLETED",
        },
      },
    },
  });

  if (!recurringBooking) {
    throw new NotFoundError(
      "Recurring booking not found or inaccessible by owner"
    );
  }

  //update tất cả booking con sang CONFIRMED
  await prisma.booking.updateMany({
    where: {
      recurring_booking_id: recurring_booking_id,
      status: "COMPLETED",
    },
    data: {
      status: "CONFIRMED",
    },
  });

  //cập nhật trạng thái recurring booking
  await prisma.recurringBooking.update({
    where: { id: recurring_booking_id },
    data: {
      status: "CONFIRMED",
    },
  });

  return {
    message: "Recurring booking confirmed successfully by owner",
  };
};
