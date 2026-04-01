/**
 * Seed toàn diện cho đồ án — bao phủ tất cả entity trong schema.
 *
 * Entities được seed:
 *   Account / Admin / Owner / Player
 *   Complex / SubField / PricingRule / Product
 *   Booking / Payment / BookingAddon
 *   RecurringBooking (+ child Bookings)
 *   Match / MatchParticipant
 *   Review
 *   Notification
 *
 * Phân phối dữ liệu phục vụ analytics:
 *   - Account.created_at trải đều 6 tháng → userGrowth chart có sóng
 *   - Booking tập trung giờ cao điểm (18–22h) & cuối tuần
 *   - Revenue tháng gần đây cao hơn → trend đi lên
 *   - Cancel rate dao động 15–25% mỗi tháng
 *   - Rating phân phối 1–5 (không chỉ 3–5)
 *   - BookingAddon cho ~40% COMPLETED booking → upsell metrics thực
 *   - PaymentProvider phân chia MOMO 50% / VNPAY 30% / STRIPE 20%
 *   - Recurring bookings thực sự có child bookings
 *   - Match open/full/completed với participants
 */

import { faker } from "@faker-js/faker/locale/vi";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  AdminStatus,
  BookingStatus,
  ComplexStatus,
  MatchSkillLevel,
  MatchStatus,
  OwnerStatus,
  ParticipantStatus,
  PaymentProvider,
  PaymentStatus,
  PlayerStatus,
  PrismaClient,
  RecurrenceType,
  RecurringStatus,
  SportType,
} from "@prisma/client";
import * as bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path";
import { Pool } from "pg";

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const connectionString = process.env.DATABASE_URL ?? "";

if (!connectionString) {
  throw new Error("DATABASE_URL is required for seed");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Helpers ─────────────────────────────────────────────────────────────────

const hash = (p: string) => bcrypt.hashSync(p, 10);

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const rand = () => Math.random();

const pick = <T>(arr: T[]): T => arr[randInt(0, arr.length - 1)];

const pickN = <T>(arr: T[], n: number): T[] => {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(randInt(0, copy.length - 1), 1)[0]);
  }
  return out;
};

/** Ngày trong quá khứ tính từ hôm nay */
const daysAgo = (d: number): Date => {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  return dt;
};

/** Ngày trong quá khứ từ một mốc nhất định */
const daysAgoFrom = (base: Date, d: number): Date => {
  const dt = new Date(base);
  dt.setDate(dt.getDate() - d);
  return dt;
};

/** Set giờ:phút cho một Date */
const setHM = (base: Date, hh: number, mm: number): Date => {
  const d = new Date(base);
  d.setHours(hh, mm, 0, 0);
  return d;
};

/** Random Date trong khoảng [from, to] */
const randDate = (from: Date, to: Date): Date => {
  const ms = from.getTime() + rand() * (to.getTime() - from.getTime());
  return new Date(ms);
};

/** Random Date an toàn khi from >= to */
const randDateSafe = (from: Date, to: Date): Date => {
  if (from.getTime() >= to.getTime()) return new Date(from);
  return randDate(from, to);
};

/**
 * Chọn ngẫu nhiên với trọng số.
 * weights phải cùng độ dài với items và tổng = 1 (hoặc bất kỳ — sẽ normalise).
 */
const weightedPick = <T>(items: T[], weights: number[]): T => {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
};

// ─── Lookup data ──────────────────────────────────────────────────────────────

const SPORT_TYPES = Object.values(SportType);

const DISTRICTS = [
  "Quận 1",
  "Quận 3",
  "Quận 7",
  "Quận Bình Thạnh",
  "Quận Tân Bình",
  "Quận Gò Vấp",
  "Quận Phú Nhuận",
  "TP Thủ Đức",
  "Quận 10",
  "Quận 12",
];

const STREETS = [
  "Đinh Tiên Hoàng",
  "Lý Thường Kiệt",
  "Trần Phú",
  "Hoàng Diệu",
  "Nguyễn Chí Thanh",
  "Kim Mã",
  "Xuân Thủy",
  "Lê Văn Sỹ",
  "Cộng Hòa",
  "Nguyễn Văn Linh",
  "Phạm Văn Đồng",
];

const COMPLEX_NAMES = [
  "Sân Thể Thao Mỹ Đình",
  "SportZone Arena",
  "GreenField Sports",
  "Khu Thể Thao Tây Hồ",
  "Trung Tâm Thể Thao Citadel",
  "Sân Bóng Hà Nội Star",
  "SportHub Bình Thạnh",
  "Victory Sports Center",
  "Sân Thể Thao Hoàng Mai",
  "Khu Thể Thao Gia Định",
  "ProSport Complex",
  "Arena Sports Club",
  "Sân Thể Thao Tân Bình",
  "Urban Sports Park",
];

