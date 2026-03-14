import {
  PrismaClient,
  SportType,
  BookingStatus,
  PaymentProvider,
  PaymentStatus,
  AdminStatus,
  PlayerStatus,
  OwnerStatus,
  RecurrenceType,
  RecurringStatus,
  ComplexStatus,
} from "@prisma/client";
import { faker } from "@faker-js/faker/locale/vi";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

// ─── Helpers ────────────────────────────────────────────────────────────────

const hashPassword = (plain: string) => bcrypt.hashSync(plain, 10);

/** Random integer in [min, max] */
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/** Pick a random element from an array */
const pick = <T>(arr: T[]): T => arr[randInt(0, arr.length - 1)];

/** Pick N distinct random elements from an array */
const pickN = <T>(arr: T[], n: number): T[] => {
  const copy = [...arr];
  const result: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = randInt(0, copy.length - 1);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
};

/** Return a date in the past (days ago) */
const daysAgo = (d: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  return dt;
};

/** Return a date in the future (days from now) */
const daysFromNow = (d: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  return dt;
};

/** Build a DateTime from a Date + HH:MM string */
const setTime = (base: Date, hhmm: string): Date => {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
};

// ─── Static lookup data ──────────────────────────────────────────────────────

const SPORT_TYPES = Object.values(SportType);

const DISTRICTS_HCMC = [
  "Hoàn Kiếm",
  "Ba Đình",
  "Đống Đa",
  "Hai Bà Trưng",
  "Hoàng Mai",
  "Thanh Xuân",
  "Cầu Giấy",
  "Tây Hồ",
  "Long Biên",
  "Nam Từ Liêm",
  "Bắc Từ Liêm",
  "Hà Đông",
  "Gia Lâm",
  "Đông Anh",
  "Sóc Sơn",
  "Mê Linh",
  "Thanh Trì",
  "Thạch Thất",
  "Chương Mỹ",
];

const STREET_PREFIXES = ["Đường", "Đại lộ", "Hẻm", "Ngõ"];

const STREET_NAMES = [
  "Đinh Tiên Hoàng",
  "Lý Thường Kiệt",
  "Trần Phú",
  "Hoàng Diệu",
  "Phan Đình Phùng",
  "Nguyễn Chí Thanh",
  "Kim Mã",
  "Xuân Thủy",
  "Cầu Giấy",
  "Láng Hạ",
  "Nguyễn Trãi",
  "Lê Văn Lương",
  "Trường Chinh",
  "Giải Phóng",
  "Đại Cồ Việt",
];

const COMPLEX_NAMES = [
  "Sân Thể Thao Mỹ Đình",
  "Khu Vui Chơi Thể Thao Tây Hồ",
  "Trung Tâm Thể Thao Citadel Hà Nội",
  "SportZone Arena Cầu Giấy",
  "Sân Bóng Hà Nội Star",
  "Khu Thể Thao Long Biên",
  "Trung Tâm Thể Thao Royal City",
  "GreenField Sports Thanh Xuân",
  "Sân Thể Thao Hoàng Mai",
  "Khu Thể Thao Gia Lâm",
  "SportHub Hà Đông",
  "Arena Sports Đống Đa",
  "Sân Bóng Cộng Đồng Hai Bà Trưng",
  "Khu Liên Hợp Thể Thao Nam Từ Liêm",
  "Trung Tâm Thể Thao Tràng An",
];

const TIME_SLOTS = [
  { start: "06:00", end: "08:00" },
  { start: "08:00", end: "10:00" },
  { start: "10:00", end: "12:00" },
  { start: "14:00", end: "16:00" },
  { start: "16:00", end: "18:00" },
  { start: "18:00", end: "20:00" },
  { start: "20:00", end: "22:00" },
];

// Price ranges per sport (VND / hour)
const PRICE_BY_SPORT: Record<SportType, [number, number]> = {
  FOOTBALL: [200_000, 600_000],
  BASKETBALL: [150_000, 400_000],
  TENNIS: [100_000, 300_000],
  BADMINTON: [80_000, 200_000],
  VOLLEYBALL: [100_000, 250_000],
  PICKLEBALL: [80_000, 180_000],
};

// ─── Seed Functions ──────────────────────────────────────────────────────────

