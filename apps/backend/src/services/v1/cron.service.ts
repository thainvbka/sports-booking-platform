import cron from "node-cron";
import { prisma } from "../../libs/prisma";
import {
  restoreAddonStockForBooking,
  restoreAddonStockForBookingIds,
  restoreRentalAddonStockForBookingIds,
} from "./booking_addon.service";
import {
  cancelMatchesByCanceledBookings,
  syncMatchStatusesByTime,
} from "./match.service";
import { sendNotificationIfNotExists } from "./notification.service";

export const cleanupExpiredBookings = async () => {
  try {
    const now = new Date();

    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: "PENDING",
        expires_at: {
          lt: now,
        },
      },
      select: {
        id: true,
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

    let canceledCount = 0;

    for (const booking of expiredBookings) {
      const canceled = await prisma.$transaction(async (tx) => {
        const updateResult = await tx.booking.updateMany({
          where: {
            id: booking.id,
            status: "PENDING",
            expires_at: {
              lt: now,
            },
          },
          data: {
            status: "CANCELED",
          },
        });

        if (updateResult.count === 0) {
          return false;
        }

        await restoreAddonStockForBooking(tx, booking.id);
        return true;
      });

      if (canceled) {
        canceledCount += 1;
        await sendNotificationIfNotExists(booking.player.account_id, {
          message: `Phiên đặt sân ${booking.sub_field.sub_field_name} tại ${booking.sub_field.complex.complex_name} đã hết hạn và bị hủy tự động.`,
          type: "BOOKING",
          target_role: "PLAYER",
          link_to: "/bookings",
        });
      }
    }

    if (canceledCount > 0) {
      console.log(
        `Canceled ${canceledCount} expired bookings at ${now.toISOString()}`,
      );
    }
  } catch (error) {
    console.error("Error during cleanupExpiredBookings:", error);
  }
};

export const expiredRecurringBookings = async () => {
  try {
    const now = new Date();
    //xu ly hủy cac recurring booking het han
    //chi huy khi tat ca cac booking con cuar recurring booking do da het han
    const expiredRecurringBookings = await prisma.recurringBooking.findMany({
      where: {
        status: "PENDING",
        bookings: {
          every: {
            OR: [
              {
                status: "CANCELED",
              },
              {
                AND: [
                  { status: "PENDING" },
                  {
                    expires_at: {
                      lt: now,
                    },
                  },
                ],
              },
            ],
          },
        },
      },
      select: { id: true },
    });

    if (expiredRecurringBookings.length > 0) {
      const expiredRecurringBookingIds = expiredRecurringBookings.map(
        (rb) => rb.id,
      );

      let canceledRecurringCount = 0;

      for (const recurringId of expiredRecurringBookingIds) {
        const updated = await prisma.$transaction(async (tx) => {
          const recurringUpdated = await tx.recurringBooking.updateMany({
            where: {
              id: recurringId,
              status: "PENDING",
            },
            data: {
              status: "CANCELED",
            },
          });

          if (recurringUpdated.count === 0) {
            return false;
          }

          const pendingBookings = await tx.booking.findMany({
            where: {
              recurring_booking_id: recurringId,
              status: "PENDING",
              expires_at: {
                lt: now,
              },
            },
            select: {
              id: true,
            },
          });

          const pendingBookingIds = pendingBookings.map(
            (booking) => booking.id,
          );

          if (pendingBookingIds.length > 0) {
            await restoreAddonStockForBookingIds(tx, pendingBookingIds);
            await tx.booking.updateMany({
              where: {
                id: { in: pendingBookingIds },
                status: "PENDING",
              },
              data: {
                status: "CANCELED",
              },
            });
          }

          // Bổ sung lớp an toàn cho các booking pending vừa mới phát sinh trong transaction.
          const remainPendingIds = (
            await tx.booking.findMany({
              where: {
                recurring_booking_id: recurringId,
                status: "PENDING",
                expires_at: {
                  lt: now,
                },
              },
              select: { id: true },
            })
          ).map((booking) => booking.id);

          if (remainPendingIds.length > 0) {
            await restoreAddonStockForBookingIds(tx, remainPendingIds);
            await tx.booking.updateMany({
              where: {
                id: { in: remainPendingIds },
                status: "PENDING",
              },
              data: { status: "CANCELED" },
            });
          }

          return true;
        });

        if (updated) {
          canceledRecurringCount += 1;
        }
      }

      console.log(
        `Canceled ${canceledRecurringCount} expired recurring bookings at ${now.toISOString()}`,
      );
    }
  } catch (error) {
    console.error("Error during expiredRecurringBookings:", error);
  }
};