/** Giờ mở cửa: 6h–22h. Trọng số tập trung peak 18–22h và 8–10h */
const PEAK_HOURS = [6, 7, 8, 9, 10, 14, 15, 16, 17, 18, 19, 20];
const PEAK_WEIGHTS = [
  0.04, 0.05, 0.06, 0.06, 0.05, 0.04, 0.05, 0.06, 0.07, 0.14, 0.16, 0.12,
];
const SLOT_DURATION_H = 2; // mỗi slot 2 giờ

const PRICE_RANGE: Record<SportType, [number, number]> = {
  FOOTBALL: [300_000, 800_000],
  BASKETBALL: [200_000, 500_000],
  TENNIS: [150_000, 400_000],
  BADMINTON: [100_000, 250_000],
  VOLLEYBALL: [120_000, 300_000],
  PICKLEBALL: [100_000, 200_000],
};

/** Tỉ lệ cancel theo tháng: tháng xa hơn cancel ít hơn (dữ liệu đã "chốt") */
const CANCEL_RATE_BY_MONTH = [0.15, 0.17, 0.2, 0.22, 0.18, 0.14]; // index 0 = cách 5 tháng

const PROVIDER_WEIGHTS = {
  [PaymentProvider.MOMO]: 0.5,
  [PaymentProvider.VNPAY]: 0.3,
  [PaymentProvider.STRIPE]: 0.2,
};

/** Phân phối rating thực tế: 1★ ít, 5★ nhiều */
const RATING_WEIGHTS = [0.05, 0.08, 0.15, 0.32, 0.4]; // 1→5

/** Sport names cho match title */
const SPORT_LABELS: Record<SportType, string> = {
  FOOTBALL: "Bóng đá",
  BASKETBALL: "Bóng rổ",
  TENNIS: "Tennis",
  BADMINTON: "Cầu lông",
  VOLLEYBALL: "Bóng chuyền",
  PICKLEBALL: "Pickleball",
};

const PRODUCT_TEMPLATES: Record<
  SportType,
  Array<{ name: string; price: number }>
> = {
  FOOTBALL: [
    { name: "Nước uống thể thao 500ml", price: 15_000 },
    { name: "Vớ bóng đá", price: 35_000 },
    { name: "Thuê áo thi đấu", price: 50_000 },
    { name: "Gói chụp ảnh trận đấu", price: 150_000 },
  ],
  BASKETBALL: [
    { name: "Nước uống thể thao 500ml", price: 15_000 },
    { name: "Thuê bóng rổ (1h)", price: 30_000 },
    { name: "Băng hỗ trợ khớp cổ tay", price: 45_000 },
  ],
  TENNIS: [
    { name: "Nước uống thể thao 500ml", price: 15_000 },
    { name: "Thuê vợt tennis", price: 60_000 },
    { name: "Hộp bóng tennis 3 quả", price: 80_000 },
    { name: "Cước tennis cuộn nhỏ", price: 120_000 },
  ],
  BADMINTON: [
    { name: "Nước uống thể thao 500ml", price: 15_000 },
    { name: "Hộp cầu lông 12 quả", price: 55_000 },
    { name: "Thuê vợt cầu lông", price: 40_000 },
    { name: "Quấn cán vợt", price: 25_000 },
  ],
  VOLLEYBALL: [
    { name: "Nước uống thể thao 500ml", price: 15_000 },
    { name: "Thuê bóng chuyền (1h)", price: 25_000 },
    { name: "Đầu gối bảo vệ", price: 60_000 },
  ],
  PICKLEBALL: [
    { name: "Nước uống thể thao 500ml", price: 15_000 },
    { name: "Thuê vợt pickleball", price: 50_000 },
    { name: "Hộp bóng pickleball 3 quả", price: 70_000 },
  ],
};

// ─── Seed functions ───────────────────────────────────────────────────────────

/**
 * 1. Accounts — trải created_at đều trong 6 tháng để userGrowth chart có dữ liệu.
 *    - 1 Admin
 *    - 12 Owners (cố định)
 *    - 120 Players: 10–15 player/tháng để có tăng trưởng rõ
 */
