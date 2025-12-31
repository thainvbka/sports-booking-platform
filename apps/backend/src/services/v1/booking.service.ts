import { prisma } from "@sports-booking-platform/db";
import { CreateBookingInput } from "@sports-booking-platform/validation";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/error.response";

import {
  getVietnamMinutes,
  getVietnamDayOfWeek,
  getRawMinutes,
} from "../../helpers/time.helper";

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

  //neu nguoi dung quay lai va sau do lai dat lai thi se khong thong bao loi ma booking do van la cua chinh nguoi do

  if (overlappingBooking) {
    if (overlappingBooking.player_id === player_id) {
      //gia hạn thời gian giữ chỗ
      const updatedBooking = await prisma.booking.update({
        where: { id: overlappingBooking.id },
        data: { expires_at: new Date(Date.now() + 3 * 60 * 1000) }, // 3 minutes from now
      });

      //trả về thông tin booking đã được gia hạn
      return {
        booking_id: updatedBooking.id,
        start_time: updatedBooking.start_time,
        end_time: updatedBooking.end_time,
        total_price: updatedBooking.total_price,
        status: updatedBooking.status,
        expires_at: updatedBooking.expires_at,
      };
    }
    //nếu không phải của người dùng hiện tại thì báo lỗi đã có người đặt
    throw new BadRequestError("The selected time slot is already booked");
  }

  // ---------------------------------------------------------
  //  TÌM PRICING RULE PHÙ HỢP
  // ---------------------------------------------------------

  /**
   * Ví dụ: Khách đặt đá bóng lúc 02:00 sáng Thứ 4 (Giờ VN).
   * -> Quy đổi ra UTC là 19:00 tối Thứ 3.
   * -> Nếu dùng date.getDay() của UTC, nó ra Thứ 3 => SAI RULE.
   * -> Phải ép về giờ VN để biết đó là sáng Thứ 4.
   */
  const dayOfWeek = getVietnamDayOfWeek(data.start_time);
  console.log("dayOfWeek:::::", dayOfWeek);

  // Lấy tất cả các khung giá của ngày hôm đó (Ví dụ: Lấy hết giá của Thứ 4)
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

  /**
   * QUY ĐỔI RA PHÚT ĐỂ SO SÁNH
   * Chúng ta sẽ đưa tất cả về đơn vị "Phút trong ngày" để so sánh.
   * Bất kể Rule lưu năm 1970 hay Booking là năm 2025,
   * chỉ cần biết "06:00" là 360 phút.
   */
  const bookingStartMin = getVietnamMinutes(data.start_time);
  const bookingEndMin = getVietnamMinutes(data.end_time);
  console.log("bookingStartMin:::::", bookingStartMin);
  console.log("bookingEndMin:::::", bookingEndMin);

  // Tìm rule nào "bao trùm" (cover) được khung giờ khách đặt
  const matchedRule = potentialRules.find((rule) => {
    const ruleStartMin = getRawMinutes(rule.start_time);
    const ruleEndMin = getRawMinutes(rule.end_time);
    console.log("ruleStartMin:::::", ruleStartMin);
    console.log("ruleEndMin:::::", ruleEndMin);

    // Logic: Giờ đặt nằm trọn trong khung giờ của Rule
    // Rule:  |-------------------| (Ví dụ 17h - 21h)
    // Book:      |---------|       (Ví dụ 18h - 20h) -> OK
    return bookingStartMin >= ruleStartMin && bookingEndMin <= ruleEndMin;
  });

  if (!matchedRule) {
    throw new BadRequestError(
      "Giờ đặt không hợp lệ hoặc nằm ngoài khung giờ hoạt động của sân."
    );
  }

  //lay base price
  const basePrice = Number(matchedRule.base_price);

  ///tinh total_price dua tren base_price va thoi gian dat
  //base_price gia/gio
  const duration = bookingEndMin - bookingStartMin; //in minutes
  const hours = duration / 60;
  const totalPrice = basePrice * hours;

  //create booking
  const booking = await prisma.booking.create({
    data: {
      player_id,
      sub_field_id,
      start_time: data.start_time,
      end_time: data.end_time,
      total_price: totalPrice,
      status: "PENDING",
      expires_at: new Date(Date.now() + 3 * 60 * 1000), // 3 minutes from now
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
    throw new BadRequestError("The selected time slot is already booked");
  }

  // ---------------------------------------------------------
  //  TÌM PRICING RULE PHÙ HỢP
  // ---------------------------------------------------------

  /**
   * Ví dụ: Khách đặt đá bóng lúc 02:00 sáng Thứ 4 (Giờ VN).
   * -> Quy đổi ra UTC là 19:00 tối Thứ 3.
   * -> Nếu dùng date.getDay() của UTC, nó ra Thứ 3 => SAI RULE.
   * -> Phải ép về giờ VN để biết đó là sáng Thứ 4.
   */
  const dayOfWeek = getVietnamDayOfWeek(data.start_time);
  console.log("dayOfWeek:::::", dayOfWeek);

  // Lấy tất cả các khung giá của ngày hôm đó (Ví dụ: Lấy hết giá của Thứ 4)
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

  /**
   * QUY ĐỔI RA PHÚT ĐỂ SO SÁNH
   * Chúng ta sẽ đưa tất cả về đơn vị "Phút trong ngày" để so sánh.
   * Bất kể Rule lưu năm 1970 hay Booking là năm 2025,
   * chỉ cần biết "06:00" là 360 phút.
   */
  const bookingStartMin = getVietnamMinutes(data.start_time);
  const bookingEndMin = getVietnamMinutes(data.end_time);
  console.log("bookingStartMin:::::", bookingStartMin);
  console.log("bookingEndMin:::::", bookingEndMin);

  // Tìm rule nào "bao trùm" (cover) được khung giờ khách đặt
  const matchedRule = potentialRules.find((rule) => {
    const ruleStartMin = getRawMinutes(rule.start_time);
    const ruleEndMin = getRawMinutes(rule.end_time);
    console.log("ruleStartMin:::::", ruleStartMin);
    console.log("ruleEndMin:::::", ruleEndMin);

    // Logic: Giờ đặt nằm trọn trong khung giờ của Rule
    // Rule:  |-------------------| (Ví dụ 17h - 21h)
    // Book:      |---------|       (Ví dụ 18h - 20h) -> OK
    return bookingStartMin >= ruleStartMin && bookingEndMin <= ruleEndMin;
  });

  if (!matchedRule) {
    throw new BadRequestError(
      "Giờ đặt không hợp lệ hoặc nằm ngoài khung giờ hoạt động của sân."
    );
  }

  //lay base price
  const basePrice = Number(matchedRule.base_price);

  ///tinh total_price dua tren base_price va thoi gian dat
  //base_price gia/gio
  const duration = bookingEndMin - bookingStartMin; //in minutes
  const hours = duration / 60;
  const totalPrice = basePrice * hours;

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
      expires_at: new Date(Date.now() + 3 * 60 * 1000), // 3 minutes from now
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

export const cancelBooking = async (booking_id: string, player_id: string) => {
  const booking = await prisma.booking.findFirst({
    where: {
      id: booking_id,
      player_id: player_id,
      status: "PENDING",
    },
  });

  if (!booking) {
    throw new NotFoundError("Booking not found or cannot be canceled");
  }

  const canceledBooking = await prisma.booking.update({
    where: { id: booking_id },
    data: { status: "CANCELED" },
  });

  return canceledBooking;
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

  const skip = (page - 1) * limit;

  const [total, bookings] = await prisma.$transaction([
    prisma.booking.count({
      where: { player_id: player_id },
    }),
    prisma.booking.findMany({
      where: { player_id: player_id },
      select: {
        id: true,
        start_time: true,
        end_time: true,
        total_price: true,
        status: true,
        expires_at: true,
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
      skip,
      take: limit,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  if (!bookings || bookings.length === 0) {
    return {
      bookings: [],
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  const formattedBookings = bookings.map((booking) => ({
    id: booking.id,
    start_time: booking.start_time,
    end_time: booking.end_time,
    total_price: booking.total_price,
    status: booking.status,
    complex_name: booking.sub_field.complex.complex_name,
    complex_address: booking.sub_field.complex.complex_address,
    sport_type: booking.sub_field.sport_type,
    sub_field_name: booking.sub_field.sub_field_name,
    expires_at: booking.expires_at,
  }));

  return {
    bookings: formattedBookings,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};
