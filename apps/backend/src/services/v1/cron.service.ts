import cron from "node-cron";
import { prisma } from "@sports-booking-platform/db";

export const cleanupExpiredBookings = async () => {
  try {
    const now = new Date();

    //xu ly cac booking le het han
    const expiredBookings = await prisma.booking.updateMany({
      where: {
        status: "PENDING",
        expires_at: {
          lt: now,
        },
      },
      data: {
        status: "CANCELED",
      },
    });

    if (expiredBookings.count > 0) {
      console.log(
        `Canceled ${
          expiredBookings.count
        } expired bookings at ${now.toISOString()}`
      );
    }

    //xu ly cac recurring booking het han
  } catch (error) {
    console.error("Error during cleanupExpiredBookings:", error);
  }
};

export const startCronJobs = () => {
  // chay moi phut
  cron.schedule("*/1 * * * *", () => {
    console.log("Running cleanupExpiredBookings cron job...");
    cleanupExpiredBookings();
  });
};