async function seedAccounts() {
  console.log("  [1/7] Accounts...");

  // Admin
  await prisma.account.create({
    data: {
      email: "admin@sportsbooking.vn",
      password: hash("Admin@123"),
      full_name: "Tổng Quản Trị",
      phone_number: "0900000001",
      email_verified: true,
      phone_verified: true,
      admin: { create: { status: AdminStatus.ACTIVE } },
    },
  });

  // Owners — tạo từ 6 tháng trước, stable
  const ownerAccounts: any[] = [];
  for (let i = 0; i < 12; i++) {
    const createdAt = randDate(daysAgo(180), daysAgo(120));
    const acc = await prisma.account.create({
      data: {
        email: `owner${i + 1}@sportsbooking.vn`,
        password: hash("Owner@123"),
        full_name: faker.person.fullName(),
        phone_number: `091${String(i).padStart(7, "0")}`,
        email_verified: true,
        phone_verified: true,
        created_at: createdAt,
        owner: {
          create: {
            company_name: `${faker.company.name()} Sports`,
            status: i < 10 ? OwnerStatus.ACTIVE : OwnerStatus.SUSPENDED,
          },
        },
      },
      include: { owner: true },
    });
    ownerAccounts.push(acc);
  }

  // Players — phân bổ đều 6 tháng: tháng xa ít hơn, tháng gần nhiều hơn
  // → tạo cảm giác tăng trưởng
  const playerAccounts: any[] = [];
  const playerDistByMonth = [12, 14, 16, 18, 22, 28]; // index 0 = cách 5 tháng
  // Use a distinct 093xxxxxxx range for players to avoid collisions with:
  // - admin: 0900000001
  // - owners: 0910000000..0910000011
  let playerPhoneSeq = 0;

  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const count = playerDistByMonth[5 - monthOffset];
    const from = daysAgo((monthOffset + 1) * 30);
    const to = daysAgo(monthOffset * 30);

    for (let i = 0; i < count; i++) {
      const createdAt = randDate(from, to);
      const acc = await prisma.account.create({
        data: {
          email: `player_${Date.now()}_${playerPhoneSeq}@gmail.com`,
          password: hash("Player@123"),
          full_name: faker.person.fullName(),
          phone_number: `093${String(playerPhoneSeq++).padStart(7, "0")}`,
          email_verified: rand() > 0.1,
          phone_verified: rand() > 0.2,
          created_at: createdAt,
          player: { create: { status: PlayerStatus.ACTIVE } },
        },
        include: { player: true },
      });
      playerAccounts.push(acc);
    }
  }

  console.log(
    `     → ${ownerAccounts.length} owners, ${playerAccounts.length} players`,
  );
  return { ownerAccounts, playerAccounts };
}

/**
 * 2. Complexes, SubFields, PricingRules, Products
 */
async function seedComplexesAndProducts(ownerAccounts: any[]) {
  console.log("  [2/7] Complexes, SubFields, PricingRules, Products...");

  const allSubFields: any[] = [];
  const complexProductsMap: Record<string, any[]> = {}; // complexId → products[]

  for (const ownerAcc of ownerAccounts) {
    const owner = ownerAcc.owner;
    if (!owner) continue;

    const numComplexes = randInt(1, 2);
    for (let ci = 0; ci < numComplexes; ci++) {
      const sports = pickN(SPORT_TYPES, randInt(1, 3)) as SportType[];
      const status =
        rand() > 0.15 ? ComplexStatus.ACTIVE : ComplexStatus.PENDING;

      const complex = await prisma.complex.create({
        data: {
          owner_id: owner.id,
          complex_name: `${pick(COMPLEX_NAMES)} ${faker.string.alphanumeric(3).toUpperCase()}`,
          complex_address: `${randInt(1, 500)} ${pick(STREETS)}, ${pick(DISTRICTS)}`,
          status,
          verification_docs: { license: "license.pdf", tax: "tax.pdf" },
          sport_types: sports,
        },
      });

      // ── SubFields + PricingRules ──
      const numSubs = randInt(2, 6);
      for (let si = 0; si < numSubs; si++) {
        const sport = pick(sports);
        const subField = await prisma.subField.create({
          data: {
            complex_id: complex.id,
            sub_field_name: `Sân ${si + 1} (${sport})`,
            capacity: pick([2, 4, 6, 8, 10, 14]),
            sport_type: sport,
          },
        });
        allSubFields.push({ ...subField, complex_id: complex.id });

        const [pMin, pMax] = PRICE_RANGE[sport];
        // Mỗi subfield có giá biến đổi theo giờ trong ngày + ngày trong tuần
        for (let day = 0; day < 7; day++) {
          const isWeekend = day === 0 || day === 6;
          for (const startH of [6, 8, 10, 14, 16, 18, 20]) {
            const isPeak = startH >= 17;
            const base = Math.round(randInt(pMin, pMax) / 10_000) * 10_000;
            const price =
              Math.round(
                (base * (isPeak ? 1.3 : 1) * (isWeekend ? 1.2 : 1)) / 10_000,
              ) * 10_000;

            const refDate = new Date("2000-01-01T00:00:00Z");
            const startTime = new Date(refDate);
            startTime.setUTCHours(startH, 0, 0, 0);
            const endTime = new Date(refDate);
            endTime.setUTCHours(startH + 2, 0, 0, 0);

            await prisma.pricingRule
              .create({
                data: {
                  sub_field_id: subField.id,
                  day_of_week: day,
                  start_time: startTime,
                  end_time: endTime,
                  base_price: price,
                },
              })
              .catch(() => {});
          }
        }
      }

      // ── Products cho complex ──
      if (status === ComplexStatus.ACTIVE) {
        const products: any[] = [];
        for (const sport of sports) {
          for (const tmpl of PRODUCT_TEMPLATES[sport]) {
            // tránh tạo sản phẩm tên trùng
            if (products.some((p) => p.name === tmpl.name)) continue;
            const product = await prisma.product.create({
              data: {
                complex_id: complex.id,
                sport_type: sport,
                name: tmpl.name,
                price: tmpl.price,
                stock: randInt(20, 200),
                status: rand() > 0.05 ? "ACTIVE" : "INACTIVE",
              },
            });
            products.push(product);
          }
        }
        complexProductsMap[complex.id] = products;
      }
    }
  }

  console.log(`     → ${allSubFields.length} sub-fields`);
  return { allSubFields, complexProductsMap };
}

