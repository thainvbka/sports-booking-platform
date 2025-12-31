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
        (rb) => rb.id
      );
      await prisma.recurringBooking.updateMany({
        where: {
          id: { in: expiredRecurringBookingIds },
        },
        data: {
          status: "CANCELED",
        },
      });

      //double check de huy tat ca booking lien quan den recurring booking da bi huy
      await prisma.booking.updateMany({
        where: {
          recurring_booking_id: { in: expiredRecurringBookingIds },
          status: "PENDING",
        },
        data: {
          status: "CANCELED",
        },
      });
      console.log(
        `Canceled ${
          expiredRecurringBookingIds.length
        } expired recurring bookings at ${now.toISOString()}`
      );
    }
  } catch (error) {
    console.error("Error during expiredRecurringBookings:", error);
  }
};

export const completeRecurringBookings = async () => {
  try {
    //chuyển các recurring booking đã hoàn thành sang trạng thái COMPLETED
    const result = await prisma.recurringBooking.updateMany({
      where: {
        status: "ACTIVE", // Chỉ xử lý đơn ĐÃ THANH TOÁN
        end_date: {
          lt: new Date(), // Ngày kết thúc hợp đồng < Hiện tại
        },
      },
      data: { status: "COMPLETED" },
    });
    if (result.count > 0) {
      console.log(`Completed ${result.count} finished recurring bookings.`);
    }
  } catch (error) {
    console.error("Error during completeRecurringBookings:", error);
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

  //chay moi ngay de hoan thanh cac recurring booking da ket thuc
  cron.schedule("0 0 * * *", () => {
    completeRecurringBookings();
  });
};
