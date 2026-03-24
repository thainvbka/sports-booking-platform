import {
  AdminStatus,
  ComplexStatus,
  OwnerStatus,
  PlayerStatus,
} from "@prisma/client";
import prisma from "../../libs/prisma";
import { BadRequestError, NotFoundError } from "../../utils/error.response";

/**
 * Dashboard Statistics
 */
export const getStats = async () => {
  const [totalUsers, totalComplexes, totalBookings, totalRevenue] =
    await Promise.all([
      prisma.account.count(),
      prisma.complex.count(),
      prisma.booking.count(),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "SUCCESS" },
      }),
    ]);

  return {
    totalUsers,
    totalComplexes,
    totalBookings,
    totalRevenue: Number(totalRevenue._sum.amount) || 0,
  };
};

/**
 * User Management
 */
export const getUsers = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  role?: string,
  status?: string,
) => {
  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.OR = [
      { full_name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone_number: { contains: search, mode: "insensitive" } },
    ];
  }

  if (role) {
    if (role === "PLAYER") {
      where.player = status
        ? { status: status as PlayerStatus }
        : { isNot: null };
    } else if (role === "OWNER") {
      where.owner = status
        ? { status: status as OwnerStatus }
        : { isNot: null };
    } else if (role === "ADMIN") {
      where.admin = status
        ? { status: status as AdminStatus }
        : { isNot: null };
    }
  } else if (status) {
    // Nếu chỉ có status mà không có role, ta tìm kiếm status này ở cả 3 bảng liên quan
    where.OR = [
      ...(where.OR || []),
      { player: { status: status as PlayerStatus } },
      { owner: { status: status as OwnerStatus } },
      { admin: { status: status as AdminStatus } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.account.findMany({
      where,
      skip,
      take: limit,
      include: {
        player: true,
        owner: true,
        admin: true,
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.account.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateUserStatus = async (
  accountId: string,
  role: string,
  status: string,
) => {
  if (role === "PLAYER") {
    return await prisma.player.update({
      where: { account_id: accountId },
      data: { status: status as PlayerStatus },
    });
  }
  if (role === "OWNER") {
    return await prisma.owner.update({
      where: { account_id: accountId },
      data: { status: status as OwnerStatus },
    });
  }
  if (role === "ADMIN") {
    return await prisma.admin.update({
      where: { account_id: accountId },
      data: { status: status as AdminStatus },
    });
  }
  throw new BadRequestError("Invalid role");
};

/**
 * Content Management (Complexes)
 */
export const getComplexes = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: ComplexStatus,
) => {
  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.complex_name = { contains: search, mode: "insensitive" };
  }
  if (status) {
    where.status = status;
  }

  const [complexes, total] = await Promise.all([
    prisma.complex.findMany({
      where,
      skip,
      take: limit,
      include: {
        owner: {
          select: {
            id: true,
            account: {
              select: {
                full_name: true,
                email: true,
                phone_number: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.complex.count({ where }),
  ]);

  return {
    complexes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateComplexStatus = async (
  complexId: string,
  status: ComplexStatus,
) => {
  const complex = await prisma.complex.findUnique({
    where: { id: complexId },
  });

  if (!complex) throw new NotFoundError("Complex not found");

  // Logic nghiệp vụ (Guards)
  if (status === "ACTIVE" && complex.status === "PENDING") {
    // Đây là hành động Approve
  } else if (status === "REJECTED" && complex.status !== "PENDING") {
    throw new BadRequestError("Only PENDING complexes can be rejected");
  } else if (status === "INACTIVE" && complex.status !== "ACTIVE") {
    throw new BadRequestError("Only ACTIVE complexes can be suspended");
  }

  return await prisma.complex.update({
    where: { id: complexId },
    data: { status },
  });
};

/**
 * Dashboard Analytics for Charts
 */
export const getAnalytics = async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  // 1. Revenue Analytics (Last 6 months)
  const payments = await prisma.payment.findMany({
    where: {
      status: "SUCCESS",
      created_at: { gte: sixMonthsAgo },
    },
    select: {
      amount: true,
      created_at: true,
    },
  });

  // 2. Booking Analytics (Last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const bookings = await prisma.booking.findMany({
    where: {
      created_at: { gte: thirtyDaysAgo },
    },
    select: {
      status: true,
      created_at: true,
    },
  });

  // 3. User Growth (Last 6 months)
  const users = await prisma.account.findMany({
    where: {
      created_at: { gte: sixMonthsAgo },
    },
    select: {
      created_at: true,
    },
  });

  // Helper to group by Month
  const groupByMonth = (data: any[], dateField: string, sumField?: string) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const result: { [key: string]: number } = {};

    // Initialize last 6 months
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = `${months[d.getMonth()]} ${d.getFullYear()}`;
      result[label] = 0;
    }

    data.forEach((item) => {
      const date = new Date(item[dateField]);
      const label = `${months[date.getMonth()]} ${date.getFullYear()}`;
      if (result[label] !== undefined) {
        result[label] += sumField ? Number(item[sumField]) : 1;
      }
    });

    return Object.entries(result)
      .map(([name, value]) => ({ name, value }))
      .reverse();
  };

  // 4. Sport Type Distribution (Total)
  const complexStats = await prisma.complex.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  return {
    revenueChart: groupByMonth(payments, "created_at", "amount"),
    userChart: groupByMonth(users, "created_at"),
    bookingStatusDistribution: [
      {
        name: "Confirmed",
        value: bookings.filter((b) => b.status === "CONFIRMED").length,
      },
      {
        name: "Canceled",
        value: bookings.filter((b) => b.status === "CANCELED").length,
      },
      {
        name: "Pending",
        value: bookings.filter((b) => b.status === "PENDING").length,
      },
      {
        name: "Completed",
        value: bookings.filter((b) => b.status === "COMPLETED").length,
      },
    ],
    complexStatusDistribution: complexStats.map((stat) => ({
      name: stat.status,
      value: stat._count.id,
    })),
  };
};

/**
 * Monitoring
 */
export const getBookings = async (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      skip,
      take: limit,
      include: {
        player: { include: { account: { select: { full_name: true } } } },
        sub_field: { include: { complex: { select: { complex_name: true } } } },
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.booking.count(),
  ]);

  return {
    bookings,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getPayments = async (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      skip,
      take: limit,
      include: {
        bookings: {
          include: {
            player: { include: { account: { select: { full_name: true } } } },
          },
        },
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.payment.count(),
  ]);

  return {
    payments,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};