/**
 * 3. Bookings + Payments + BookingAddons + Reviews
 *
 * Chiến lược:
 *   - Mỗi player có 15–30 bookings trải 6 tháng
 *   - Tháng gần hơn → revenue cao hơn (tăng trưởng)
 *   - start_time theo peak hours có trọng số
 *   - 50% returning players đặt nhiều hơn 1 lần/tháng
 *   - COMPLETED booking: 40% có addon, 55% có review
 *   - Payment theo provider weights
 *   - Rating phân phối thực tế 1–5
 */
async function seedBookingsAndReviews(
  playerAccounts: any[],
  allSubFields: any[],
  complexProductsMap: Record<string, any[]>,
) {
  console.log("  [3/7] Bookings, Payments, Addons, Reviews...");

  let totalBookings = 0;
  let totalPayments = 0;
  let totalAddons = 0;
  let totalReviews = 0;

  // Subfields chỉ từ ACTIVE complex (cần truy vấn để lọc)
  const activeSubFields = allSubFields.filter((sf) => {
    const products = complexProductsMap[sf.complex_id];
    return products !== undefined; // proxy cho ACTIVE complex
  });

  for (const playerAcc of playerAccounts) {
    const player = playerAcc.player;
    if (!player) continue;

    // Players tạo muộn hơn → ít booking hơn, nhưng tập trung tháng gần
    const accountAgeMs = Date.now() - new Date(playerAcc.created_at).getTime();
    const accountAgeDays = accountAgeMs / 86_400_000;
    const numBookings = Math.min(
      30,
      Math.max(5, Math.round(accountAgeDays / 7)),
    );

    for (let b = 0; b < numBookings; b++) {
      // Phân phối ngày: trọng số tháng gần hơn có nhiều booking hơn
      // tháng 0 (hiện tại) weight 3x so với tháng 5 (xa nhất)
      const monthOffset = weightedPick(
        [0, 1, 2, 3, 4, 5],
        [0.3, 0.22, 0.17, 0.13, 0.1, 0.08],
      );
      const bookingDate = randDate(
        daysAgo((monthOffset + 1) * 30),
        daysAgo(monthOffset * 30 + 1),
      );

      // Peak hours với trọng số
      const startH = weightedPick(PEAK_HOURS, PEAK_WEIGHTS);
      const isWeekend =
        bookingDate.getDay() === 0 || bookingDate.getDay() === 6;

      const startTime = setHM(bookingDate, startH, 0);
      const endTime = setHM(bookingDate, startH + SLOT_DURATION_H, 0);

      const subField = pick(
        activeSubFields.length > 0 ? activeSubFields : allSubFields,
      );
      const [pMin, pMax] = PRICE_RANGE[subField.sport_type as SportType];
      const basePrice = Math.round(randInt(pMin, pMax) / 10_000) * 10_000;
      const fieldPrice =
        Math.round(
          (basePrice * (startH >= 17 ? 1.3 : 1) * (isWeekend ? 1.2 : 1)) /
            10_000,
        ) * 10_000;

      // Status theo tháng (booking cũ đa số COMPLETED/CANCELED, mới thì CONFIRMED/PENDING)
      let status: BookingStatus;
      const cancelRate = CANCEL_RATE_BY_MONTH[5 - monthOffset] ?? 0.18;
      if (monthOffset >= 1) {
        status =
          rand() < cancelRate
            ? BookingStatus.CANCELED
            : BookingStatus.COMPLETED;
      } else {
        // Tháng hiện tại: mix CONFIRMED, PENDING, và một số COMPLETED
        status = weightedPick(
          [
            BookingStatus.COMPLETED,
            BookingStatus.CONFIRMED,
            BookingStatus.PENDING,
            BookingStatus.CANCELED,
          ],
          [0.45, 0.3, 0.15, 0.1],
        );
      }

      const booking = await prisma.booking.create({
        data: {
          player_id: player.id,
          sub_field_id: subField.id,
          start_time: startTime,
          end_time: endTime,
          total_price: fieldPrice,
          status,
          expires_at: new Date(startTime.getTime() + 15 * 60_000),
          created_at: daysAgoFrom(startTime, randInt(1, 5)), // đặt trước 1–5 ngày
        },
      });
      totalBookings++;

      let addonTotal = 0;

      // ── BookingAddon (40% COMPLETED bookings) ──
      if (status === BookingStatus.COMPLETED && rand() < 0.4) {
        const products = complexProductsMap[subField.complex_id] ?? [];
        const activeProducts = products.filter(
          (p) => p.status === "ACTIVE" && p.stock > 0,
        );
        if (activeProducts.length > 0) {
          const addonProducts = pickN(activeProducts, randInt(1, 3));
          for (const product of addonProducts) {
            const quantity = randInt(1, 3);
            await prisma.bookingAddon
              .create({
                data: {
                  booking_id: booking.id,
                  product_id: product.id,
                  quantity,
                  unit_price: product.price,
                },
              })
              .catch(() => {});
            addonTotal += Number(product.price) * quantity;
            totalAddons++;
          }
        }
      }

      const finalTotal = fieldPrice + addonTotal;

      // Payment: cả COMPLETED và CONFIRMED đều có payment, amount phải khớp total_price sau addons
      let paymentId: string | null = null;
      if (
        status === BookingStatus.COMPLETED ||
        status === BookingStatus.CONFIRMED
      ) {
        const provider = weightedPick(
          [PaymentProvider.MOMO, PaymentProvider.VNPAY, PaymentProvider.STRIPE],
          [
            PROVIDER_WEIGHTS[PaymentProvider.MOMO],
            PROVIDER_WEIGHTS[PaymentProvider.VNPAY],
            PROVIDER_WEIGHTS[PaymentProvider.STRIPE],
          ],
        );
        const payment = await prisma.payment.create({
          data: {
            amount: finalTotal,
            provider,
            transaction_code: `TXN_${faker.string.alphanumeric(14).toUpperCase()}`,
            status: PaymentStatus.SUCCESS,
            created_at: startTime,
          },
        });
        paymentId = payment.id;
        totalPayments++;
      }

      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          total_price: finalTotal,
          payment_id: paymentId,
          paid_at: paymentId ? startTime : null,
        },
      });

      // ── Review (55% COMPLETED bookings) ──
      if (status === BookingStatus.COMPLETED && rand() < 0.55) {
        const rating = weightedPick([1, 2, 3, 4, 5], RATING_WEIGHTS);
        const reviewDate = new Date(
          endTime.getTime() + randInt(1, 48) * 3_600_000,
        );
        await prisma.review
          .create({
            data: {
              booking_id: booking.id,
              player_id: player.id,
              subfield_id: subField.id,
              rating,
              comment:
                rating >= 4
                  ? faker.lorem.sentence()
                  : rand() > 0.5
                    ? faker.lorem.sentence()
                    : null,
              created_at: reviewDate,
            },
          })
          .catch(() => {});
        totalReviews++;
      }
    }
  }

  console.log(
    `     → ${totalBookings} bookings, ${totalPayments} payments, ${totalAddons} addons, ${totalReviews} reviews`,
  );
}