async function seedAccounts() {
  console.log(":::::Seeding accounts...");

  const accounts = [];

  // 1 Admin
  const adminAccount = await prisma.account.create({
    data: {
      email: "admin@sportsbooking.vn",
      password: hashPassword("Admin@123"),
      full_name: "Quản Trị Viên",
      phone_number: "0900000001",
      email_verified: true,
      phone_verified: true,
      admin: {
        create: { status: AdminStatus.ACTIVE },
      },
    },
  });
  accounts.push(adminAccount);
  console.log(`:::::Admin: ${adminAccount.email}`);

  // 5 Owners
  const ownerEmails = [
    "owner1@gmail.com",
    "owner2@gmail.com",
    "owner3@gmail.com",
    "owner4@gmail.com",
    "owner5@gmail.com",
  ];
  const companyNames = [
    "Công Ty TNHH Thể Thao Hà Nội",
    "SportViet Thủ Đô JSC",
    "Tập Đoàn Giải Trí Tràng An",
    "Hoàng Gia Sports Hà Nội",
    "Khu Vui Chơi Gia Đình Hà Thành",
  ];

  const ownerAccounts = [];
  for (let i = 0; i < 5; i++) {
    const acc = await prisma.account.create({
      data: {
        email: ownerEmails[i],
        password: hashPassword("Owner@123"),
        full_name: faker.person.fullName(),
        phone_number: `090000${String(i + 10).padStart(4, "0")}`,
        email_verified: true,
        phone_verified: true,
        owner: {
          create: {
            company_name: companyNames[i],
            status: pick([
              OwnerStatus.ACTIVE,
              OwnerStatus.ACTIVE,
              OwnerStatus.SUSPENDED,
            ]),
          },
        },
      },
      include: { owner: true },
    });
    ownerAccounts.push(acc);
    accounts.push(acc);
  }
  console.log(`:::::Owners: ${ownerAccounts.length}`);

  // 20 Players
  const playerAccounts = [];
  for (let i = 0; i < 20; i++) {
    const acc = await prisma.account.create({
      data: {
        email: `player${i + 1}@gmail.com`,
        password: hashPassword("Player@123"),
        full_name: faker.person.fullName(),
        phone_number: `09${String(randInt(10000000, 99999999))}`,
        email_verified: i % 5 !== 0, // some unverified
        phone_verified: i % 4 !== 0,
        player: {
          create: {
            status: i === 0 ? PlayerStatus.BANNED : PlayerStatus.ACTIVE,
          },
        },
      },
      include: { player: true },
    });
    playerAccounts.push(acc);
    accounts.push(acc);
  }
  console.log(`:::::Players: ${playerAccounts.length}`);

  return { ownerAccounts, playerAccounts };
}

async function seedComplexesAndSubFields(ownerAccounts: any[]) {
  console.log("\n:::::Seeding complexes & sub-fields...");

  const allSubFields: any[] = [];

  for (let oi = 0; oi < ownerAccounts.length; oi++) {
    const owner = ownerAccounts[oi].owner;
    if (!owner) continue;

    const numComplexes = randInt(2, 3);

    for (let ci = 0; ci < numComplexes; ci++) {
      const sports = pickN(SPORT_TYPES, randInt(1, 3));
      const address = `${randInt(1, 200)} ${pick(STREET_PREFIXES)} ${pick(STREET_NAMES)}, ${pick(DISTRICTS_HCMC)}, Hà Nội`;

      const complex = await prisma.complex.create({
        data: {
          owner_id: owner.id,
          complex_name: COMPLEX_NAMES[(oi * 3 + ci) % COMPLEX_NAMES.length],
          complex_address: address,
          status: pick([
            ComplexStatus.ACTIVE,
            ComplexStatus.ACTIVE,
            ComplexStatus.ACTIVE,
            ComplexStatus.PENDING,
            ComplexStatus.INACTIVE,
          ]),
          verification_docs: {
            front: "id_front.jpg",
            back: "id_back.jpg",
            license: "business_license.pdf",
          },
          sport_types: sports,
        },
      });

      // 2-4 sub-fields per complex
      let minPrice = Infinity;
      let maxPrice = -Infinity;
      const subFieldsCreated = [];

      const numSubs = randInt(2, 4);
      for (let si = 0; si < numSubs; si++) {
        const sport = sports[si % sports.length] as SportType;
        const [priceMin, priceMax] = PRICE_BY_SPORT[sport];

        const subField = await prisma.subField.create({
          data: {
            complex_id: complex.id,
            sub_field_name: `Sân ${si + 1} - ${sport}`,
            capacity: pick([2, 4, 6, 8, 10, 12]),
            sport_type: sport,
            isDelete: false,
          },
        });
        subFieldsCreated.push(subField);
        allSubFields.push(subField);

        // Seed pricing rules: 7 days × multiple time slots
        const pricingRules = [];
        for (let day = 0; day < 7; day++) {
          // 2-4 random non-overlapping time slots per day
          const slots = pickN(TIME_SLOTS, randInt(2, 4));
          for (const slot of slots) {
            const price = randInt(priceMin, priceMax);
            minPrice = Math.min(minPrice, price);
            maxPrice = Math.max(maxPrice, price);

            // Use a fixed reference date for Time fields
            const refDate = new Date("2000-01-01T00:00:00Z");
            const [sh, sm] = slot.start.split(":").map(Number);
            const [eh, em] = slot.end.split(":").map(Number);
            const startTime = new Date(refDate);
            startTime.setUTCHours(sh, sm, 0, 0);
            const endTime = new Date(refDate);
            endTime.setUTCHours(eh, em, 0, 0);

            pricingRules.push({
              sub_field_id: subField.id,
              day_of_week: day,
              start_time: startTime,
              end_time: endTime,
              base_price: price,
            });
          }
        }

        await prisma.pricingRule.createMany({
          data: pricingRules,
          skipDuplicates: true,
        });
      }

      // Update cached fields on complex
      await prisma.complex.update({
        where: { id: complex.id },
        data: {
          min_price: minPrice === Infinity ? null : minPrice,
          max_price: maxPrice === -Infinity ? null : maxPrice,
          total_subfields: subFieldsCreated.length,
        },
      });

      console.log(
        `:::::Complex "${complex.complex_name}" — ${subFieldsCreated.length} sub-fields`,
      );
    }
  }

  return allSubFields;
}

