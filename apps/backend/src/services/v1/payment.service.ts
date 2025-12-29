import { prisma } from "@sports-booking-platform/db";
import {
  BookingStatus,
  PaymentStatus,
  PaymentProvider,
} from "@sports-booking-platform/db";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/error.response";
import stripe from "../../libs/stripe";
import { config } from "../../configs";

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

  //check owner đã connect stripe account chưa
  if (!striperAccountId) {
    // nếu chưa thì tạo mới
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: owner.account.email,
      // business_type: "individual", //la ca nhan
      // capabilities: {
      //   card_payments: { requested: true },
      //   transfers: { requested: true },
      // },
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
    refresh_url: `${config.CORS_ORIGIN}/owner/stripe/refresh`, //check neu hoan thanh thi redirect ve trang kiem tra hoac chua thi tao lai
    return_url: `${config.CORS_ORIGIN}/owner/stripe/return`, //goi Api de update onboarding complete
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

  //lấy thông tin account từ stripe
  const account = await stripe.accounts.retrieve(owner.stripe_account_id);

  //check owner đã hoàn thành onboarding và account đã được kích hoạt charges chưa
  // const isComplete =
  //   account.details_submitted && account.charges_enabled ? true : false;
  const isComplete = account.details_submitted ? true : false; //cái trên chặt quá =)) cái thứ 2 là nhận tiền rồi chứ ko phải hoàn thành onboarding
  //luôn cập nhật trạng thái mới nhất vào db
  if (owner.stripe_onboarding_complete !== isComplete) {
    //cập nhật lại trạng thái hoàn thành onboarding
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
  bookingIds: string[]
) => {
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
    },
  });

  if (bookings.length !== bookingIds.length) {
    throw new BadRequestError("Some bookings not found or not pending");
  }

  //check owner đã hoàn thành onboarding stripe chưa
  const firstBooking = bookings[0];
  const owner = firstBooking.sub_field.complex.owner;

  if (!owner.stripe_account_id || !owner.stripe_onboarding_complete) {
    throw new BadRequestError("Owner has not connected Stripe account");
  }

  //tạo line items cho stripe checkout
  const line_items = bookings.map((booking) => ({
    price_data: {
      currency: "vnd",
      product_data: {
        name: `Sân ${booking.sub_field.sub_field_name}`,
        description: `Khu phức hợp ${booking.sub_field.complex.complex_name} - Địa chỉ: ${booking.sub_field.complex.complex_address}`,
      },
      unit_amount: Number(booking.total_price),
    },
    quantity: 1,
  }));

  //tinh tong tien
  const totalAmount = bookings.reduce(
    (sum, booking) => sum + Number(booking.total_price),
    0
  );

  //phí nền tảng (10%)
  const platformFee = Math.round(totalAmount * 0.1);

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
    success_url: `${config.CORS_ORIGIN}/bookings/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.CORS_ORIGIN}/bookings/failed`,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60, //30 phut
  });

  return { url: session.url! };
};

export const handleStripeWebhook = async (sig: string, data: any) => {
  const endpointSecret = config.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripe.webhooks.constructEvent(data, sig, endpointSecret!);
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
      const bookingIds = JSON.parse(session.metadata.bookingIds);
      const transactionCode = session.id;
      const totalAmount = session.amount_total;
      console.log(` Webhook received for bookings: ${bookingIds}`);

      try {
        //cập nhật trạng thái booking thành PAID
        await prisma.$transaction(async (tx) => {
          const newPayment = await tx.payment.create({
            data: {
              amount: totalAmount,
              provider: PaymentProvider.STRIPE,
              transaction_code: session.id,
              status: PaymentStatus.SUCCESS,
            },
          });

          //cập nhật các booking lẻ hoặc booking con của booking định kỳ
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
        });

        console.log(`Bookings successfully : ${transactionCode} `);
      } catch (error: any) {
        throw new Error("Database update failed: " + error.message);
      }
    }
  }
};