/**
 * 4. Recurring Bookings — mỗi player có ~5% cơ hội có recurring booking
 *    Mỗi recurring sinh ra 4–8 child bookings thực sự.
 */
async function seedRecurringBookings(
  playerAccounts: any[],
  allSubFields: any[],
) {
  console.log("  [4/7] Recurring bookings...");
  let count = 0;

  // Chọn ~20% player làm recurring player
  const recurringPlayers = playerAccounts.filter(() => rand() < 0.2);

  for (const playerAcc of recurringPlayers) {
    const player = playerAcc.player;
    if (!player) continue;

    const subField = pick(allSubFields);
    const recType: RecurrenceType =
      rand() > 0.5 ? RecurrenceType.WEEKLY : RecurrenceType.MONTHLY;

    // Bắt đầu từ 60–90 ngày trước, kéo dài 56 ngày (8 tuần)
    const startDate = daysAgo(randInt(60, 90));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 56);

    const recurStatus: RecurringStatus =
      endDate < new Date()
        ? RecurringStatus.COMPLETED
        : RecurringStatus.CONFIRMED;

    const recurring = await prisma.recurringBooking.create({
      data: {
        player_id: player.id,
        sub_field_id: subField.id,
        recurrence_type: recType,
        start_date: startDate,
        end_date: endDate,
        status: recurStatus,
      },
    });

    // Tạo child bookings theo recurrence
    const [pMin, pMax] = PRICE_RANGE[subField.sport_type as SportType];
    const price = Math.round(randInt(pMin, pMax) / 10_000) * 10_000;
    const startH = pick([8, 10, 18, 20]);
    const intervalDays = recType === RecurrenceType.WEEKLY ? 7 : 30;

    let cursor = new Date(startDate);
    while (cursor <= endDate) {
      const startTime = setHM(cursor, startH, 0);
      const endTime = setHM(cursor, startH + 2, 0);
      const isPast = endTime < new Date();
      const childStatus: BookingStatus = isPast
        ? BookingStatus.COMPLETED
        : BookingStatus.CONFIRMED;

      let paymentId: string | null = null;
      if (childStatus === BookingStatus.COMPLETED) {
        const payment = await prisma.payment.create({
          data: {
            amount: price,
            provider: weightedPick(
              [
                PaymentProvider.MOMO,
                PaymentProvider.VNPAY,
                PaymentProvider.STRIPE,
              ],
              [0.5, 0.3, 0.2],
            ),
            transaction_code: `REC_${faker.string.alphanumeric(12).toUpperCase()}`,
            status: PaymentStatus.SUCCESS,
            created_at: startTime,
          },
        });
        paymentId = payment.id;
      }

      await prisma.booking.create({
        data: {
          player_id: player.id,
          sub_field_id: subField.id,
          start_time: startTime,
          end_time: endTime,
          total_price: price,
          status: childStatus,
          payment_id: paymentId,
          paid_at: paymentId ? startTime : null,
          expires_at: new Date(startTime.getTime() + 15 * 60_000),
          recurring_booking_id: recurring.id,
          created_at: daysAgoFrom(startTime, 3),
        },
      });
      count++;
      cursor.setDate(cursor.getDate() + intervalDays);
    }
  }

  console.log(`     → ${count} recurring child bookings`);
}

