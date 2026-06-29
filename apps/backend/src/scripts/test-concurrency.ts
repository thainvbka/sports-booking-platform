import "../configs/dotenv";
import { prisma } from "../libs/prisma";
import { initRedis, closeRedis } from "../libs/redis";
import { createBooking } from "../services/v1/booking.service";

async function main() {
  console.log("=== BẮT ĐẦU CHẠY THỬ NGHIỆM ĐẶT SÂN ĐỒNG THỜI ===");
  await initRedis();

  // 1. Lấy 2 người chơi Active khác nhau từ database
  const players = await prisma.player.findMany({
    where: { status: "ACTIVE" },
    take: 2,
    include: {
      account: {
        select: { full_name: true }
      }
    }
  });

  if (players.length < 2) {
    console.error("LỖI: Cơ sở dữ liệu cần có ít nhất 2 người chơi ACTIVE để kiểm thử tranh chấp.");
    return;
  }

  const [player1, player2] = players;
  console.log(`Người chơi 1: ${player1.account.full_name} (${player1.id})`);
  console.log(`Người chơi 2: ${player2.account.full_name} (${player2.id})`);

  // 2. Lấy 1 sân con đang hoạt động
  const subfield = await prisma.subField.findFirst({
    where: { isDelete: false }
  });

  if (!subfield) {
    console.error("LỖI: Không tìm thấy sân con nào để kiểm thử.");
    return;
  }
  console.log(`Sân con được chọn: ${subfield.sub_field_name} (${subfield.id})`);

  // 3. Định nghĩa khung giờ đặt sân (Ngày mai từ 10:00 đến 11:00)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const startTime = new Date(tomorrow);
  startTime.setHours(10, 0, 0, 0);

  const endTime = new Date(tomorrow);
  endTime.setHours(11, 0, 0, 0);

  console.log(`Khung giờ kiểm thử: ${startTime.toISOString()} -> ${endTime.toISOString()}`);

  // 4. Dọn dẹp các booking trùng nếu có từ trước
  await prisma.booking.deleteMany({
    where: {
      sub_field_id: subfield.id,
      start_time: startTime,
      end_time: endTime,
    }
  });
  console.log("Đã dọn dẹp các booking cũ (nếu có) trên khung giờ này.");

  const bookingInput = {
    start_time: startTime,
    end_time: endTime,
    addons: []
  };

  console.log("\n[GỬI ĐỒNG THỜI]: Bắt đầu gửi đồng thời 2 request đặt sân cùng lúc...");

  // 5. Gửi song song 2 request đặt sân qua Promise.allSettled
  const startTimeMs = Date.now();
  const results = await Promise.allSettled([
    createBooking(player1.id, bookingInput, subfield.id),
    createBooking(player2.id, bookingInput, subfield.id)
  ]);
  const duration = Date.now() - startTimeMs;

  console.log(`Thời gian xử lý: ${duration}ms\n`);

  // 6. Phân tích kết quả
  let successCount = 0;
  let failCount = 0;
  let successId = "";

  results.forEach((res, index) => {
    const playerNum = index + 1;
    const playerName = playerNum === 1 ? player1.account.full_name : player2.account.full_name;

    if (res.status === "fulfilled") {
      successCount++;
      successId = res.value.booking.id;
      console.log(`✅ [REQUEST ${playerNum}] (${playerName}): THÀNH CÔNG!`);
      console.log(`   ID Đặt sân: ${res.value.booking.id}`);
    } else {
      failCount++;
      console.log(`❌ [REQUEST ${playerNum}] (${playerName}): THẤT BẠI!`);
      console.log(`   Lý do lỗi: "${res.reason.message}"`);
    }
  });

  // 7. Xác thực tính chính xác trong Database
  console.log("\n=== KIỂM TRA LẠI DATABASE ===");
  const savedBookings = await prisma.booking.findMany({
    where: {
      sub_field_id: subfield.id,
      start_time: startTime,
      end_time: endTime,
      status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] }
    }
  });

  console.log(`Số lượng đơn đặt sân thực tế trong DB: ${savedBookings.length}`);

  if (savedBookings.length === 1 && successCount === 1 && failCount === 1) {
    console.log("\n🎉 KẾT QUẢ: KIỂM THỬ THÀNH CÔNG! HỆ THỐNG ĐÃ NGĂN CHẶN DOUBLE BOOKING CHÍNH XÁC.");
    console.log("👉 Một người chơi được xác nhận đặt sân thành công.");
    console.log("👉 Người chơi còn lại bị từ chối (bởi Redis lock hoặc Postgres row-level lock) và nhận thông báo lỗi.");
  } else {
    console.log("\n⚠️ KẾT QUẢ: CÓ VẤN ĐỀ XẢY RA!");
    console.log(`- Request thành công thực tế: ${successCount}`);
    console.log(`- Số record trong DB: ${savedBookings.length}`);
  }

  // 8. Dọn dẹp sau khi test xong
  if (successId) {
    await prisma.booking.delete({ where: { id: successId } });
    console.log("\nĐã tự động dọn dẹp (xóa) đơn đặt sân thử nghiệm.");
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await closeRedis();
    process.exit(0);
  });