export const sendUpcomingBookingReminders = async () => {
  try {
    const now = new Date();
    const fromTime = new Date(now.getTime() + 55 * 60 * 1000);
    const toTime = new Date(now.getTime() + 65 * 60 * 1000);

    const upcomingBookings = await prisma.booking.findMany({
      where: {
        status: {
          in: ["CONFIRMED", "COMPLETED"],
        },
        start_time: {
          gte: fromTime,
          lte: toTime,
        },
      },
      select: {
        id: true,
        start_time: true,
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

    for (const booking of upcomingBookings) {
      const startTime = booking.start_time.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      await sendNotificationIfNotExists(booking.player.account_id, {
        message: `Nhắc lịch: Bạn có lịch đá tại ${booking.sub_field.complex.complex_name} - ${booking.sub_field.sub_field_name} vào lúc ${startTime}.`,
        type: "SYSTEM",
        target_role: "PLAYER",
        link_to: "/bookings",
      });
    }
  } catch (error) {
    console.error("Error during sendUpcomingBookingReminders:", error);
  }
};

export const sendOwnerBookingConfirmationReminders = async () => {
  try {
    const now = new Date();
    const fromTime = new Date(now.getTime() + 55 * 60 * 1000);
    const toTime = new Date(now.getTime() + 65 * 60 * 1000);

    const pendingConfirmBookings = await prisma.booking.findMany({
      where: {
        status: "COMPLETED",
        payment: {
          status: "SUCCESS",
        },
        start_time: {
          gte: fromTime,
          lte: toTime,
        },
      },
      select: {
        id: true,
        start_time: true,
        sub_field: {
          select: {
            sub_field_name: true,
            complex: {
              select: {
                complex_name: true,
                owner: {
                  select: {
                    account_id: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    for (const booking of pendingConfirmBookings) {
      const startTime = booking.start_time.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      await sendNotificationIfNotExists(
        booking.sub_field.complex.owner.account_id,
        {
          message: `Nhắc xác nhận: Booking ${booking.sub_field.sub_field_name} tại ${booking.sub_field.complex.complex_name} sẽ bắt đầu lúc ${startTime}. Vui lòng xác nhận sớm cho khách.`,
          type: "BOOKING",
          target_role: "OWNER",
          link_to: `/owner/bookings?bookingId=${booking.id}`,
        },
      );
    }
  } catch (error) {
    console.error("Error during sendOwnerBookingConfirmationReminders:", error);
  }
};

export const autoReturnEndedRentalAddons = async () => {
  try {
    const now = new Date();

    // 1. Tìm các booking CONFIRMED đã kết thúc nhưng chưa hoàn đồ thuê
    const endedBookings = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        end_time: {
          lt: now,
        },
        rental_returned: false,
      },
      select: {
        id: true,
      },
    });

    if (endedBookings.length === 0) return;

    const bookingIds = endedBookings.map((b) => b.id);
    let processedCount = 0;

    // 2. Chạy transaction xử lý
    await prisma.$transaction(async (tx) => {
      // Hoàn trả stock dụng cụ RENTAL
      await restoreRentalAddonStockForBookingIds(tx, bookingIds);

      // Đánh dấu đã hoàn trả trên Booking
      await tx.booking.updateMany({
        where: {
          id: { in: bookingIds },
        },
        data: {
          rental_returned: true,
        },
      });

      processedCount = bookingIds.length;
    });

    if (processedCount > 0) {
      console.log(`[Cron] Tự động hoàn trả đồ thuê cho ${processedCount} booking đã kết thúc lúc ${now.toISOString()}`);
    }
  } catch (error) {
    console.error("[Cron] Lỗi trong tiến trình tự động trả đồ thuê autoReturnEndedRentalAddons:", error);
  }
};

export const startCronJobs = () => {
  // Invalidate recommendation cache for players whose bookings just ended
  // Runs every hour — finds CONFIRMED bookings with end_time < now and invalidates cache
  cron.schedule("0 * * * *", async () => {
    try {
      console.log("[Cron] Running recommendation cache invalidation for ended bookings...");
      const { invalidatePlayerRecommendation } = await import("./recommendation.service");

      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Find bookings that ended within the last hour
      const endedBookings = await prisma.booking.findMany({
        where: {
          status: "CONFIRMED",
          end_time: {
            gte: oneHourAgo,
            lt: now,
          },
        },
        select: { player_id: true },
        distinct: ["player_id"],
      });

      for (const booking of endedBookings) {
        await invalidatePlayerRecommendation(booking.player_id);
      }

      if (endedBookings.length > 0) {
        console.log(`[Cron] Invalidated recommendation cache for ${endedBookings.length} players`);
      }
    } catch (e) {
      console.error("[Cron] Error in recommendation cache invalidation:", e);
    }
  });

  // Weekly rebuild of all subfield embeddings (Sunday 3:00 AM)
  // Prevents vector drift as prices, ratings, and booking patterns change over time
  cron.schedule("0 3 * * 0", async () => {
    try {
      console.log("[Cron] Starting weekly subfield embedding rebuild...");
      const { recomputeSubfieldEmbedding } = await import("./recommendation.service");

      const subfields = await prisma.subField.findMany({
        where: { isDelete: false },
        select: { id: true },
      });

      let successCount = 0;
      for (const sf of subfields) {
        try {
          await recomputeSubfieldEmbedding(sf.id);
          successCount++;
        } catch (err) {
          console.error(`[Cron] Failed to recompute embedding for subfield ${sf.id}:`, err);
        }
      }

      console.log(`[Cron] Weekly embedding rebuild complete: ${successCount}/${subfields.length} succeeded`);
    } catch (e) {
      console.error("[Cron] Error in weekly embedding rebuild:", e);
    }
  });

  // chay moi phut de huy cac booking le het han
  cron.schedule("*/1 * * * *", () => {
    console.log("Running cleanupExpiredBookings cron job...");
    cleanupExpiredBookings();
  });
  //chay moi 5 phut để hủy recurring booking het han
  cron.schedule("*/5 * * * *", () => {
    expiredRecurringBookings();
  });

  // chạy mỗi 5 phút để nhắc lịch đá trước 1 giờ
  cron.schedule("*/5 * * * *", () => {
    sendUpcomingBookingReminders();
  });

  // chạy mỗi 5 phút để nhắc chủ sân xác nhận booking đã thanh toán
  cron.schedule("*/5 * * * *", () => {
    sendOwnerBookingConfirmationReminders();
  });

  // chay moi phut de dong/huy/completed match theo booking va thoi gian
  cron.schedule("*/1 * * * *", async () => {
    await cancelMatchesByCanceledBookings();
    await syncMatchStatusesByTime();
  });

  // chạy mỗi phút để tự động hoàn trả đồ thuê khi booking đã kết thúc
  cron.schedule("*/1 * * * *", () => {
    console.log("Running autoReturnEndedRentalAddons cron job...");
    autoReturnEndedRentalAddons();
  });
};