/**
 * 5. Matches + MatchParticipants
 *    Lấy COMPLETED / CONFIRMED booking và tạo dữ liệu match nhất quán theo status/slots/time.
 */
async function seedMatches(playerAccounts: any[]) {
  console.log("  [5/7] Matches & participants...");

  // Lấy bookings đã CONFIRMED/COMPLETED + không có match, lấy tối đa 80
  const eligibleBookings = await prisma.booking.findMany({
    where: {
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
      match: null,
    },
    include: {
      sub_field: true,
      player: true,
    },
    take: 80,
    orderBy: { created_at: "desc" },
  });

  // Chỉ tạo match cho 60% eligible bookings
  const matchBookings = eligibleBookings.filter(() => rand() < 0.6);

  const playerIds = playerAccounts
    .filter((p) => p.player)
    .map((p) => p.player.id);

  let totalMatches = 0;
  let totalParticipants = 0;
  const now = new Date();

  const closeReasons = [
    "Chủ kèo đóng do đủ team nội bộ",
    "Đổi lịch thi đấu",
    "Đã chuyển sang sân khác",
  ];

  for (const booking of matchBookings) {
    const sport = booking.sub_field.sport_type as SportType;
    const slotsNeeded = randInt(1, 5);
    const bookingStart = new Date(booking.start_time);
    const bookingEnd = new Date(booking.end_time);
    const isPast = bookingEnd < now;

    const matchStatus: MatchStatus = isPast
      ? MatchStatus.COMPLETED
      : weightedPick(
          [
            MatchStatus.OPEN,
            MatchStatus.FULL,
            MatchStatus.CLOSED,
            MatchStatus.EXPIRED,
          ],
          [0.45, 0.25, 0.2, 0.1],
        );

    let desiredAccepted = 0;
    if (matchStatus === MatchStatus.FULL) {
      desiredAccepted = slotsNeeded;
    } else if (
      matchStatus === MatchStatus.OPEN ||
      matchStatus === MatchStatus.EXPIRED
    ) {
      desiredAccepted = slotsNeeded > 1 ? randInt(0, slotsNeeded - 1) : 0;
    } else {
      desiredAccepted = randInt(0, slotsNeeded);
    }

    const otherPlayers = playerIds.filter((id) => id !== booking.player.id);
    const acceptedCount = Math.min(desiredAccepted, otherPlayers.length);

    let joinDeadline = new Date(
      bookingStart.getTime() - randInt(30, 180) * 60_000,
    );
    if (matchStatus === MatchStatus.EXPIRED) {
      joinDeadline = new Date(now.getTime() - randInt(30, 360) * 60_000);
    }
    if (joinDeadline >= bookingStart) {
      joinDeadline = new Date(bookingStart.getTime() - 15 * 60_000);
    }

    const skillLevel = weightedPick(
      [
        MatchSkillLevel.BEGINNER,
        MatchSkillLevel.INTERMEDIATE,
        MatchSkillLevel.ADVANCED,
      ],
      [0.35, 0.45, 0.2],
    );

    const match = await prisma.match.create({
      data: {
        booking_id: booking.id,
        creator_id: booking.player.id,
        sport_type: sport,
        skill_level: skillLevel,
        title: `Tìm người chơi ${SPORT_LABELS[sport]} — ${bookingStart.toLocaleDateString("vi")}`,
        description: rand() > 0.4 ? faker.lorem.sentences(2) : null,
        slots_needed: slotsNeeded,
        slots_filled: acceptedCount,
        join_deadline: joinDeadline,
        status: matchStatus,
        closed_reason:
          matchStatus === MatchStatus.CLOSED
            ? pick(closeReasons)
            : matchStatus === MatchStatus.EXPIRED
              ? "Quá hạn nhận người tham gia"
              : null,
        created_at: new Date(booking.created_at),
      },
    });
    totalMatches++;

    // Thêm participants: luôn nhất quán với slots_filled (số ACCEPTED)
    const maxExtra = Math.min(
      3,
      Math.max(otherPlayers.length - acceptedCount, 0),
    );
    const extraCount = maxExtra > 0 ? randInt(0, maxExtra) : 0;
    const totalParticipantsTarget = acceptedCount + extraCount;
    const participants = pickN(otherPlayers, totalParticipantsTarget);

    const acceptedPlayers = participants.slice(0, acceptedCount);
    const remainingPlayers = participants.slice(acceptedCount);

    for (const playerId of acceptedPlayers) {
      await prisma.matchParticipant
        .create({
          data: {
            match_id: match.id,
            player_id: playerId,
            status: ParticipantStatus.ACCEPTED,
            introduction: rand() > 0.3 ? faker.lorem.sentence() : null,
            responded_at: randDateSafe(
              new Date(booking.created_at),
              new Date(
                Math.max(bookingStart.getTime() - 10 * 60_000, now.getTime()),
              ),
            ),
          },
        })
        .catch(() => {});
      totalParticipants++;
    }

    for (const playerId of remainingPlayers) {
      const pendingAllowed =
        matchStatus === MatchStatus.OPEN || matchStatus === MatchStatus.CLOSED;

      const statusPool: ParticipantStatus[] = pendingAllowed
        ? [
            ParticipantStatus.PENDING,
            ParticipantStatus.REJECTED,
            ParticipantStatus.WITHDRAWN,
            ParticipantStatus.REMOVED,
          ]
        : [
            ParticipantStatus.REJECTED,
            ParticipantStatus.WITHDRAWN,
            ParticipantStatus.REMOVED,
          ];

      const statusWeights = pendingAllowed
        ? [0.45, 0.3, 0.15, 0.1]
        : [0.55, 0.3, 0.15];

      const pStatus = weightedPick(statusPool, statusWeights);
      const actionAt = randDateSafe(
        new Date(booking.created_at),
        new Date(Math.max(bookingStart.getTime() - 10 * 60_000, now.getTime())),
      );

      await prisma.matchParticipant
        .create({
          data: {
            match_id: match.id,
            player_id: playerId,
            status: pStatus,
            introduction: rand() > 0.3 ? faker.lorem.sentence() : null,
            responded_at:
              pStatus === ParticipantStatus.PENDING ? null : actionAt,
            left_at: pStatus === ParticipantStatus.WITHDRAWN ? actionAt : null,
          },
        })
        .catch(() => {});
      totalParticipants++;
    }
  }

  console.log(
    `     → ${totalMatches} matches, ${totalParticipants} participants`,
  );
}