async function seedBookingsAndPayments(
  playerAccounts: any[],
  subFields: any[],
) {
  console.log("\n:::::Seeding bookings & payments...");

  const activePlayers = playerAccounts.filter(
    (a) => a.player?.status === PlayerStatus.ACTIVE,
  );

  for (const playerAcc of activePlayers) {
    const player = playerAcc.player;
    const numBookings = randInt(1, 5);

    for (let b = 0; b < numBookings; b++) {
      const subField = pick(subFields);
      const daysOffset = randInt(0, 60) - 30; // past 30 days or future 30 days
      const baseDate =
        daysOffset < 0 ? daysAgo(-daysOffset) : daysFromNow(daysOffset);
      const slot = pick(TIME_SLOTS);

      const startTime = setTime(baseDate, slot.start);
      const endTime = setTime(baseDate, slot.end);
      const totalPrice = randInt(80_000, 600_000);

      const isPast = daysOffset < -1;
      const status: BookingStatus = isPast
        ? pick([BookingStatus.COMPLETED, BookingStatus.CANCELED])
        : pick([BookingStatus.CONFIRMED, BookingStatus.PENDING]);

      const paidAt =
        status === BookingStatus.COMPLETED ? daysAgo(-daysOffset + 1) : null;

      // Create payment for COMPLETED bookings
      let paymentId: string | null = null;
      if (status === BookingStatus.COMPLETED) {
        const payment = await prisma.payment.create({
          data: {
            amount: totalPrice,
            provider: PaymentProvider.STRIPE,
            transaction_code: `TXN_${faker.string.alphanumeric(16).toUpperCase()}`,
            status: PaymentStatus.SUCCESS,
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
          total_price: totalPrice,
          status,
          paid_at: paidAt,
          payment_id: paymentId,
          expires_at: new Date(startTime.getTime() + 15 * 60 * 1000), // 15 min to pay
        },
      });
    }
  }

  const total = await prisma.booking.count();
  console.log(`:::::Created ${total} bookings`);
}

async function seedRecurringBookings(playerAccounts: any[], subFields: any[]) {
  console.log("\n:::::Seeding recurring bookings...");

  const activePlayers = playerAccounts
    .filter((a) => a.player?.status === PlayerStatus.ACTIVE)
    .slice(0, 5); // top 5 active players get recurring bookings

  for (const playerAcc of activePlayers) {
    const player = playerAcc.player;
    const subField = pick(subFields);

    const recurring = await prisma.recurringBooking.create({
      data: {
        player_id: player.id,
        sub_field_id: subField.id,
        recurrence_type: pick([RecurrenceType.WEEKLY, RecurrenceType.MONTHLY]),
        start_date: daysAgo(30),
        end_date: daysFromNow(60),
        status: RecurringStatus.CONFIRMED,
      },
    });

    // Create individual bookings linked to this recurring booking
    const slot = pick(TIME_SLOTS);
    for (let w = 0; w < 4; w++) {
      const baseDate = daysAgo(28 - w * 7);
      const startTime = setTime(baseDate, slot.start);
      const endTime = setTime(baseDate, slot.end);
      const isPast = w < 3;

      await prisma.booking.create({
        data: {
          player_id: player.id,
          sub_field_id: subField.id,
          start_time: startTime,
          end_time: endTime,
          total_price: randInt(100_000, 500_000),
          status: isPast ? BookingStatus.COMPLETED : BookingStatus.CONFIRMED,
          paid_at: isPast ? daysAgo(28 - w * 7 - 1) : null,
          recurring_booking_id: recurring.id,
          expires_at: new Date(startTime.getTime() + 15 * 60 * 1000),
        },
      });
    }
  }

  const total = await prisma.recurringBooking.count();
  console.log(`:::::Created ${total} recurring bookings`);
}

async function seedNotifications(playerAccounts: any[], ownerAccounts: any[]) {
  console.log("\n:::::Seeding notifications...");

  const messages = [
    {
      msg: "Đặt sân thành công! Vui lòng đến đúng giờ.",
      type: "BOOKING_CONFIRMED",
    },
    { msg: "Thanh toán thành công cho đặt sân.", type: "PAYMENT_SUCCESS" },
    { msg: "Đặt sân của bạn đã bị hủy.", type: "BOOKING_CANCELED" },
    { msg: "Sân mới đã được mở gần khu vực của bạn.", type: "NEW_COMPLEX" },
    { msg: "Nhắc nhở: Bạn có đặt sân vào ngày mai.", type: "BOOKING_REMINDER" },
    { msg: "Khuyến mãi đặc biệt cuối tuần - Giảm 20%!", type: "PROMOTION" },
  ];

  const allAccounts = [...playerAccounts, ...ownerAccounts];
  const notifications = [];

  for (const acc of allAccounts) {
    const count = randInt(2, 6);
    for (let i = 0; i < count; i++) {
      const m = pick(messages);
      notifications.push({
        account_id: acc.id,
        message: m.msg,
        type: m.type,
        is_read: Math.random() > 0.4,
        link_to: "/bookings",
      });
    }
  }

  await prisma.notification.createMany({ data: notifications });
  console.log(`:::::Created ${notifications.length} notifications`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(":::::Starting seed...\n");

  // Clean existing data (order matters: children first)
  console.log(":::::Cleaning old data...");
  await prisma.notification.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.recurringBooking.deleteMany();
  await prisma.pricingRule.deleteMany();
  await prisma.subField.deleteMany();
  await prisma.complex.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.socialAccount.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.owner.deleteMany();
  await prisma.player.deleteMany();
  await prisma.account.deleteMany();
  console.log(":::::Done cleaning\n");

  const { ownerAccounts, playerAccounts } = await seedAccounts();
  const subFields = await seedComplexesAndSubFields(ownerAccounts);
  await seedBookingsAndPayments(playerAccounts, subFields);
  await seedRecurringBookings(playerAccounts, subFields);
  await seedNotifications(playerAccounts, ownerAccounts);

  console.log("\n:::::Seed completed successfully!");
  console.log("\n:::::Summary:");
  console.log(`  Accounts:           ${await prisma.account.count()}`);
  console.log(`  Admins:             ${await prisma.admin.count()}`);
  console.log(`  Owners:             ${await prisma.owner.count()}`);
  console.log(`  Players:            ${await prisma.player.count()}`);
  console.log(`  Complexes:          ${await prisma.complex.count()}`);
  console.log(`  SubFields:          ${await prisma.subField.count()}`);
  console.log(`  PricingRules:       ${await prisma.pricingRule.count()}`);
  console.log(`  Bookings:           ${await prisma.booking.count()}`);
  console.log(`  RecurringBookings:  ${await prisma.recurringBooking.count()}`);
  console.log(`  Payments:           ${await prisma.payment.count()}`);
  console.log(`  Notifications:      ${await prisma.notification.count()}`);
}

main()
  .catch((e) => {
    console.error(":::::Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
