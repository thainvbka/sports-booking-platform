import cron from "node-cron";
import { prisma } from "../../libs/prisma";
import {
  restoreAddonStockForBooking,
  restoreAddonStockForBookingIds,
} from "./booking_addon.service";

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
};