/**
 * 6. Cập nhật cache fields trên SubField (avg_rating, total_reviews)
 */
async function syncSubFieldCaches() {
  console.log("  [6/8] Sync subfield cache fields...");

  const subFields = await prisma.subField.findMany({
    where: { isDelete: false },
    select: {
      id: true,
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  });

  for (const sf of subFields) {
    const ratings = sf.reviews.map((r) => r.rating);
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : null;

    await prisma.subField.update({
      where: { id: sf.id },
      data: {
        avg_rating: avgRating ? Number(avgRating.toFixed(2)) : null,
        total_reviews: ratings.length,
      },
    });
  }

  console.log(`     → ${subFields.length} subfields synced`);
}

/**
 * 7. Cập nhật cache fields trên Complex (avg_rating, total_reviews, min/max price)
 *    Schema có các cached fields — cần sync sau khi seed xong.
 */
async function syncComplexCaches() {
  console.log("  [7/8] Sync complex cache fields...");

  const complexes = await prisma.complex.findMany({
    select: {
      id: true,
      sub_fields: {
        where: { isDelete: false },
        select: {
          sport_type: true,
          pricing_rules: { select: { base_price: true } },
          reviews: { select: { rating: true } },
        },
      },
    },
  });

  for (const c of complexes) {
    const allPrices = c.sub_fields.flatMap((sf) =>
      sf.pricing_rules.map((r) => Number(r.base_price)),
    );
    const allRatings = c.sub_fields.flatMap((sf) =>
      sf.reviews.map((r) => r.rating),
    );

    const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : null;
    const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : null;
    const avgRating =
      allRatings.length > 0
        ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
        : null;

    await prisma.complex.update({
      where: { id: c.id },
      data: {
        min_price: minPrice,
        max_price: maxPrice,
        total_subfields: c.sub_fields.length,
        avg_rating: avgRating ? Number(avgRating.toFixed(2)) : null,
        total_reviews: allRatings.length,
      },
    });
  }

  console.log(`     → ${complexes.length} complexes synced`);
}

/**
 * 8. Notifications — vài notification mẫu cho mỗi player
 */
async function seedNotifications(playerAccounts: any[]) {
  console.log("  [8/8] Notifications...");

  const templates = [
    { type: "BOOKING_CONFIRMED", msg: "Booking của bạn đã được xác nhận." },
    {
      type: "BOOKING_REMINDER",
      msg: "Nhắc nhở: bạn có lịch chơi trong 2 giờ nữa.",
    },
    {
      type: "MATCH_NEW_REQUEST",
      msg: "Có người mới xin tham gia trận đấu của bạn.",
    },
    {
      type: "MATCH_ACCEPTED",
      msg: "Yêu cầu tham gia trận đấu của bạn đã được chấp nhận.",
    },
    {
      type: "REVIEW_REMINDER",
      msg: "Hãy đánh giá trải nghiệm lần chơi gần đây nhất.",
    },
    { type: "PAYMENT_SUCCESS", msg: "Thanh toán thành công. Cảm ơn bạn!" },
    { type: "PROMO", msg: "Giảm 20% vào cuối tuần này tại các sân đối tác!" },
  ];

  let total = 0;
  for (const playerAcc of playerAccounts.slice(0, 60)) {
    // Chỉ 60 players có notification
    const numNotifs = randInt(2, 6);
    for (let i = 0; i < numNotifs; i++) {
      const tmpl = pick(templates);
      await prisma.notification.create({
        data: {
          account_id: playerAcc.id,
          message: tmpl.msg,
          type: tmpl.type,
          is_read: rand() > 0.4,
          created_at: randDate(daysAgo(30), new Date()),
        },
      });
      total++;
    }
  }

  console.log(`     → ${total} notifications`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("========================================");
  console.log("  Sports Booking — Full Seed");
  console.log("========================================\n");

  // ── Cleanup (theo thứ tự FK) ──
  console.log("Cleaning up existing data...");
  await prisma.matchParticipant.deleteMany();
  await prisma.match.deleteMany();
  await prisma.bookingAddon.deleteMany();
  await prisma.review.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.recurringBooking.deleteMany();
  await prisma.pricingRule.deleteMany();
  await prisma.product.deleteMany();
  await prisma.subField.deleteMany();
  await prisma.complex.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.socialAccount.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.owner.deleteMany();
  await prisma.player.deleteMany();
  await prisma.account.deleteMany();
  console.log("Done.\n");

  // ── Seed ──
  const { ownerAccounts, playerAccounts } = await seedAccounts();
  const { allSubFields, complexProductsMap } =
    await seedComplexesAndProducts(ownerAccounts);
  await seedBookingsAndReviews(
    playerAccounts,
    allSubFields,
    complexProductsMap,
  );
  await seedRecurringBookings(playerAccounts, allSubFields);
  await seedMatches(playerAccounts);
  await syncSubFieldCaches();
  await syncComplexCaches();
  await seedNotifications(playerAccounts);

  // ── Summary ──
  console.log("\n========================================");
  console.log("  Seed Summary");
  console.log("========================================");
  const counts = await Promise.all([
    prisma.account.count(),
    prisma.complex.count(),
    prisma.subField.count(),
    prisma.product.count(),
    prisma.booking.count(),
    prisma.payment.count(),
    prisma.bookingAddon.count(),
    prisma.recurringBooking.count(),
    prisma.match.count(),
    prisma.matchParticipant.count(),
    prisma.review.count(),
    prisma.notification.count(),
  ]);
  const labels = [
    "Accounts",
    "Complexes",
    "SubFields",
    "Products",
    "Bookings",
    "Payments",
    "BookingAddons",
    "RecurringBookings",
    "Matches",
    "MatchParticipants",
    "Reviews",
    "Notifications",
  ];
  labels.forEach((l, i) => console.log(`  ${l.padEnd(20)}: ${counts[i]}`));
  console.log("========================================\n");

  // ── Login hints ──
  console.log("Test accounts:");
  console.log("  Admin:  admin@sportsbooking.vn  / Admin@123");
  console.log("  Owner:  owner1@sportsbooking.vn / Owner@123");
  console.log("  Player: player_*@gmail.com      / Player@123");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
