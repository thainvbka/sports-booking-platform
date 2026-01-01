import { prisma } from "@sports-booking-platform/db";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/error.response";
import { endOfDay, endOfMonth, startOfMonth, subMonths } from "date-fns";

// Chỉ số tổng quan
export interface OverView {
  totalRevenue: number; // Tổng doanh thu
  revenueGrowth: number; // % tăng trưởng so với kỳ trước
  totalBookings: number; // Tổng số booking
  newBookingsThisWeek: number; // Booking mới tuần này
  totalComplexes: number; // Tổng complex
  activeSubFields: number; // Số sân đang hoạt động
  totalCustomers: number; // Tổng khách hàng
  newCustomers: number; // Khách hàng mới
}

// Phân bố theo khung giờ
export interface HourlyDistribution {
  hour: number; // 0-23
  bookingCount: number;
  revenue: number;
}

type HourlyDistributionResponse = Array<HourlyDistribution>;

// phân bố trạng thái booking
export interface BookingStatusDistribution {
  completed: number;
  confirmed: number;
  pending: number;
  cancelled: number;
}

// Top sân được đặt nhiều
export interface TopSubFields {
  subFieldId: string;
  name: string;
  complexName: string;
  bookingCount: number;
  revenue: number;
}

type TopSubFieldsResponse = Array<TopSubFields>;

// Doanh thu theo complex
export interface RevenueByComplex {
  complexId: string;
  name: string;
  revenue: number;
  bookingCount: number;
}

type RevenueByComplexResponse = Array<RevenueByComplex>;

export interface StatsMetrics {
  overview: OverView;
  bookingStatusDistribution: BookingStatusDistribution;
  topSubFields: TopSubFieldsResponse;
  revenueByComplex: RevenueByComplexResponse;
  hourlyDistribution: HourlyDistributionResponse;
}

//tong doanh thu
export const getTotalRevenue = async (ownerId: string): Promise<number> => {
  //check owner exists
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
  });

  if (!owner) {
    throw new NotFoundError("Owner not found");
  }

  //tinh tong doanh thu
  const totalRevenueResult = await prisma.booking.aggregate({
    where: {
      sub_field: {
        complex: {
          owner_id: ownerId,
        },
      },
      status: "CONFIRMED",
    },
    _sum: {
      total_price: true,
    },
  });

  const totalRevenue = Number(totalRevenueResult._sum.total_price) || 0;

  return totalRevenue;
};

//doanh thu thang nay
export const getTotalRevenueThisMonth = async (
  ownerId: string
): Promise<number> => {
  //check owner exists
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
  });

  if (!owner) {
    throw new NotFoundError("Owner not found");
  }

  const totalRevenueResult = await prisma.booking.aggregate({
    where: {
      sub_field: {
        complex: {
          owner_id: ownerId,
        },
      },
      status: "CONFIRMED",
      created_at: {
        gte: startOfMonth(new Date()),
      },
    },
    _sum: {
      total_price: true,
    },
  });

  const totalRevenue = Number(totalRevenueResult._sum.total_price) || 0;

  return totalRevenue;
};

//doanh thu thang truoc
export const getTotalRevenueLastMonth = async (
  ownerId: string
): Promise<number> => {
  //check owner exists
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
  });

  if (!owner) {
    throw new NotFoundError("Owner not found");
  }

  const now = new Date();
  const previousMonth = subMonths(now, 1);
  const startDate = startOfMonth(previousMonth);
  const endDate = endOfMonth(previousMonth);

  const totalRevenueResult = await prisma.booking.aggregate({
    where: {
      sub_field: {
        complex: {
          owner_id: ownerId,
        },
      },
      status: "CONFIRMED",
      created_at: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      total_price: true,
    },
  });

  const totalRevenue = Number(totalRevenueResult._sum.total_price) || 0;

  return totalRevenue;
};

//ty le tang truong doanh thu
export const getRevenueGrowth = async (ownerId: string): Promise<number> => {
  const thisMonthRevenue = await getTotalRevenueThisMonth(ownerId);
  const lastMonthRevenue = await getTotalRevenueLastMonth(ownerId);

  if (lastMonthRevenue === 0) {
    return thisMonthRevenue === 0 ? 0 : 100;
  }

  const growth =
    ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

  return growth;
};

