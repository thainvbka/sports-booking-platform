import Stripe from "stripe";
import { config } from "../configs";
import { prisma, BookingStatus, PaymentProvider, PaymentStatus } from "../libs/prisma";
import stripe from "../libs/stripe";
import crypto from "crypto";
import { handleStripeWebhook, handleVnpayIpn } from "../services/v1/payment.service";

async function main() {
  console.log("=== BẮT ĐẦU KIỂM THỬ PAYMENT WEBHOOK IDEMPOTENCY (DIRECT INVOCATION) ===");

  // 1. Lấy thông tin Player và SubField từ Database để tạo dữ liệu test
  const player = await prisma.player.findFirst();
  const subField = await prisma.subField.findFirst();

  if (!player || !subField) {
    console.error("❌ Thất bại: Không tìm thấy Player hoặc SubField trong database để tạo dữ liệu test.");
    process.exit(1);
  }

  console.log(`[Dữ liệu mẫu] Player ID: ${player.id}, SubField ID: ${subField.id}`);

  // =======================================================
  // TEST CASE 1: STRIPE WEBHOOK IDEMPOTENCY
  // =======================================================
  console.log("\n--- [Stripe] Bắt đầu test Webhook Idempotency ---");

  // Tạo booking PENDING giả lập
  const stripeBooking = await prisma.booking.create({
    data: {
      player_id: player.id,
      sub_field_id: subField.id,
      status: BookingStatus.PENDING,
      total_price: 200000,
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000), // ngày mai
      end_time: new Date(Date.now() + 25 * 60 * 60 * 1000),
      expires_at: new Date(Date.now() + 30 * 60 * 1000),
    },
  });

  console.log(`1. Đã tạo Booking PENDING cho Stripe: ${stripeBooking.id}`);

  const stripeTransactionCode = `cs_test_${crypto.randomBytes(8).toString("hex")}`;
  const stripePayload = {
    id: `evt_test_${crypto.randomBytes(8).toString("hex")}`,
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: stripeTransactionCode,
        amount_total: 200000,
        metadata: {
          playerId: player.id,
          bookingIds: JSON.stringify([stripeBooking.id]),
          type: "BOOKING_CHECKOUT",
        },
      },
    },
  };

  const payloadString = JSON.stringify(stripePayload);
  const timestamp = Math.floor(Date.now() / 1000);
  
  // Tạo chữ ký Stripe hợp lệ
  const stripeSignature = Stripe.webhooks.generateTestHeaderString({
    payload: payloadString,
    timestamp: timestamp,
    secret: config.STRIPE_WEBHOOK_SECRET as string,
  });

  // Gọi trực tiếp handleStripeWebhook lần 1
  console.log("2. Gọi handleStripeWebhook lần thứ nhất...");
  let stripe1Success = true;
  try {
    await handleStripeWebhook(stripeSignature, payloadString);
    console.log("   Lần 1: Xử lý thành công!");
  } catch (error: any) {
    console.error("   Lần 1: Lỗi:", error.message);
    stripe1Success = false;
  }

  // Xác thực Database sau lần 1
  const bookingAfterStripe1 = await prisma.booking.findUnique({ where: { id: stripeBooking.id } });
  const paymentAfterStripe1 = await prisma.payment.findUnique({ where: { transaction_code: stripeTransactionCode } });
  
  console.log(`   Trạng thái Booking trong DB: ${bookingAfterStripe1?.status} (Kỳ vọng: COMPLETED)`);
  console.log(`   Bản ghi Payment được tạo: ${paymentAfterStripe1 ? "Có" : "Không"} (Kỳ vọng: Có)`);

  // Gọi trực tiếp handleStripeWebhook lần 2 (Trùng lặp / Duplicate)
  console.log("3. Gọi handleStripeWebhook lần thứ hai (Trùng lặp)...");
  let stripe2Success = true;
  try {
    await handleStripeWebhook(stripeSignature, payloadString);
    console.log("   Lần 2: Xử lý thành công (hoặc bỏ qua không lỗi)!");
  } catch (error: any) {
    console.error("   Lần 2: Lỗi:", error.message);
    stripe2Success = false;
  }

  // Xác thực Database sau lần 2: Đảm bảo số lượng payment record vẫn là 1
  const stripePaymentCount = await prisma.payment.count({
    where: { transaction_code: stripeTransactionCode },
  });
  console.log(`   Số lượng bản ghi Payment trong DB: ${stripePaymentCount} (Kỳ vọng: 1)`);

  let stripePassed = false;
  if (
    stripe1Success &&
    stripe2Success &&
    bookingAfterStripe1?.status === BookingStatus.COMPLETED &&
    stripePaymentCount === 1
  ) {
    console.log("✅ KẾT QUẢ TEST STRIPE: THÀNH CÔNG (Đảm bảo Idempotency)");
    stripePassed = true;
  } else {
    console.error("❌ KẾT QUẢ TEST STRIPE: THẤT BẠI");
  }

  // Dọn dẹp dữ liệu test Stripe
  console.log("4. Đang dọn dẹp dữ liệu test Stripe...");
  await prisma.booking.delete({ where: { id: stripeBooking.id } });
  if (paymentAfterStripe1) {
    await prisma.ownerPayout.deleteMany({ where: { payment_id: paymentAfterStripe1.id } });
    await prisma.payment.delete({ where: { id: paymentAfterStripe1.id } });
  }

  // =======================================================
  // TEST CASE 2: VNPAY IPN IDEMPOTENCY
  // =======================================================
  console.log("\n--- [VNPay] Bắt đầu test IPN Webhook Idempotency ---");

  // Tạo booking PENDING giả lập cho VNPay
  const vnpayBooking = await prisma.booking.create({
    data: {
      player_id: player.id,
      sub_field_id: subField.id,
      status: BookingStatus.PENDING,
      total_price: 150000,
      start_time: new Date(Date.now() + 26 * 60 * 60 * 1000),
      end_time: new Date(Date.now() + 27 * 60 * 60 * 1000),
      expires_at: new Date(Date.now() + 30 * 60 * 1000),
    },
  });

  // Tạo bản ghi Payment PENDING trước
  const vnpayTransactionCode = `VNP_test_${crypto.randomBytes(8).toString("hex")}`;
  const vnpayPayment = await prisma.payment.create({
    data: {
      amount: 150000,
      provider: PaymentProvider.VNPAY,
      transaction_code: vnpayTransactionCode,
      status: PaymentStatus.PENDING,
    },
  });

  // Liên kết booking với payment ID
  await prisma.booking.update({
    where: { id: vnpayBooking.id },
    data: { payment_id: vnpayPayment.id },
  });

  console.log(`1. Đã tạo Booking PENDING và Payment PENDING trong DB. TxnRef: ${vnpayTransactionCode}`);

  // Cấu hình Query Params cho VNPay IPN
  const vnpayParams: Record<string, string> = {
    vnp_Amount: "15000000",
    vnp_Command: "pay",
    vnp_CreateDate: "20260705220000",
    vnp_CurrCode: "VND",
    vnp_IpAddr: "127.0.0.1",
    vnp_Locale: "vn",
    vnp_OrderInfo: `Thanh toan booking: ${vnpayBooking.id}`,
    vnp_ResponseCode: "00",
    vnp_TmnCode: config.VNPAY_TMN_CODE as string,
    vnp_TransactionNo: `Trans_${crypto.randomBytes(4).toString("hex")}`,
    vnp_TransactionStatus: "00",
    vnp_TxnRef: vnpayTransactionCode,
    vnp_Version: "2.1.0",
  };

  // Tạo chữ ký
  const sortedKeys = Object.keys(vnpayParams).sort();
  const signData = sortedKeys
    .map((key) => `${key}=${encodeURIComponent(vnpayParams[key]).replace(/%20/g, "+")}`)
    .join("&");
  const secureHash = crypto
    .createHmac("sha512", config.VNPAY_SECURE_SECRET as string)
    .update(signData)
    .digest("hex");

  vnpayParams.vnp_SecureHash = secureHash;

  // Gọi trực tiếp handleVnpayIpn lần 1
  console.log("2. Gọi handleVnpayIpn lần thứ nhất...");
  const resVnpay1 = await handleVnpayIpn(vnpayParams);
  console.log("   Kết quả lần 1:", resVnpay1); // Kỳ vọng: { RspCode: '00', Message: 'Confirm success' }

  // Xác thực Database sau lần 1
  const bookingAfterVnpay1 = await prisma.booking.findUnique({ where: { id: vnpayBooking.id } });
  const paymentAfterVnpay1 = await prisma.payment.findUnique({ where: { id: vnpayPayment.id } });
  
  console.log(`   Trạng thái Booking trong DB: ${bookingAfterVnpay1?.status} (Kỳ vọng: COMPLETED)`);
  console.log(`   Trạng thái Payment trong DB: ${paymentAfterVnpay1?.status} (Kỳ vọng: SUCCESS)`);

  // Gọi trực tiếp handleVnpayIpn lần 2 (Trùng lặp / Duplicate)
  console.log("3. Gọi handleVnpayIpn lần thứ hai (Trùng lặp)...");
  const resVnpay2 = await handleVnpayIpn(vnpayParams);
  console.log("   Kết quả lần 2:", resVnpay2); // Kỳ vọng: { RspCode: '02', Message: 'Order already confirmed' }

  let vnpayPassed = false;
  if (
    resVnpay1.RspCode === "00" &&
    resVnpay2.RspCode === "02" &&
    bookingAfterVnpay1?.status === BookingStatus.COMPLETED &&
    paymentAfterVnpay1?.status === PaymentStatus.SUCCESS
  ) {
    console.log("✅ KẾT QUẢ TEST VNPAY: THÀNH CÔNG (Đảm bảo Idempotency)");
    vnpayPassed = true;
  } else {
    console.error("❌ KẾT QUẢ TEST VNPAY: THẤT BẠI");
  }

  // Dọn dẹp dữ liệu test VNPay
  console.log("4. Đang dọn dẹp dữ liệu test VNPay...");
  await prisma.booking.delete({ where: { id: vnpayBooking.id } });
  await prisma.ownerPayout.deleteMany({ where: { payment_id: vnpayPayment.id } });
  await prisma.payment.delete({ where: { id: vnpayPayment.id } });

  console.log("\n=== TỔNG KẾT KIỂM THỬ ===");
  if (stripePassed && vnpayPassed) {
    console.log("🎉 TẤT CẢ CÁC TEST CASE ĐÃ VƯỢT QUA THÀNH CÔNG!");
  } else {
    console.error("⚠️ CÓ TEST CASE THẤT BẠI. VUI LÒNG KIỂM TRA LẠI LOG.");
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Có lỗi xảy ra khi thực thi script test:", err);
  process.exit(1);
});
