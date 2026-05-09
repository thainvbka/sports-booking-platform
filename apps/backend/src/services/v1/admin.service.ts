import {
  AdminStatus,
  ComplexStatus,
  OwnerStatus,
  PlayerStatus,
} from "@prisma/client";
import prisma from "../../libs/prisma";
import { BadRequestError, NotFoundError } from "../../utils/error.response";
import { sendNotificationIfNotExists } from "./notification.service";

/**
 * Dashboard Analytics — Deep Version
 *
 * 5 nhóm phân tích, 11 metrics, 0 trùng lặp.
 * Tất cả query chạy song song qua Promise.all để giảm latency tối đa.
 */
export const getAnalytics = async () => {
  const now = new Date();

  // ─── Time windows ─────────────────────────────────────────────────────────
  const sixMonthsAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 5,
    1,
    0,
    0,
    0,
    0,
  );
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0); // normalize về midnight, tránh lệch giờ với startOfThisMonth
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59,
    999,
  );

  // ─── Fetch tất cả data song song ──────────────────────────────────────────
  const [
    // KPIs: so sánh tháng này vs tháng trước
    kpiThisRevenue,
    kpiLastRevenue,
    kpiThisBookings,
    kpiLastBookings,
    kpiThisUsers,
    kpiLastUsers,

    // Totals
    totalUsersCount,
    totalComplexesCount,
    totalBookingsCount,
    totalRevenueCount,
    pendingComplexesCount,

    // Trend 6 tháng
    payments6m,
    bookings6m,

    // Retention: tất cả booking 6 tháng để phân biệt new vs returning player
    bookingsForRetention,

    // Operations 30 ngày
    recentBookingsOps,
    bookingStatusCounts,

    // Revenue by sport type (COMPLETED)
    bookingsBySport,

    // Addon upsell
    addonAggregate,
    baseRevenue30d,

    // Complex performance
    complexPerformance,

    // Payment providers
    paymentProviders,

    // Rating distribution
    ratingDistribution,
    systemAvgRating,

    // User growth monthly
    accounts6m,
  ] = await Promise.all([
    // ── KPIs ──
    prisma.payment.aggregate({
      where: { status: "SUCCESS", created_at: { gte: startOfThisMonth } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: "SUCCESS",
        created_at: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { amount: true },
    }),
    prisma.booking.count({ where: { created_at: { gte: startOfThisMonth } } }),
    prisma.booking.count({
      where: { created_at: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),
    prisma.account.count({ where: { created_at: { gte: startOfThisMonth } } }),
    prisma.account.count({
      where: { created_at: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),

    // ── Totals ──
    prisma.account.count(),
    prisma.complex.count(),
    prisma.booking.count(),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS" },
    }),
    prisma.complex.count({ where: { status: "PENDING" } }),

    // ── Trend 6 tháng ──
    prisma.payment.findMany({
      where: { status: "SUCCESS", created_at: { gte: sixMonthsAgo } },
      select: { amount: true, created_at: true },
    }),
    prisma.booking.findMany({
      where: { created_at: { gte: sixMonthsAgo } },
      select: { created_at: true, status: true },
    }),

    // ── Retention ──
    prisma.booking.findMany({
      where: { created_at: { gte: sixMonthsAgo } },
      select: { player_id: true, created_at: true },
      orderBy: { created_at: "asc" },
    }),

    // ── Operations ── (dùng start_time — khi sân ĐƯỢC ĐẶT, không phải khi booking tạo)
    prisma.booking.findMany({
      where: {
        status: { in: ["CONFIRMED", "COMPLETED"] },
        start_time: { gte: thirtyDaysAgo },
      },
      select: { start_time: true, total_price: true, end_time: true },
    }),
    prisma.booking.groupBy({
      by: ["status"],
      _count: { id: true },
      where: { created_at: { gte: thirtyDaysAgo } },
    }),

    // ── Sport revenue ── (COMPLETED = đã TT chờ chủ sân + CONFIRMED = đã duyệt)
    prisma.booking.findMany({
      where: {
        status: { in: ["COMPLETED", "CONFIRMED"] },
        created_at: { gte: sixMonthsAgo },
      },
      select: {
        total_price: true,
        sub_field: { select: { sport_type: true } },
      },
    }),

    // ── Addon upsell ──
    prisma.bookingAddon.aggregate({
      where: { booking: { created_at: { gte: thirtyDaysAgo } } },
      _sum: { unit_price: true },
      _count: { id: true },
    }),
    prisma.payment.aggregate({
      where: { status: "SUCCESS", created_at: { gte: thirtyDaysAgo } },
      _sum: { amount: true },
    }),

    // ── Complex performance ──
    prisma.complex.findMany({
      where: { status: "ACTIVE" },
      take: 10,
      select: {
        complex_name: true,
        avg_rating: true,
        total_reviews: true,
        sub_fields: {
          where: { isDelete: false },
          select: {
            bookings: {
              // COMPLETED + CONFIRMED = booking đã thanh toán (dù chủ sân đã duyệt hay chưa)
              where: {
                status: { in: ["COMPLETED", "CONFIRMED"] },
                created_at: { gte: sixMonthsAgo },
              },
              select: { total_price: true, start_time: true, end_time: true },
            },
          },
        },
      },
    }),

    // ── Payment providers ──
    prisma.payment.groupBy({
      by: ["provider"],
      where: { status: "SUCCESS", created_at: { gte: thirtyDaysAgo } },
      _count: { id: true },
      _sum: { amount: true },
    }),

    // ── Ratings ──
    prisma.review.groupBy({
      by: ["rating"],
      _count: { id: true },
      where: { created_at: { gte: thirtyDaysAgo } },
    }),
    prisma.review.aggregate({ _avg: { rating: true } }),

    // ── User growth ──
    prisma.account.findMany({
      where: { created_at: { gte: sixMonthsAgo } },
      select: { created_at: true },
    }),
  ]);

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const MONTHS = [
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
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  /** Tạo mảng 6 tháng gần nhất dưới dạng {month, year} */
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      month: d.getMonth(),
      year: d.getFullYear(),
      label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
    };
  });

  const pct = (a: number, b: number) =>
    b > 0 ? Math.round(((a - b) / b) * 100) : a > 0 ? 100 : 0;

  // ─── 1. KPI Cards ─────────────────────────────────────────────────────────
  const thisRev = Number(kpiThisRevenue._sum.amount) || 0;
  const lastRev = Number(kpiLastRevenue._sum.amount) || 0;
  const totalRev = Number(totalRevenueCount._sum.amount) || 0;
  const avgRating = Number(systemAvgRating._avg.rating?.toFixed(1)) || 0;
  const addonRev = Number(addonAggregate._sum.unit_price) || 0;
  const totalRev30d = Number(baseRevenue30d._sum.amount) || 0;

  const kpis = {
    revenue: {
      thisMonth: thisRev,
      lastMonth: lastRev,
      growth: pct(thisRev, lastRev), // % tăng trưởng doanh thu MoM
      total: totalRev,
    },
    bookings: {
      thisMonth: kpiThisBookings,
      lastMonth: kpiLastBookings,
      growth: pct(kpiThisBookings, kpiLastBookings),
      total: totalBookingsCount,
    },
    users: {
      thisMonth: kpiThisUsers,
      lastMonth: kpiLastUsers,
      growth: pct(kpiThisUsers, kpiLastUsers),
      total: totalUsersCount,
    },
    complexes: {
      total: totalComplexesCount,
      pending: pendingComplexesCount,
    },
    avgRating,
    addonUpsell: {
      revenue30d: addonRev,
      // Tỉ lệ doanh thu từ addon so với tổng — đo hiệu quả upsell
      revenueSharePct:
        totalRev30d > 0 ? Math.round((addonRev / totalRev30d) * 100) : 0,
      totalAddons: addonAggregate._count.id,
    },
  };

  // ─── 2. Revenue Trend + Cancel Rate (6 tháng) ────────────────────────────
  //  Kết hợp revenue + cancel rate trong 1 chart → thấy ngay correlation
  const revenueTrend = last6Months.map(({ month, year, label }) => {
    const revenue = payments6m
      .filter((p) => {
        const d = new Date(p.created_at);
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const monthBookings = bookings6m.filter((b) => {
      const d = new Date(b.created_at);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    const total = monthBookings.length;
    const canceled = monthBookings.filter(
      (b) => b.status === "CANCELED",
    ).length;
    const completed = monthBookings.filter(
      (b) => b.status === "COMPLETED",
    ).length;

    return {
      name: label,
      revenue,
      bookings: total,
      completed,
      canceled,
      cancelRate: total > 0 ? Math.round((canceled / total) * 100) : 0,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });

  // ─── 3. Retention: New vs Returning Players (6 tháng) ────────────────────
  //  Một metric KPI về sức khoẻ cộng đồng — không thể thay bằng user growth
  const firstBookingOf: Record<string, string> = {}; // player_id → month-year label
  const retentionData = last6Months.map(({ month, year, label }) => {
    const monthBookings = bookingsForRetention.filter((b) => {
      const d = new Date(b.created_at);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    const seen = new Set<string>();
    let newPlayers = 0,
      returningPlayers = 0;

    for (const b of monthBookings) {
      if (seen.has(b.player_id)) continue;
      seen.add(b.player_id);
      if (!firstBookingOf[b.player_id]) {
        firstBookingOf[b.player_id] = label;
        newPlayers++;
      } else {
        returningPlayers++;
      }
    }

    return { name: label, new: newPlayers, returning: returningPlayers };
  });

  // ─── 4. Phân bổ trạng thái booking (30 ngày) ────────────────────────────
  //  Mỗi trạng thái là mutually exclusive → 4 nhóm cộng lại = totalCreated
  //  Flow: PENDING (chưa TT) → COMPLETED (đã TT, chờ chủ sân) → CONFIRMED (đã duyệt)
  //        └→ CANCELED (hủy ở bất kỳ bước nào)
  const statusMap = Object.fromEntries(
    bookingStatusCounts.map((s) => [s.status, s._count.id]),
  );
  const totalCreated = Object.values(statusMap).reduce((a, b) => a + b, 0);
  const pendingCount = statusMap["PENDING"] || 0; // chưa thanh toán
  const completedCount = statusMap["COMPLETED"] || 0; // đã TT, chờ chủ sân xác nhận
  const confirmedCount = statusMap["CONFIRMED"] || 0; // chủ sân đã xác nhận
  const canceledCount = statusMap["CANCELED"] || 0; // đã hủy
  // Kiểm chứng: pendingCount + completedCount + confirmedCount + canceledCount = totalCreated

  const pctOf = (n: number) =>
    totalCreated > 0 ? Math.round((n / totalCreated) * 100) : 0;

  const conversionFunnel = [
    // Stage 0: tổng tham chiếu
    { stage: "Tạo booking", value: totalCreated, dropOffPct: 100 },
    // 4 nhóm mutually exclusive — dropOffPct = % của tổng
    {
      stage: "Chưa thanh toán",
      value: pendingCount,
      dropOffPct: pctOf(pendingCount),
    },
    {
      stage: "Chờ xác nhận",
      value: completedCount,
      dropOffPct: pctOf(completedCount),
    },
    {
      stage: "Đã xác nhận",
      value: confirmedCount,
      dropOffPct: pctOf(confirmedCount),
    },
    { stage: "Đã hủy", value: canceledCount, dropOffPct: pctOf(canceledCount) },
  ];

  // ─── 5. Peak Hours (dùng start_time — giờ SÂN HOẠT ĐỘNG, không phải giờ đặt) ──
  const hourlyDistribution = Array.from({ length: 24 }, (_, h) => {
    const booksAtHour = recentBookingsOps.filter(
      (b) => new Date(b.start_time).getHours() === h,
    );
    return {
      hour: h,
      name: `${h}:00`,
      bookings: booksAtHour.length,
      revenue: booksAtHour.reduce((s, b) => s + Number(b.total_price), 0),
    };
  });

  // ─── 6. Peak Days of Week ─────────────────────────────────────────────────
  const dailyDistribution = DAYS.map((name, i) => {
    const booksOnDay = recentBookingsOps.filter(
      (b) => new Date(b.start_time).getDay() === i,
    );
    return {
      name,
      bookings: booksOnDay.length,
      revenue: booksOnDay.reduce((s, b) => s + Number(b.total_price), 0),
    };
  });

  // ─── 7. Revenue by Sport Type ─────────────────────────────────────────────
  //  Không chỉ đếm subfield — mà so revenue + avg booking value để ưu tiên môn nào
  const sportMap: Record<string, { revenue: number; bookings: number }> = {};
  for (const b of bookingsBySport) {
    const sport = b.sub_field.sport_type;
    if (!sportMap[sport]) sportMap[sport] = { revenue: 0, bookings: 0 };
    sportMap[sport].revenue += Number(b.total_price);
    sportMap[sport].bookings += 1;
  }
  const sportRevenue = Object.entries(sportMap)
    .map(([name, { revenue, bookings }]) => ({
      name,
      revenue,
      bookings,
      avgBookingValue: bookings > 0 ? Math.round(revenue / bookings) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // ─── 8. Top 5 Complexes — Revenue (6m) + Rating + Utilization (30d) ─────
  //  Revenue / bookings: tổng 6 tháng — phản ánh tài chính dài hạn để xếp hạng top.
  //  Utilization: cửa sổ 30 ngày gần nhất theo start_time, peak 12h/ngày
  //   đồng bộ window với operations/peak-hours, phản ánh "sức nóng" hiện tại.
  const PEAK_HOURS_PER_DAY = 12;
  const UTILIZATION_WINDOW_DAYS = 30;
  const AVAILABLE_HOURS_PER_SUBFIELD =
    PEAK_HOURS_PER_DAY * UTILIZATION_WINDOW_DAYS;

  const topComplexes = complexPerformance
    .map((c) => {
      const allBookings = c.sub_fields.flatMap((sf) => sf.bookings);
      const revenue = allBookings.reduce(
        (s, b) => s + Number(b.total_price),
        0,
      );

      // Utilization: chỉ đếm booking có start_time nằm trong cửa sổ 30 ngày gần nhất.
      // Filter theo start_time (giờ sân thực sự được dùng), không phải created_at.
      const recentBookedHours = allBookings.reduce((s, b) => {
        if (new Date(b.start_time) < thirtyDaysAgo) return s;
        return (
          s +
          (new Date(b.end_time).getTime() - new Date(b.start_time).getTime()) /
            3_600_000
        );
      }, 0);
      const totalAvailable = c.sub_fields.length * AVAILABLE_HOURS_PER_SUBFIELD;

      return {
        name: c.complex_name,
        revenue,
        bookings: allBookings.length,
        avgRating: Number(c.avg_rating) || 0,
        totalReviews: c.total_reviews,
        utilizationRate:
          totalAvailable > 0
            ? Math.min(
                100,
                Math.round((recentBookedHours / totalAvailable) * 100),
              )
            : 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // ─── 9. Payment Providers Breakdown (30 ngày) ────────────────────────────
  const paymentProviderData = paymentProviders.map((p) => {
    const revenue = Number(p._sum.amount) || 0;
    const count = p._count.id;
    return {
      provider: p.provider,
      revenue,
      bookings: count,
      avgTransaction: count > 0 ? Math.round(revenue / count) : 0,
    };
  });

  // ─── 10. Rating Distribution 1–5 ─────────────────────────────────────────
  //  Phân phối sao → phát hiện pattern (nhiều 1★ và 5★ = polarised, ít 3★ = healthy)
  const ratingDist = [1, 2, 3, 4, 5].map((star) => ({
    star,
    count: ratingDistribution.find((r) => r.rating === star)?._count.id || 0,
  }));

  // ─── 11. User Growth (monthly) ───────────────────────────────────────────
  const userGrowth = last6Months.map(({ month, year, label }) => ({
    name: label,
    newUsers: accounts6m.filter((u) => {
      const d = new Date(u.created_at);
      return d.getMonth() === month && d.getFullYear() === year;
    }).length,
  }));

  // ─── Return ───────────────────────────────────────────────────────────────
  return {
    /**
     * GROUP 1 — KPI Cards (hiện ở top dashboard)
     * So sánh tháng này vs tháng trước, kèm % tăng trưởng
     */
    kpis,

    /**
     * GROUP 2 — Trends (Line chart kép)
     * revenueTrend: Cột revenue + line cancelRate → thấy ngay doanh thu & chất lượng vận hành
     * retentionData: Stacked bar New vs Returning → sức khoẻ cộng đồng player
     */
    revenueTrend,
    retentionData,

    /**
     * GROUP 3 — Operations (30 ngày gần nhất)
     * conversionFunnel: Mất khách ở bước nào?
     * hourlyDistribution: Giờ cao điểm theo start_time thực tế (không phải giờ tạo booking)
     * dailyDistribution: Ngày cao điểm trong tuần
     */
    conversionFunnel,
    hourlyDistribution,
    dailyDistribution,

    /**
     * GROUP 4 — Revenue breakdown
     * sportRevenue: Môn nào đóng góp nhiều nhất + avg booking value
     * kpis.addonUpsell: % doanh thu từ addon/sản phẩm (trong kpis)
     */
    sportRevenue,

    /**
     * GROUP 5 — Complex & System health
     * topComplexes: Top 5 theo revenue + rating + utilization rate
     * paymentProviderData: Phân phối cổng thanh toán + avg transaction
     * ratingDist: Phân phối sao 1–5
     * userGrowth: Tăng trưởng tài khoản mới theo tháng
     */
    topComplexes,
    paymentProviderData,
    ratingDist,
    userGrowth,
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

  // Helper to map UI status to DB status
  const getDbStatus = (s: string, r: string) => {
    if (s === "ACTIVE") return "ACTIVE";
    if (s === "INACTIVE" || s === "BANNED" || s === "SUSPENDED") {
      if (r === "PLAYER") return "BANNED";
      if (r === "OWNER") return "SUSPENDED";
      if (r === "ADMIN") return "INACTIVE";
    }
    return null;
  };

  if (role) {
    if (status) {
      const dbStatus = getDbStatus(status, role);
      if (!dbStatus) {
        return {
          users: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        };
      }
      if (role === "PLAYER")
        where.player = { status: dbStatus as PlayerStatus };
      else if (role === "OWNER")
        where.owner = { status: dbStatus as OwnerStatus };
      else if (role === "ADMIN")
        where.admin = { status: dbStatus as AdminStatus };
    } else {
      if (role === "PLAYER") where.player = { isNot: null };
      else if (role === "OWNER") where.owner = { isNot: null };
      else if (role === "ADMIN") where.admin = { isNot: null };
    }
  } else if (status) {
    // If no role but status is filtered, search across all roles with mapped values
    where.OR = [
      ...(where.OR || []),
      {
        player: {
          status: (getDbStatus(status, "PLAYER") as PlayerStatus) || "ACTIVE",
        },
      },
      {
        owner: {
          status: (getDbStatus(status, "OWNER") as OwnerStatus) || "ACTIVE",
        },
      },
      {
        admin: {
          status: (getDbStatus(status, "ADMIN") as AdminStatus) || "ACTIVE",
        },
      },
    ].filter(Boolean);
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
    // Map Frontend status to PlayerStatus enum
    let dbStatus: PlayerStatus = "ACTIVE";
    if (status === "INACTIVE" || status === "BANNED") dbStatus = "BANNED";

    return await prisma.player.update({
      where: { account_id: accountId },
      data: { status: dbStatus },
    });
  }
  if (role === "OWNER") {
    // Map Frontend status to OwnerStatus enum
    let dbStatus: OwnerStatus = "ACTIVE";
    if (status === "INACTIVE" || status === "SUSPENDED") dbStatus = "SUSPENDED";

    return await prisma.owner.update({
      where: { account_id: accountId },
      data: { status: dbStatus },
    });
  }
  if (role === "ADMIN") {
    // Map Frontend status to AdminStatus enum
    let dbStatus: AdminStatus = "ACTIVE";
    if (status === "INACTIVE") dbStatus = "INACTIVE";

    return await prisma.admin.update({
      where: { account_id: accountId },
      data: { status: dbStatus },
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

  const [complexes, total, complexStatusStats] = await Promise.all([
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
    prisma.complex.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  const statsMap = complexStatusStats.reduce(
    (acc, item) => ({ ...acc, [item.status]: item._count.id }),
    {} as Record<string, number>,
  );

  return {
    complexes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    stats: {
      total: Object.values(statsMap).reduce((sum, value) => sum + value, 0),
      active: statsMap.ACTIVE || 0,
      pending: statsMap.PENDING || 0,
      inactive: statsMap.INACTIVE || 0,
      rejected: statsMap.REJECTED || 0,
      draft: statsMap.DRAFT || 0,
    },
  };
};

export const updateComplexStatus = async (
  complexId: string,
  status: ComplexStatus,
) => {
  const complex = await prisma.complex.findUnique({
    where: { id: complexId },
    select: {
      id: true,
      status: true,
      complex_name: true,
      owner: {
        select: {
          account_id: true,
        },
      },
    },
  });

  if (!complex) throw new NotFoundError("Complex not found");

  if (status === "ACTIVE" && complex.status === "PENDING") {
  } else if (status === "REJECTED" && complex.status !== "PENDING") {
    throw new BadRequestError("Only PENDING complexes can be rejected");
  } else if (status === "INACTIVE" && complex.status !== "ACTIVE") {
    throw new BadRequestError("Only ACTIVE complexes can be suspended");
  }

  const updatedComplex = await prisma.complex.update({
    where: { id: complexId },
    data: { status },
  });

  const statusTextMap: Record<ComplexStatus, string> = {
    DRAFT: "bản nháp",
    PENDING: "đang chờ duyệt",
    ACTIVE: "đã được phê duyệt",
    REJECTED: "đã bị từ chối",
    INACTIVE: "đã bị tạm ngưng",
  };

  await sendNotificationIfNotExists(complex.owner.account_id, {
    message: `Hồ sơ khu phức hợp ${complex.complex_name} ${statusTextMap[status]}.`,
    type: "SYSTEM",
    target_role: "OWNER",
    link_to: "/owner/complexes",
  });

  return updatedComplex;
};

/**
 * Monitoring
 */
export const getBookings = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string,
) => {
  const skip = (page - 1) * limit;

  // whereSearch: search + SINGLE-only — dùng cho stats (không bao gồm status filter)
  // → chỉ đếm booking đơn lẻ để nhất quán với bảng kết quả
  const whereSearch: Record<string, unknown> = {
    recurring_booking_id: null,
  };
  if (search?.trim()) {
    const searchStr = search.trim();
    whereSearch.OR = [
      {
        player: {
          account: { full_name: { contains: searchStr, mode: "insensitive" } },
        },
      },
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
    ];
  }

  // whereTable: thêm status filter lên trên whereSearch (đã bao gồm SINGLE filter)
  const whereTable: Record<string, unknown> = { ...whereSearch };
  if (status && status !== "ALL") {
    whereTable.status = status;
  }

  // Lấy danh sách, tổng số trang và thống kê trạng thái song song
  const [bookingsData, total, statusStats] = await Promise.all([
    prisma.booking.findMany({
      where: whereTable,
      skip,
      take: limit,
      include: {
        player: {
          include: {
            account: { select: { full_name: true, phone_number: true } },
          },
        },
        sub_field: {
          include: {
            complex: {
              select: {
                complex_name: true,
                owner: { select: { company_name: true } },
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    }),
    // pagination.total theo đúng filter (bao gồm status + SINGLE)
    prisma.booking.count({ where: whereTable }),
    // stats dùng whereSearch (không lọc status) → hiển thị breakdown đầy đủ
    prisma.booking.groupBy({
      by: ["status"],
      _count: { id: true },
      where: whereSearch,
    }),
  ]);

  const bookings = bookingsData;

  const statsMap = statusStats.reduce(
    (acc, s) => ({ ...acc, [s.status]: s._count.id }),
    {} as Record<string, number>,
  );

  return {
    bookings,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    stats: {
      total: Object.values(statsMap).reduce((a, b) => a + b, 0),
      confirmed: statsMap["CONFIRMED"] ?? 0,
      completed: statsMap["COMPLETED"] ?? 0,
      canceled: statsMap["CANCELED"] ?? 0,
      pending: statsMap["PENDING"] ?? 0,
    },
  };
};

export const getPayments = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string,
) => {
  const skip = (page - 1) * limit;

  const where: any = {};
  if (search?.trim()) {
    const searchStr = search.trim();
    where.OR = [
      { transaction_code: { contains: searchStr, mode: "insensitive" } },
      {
        bookings: {
          some: {
            player: {
              account: {
                OR: [
                  { full_name: { contains: searchStr, mode: "insensitive" } },
                  { email: { contains: searchStr, mode: "insensitive" } },
                ],
              },
            },
          },
        },
      },
    ];
  }

  if (status && status !== "ALL") {
    where.status = status;
  }

  const [payments, total, paymentStats] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      include: {
        bookings: {
          include: {
            player: {
              include: {
                account: { select: { full_name: true, email: true } },
              },
            },
            sub_field: {
              include: {
                complex: {
                  select: { complex_name: true },
                },
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.payment.count({ where }),
    prisma.payment.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
    }),
    prisma.payment.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  // Thêm một query nữa để lấy tổng số lượng cho stats chính xác
  const statusCounts = await prisma.payment.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const statsMap = statusCounts.reduce(
    (acc, s) => ({ ...acc, [s.status]: s._count.id }),
    {} as any,
  );

  return {
    payments,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    stats: {
      totalRevenue: Number(paymentStats._sum.amount) || 0,
      failedCount: statsMap["FAILED"] || 0,
      successCount: statsMap["SUCCESS"] || 0,
      refundedCount: statsMap["REFUNDED"] || 0,
    },
  };
};

// ─── Recurring Bookings ───────────────────────────────────────────────────────

export const getRecurringBookings = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string,
) => {
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status && status !== "ALL") {
    where.status = status;
  }
  if (search?.trim()) {
    const s = search.trim();
    where.OR = [
      {
        player: {
          account: { full_name: { contains: s, mode: "insensitive" } },
        },
      },
      {
        sub_field: {
          complex: {
            complex_name: { contains: s, mode: "insensitive" },
          },
        },
      },
      {
        sub_field: {
          sub_field_name: { contains: s, mode: "insensitive" },
        },
      },
    ];
  }

  const [data, total, statusStats] = await Promise.all([
    prisma.recurringBooking.findMany({
      where,
      skip,
      take: limit,
      include: {
        player: {
          include: {
            account: { select: { full_name: true, phone_number: true } },
          },
        },
        sub_field: {
          include: {
            complex: {
              select: {
                complex_name: true,
                owner: { select: { company_name: true } },
              },
            },
          },
        },
        bookings: {
          select: {
            id: true,
            status: true,
            total_price: true,
            start_time: true,
            end_time: true,
          },
          orderBy: { start_time: "asc" },
        },
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.recurringBooking.count({ where }),
    prisma.recurringBooking.groupBy({
      by: ["status"],
      _count: { id: true },
      where,
    }),
  ]);

  const recurringBookings = data.map((rb) => ({
    ...rb,
    child_count: rb.bookings.length,
    total_value: rb.bookings.reduce((sum, b) => sum + Number(b.total_price), 0),
    status_breakdown: rb.bookings.reduce(
      (acc, b) => {
        acc[b.status] = (acc[b.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  }));

  const statsMap = statusStats.reduce(
    (acc, s) => ({ ...acc, [s.status]: s._count.id }),
    {} as Record<string, number>,
  );

  return {
    recurringBookings,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    stats: {
      total: Object.values(statsMap).reduce((a, b) => a + b, 0),
      pending: statsMap["PENDING"] ?? 0,
      confirmed: statsMap["CONFIRMED"] ?? 0,
      completed: statsMap["COMPLETED"] ?? 0,
      canceled: statsMap["CANCELED"] ?? 0,
    },
  };
};