//tong booking
export const getTotalBookings = async (ownerId: string): Promise<number> => {
  //check owner exists
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
  });

  if (!owner) {
    throw new NotFoundError("Owner not found");
  }

  //tinh tong so booking
  const totalBookings = await prisma.booking.count({
    where: {
      sub_field: {
        complex: {
          owner_id: ownerId,
        },
      },
    },
  });

  return totalBookings;
};
//booking moi trong tuan
export const getNewBookingsThisWeek = async (
  ownerId: string
): Promise<number> => {
  //check owner exists
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
  });

  if (!owner) {
    throw new NotFoundError("Owner not found");
  }

  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 (Chủ nhật) đến 6 (Thứ bảy)
  //chuyen thu 2 ve dau tuan
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startOfWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - diffToMonday
  );
  startOfWeek.setHours(0, 0, 0, 0); // Đặt thời gian về đầu ngày
  const newBookings = await prisma.booking.count({
    where: {
      sub_field: {
        complex: {
          owner_id: ownerId,
        },
      },
      created_at: {
        gte: startOfWeek,
      },
    },
  });

  return newBookings;
};

//tong complex
export const getTotalComplexes = async (ownerId: string): Promise<number> => {
  //check owner exists
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
  });

  if (!owner) {
    throw new NotFoundError("Owner not found");
  }

  //tinh tong so complex
  const totalComplexes = await prisma.complex.count({
    where: {
      owner_id: ownerId,
    },
  });

  return totalComplexes;
};

//so san dang hoat dong
export const getActiveSubFields = async (ownerId: string): Promise<number> => {
  //check owner exists
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
  });

  if (!owner) {
    throw new NotFoundError("Owner not found");
  }

  //tinh tong so san dang hoat dong
  const activeSubFields = await prisma.subField.count({
    where: {
      complex: {
        owner_id: ownerId,
        status: "ACTIVE",
      },
      isDelete: false,
    },
  });

  return activeSubFields;
};

//tong khach hang
export const getTotalCustomers = async (ownerId: string): Promise<number> => {
  //check owner exists
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
  });

  if (!owner) {
    throw new NotFoundError("Owner not found");
  }

  //tinh tong so khach hang
  const totalCustomers = await prisma.booking
    .findMany({
      where: {
        sub_field: {
          complex: {
            owner_id: ownerId,
          },
        },
      },
      select: {
        player_id: true,
      },
      distinct: ["player_id"],
    })
    .then((bookings) => bookings.length);

  return totalCustomers;
};

//so khach hang moi thang nay
export const getNewCustomers = async (ownerId: string): Promise<number> => {
  //check owner exists
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
  });

  if (!owner) {
    throw new NotFoundError("Owner not found");
  }

  const now = new Date();
  const startDate = startOfMonth(now);

  //lấy tất cả khác hàng đã đặt sân trước tháng này
  const existingCustomers = await prisma.booking
    .findMany({
      where: {
        sub_field: {
          complex: {
            owner_id: ownerId,
          },
        },
        created_at: {
          lt: startDate,
        },
      },
      select: {
        player_id: true,
      },
      distinct: ["player_id"],
    })
    .then((bookings) => bookings.map((booking) => booking.player_id));

  //lấy tất cả khách hàng mới đã đặt sân trong tháng này
  const newCustomers = await prisma.booking
    .findMany({
      where: {
        sub_field: {
          complex: {
            owner_id: ownerId,
          },
        },
        created_at: {
          gte: startDate,
        },
        NOT: {
          player_id: {
            in: existingCustomers,
          },
        },
      },
      select: {
        player_id: true,
      },
      distinct: ["player_id"],
    })
    .then((bookings) => bookings.length);

  return newCustomers;
};

export const getStatsMetrics = async (ownerId: string): Promise<OverView> => {
  const [
    totalRevenue,
    revenueGrowth,
    totalBookings,
    newBookingsThisWeek,
    totalComplexes,
    activeSubFields,
    totalCustomers,
    newCustomers,
  ] = await Promise.all([
    getTotalRevenue(ownerId),
    getRevenueGrowth(ownerId),
    getTotalBookings(ownerId),
    getNewBookingsThisWeek(ownerId),
    getTotalComplexes(ownerId),
    getActiveSubFields(ownerId),
    getTotalCustomers(ownerId),
    getNewCustomers(ownerId),
  ]);

  return {
    totalRevenue,
    revenueGrowth,
    totalBookings,
    newBookingsThisWeek,
    totalComplexes,
    activeSubFields,
    totalCustomers,
    newCustomers,
  };
};

