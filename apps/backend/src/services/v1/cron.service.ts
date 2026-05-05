import cron from "node-cron";
import { prisma } from "../../libs/prisma";
import {
  restoreAddonStockForBooking,
  restoreAddonStockForBookingIds,
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

          for (const bookingId of pendingBookingIds) {
            const canceledBooking = await tx.booking.updateMany({
              where: {
                id: bookingId,
                status: "PENDING",
              },
              data: {
                status: "CANCELED",
              },
            });

            if (canceledBooking.count > 0) {
              await restoreAddonStockForBooking(tx, bookingId);
            }
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
        link_to: `/bookings/${booking.id}`,
      });
    }
  } catch (error) {
    console.error("Error during sendUpcomingBookingReminders:", error);
  }
};

export const startCronJobs = () => {
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

  // chay moi phut de dong/huy/completed match theo booking va thoi gian
  cron.schedule("*/1 * * * *", async () => {
    await cancelMatchesByCanceledBookings();
    await syncMatchStatusesByTime();
  });
};
