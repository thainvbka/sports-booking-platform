import { config } from "../../configs";
import { sendNotificationIfNotExists } from "./notification.service";
import { invalidatePlayerRecommendation } from "./recommendation.service";
import {
  BookingStatus,
  PaymentProvider,
  PaymentStatus,
  prisma,
  RecurringStatus,
} from "../../libs/prisma";
import stripe from "../../libs/stripe";
import { BadRequestError, NotFoundError } from "../../utils/error.response";

// Tạo Stripe Connect Account cho Owner
export const createConnectAccount = async (ownerId: string) => {
  let owner = await prisma.owner.findUnique({
    where: { id: ownerId, status: "ACTIVE" },
    select: {
      stripe_account_id: true,
      stripe_onboarding_complete: true,
      account: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!owner) {
    throw new NotFoundError("Owner not found or inactive");
  }

  let striperAccountId = owner.stripe_account_id;

  if (!striperAccountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: owner.account.email,
    });

    await prisma.owner.update({
      where: { id: ownerId },
      data: {
        stripe_account_id: account.id,
      },
    });

    striperAccountId = account.id;
  }

  //tạo link onboarding
  const accountLink = await stripe.accountLinks.create({
    account: striperAccountId,
    refresh_url: `${config.CLIENT_URL}/owner/stripe/refresh`, //check neu hoan thanh thi redirect ve trang kiem tra hoac chua thi tao lai
    return_url: `${config.CLIENT_URL}/owner/stripe/return`, //goi Api de update onboarding complete
    type: "account_onboarding",
  });

  return { url: accountLink.url };
};

//check trạng thái stripe account
export const checkStripeAccountStatus = async (ownerId: string) => {
  //check owner
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId, status: "ACTIVE" },
    select: {
      stripe_account_id: true,
      stripe_onboarding_complete: true,
    },
  });

  if (!owner || !owner.stripe_account_id) {
    return { isComplete: false };
  }

  // Safety-first: once onboarding is marked complete in DB, do not downgrade it
  // from this polling endpoint to avoid transient Stripe/API inconsistencies.
  if (owner.stripe_onboarding_complete) {
    return { isComplete: true };
  }

  //lấy thông tin account từ stripe
  const account = await stripe.accounts.retrieve(owner.stripe_account_id);

  //check owner đã hoàn thành onboarding và account đã được kích hoạt charges chưa
  // const isComplete =
  //   account.details_submitted && account.charges_enabled ? true : false;
  const isComplete = account.details_submitted ? true : false; //cái trên chặt quá =)) cái thứ 2 là nhận tiền rồi chứ ko phải hoàn thành onboarding
  // Chỉ cập nhật theo hướng false -> true để tránh ghi đè sai trạng thái đã hoàn tất.
  if (isComplete && !owner.stripe_onboarding_complete) {
    await prisma.owner.update({
      where: { id: ownerId },
      data: {
        stripe_onboarding_complete: isComplete,
      },
    });
  }

  return { isComplete };
};

