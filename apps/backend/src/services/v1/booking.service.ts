import { prisma } from "@sports-booking-platform/db";
import { CreateBookingInput } from "@sports-booking-platform/validation";
import { BookingStatus } from "@sports-booking-platform/db";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/error.response";

import {
  getVietnamMinutes,
  getVietnamDayOfWeek,
  getRawMinutes,
  formatTimeForDisplayErrBookingService,
} from "../../helpers/time.helper";

import { BOOKING_TIMEOUT } from "../../configs";

export interface filter {
  search?: string;
  status?: BookingStatus;
  start_date?: Date;
  end_date?: Date;
  min_price?: number;
  max_price?: number;
}

export const createBooking = async (
  player_id: string,
  data: CreateBookingInput,
  sub_field_id: string
) => {
  //check player exists
  const player = await prisma.player.findUnique({
    where: { id: player_id, status: "ACTIVE" },
  });
  if (!player) {
    throw new ForbiddenError("You are not allowed to make a booking");
  }

  // Không cho phép đặt slot trong quá khứ
  if (new Date(data.start_time) < new Date()) {
    throw new BadRequestError("Không thể đặt sân cho thời gian đã qua.");
  }

  //check sub field exists
  const subField = await prisma.subField.findFirst({
    where: { id: sub_field_id, isDelete: false },
  });
  if (!subField) {
    throw new NotFoundError("Sub field not found");
  }

  //check overlapping booking
  const overlappingBooking = await prisma.booking.findFirst({
    where: {
      sub_field_id: sub_field_id,
      OR: [
        { status: "PENDING", expires_at: { gt: new Date() } },
        { status: "COMPLETED" },
        { status: "CONFIRMED" },
      ],
      start_time: { lt: data.end_time },
      end_time: { gt: data.start_time },
    },
  });

  //neu nguoi dung quay lai va sau do lai dat lai thi se khong thong bao loi ma booking do van la cua chinh nguoi do

  if (overlappingBooking) {
    // Nếu là của chính user này
    if (overlappingBooking.player_id === player_id) {
      //neu booking đã được thanh toán hoặc xác nhận thì thông báo xem lại ở trang lịch sử
      if (
        overlappingBooking.status === "COMPLETED" ||
        overlappingBooking.status === "CONFIRMED"
      ) {
        throw new BadRequestError(
          "Bạn đã đặt khung thời gian này. Vui lòng xem lại lịch sử đặt sân của bạn."
        );
      }

      // Nếu là PENDING và CHÍNH XÁC cùng thời gian → Gia hạn
      if (
        overlappingBooking.start_time.getTime() ===
          new Date(data.start_time).getTime() &&
        overlappingBooking.end_time.getTime() ===
          new Date(data.end_time).getTime()
      ) {
        //gia hạn thời gian giữ chỗ
        const updatedBooking = await prisma.booking.update({
          where: { id: overlappingBooking.id },
          data: { expires_at: new Date(Date.now() + BOOKING_TIMEOUT.INITIAL) },
        });

        //trả về thông tin booking đã được gia hạn
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

      // Nếu khác thời gian → Báo lỗi overlap của chính user
      throw new BadRequestError(
        "Bạn đã đặt một khung giờ khác trùng với khung giờ này. Vui lòng kiểm tra lại lịch đặt sân."
      );
    }

    //nếu không phải của người dùng hiện tại thì báo lỗi đã có người đặt
    throw new BadRequestError(
      `Đã có người đặt khoảng thời gian từ ${formatTimeForDisplayErrBookingService(
        overlappingBooking.start_time
      )} đến ${formatTimeForDisplayErrBookingService(
        overlappingBooking.end_time
      )}  trên sân này. Vui lòng chọn khung giờ khác.`
    );
  }

  //  TÌM PRICING RULE PHÙ HỢP VÀ TÍNH GIÁ

  const dayOfWeek = getVietnamDayOfWeek(data.start_time);
  console.log("dayOfWeek:::::", dayOfWeek);

  // Lấy tất cả các khung giá của ngày hôm đó
  const potentialRules = await prisma.pricingRule.findMany({
    where: {
      sub_field_id: sub_field_id,
      day_of_week: dayOfWeek,
    },
  });
  console.log("potentialRules:::::", potentialRules);

  if (!potentialRules || potentialRules.length === 0) {
    throw new BadRequestError("Sân chưa thiết lập bảng giá cho ngày này.");
  }

  const bookingStartMin = getVietnamMinutes(data.start_time);
  const bookingEndMin = getVietnamMinutes(data.end_time);
  console.log("bookingStartMin:::::", bookingStartMin);
  console.log("bookingEndMin:::::", bookingEndMin);

  // Tìm tất cả rules giao với booking time
  const overlappingRules = potentialRules.filter((rule: any) => {
    const ruleStartMin = getRawMinutes(rule.start_time);
    const ruleEndMin = getRawMinutes(rule.end_time);

    // Rule giao với booking nếu:
    // Rule bắt đầu trước khi booking kết thúc VÀ
    // Rule kết thúc sau khi booking bắt đầu
    return ruleStartMin < bookingEndMin && ruleEndMin > bookingStartMin;
  });

  if (overlappingRules.length === 0) {
    throw new BadRequestError(
      "Giờ đặt không hợp lệ hoặc nằm ngoài khung giờ hoạt động của sân."
    );
  }

  // Sắp xếp rules theo thời gian
  overlappingRules.sort(
    (a, b) => getRawMinutes(a.start_time) - getRawMinutes(b.start_time)
  );

  // Tính giá theo từng segment
  let totalPrice = 0;
  let currentMin = bookingStartMin;
  const priceBreakdown: Array<{
    rule_id: string;
    start_min: number;
    end_min: number;
    duration_min: number;
    base_price: number;
    segment_price: number;
  }> = [];

  for (const rule of overlappingRules) {
    const ruleStartMin = getRawMinutes(rule.start_time);
    const ruleEndMin = getRawMinutes(rule.end_time);

    // Tìm phần giao nhau
    const segmentStart = Math.max(currentMin, ruleStartMin);
    const segmentEnd = Math.min(bookingEndMin, ruleEndMin);

    if (segmentStart < segmentEnd) {
      const segmentDuration = segmentEnd - segmentStart; // minutes
      const segmentHours = segmentDuration / 60;
      const segmentPrice = Number(rule.base_price) * segmentHours;

      totalPrice += segmentPrice;
      priceBreakdown.push({
        rule_id: rule.id,
        start_min: segmentStart,
        end_min: segmentEnd,
        duration_min: segmentDuration,
        base_price: Number(rule.base_price),
        segment_price: segmentPrice,
      });

      currentMin = segmentEnd;
    }

    if (currentMin >= bookingEndMin) break;
  }

  // Kiểm tra xem đã cover hết booking chưa
  if (currentMin < bookingEndMin) {
    const formatTime = (min: number) => {
      const h = Math.floor(min / 60)
        .toString()
        .padStart(2, "0");
      const m = (min % 60).toString().padStart(2, "0");
      return `${h}:${m}`;
    };

    throw new BadRequestError(
      `Khung giờ ${formatTime(currentMin)} - ${formatTime(
        bookingEndMin
      )} không có giá. Vui lòng chọn khung giờ khác.`
    );
  }

  console.log("Price Breakdown:::::", priceBreakdown);
  console.log("Total Price:::::", totalPrice);

  //create booking
  const booking = await prisma.booking.create({
    data: {
      player_id,
      sub_field_id,
      start_time: data.start_time,
      end_time: data.end_time,
      total_price: totalPrice,
      status: "PENDING",
      expires_at: new Date(Date.now() + BOOKING_TIMEOUT.INITIAL), // 5 minutes from now
    },
  });

  return {
    message: "Đặt sân thành công! Vui lòng kiểm tra lại thông tin.",
    booking_id: booking.id,
    start_time: booking.start_time,
    end_time: booking.end_time,
    total_price: booking.total_price,
    status: booking.status,
    expires_at: booking.expires_at,
  };
};

//review booking before payment
export const reviewBooking = async (booking_id: string, player_id: string) => {
  const booking = await prisma.booking.findFirst({
    where: {
      id: booking_id,
      player_id: player_id,
      status: "PENDING",
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
    },
  });

  if (!booking) {
    throw new NotFoundError("Booking not found or cannot be reviewed");
  }

  // Nếu đã quá giờ giữ chỗ ->  không cho thanh toán
  if (new Date() > booking.expires_at) {
    // update trang thai booking thanh CANCELED
    await prisma.booking.update({
      where: { id: booking_id },
      data: { status: "CANCELED" },
    });
    throw new BadRequestError("Booking has expired and been canceled");
  }

  //can kiem tra vi trong luc review co the co nguoi da dat truoc do roi
  const conflickBooking = await prisma.booking.findFirst({
    where: {
      sub_field_id: booking.sub_field_id,
      status: "CONFIRMED",
      AND: [
        {
          start_time: { lt: booking.end_time },
        },
        {
          end_time: { gt: booking.start_time },
        },
        {
          id: { not: booking.id },
        },
      ],
    },
  });

  if (conflickBooking) {
    throw new BadRequestError(
      "The selected time slot has just been booked by someone else"
    );
  }

  return {
    id: booking.id,
    start_time: booking.start_time,
    end_time: booking.end_time,
    total_price: booking.total_price,
    complex_name: booking.sub_field.complex.complex_name,
    complex_address: booking.sub_field.complex.complex_address,
    sprot_type: booking.sub_field.sport_type,
    sub_field_name: booking.sub_field.sub_field_name,
    expires_at: booking.expires_at,
  };
};

export const updateBooking = async (
  player_id: string,
  data: CreateBookingInput,
  booking_id: string
) => {
  //check player exists
  const player = await prisma.player.findUnique({
    where: { id: player_id, status: "ACTIVE" },
  });
  if (!player) {
    throw new ForbiddenError("You are not allowed to make a booking");
  }

  //check booking exists
  const existingBooking = await prisma.booking.findFirst({
    where: { id: booking_id, player_id: player_id, status: "PENDING" },
  });
  if (!existingBooking) {
    throw new NotFoundError("Booking not found or cannot be updated");
  }

  const sub_field_id = existingBooking.sub_field_id;

  //check overlapping booking
  const overlappingBooking = await prisma.booking.findFirst({
    where: {
      sub_field_id: sub_field_id,
      id: { not: booking_id },
      OR: [
        { status: "PENDING", expires_at: { gt: new Date() } },
        { status: "CONFIRMED" },
      ],
      AND: [
        {
          start_time: { lt: data.end_time },
        },
        {
          end_time: { gt: data.start_time },
        },
      ],
    },
  });

  if (overlappingBooking) {
    throw new BadRequestError(
      `Đã có một booking khung giờ từ ${formatTimeForDisplayErrBookingService(
        overlappingBooking.start_time
      )} đến ${formatTimeForDisplayErrBookingService(
        overlappingBooking.end_time
      )}. Vui lòng chọn khung giờ khác.`
    );
  }

  //  TÌM PRICING RULE PHÙ HỢP VÀ TÍNH GIÁ

  const dayOfWeek = getVietnamDayOfWeek(data.start_time);
  console.log("dayOfWeek:::::", dayOfWeek);

  // Lấy tất cả các khung giá của ngày hôm đó
  const potentialRules = await prisma.pricingRule.findMany({
    where: {
      sub_field_id: sub_field_id,
      day_of_week: dayOfWeek,
    },
  });
  console.log("potentialRules:::::", potentialRules);

  if (!potentialRules || potentialRules.length === 0) {
    throw new BadRequestError("Sân chưa thiết lập bảng giá cho ngày này.");
  }

  const bookingStartMin = getVietnamMinutes(data.start_time);
  const bookingEndMin = getVietnamMinutes(data.end_time);
  console.log("bookingStartMin:::::", bookingStartMin);
  console.log("bookingEndMin:::::", bookingEndMin);

  // Tìm tất cả rules giao với booking time
  const overlappingRules = potentialRules.filter((rule: any) => {
    const ruleStartMin = getRawMinutes(rule.start_time);
    const ruleEndMin = getRawMinutes(rule.end_time);

    // Rule giao với booking nếu:
    // Rule bắt đầu trước khi booking kết thúc VÀ
    // Rule kết thúc sau khi booking bắt đầu
    return ruleStartMin < bookingEndMin && ruleEndMin > bookingStartMin;
  });

  if (overlappingRules.length === 0) {
    throw new BadRequestError(
      "Giờ đặt không hợp lệ hoặc nằm ngoài khung giờ hoạt động của sân."
    );
  }

  // Sắp xếp rules theo thời gian
  overlappingRules.sort(
    (a, b) => getRawMinutes(a.start_time) - getRawMinutes(b.start_time)
  );

  // Tính giá theo từng segment
  let totalPrice = 0;
  let currentMin = bookingStartMin;

  for (const rule of overlappingRules) {
    const ruleStartMin = getRawMinutes(rule.start_time);
    const ruleEndMin = getRawMinutes(rule.end_time);

    // Tìm phần giao nhau
    const segmentStart = Math.max(currentMin, ruleStartMin);
    const segmentEnd = Math.min(bookingEndMin, ruleEndMin);

    if (segmentStart < segmentEnd) {
      const segmentDuration = segmentEnd - segmentStart; // minutes
      const segmentHours = segmentDuration / 60;
      const segmentPrice = Number(rule.base_price) * segmentHours;

      totalPrice += segmentPrice;
      currentMin = segmentEnd;
    }

    if (currentMin >= bookingEndMin) break;
  }

  // Kiểm tra xem đã cover hết booking chưa
  if (currentMin < bookingEndMin) {
    const formatTime = (min: number) => {
      const h = Math.floor(min / 60)
        .toString()
        .padStart(2, "0");
      const m = (min % 60).toString().padStart(2, "0");
      return `${h}:${m}`;
    };

    throw new BadRequestError(
      `Khung giờ ${formatTime(currentMin)} - ${formatTime(
        bookingEndMin
      )} không có giá. Vui lòng chọn khung giờ khác.`
    );
  }

  console.log("Total Price:::::", totalPrice);

  //create booking
  const booking = await prisma.booking.update({
    where: { id: booking_id },
    data: {
      player_id,
      sub_field_id,
      start_time: data.start_time,
      end_time: data.end_time,
      total_price: totalPrice,
      status: "PENDING",
      expires_at: new Date(Date.now() + BOOKING_TIMEOUT.INITIAL), // 5 minutes from now
    },
  });

  return {
    booking_id: booking.id,
    start_time: booking.start_time,
    end_time: booking.end_time,
    total_price: booking.total_price,
    status: booking.status,
    expires_at: booking.expires_at,
  };
};

//player hủy booking
export const cancelBooking = async (booking_id: string, player_id: string) => {
  const booking = await prisma.booking.findFirst({
    where: {
      id: booking_id,
      player_id: player_id,
      status: { in: ["PENDING", "COMPLETED", "CONFIRMED"] },
    },
  });

  if (!booking) {
    throw new NotFoundError("Booking not found or cannot be canceled");
  }
  //chi huy những booking chưa xảy ra, tức là thời gian hiện tại phải nhỏ hơn start_time
  if (booking.start_time <= new Date()) {
    throw new BadRequestError(
      "Cannot cancel a booking that has already started or passed"
    );
  }

  await prisma.booking.update({
    where: { id: booking_id },
    data: { status: "CANCELED" },
  });

  return { message: "Booking canceled successfully" };
};

//owner hủy booking
export const ownerCancelBooking = async (
  booking_id: string,
  owner_id: string
) => {
  //check owner exists
  const owner = await prisma.owner.findUnique({
    where: { id: owner_id, status: "ACTIVE" },
  });
  if (!owner) {
    throw new ForbiddenError("You are not allowed to cancel bookings");
  }
  //check booking exists and belongs to owner's complex
  const booking = await prisma.booking.findFirst({
    where: {
      id: booking_id,
      sub_field: {
        complex: {
          owner_id: owner_id,
        },
      },
    },
  });

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  if (booking.status === "CANCELED") {
    throw new BadRequestError(
      "Booking has already been canceled and cannot be canceled again"
    );
  }

  await prisma.booking.update({
    where: { id: booking_id },
    data: { status: "CANCELED" },
  });

  return { message: "Booking canceled successfully" };
};

//owner xác nhận booking
export const ownerConfirmBooking = async (
  booking_id: string,
  owner_id: string
) => {
  //check owner exists
  const owner = await prisma.owner.findUnique({
    where: { id: owner_id, status: "ACTIVE" },
  });
  if (!owner) {
    throw new ForbiddenError("You are not allowed to confirm bookings");
  }
  //check booking exists and belongs to owner's complex
  const booking = await prisma.booking.findFirst({
    where: {
      id: booking_id,
      sub_field: {
        complex: {
          owner_id: owner_id,
        },
      },
      status: "COMPLETED",
      payment: {
        status: "SUCCESS",
      },
    },
  });

  if (!booking) {
    throw new BadRequestError("Booking not found or cannot be confirmed");
  }

  await prisma.booking.update({
    where: { id: booking_id },
    data: { status: "CONFIRMED" },
  });

  return { message: "Booking confirmed successfully" };
};

// //owner get all bookings of his complex
// export const ownerGetAllBookings = async (
//   owner_id: string,
//   page = 1,
//   limit = 8,
//   filter: Partial<filter> = {}
// ) => {
//   //check owner exists
//   const owner = await prisma.owner.findUnique({
//     where: { id: owner_id, status: "ACTIVE" },
//   });
//   if (!owner) {
//     throw new ForbiddenError("You are not allowed to view bookings");
//   }

//   const skip = (page - 1) * limit;

//   let startDate;
//   let endDate;

//   if (filter.start_date) {
//     startDate = new Date(filter.start_date);
//   }

//   if (filter.end_date) {
//     endDate = new Date(filter.end_date);
//   }

//   //build where condition
//   const whereCondition: any = {
//     sub_field: {
//       complex: {
//         owner_id: owner_id,
//       },
//     },
//   };

//   // Add search filter if provided
//   if (filter.search && filter.search.trim() !== "") {
//     whereCondition.OR = [
//       {
//         sub_field: {
//           complex: {
//             complex_name: {
//               contains: filter.search,
//               mode: "insensitive",
//             },
//           },
//         },
//       },
//       {
//         sub_field: {
//           sub_field_name: {
//             contains: filter.search,
//             mode: "insensitive",
//           },
//         },
//       },
//     ];
//   }

//   // Add status filter if provided
//   if (filter.status) {
//     whereCondition.status = filter.status;
//   }

//   // Add price range filter if provided
//   if (filter.min_price || filter.max_price) {
//     whereCondition.total_price = {};
//     if (filter.min_price) {
//       whereCondition.total_price.gte = filter.min_price;
//     }
//     if (filter.max_price) {
//       whereCondition.total_price.lte = filter.max_price;
//     }
//   }

//   // Add date range filter if provided
//   if (startDate || endDate) {
//     whereCondition.start_time = {};
//     if (startDate) {
//       whereCondition.start_time.gte = startDate;
//     }
//     if (endDate) {
//       whereCondition.start_time.lte = endDate;
//     }
//   }

//   const [total, bookings] = await prisma.$transaction([
//     prisma.booking.count({
//       where: whereCondition,
//     }),
//     prisma.booking.findMany({
//       where: whereCondition,
//       select: {
//         id: true,
//         start_time: true,
//         end_time: true,
//         total_price: true,
//         status: true,
//         player: {
//           select: {
//             account: {
//               select: {
//                 full_name: true,
//                 phone_number: true,
//               },
//             },
//           },
//         },
//         sub_field: {
//           select: {
//             sub_field_name: true,
//             sport_type: true,
//             complex: {
//               select: {
//                 complex_name: true,
//                 complex_address: true,
//               },
//             },
//           },
//         },
//       },
//       orderBy: { created_at: "desc" },
//       skip,
//       take: limit,
//     }),
//   ]);

//   const totalPages = Math.ceil(total / limit);

//   return {
//     bookings,
//     pagination: {
//       total,
//       page,
//       limit,
//       totalPages,
//     },
//   };
// };

// owner get booking by id
export const ownerGetBookingById = async (
  booking_id: string,
  owner_id: string
) => {
  //check owner exists
  const owner = await prisma.owner.findUnique({
    where: { id: owner_id, status: "ACTIVE" },
  });
  if (!owner) {
    throw new ForbiddenError("You are not allowed to view bookings");
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: booking_id,
      sub_field: {
        complex: {
          owner_id: owner_id,
        },
      },
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
            select: {
              full_name: true,
              phone_number: true,
            },
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
  // //check owner co phai la chu so huu cua complex chua booking do
  if (booking.sub_field.complex.owner_id !== owner_id) {
    throw new ForbiddenError("You are not allowed to view this booking");
  }

  return booking;
};

// owner get booking stats
export const getOwnerBookingStats = async (owner_id: string) => {
  //check owner exists
  const owner = await prisma.owner.findUnique({
    where: { id: owner_id, status: "ACTIVE" },
  });
  if (!owner) {
    throw new ForbiddenError("You are not allowed to view bookings");
  }

  const baseCondition = {
    sub_field: {
      complex: {
        owner_id: owner_id,
      },
    },
  };

  // Đếm các booking lẻ (không thuộc recurring)
  const [
    singleTotal,
    singlePending,
    singleConfirmed,
    singleCompleted,
    singleCanceled,
  ] = await Promise.all([
    prisma.booking.count({
      where: {
        ...baseCondition,
        recurring_booking_id: null,
      },
    }),
    prisma.booking.count({
      where: {
        ...baseCondition,
        recurring_booking_id: null,
        status: "PENDING",
      },
    }),
    prisma.booking.count({
      where: {
        ...baseCondition,
        recurring_booking_id: null,
        status: "CONFIRMED",
      },
    }),
    prisma.booking.count({
      where: {
        ...baseCondition,
        recurring_booking_id: null,
        status: "COMPLETED",
      },
    }),
    prisma.booking.count({
      where: {
        ...baseCondition,
        recurring_booking_id: null,
        status: "CANCELED",
      },
    }),
  ]);

  // Đếm các recurring booking
  const [
    recurringTotal,
    recurringPending,
    recurringConfirmed,
    recurringCompleted,
    recurringCanceled,
  ] = await Promise.all([
    prisma.recurringBooking.count({
      where: baseCondition,
    }),
    prisma.recurringBooking.count({
      where: {
        ...baseCondition,
        status: "PENDING",
      },
    }),
    prisma.recurringBooking.count({
      where: {
        ...baseCondition,
        status: "CONFIRMED",
      },
    }),
    prisma.recurringBooking.count({
      where: {
        ...baseCondition,
        status: "COMPLETED",
      },
    }),
    prisma.recurringBooking.count({
      where: {
        ...baseCondition,
        status: "CANCELED",
      },
    }),
  ]);

  return {
    total: singleTotal + recurringTotal,
    pending: singlePending + recurringPending,
    confirmed: singleConfirmed + recurringConfirmed,
    completed: singleCompleted + recurringCompleted,
    canceled: singleCanceled + recurringCanceled,
  };
};

//get player bookings
export const getPlayerBookings = async (
  player_id: string,
  page = 1,
  limit = 8
) => {
  //check player exists
  const player = await prisma.player.findUnique({
    where: { id: player_id, status: "ACTIVE" },
  });
  if (!player) {
    throw new ForbiddenError("You are not allowed to view bookings");
  }

  //lay tat cả các booking lẻ
  const singleBookings = await prisma.booking.findMany({
    where: {
      player_id: player_id,
      recurring_booking_id: null,
    },
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
            select: {
              complex_name: true,
              complex_address: true,
            },
          },
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  //lay tat ca cac recurring booking
  const recurringBookings = await prisma.recurringBooking.findMany({
    where: {
      player_id: player_id,
    },
    select: {
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
            select: {
              complex_name: true,
              complex_address: true,
            },
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
        orderBy: { start_time: "desc" },
      },
    },
  });

  //format bookings lẻ
  const formattedSingleBookings = singleBookings.map((booking) => ({
    id: booking.id,
    type: "SINGLE" as const,
    start_time: booking.start_time,
    end_time: booking.end_time,
    total_price: booking.total_price,
    status: booking.status,
    sub_field_name: booking.sub_field.sub_field_name,
    sport_type: booking.sub_field.sport_type,
    complex_name: booking.sub_field.complex.complex_name,
    complex_address: booking.sub_field.complex.complex_address,
    expires_at: booking.expires_at,
    created_at: booking.created_at,
  }));

  //format recurring bookings
  const formattedRecurringBookings = recurringBookings.map((recurring) => {
    //tinh tong tien cua tat ca cac booking con
    const total_price = recurring.bookings.reduce(
      (sum, booking) => sum + Number(booking.total_price),
      0
    );

    const earliestExpiration =
      recurring.status === "PENDING"
        ? recurring.bookings
            .filter((booking) => booking.status === "PENDING")
            .reduce((earliest, booking) => {
              if (!earliest || booking.expires_at < earliest) {
                return booking.expires_at;
              }
              return earliest;
            }, null as Date | null)
        : null;

    return {
      id: recurring.id,
      type: "RECURRING" as const,
      start_date: recurring.start_date,
      end_date: recurring.end_date,
      recurrence_type: recurring.recurrence_type,
      status: recurring.status,
      total_slots: recurring.bookings.length,
      total_price: total_price,
      sub_field_name: recurring.sub_field.sub_field_name,
      sport_type: recurring.sub_field.sport_type,
      complex_name: recurring.sub_field.complex.complex_name,
      complex_address: recurring.sub_field.complex.complex_address,
      expires_at: earliestExpiration,
      created_at: recurring.created_at,
      bookings: recurring.bookings.map((booking) => ({
        id: booking.id,
        start_time: booking.start_time,
        end_time: booking.end_time,
        total_price: booking.total_price,
        status: booking.status,
      })),
    };
  });

  //gộp 2 mảng và sắp xếp theo ngày tạo
  const allBookings = [
    ...formattedSingleBookings,
    ...formattedRecurringBookings,
  ].sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

  //phân trang
  const total = allBookings.length;
  const skip = (page - 1) * limit;
  const paginatedBookings = allBookings.slice(skip, skip + limit);
  const totalPages = Math.ceil(total / limit);

  return {
    bookings: paginatedBookings,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

//get player bookings
export const ownerGetAllBookings = async (
  owner_id: string,
  page = 1,
  limit = 8,
  filter: Partial<filter> = {}
) => {
  //check owner exists
  const owner = await prisma.owner.findUnique({
    where: { id: owner_id, status: "ACTIVE" },
  });
  if (!owner) {
    throw new ForbiddenError("You are not allowed to view bookings");
  }

  //ngay bat dau va ket thuc loc
  let startDate;
  let endDate;

  if (filter.start_date) {
    startDate = new Date(filter.start_date);
  }

  if (filter.end_date) {
    endDate = new Date(filter.end_date);
  }

  //build where condition
  const whereCondition: any = {
    sub_field: {
      complex: {
        owner_id: owner_id,
      },
    },
  };

  // Add search filter if provided
  if (filter.search && filter.search.trim() !== "") {
    whereCondition.OR = [
      {
        sub_field: {
          complex: {
            complex_name: {
              contains: filter.search,
              mode: "insensitive",
            },
          },
        },
      },
      {
        sub_field: {
          sub_field_name: {
            contains: filter.search,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  // Add status filter if provided
  if (filter.status) {
    whereCondition.status = filter.status;
  }

  // Add price range filter if provided
  // if (filter.min_price || filter.max_price) {
  //   whereCondition.total_price = {};
  //   if (filter.min_price) {
  //     whereCondition.total_price.gte = filter.min_price;
  //   }
  //   if (filter.max_price) {
  //     whereCondition.total_price.lte = filter.max_price;
  //   }
  // }

  // Add date range filter if provided
  // if (startDate || endDate) {
  //   whereCondition.start_time = {};
  //   if (startDate) {
  //     whereCondition.start_time.gte = startDate;
  //   }
  //   if (endDate) {
  //     whereCondition.start_time.lte = endDate;
  //   }
  // }

  //lay tat cả các booking lẻ
  const singleBookings = await prisma.booking.findMany({
    where: {
      ...whereCondition,
      recurring_booking_id: null,
    },
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
            select: {
              complex_name: true,
              complex_address: true,
            },
          },
        },
      },
      player: {
        select: {
          account: {
            select: {
              full_name: true,
              phone_number: true,
            },
          },
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  //lay tat ca cac recurring booking
  const recurringBookings = await prisma.recurringBooking.findMany({
    where: whereCondition,
    select: {
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
            select: {
              complex_name: true,
              complex_address: true,
            },
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
        orderBy: { start_time: "desc" },
      },
      player: {
        select: {
          account: {
            select: {
              full_name: true,
              phone_number: true,
            },
          },
        },
      },
    },
  });

  //format bookings lẻ
  const formattedSingleBookings = singleBookings.map((booking) => ({
    id: booking.id,
    type: "SINGLE" as const,
    start_time: booking.start_time,
    end_time: booking.end_time,
    total_price: booking.total_price,
    status: booking.status,
    sub_field_name: booking.sub_field.sub_field_name,
    sport_type: booking.sub_field.sport_type,
    complex_name: booking.sub_field.complex.complex_name,
    complex_address: booking.sub_field.complex.complex_address,
    expires_at: booking.expires_at,
    created_at: booking.created_at,
    player_name: booking.player.account.full_name,
    player_phone: booking.player.account.phone_number,
  }));

  //format recurring bookings
  const formattedRecurringBookings = recurringBookings.map((recurring) => {
    //tinh tong tien cua tat ca cac booking con
    const total_price = recurring.bookings.reduce(
      (sum, booking) => sum + Number(booking.total_price),
      0
    );

    const earliestExpiration =
      recurring.status === "PENDING"
        ? recurring.bookings
            .filter((booking) => booking.status === "PENDING")
            .reduce((earliest, booking) => {
              if (!earliest || booking.expires_at < earliest) {
                return booking.expires_at;
              }
              return earliest;
            }, null as Date | null)
        : null;

    return {
      id: recurring.id,
      type: "RECURRING" as const,
      start_date: recurring.start_date,
      end_date: recurring.end_date,
      recurrence_type: recurring.recurrence_type,
      status: recurring.status,
      total_slots: recurring.bookings.length,
      total_price: total_price,
      sub_field_name: recurring.sub_field.sub_field_name,
      sport_type: recurring.sub_field.sport_type,
      complex_name: recurring.sub_field.complex.complex_name,
      complex_address: recurring.sub_field.complex.complex_address,
      expires_at: earliestExpiration,
      created_at: recurring.created_at,
      bookings: recurring.bookings.map((booking) => ({
        id: booking.id,
        start_time: booking.start_time,
        end_time: booking.end_time,
        total_price: booking.total_price,
        status: booking.status,
      })),
      player_name: recurring.player.account.full_name,
      player_phone: recurring.player.account.phone_number,
    };
  });

  //gộp 2 mảng và sắp xếp theo ngày tạo
  const allBookings = [
    ...formattedSingleBookings,
    ...formattedRecurringBookings,
  ].sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

  //phân trang
  const total = allBookings.length;
  const skip = (page - 1) * limit;
  const paginatedBookings = allBookings.slice(skip, skip + limit);
  const totalPages = Math.ceil(total / limit);

  return {
    bookings: paginatedBookings,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};