//phan bo booking theo trang thai
export const getBookingStatusDistribution = async (
  ownerId: string
): Promise<BookingStatusDistribution> => {
  //check owner exists
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
  });

  if (!owner) {
    throw new NotFoundError("Owner not found");
  }

  const bookings = await prisma.booking.groupBy({
    by: ["status"],
    where: {
      sub_field: {
        complex: {
          owner_id: ownerId,
        },
      },
    },
    _count: {
      status: true,
    },
  });

  const distribution: BookingStatusDistribution = {
    completed: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
  };

  bookings.forEach((booking) => {
    switch (booking.status) {
      case "COMPLETED":
        distribution.completed = booking._count.status;
        break;
      case "CONFIRMED":
        distribution.confirmed = booking._count.status;
        break;
      case "PENDING":
        distribution.pending = booking._count.status;
        break;
      case "CANCELED":
        distribution.cancelled = booking._count.status;
        break;
    }
  });

  return distribution;
};

//top san duoc dat nhieu
export const getTopSubFields = async (
  ownerId: string
): Promise<TopSubFieldsResponse> => {
  //check owner exists
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
  });

  if (!owner) {
    throw new NotFoundError("Owner not found");
  }

  const topSubFields = await prisma.booking.groupBy({
    by: ["sub_field_id"],
    where: {
      sub_field: {
        complex: {
          owner_id: ownerId,
        },
      },
      status: "CONFIRMED",
    },
    _count: {
      sub_field_id: true,
    },
    _sum: {
      total_price: true,
    },
    orderBy: {
      _count: {
        sub_field_id: "desc",
      },
    },
    take: 5,
  });

  const result: TopSubFieldsResponse = [];

  for (const item of topSubFields) {
    const subField = await prisma.subField.findUnique({
      where: { id: item.sub_field_id },
      include: {
        complex: true,
      },
    });

    if (subField) {
      result.push({
        subFieldId: subField.id,
        name: subField.sub_field_name,
        complexName: subField.complex.complex_name,
        bookingCount: item._count.sub_field_id,
        revenue: Number(item._sum.total_price) || 0,
      });
    }
  }

  return result;
};

//doanh thu theo complex
export const getRevenueByComplex = async (
  ownerId: string
): Promise<RevenueByComplexResponse> => {
  //check owner exists
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
  });

  if (!owner) {
    throw new NotFoundError("Owner not found");
  }

  const complexes = await prisma.complex.findMany({
    where: {
      owner_id: ownerId,
    },
  });

  const result: RevenueByComplexResponse = [];

  for (const complex of complexes) {
    const revenueData = await prisma.booking.aggregate({
      where: {
        sub_field: {
          complex_id: complex.id,
        },
        status: "CONFIRMED",
      },
      _sum: {
        total_price: true,
      },
      _count: {
        id: true,
      },
    });

    result.push({
      complexId: complex.id,
      name: complex.complex_name,
      revenue: Number(revenueData._sum.total_price) || 0,
      bookingCount: revenueData._count.id,
    });
  }

  return result;
};

//phan bo theo khung gio
export const getHourlyDistribution = async (
  ownerId: string
): Promise<HourlyDistributionResponse> => {
  //check owner exists
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
  });

  if (!owner) {
    throw new NotFoundError("Owner not found");
  }

  const bookings = await prisma.booking.findMany({
    where: {
      sub_field: {
        complex: {
          owner_id: ownerId,
        },
      },
      status: "CONFIRMED",
    },
    select: {
      start_time: true,
      total_price: true,
    },
  });

  const distributionMap: {
    [key: number]: { bookingCount: number; revenue: number };
  } = {};

  // Khởi tạo các khung giờ
  for (let hour = 0; hour < 24; hour++) {
    distributionMap[hour] = { bookingCount: 0, revenue: 0 };
  }

  bookings.forEach((booking) => {
    const bookingHour = booking.start_time.getHours();
    distributionMap[bookingHour].bookingCount += 1;
    distributionMap[bookingHour].revenue += Number(booking.total_price);
  });

  const distribution: HourlyDistributionResponse = [];

  for (let hour = 0; hour < 24; hour++) {
    distribution.push({
      hour,
      bookingCount: distributionMap[hour].bookingCount,
      revenue: distributionMap[hour].revenue,
    });
  }

  return distribution;
};

//get stat metrics
export const getOwnerDashboardStatsMetrics = async (
  ownerId: string
): Promise<StatsMetrics> => {
  const [
    overview,
    bookingStatusDistribution,
    topSubFields,
    revenueByComplex,
    hourlyDistribution,
  ] = await Promise.all([
    getStatsMetrics(ownerId),
    getBookingStatusDistribution(ownerId),
    getTopSubFields(ownerId),
    getRevenueByComplex(ownerId),
    getHourlyDistribution(ownerId),
  ]);

  return {
    overview,
    bookingStatusDistribution,
    topSubFields,
    revenueByComplex,
    hourlyDistribution,
  };
};