//tạo session thanh toán cho booking
export const createCheckoutSession = async (
  playerId: string,
  bookingIds: string[],
) => {
  console.log(
    `Creating checkout session for player: ${playerId}, bookings: ${bookingIds}`,
  );
  if (!bookingIds || bookingIds.length === 0) {
    throw new BadRequestError("No bookings provided for payment");
  }

  //lấy danh sách booking
  const bookings = await prisma.booking.findMany({
    where: {
      id: { in: bookingIds },
      player_id: playerId,
      status: "PENDING",
    },
    select: {
      id: true,
      total_price: true,
      sub_field: {
        select: {
          sub_field_name: true,
          complex: {
            select: {
              id: true,
              complex_address: true,
              complex_name: true,
              owner: {
                select: {
                  stripe_account_id: true,
                  stripe_onboarding_complete: true,
                },
              },
            },
          },
        },
      },
      booking_addons: {
        select: {
          quantity: true,
          unit_price: true,
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (bookings.length !== bookingIds.length) {
    console.log(
      "ERROR: Mismatch in booking count. Some are missing or not PENDING.",
    );
    throw new BadRequestError(
      "Môt số booking không hợp lệ hoặc đã được thanh toán",
    );
  }

  //check owner đã hoàn thành onboarding stripe chưa
  const firstBooking = bookings[0];
  const owner = firstBooking.sub_field.complex.owner;

  const hasDifferentOwners = bookings.some(
    (booking) =>
      booking.sub_field.complex.owner.stripe_account_id !==
      owner.stripe_account_id,
  );

  if (hasDifferentOwners) {
    throw new BadRequestError(
      "Không thể thanh toán booking của nhiều chủ sân trong cùng một giao dịch",
    );
  }

  if (!owner.stripe_account_id || !owner.stripe_onboarding_complete) {
    console.log("::: Chủ sân chưa hoàn thành thiết lập thanh toán.");
    throw new BadRequestError("Chủ sân chưa hoàn thành thiết lập thanh toán");
  }

  const line_items: any[] = [];
  let totalAmount = 0;

  for (const booking of bookings) {
    const roundedBookingTotal = Math.round(Number(booking.total_price));
    if (!Number.isFinite(roundedBookingTotal) || roundedBookingTotal <= 0) {
      throw new BadRequestError(
        `Invalid booking amount for booking ${booking.id}`,
      );
    }

    const addonRoundedTotal = booking.booking_addons.reduce(
      (sum, addon) =>
        sum + Math.round(Number(addon.unit_price)) * addon.quantity,
      0,
    );

    const fieldAmount = roundedBookingTotal - addonRoundedTotal;

    if (fieldAmount <= 0) {
      throw new BadRequestError(
        `INVALID_BOOKING_TOTAL: Tổng tiền sân không hợp lệ sau khi tách add-on. Booking: ${booking.id}`,
      );
    }

    line_items.push({
      price_data: {
        currency: "vnd",
        product_data: {
          name: `Sân ${booking.sub_field.sub_field_name}`,
          description: `Khu phức hợp ${booking.sub_field.complex.complex_name} - Địa chỉ: ${booking.sub_field.complex.complex_address}`,
        },
        unit_amount: fieldAmount,
      },
      quantity: 1,
    });

    totalAmount += fieldAmount;

    for (const addon of booking.booking_addons) {
      const addonUnitAmount = Math.round(Number(addon.unit_price));
      if (!Number.isFinite(addonUnitAmount) || addonUnitAmount <= 0) {
        throw new BadRequestError(
          `Invalid addon amount in booking ${booking.id}`,
        );
      }

      line_items.push({
        price_data: {
          currency: "vnd",
          product_data: {
            name: addon.product.name,
            description: `Add-on cho booking ${booking.id}`,
          },
          unit_amount: addonUnitAmount,
        },
        quantity: addon.quantity,
      });

      totalAmount += addonUnitAmount * addon.quantity;
    }
  }

  const expectedAmount = bookings.reduce(
    (sum, booking) => sum + Math.round(Number(booking.total_price)),
    0,
  );

  if (totalAmount !== expectedAmount) {
    throw new BadRequestError(
      `BOOKING_AMOUNT_MISMATCH: Tổng tiền line_items không khớp với booking total_price. Expected=${expectedAmount}, Actual=${totalAmount}`,
    );
  }

  //phí nền tảng (10%)
  const platformFee = Math.round(totalAmount * 0.1);

  //tang booking timeout khi bat dau thanh toan (30 phút theo yêu cầu của Stripe)
  await prisma.booking.updateMany({
    where: {
      id: { in: bookingIds },
      status: "PENDING",
    },
    data: {
      expires_at: new Date(Date.now() + 30 * 60 * 1000), // Reset về 30 phút
    },
  });

  //tạo stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items,
    mode: "payment",

    //cấu hình chuyển tiền cho owner
    payment_intent_data: {
      application_fee_amount: platformFee,
      transfer_data: {
        destination: owner.stripe_account_id!,
      },
    },
    metadata: {
      playerId: playerId,
      bookingIds: JSON.stringify(bookingIds),
      type: "BOOKING_CHECKOUT",
    },
    success_url: `${config.CLIENT_URL}/bookings/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.CLIENT_URL}/bookings/failed`,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 phút
  });

  return { url: session.url! };
};

export const handleStripeWebhook = async (sig: string, data: any) => {
  const endpointSecret = config.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET is not defined in environment variables",
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(data, sig, endpointSecret);
  } catch (error: any) {
    console.error(`Webhook Signature Error: ${error.message}`);

    throw new BadRequestError(`Webhook Error: ${error.message}`);
  }

  //nếu checkout thành công
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    //  session = {
    //   "id": "cs_test_a1b2c3d4e5f6g7h8i9j0",  // <--- Mã phiên (Transaction Code)
    //   "object": "checkout.session",
    //   "url": "https://checkout.stripe.com/c/pay/cs_test_a1b2c3...", // <--- Link để mở trang thanh toán
    //   "amount_total": 400000,                // <--- TỔNG TIỀN (Stripe tự cộng 2 sân 200k = 400k)
    //   "amount_subtotal": 400000,
    //   "currency": "vnd",
    //   "payment_status": "unpaid",            // <--- Trạng thái hiện tại: Chưa trả
    //   "status": "open",
    //   "metadata": {                          // <--- Dữ liệu bạn gửi kèm
    //     "playerId": "player_123",
    //     "bookingIds": "[\"bk_01\", \"bk_02\"]",
    //     "type": "BOOKING_CHECKOUT"
    //   },
    //   "payment_intent": "pi_3Mtw...",        // <--- ID của ý định thanh toán ngầm
    //   "expires_at": 1684567890,
    //   ...
    // }

    //xử lý khi thanh toán thành công
    //lấy thông tin từ metadata

    //check loại thanh toán
    if (session.metadata.type === "BOOKING_CHECKOUT") {
      // Parse dữ liệu từ metadata
      const bookingIds: string[] = JSON.parse(session.metadata.bookingIds);
      const transactionCode = session.id;
      const totalAmount = session.amount_total;
      console.log(` Webhook received for bookings: ${bookingIds}`);

      const existingPayment = await prisma.payment.findUnique({
        where: {
          transaction_code: transactionCode,
        },
      });

      if (existingPayment) {
        console.log(`Webhook retried for ${transactionCode}, skipping`);
        return;
      }

      try {
        const notificationContext = await prisma.$transaction(async (tx) => {
          const pendingBookings = await tx.booking.findMany({
            where: {
              id: { in: bookingIds },
              status: BookingStatus.PENDING,
            },
            select: {
              id: true,
              total_price: true,
              recurring_booking_id: true,
              player: {
                select: {
                  account_id: true,
                },
              },
              sub_field: {
                select: {
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

          if (pendingBookings.length !== bookingIds.length) {
            throw new BadRequestError(
              `BOOKING_STATE_INVALID: Một số booking không còn ở trạng thái PENDING. Bookings: ${bookingIds.join(",")}`,
            );
          }

          const expectedAmount = pendingBookings.reduce(
            (sum, booking) => sum + Math.round(Number(booking.total_price)),
            0,
          );

          if (expectedAmount !== totalAmount) {
            throw new BadRequestError(
              `BOOKING_AMOUNT_MISMATCH: Số tiền webhook không khớp với total_price booking. Expected=${expectedAmount}, Stripe=${totalAmount}`,
            );
          }

          // Tạo payment record
          const newPayment = await tx.payment.create({
            data: {
              amount: totalAmount,
              provider: PaymentProvider.STRIPE,
              transaction_code: transactionCode,
              status: PaymentStatus.SUCCESS,
            },
          });

          // Cập nhật tất cả bookings thành COMPLETED
          await tx.booking.updateMany({
            where: {
              id: { in: bookingIds },
              status: BookingStatus.PENDING,
            },
            data: {
              status: BookingStatus.COMPLETED,
              payment_id: newPayment.id,
              paid_at: new Date(),
            },
          });

          const recurringBookingIds = Array.from(
            new Set(
              pendingBookings
                .map((booking) => booking.recurring_booking_id)
                .filter((value): value is string => Boolean(value)),
            ),
          );

          for (const recurringBookingId of recurringBookingIds) {
            // Đếm số booking PENDING còn lại của recurring này
            const pendingCount = await tx.booking.count({
              where: {
                recurring_booking_id: recurringBookingId,
                status: BookingStatus.PENDING,
              },
            });

            // Nếu không còn booking PENDING nào, đánh dấu recurring là COMPLETED
            if (pendingCount === 0) {
              await tx.recurringBooking.update({
                where: {
                  id: recurringBookingId,
                },
                data: {
                  status: RecurringStatus.COMPLETED,
                },
              });
            }
          }

          const firstBooking = pendingBookings[0];
          return {
            playerAccountId: firstBooking.player.account_id,
            ownerAccountId: firstBooking.sub_field.complex.owner.account_id,
            complexName: firstBooking.sub_field.complex.complex_name,
          };
        });

        const bookingLink = `/bookings?ids=${bookingIds.join(",")}`;
        await Promise.all([
          sendNotificationIfNotExists(notificationContext.playerAccountId, {
            message: `Thanh toán thành công cho booking tại ${notificationContext.complexName}.`,
            type: "PAYMENT",
            target_role: "PLAYER",
            link_to: bookingLink,
          }),
          sendNotificationIfNotExists(notificationContext.ownerAccountId, {
            message: `Bạn vừa nhận được một lượt đặt sân mới đã thanh toán tại ${notificationContext.complexName}.`,
            type: "BOOKING",
            target_role: "OWNER",
            link_to: "/owner/bookings",
          }),
        ]);

        console.log(`Bookings paid successfully: ${transactionCode}`);

        // Invalidate recommendation cache for the player (fire-and-forget)
        const playerId = session.metadata.playerId;
        if (playerId) {
          invalidatePlayerRecommendation(playerId).catch((err) =>
            console.error("[Recommendation] Failed to invalidate cache after payment:", err),
          );
        }
      } catch (error: any) {
        console.error("Database update failed:", error);
        throw new Error("Database update failed: " + error.message);
      }
    }
  }
};
