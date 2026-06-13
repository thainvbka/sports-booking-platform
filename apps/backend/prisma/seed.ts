/**
 * Seed dữ liệu cho Sports Booking Platform.
 *
 * Mục tiêu: cung cấp một bộ dữ liệu đa dạng nhưng NHẤT QUÁN — mọi quan hệ
 * đều đúng ràng buộc schema và logic nghiệp vụ.
 *
 * Ràng buộc được đảm bảo:
 *   - Account: email & phone_number duy nhất.
 *   - Complex chỉ ACTIVE mới có booking; verification_docs là JSON object.
 *   - SubField: tên duy nhất trong 1 complex (theo unique index).
 *   - PricingRule: (sub_field_id, day_of_week, start_time, end_time) duy nhất.
 *   - Booking (theo quy ước nghiệp vụ):
 *       - PENDING: player tạo booking nhưng chưa thanh toán.
 *       - COMPLETED: đã thanh toán, đang chờ chủ sân xác nhận.
 *       - CONFIRMED: đã được chủ sân xác nhận.
 *       - CANCELED: booking bị hủy.
 *   - Booking:
 *       - start_time < end_time (slot 2h cố định).
 *       - Trên cùng 1 sub-field: không có 2 booking trùng slot thời gian.
 *       - Cùng 1 player: không bị book chồng giờ.
 *       - created_at ≤ paid_at ≤ start_time; expires_at = created_at + 15 phút.
 *       - status phù hợp mốc thời gian:
 *         đã qua → CONFIRMED / COMPLETED / CANCELED;
 *         tương lai → PENDING / COMPLETED / CONFIRMED / CANCELED.
 *       - Chỉ COMPLETED & CONFIRMED mới có Payment; amount khớp total_price.
 *   - Payment.transaction_code duy nhất.
 *   - BookingAddon: chỉ trên booking đã thanh toán (COMPLETED/CONFIRMED) của đúng complex; (booking_id,
 *     product_id) duy nhất; addon cộng thêm vào total_price của booking.
 *   - Recurring booking: children tuân theo recurrence_type (WEEKLY/MONTHLY),
 *     nằm trong [start_date, end_date], cùng player & sub-field, không xung đột.
 *   - Match (kèo):
 *       - 1-1 với Booking; chỉ tạo cho booking CONFIRMED.
 *       - creator_id = booking.player_id; sport_type = sub_field.sport_type.
 *       - slots_needed ≤ sub_field.capacity − 1.
 *       - slots_filled = số participants ACCEPTED.
 *       - join_deadline < booking.start_time.
 *       - status COMPLETED chỉ khi booking đã kết thúc.
 *   - MatchParticipant: (match_id, player_id) duy nhất; player ≠ creator.
 *   - Review: chỉ trên booking CONFIRMED đã kết thúc; player_id & subfield_id phải khớp
 *     booking; rating 1–5; created_at ≥ booking.end_time.
 *   - Cache fields được đồng bộ lại sau khi seed (SubField.avg_rating,
 *     total_reviews; Complex.min_price, max_price, total_subfields,
 *     sport_types, avg_rating, total_reviews).
 */

import { faker } from "@faker-js/faker/locale/vi";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  AdminStatus,
  BookingStatus,
  ComplexStatus,
  MatchSkillLevel,
  MatchStatus,
  NotificationTargetRole,
  OwnerStatus,
  ParticipantStatus,
  PaymentProvider,
  PaymentStatus,
  PayoutStatus,
  PlayerStatus,
  Prisma,
  PrismaClient,
  ProductStatus,
  ProductType,
  RecurrenceType,
  RecurringStatus,
  SportType,
} from "@prisma/client";
import * as bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path";
import { Pool } from "pg";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const connectionString = process.env.DATABASE_URL ?? "";
if (!connectionString) {
  throw new Error("DATABASE_URL is required for seed");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Helpers ──────────────────────────────────────────────────────────────────

const hash = (p: string) => bcrypt.hashSync(p, 10);
const rand = () => Math.random();
const randInt = (min: number, max: number) =>
  Math.floor(rand() * (max - min + 1)) + min;

const pick = <T>(arr: T[]): T => arr[randInt(0, arr.length - 1)];

const pickN = <T>(arr: T[], n: number): T[] => {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(randInt(0, copy.length - 1), 1)[0]);
  }
  return out;
};

const weightedPick = <T>(items: T[], weights: number[]): T => {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
};

/** Mốc 0h hôm nay – `d` ngày */
const daysAgo = (d: number): Date => {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

/** Ngày trong tương lai */
const daysFromNow = (d: number): Date => daysAgo(-d);

const addDays = (d: Date, n: number): Date => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

const addMinutes = (d: Date, m: number): Date =>
  new Date(d.getTime() + m * 60_000);

const addMonths = (d: Date, n: number): Date => {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
};

const setHM = (base: Date, hh: number, mm = 0): Date => {
  const d = new Date(base);
  d.setHours(hh, mm, 0, 0);
  return d;
};

const randDate = (from: Date, to: Date): Date => {
  if (from.getTime() >= to.getTime()) return new Date(from);
  return new Date(from.getTime() + rand() * (to.getTime() - from.getTime()));
};

/** Chuỗi đại diện ngày (theo local) – dùng làm phần khoá slot */
const dateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/** Khoá slot thời gian: YYYY-MM-DD_HH */
const slotKey = (d: Date, startH: number): string =>
  `${dateKey(d)}_${String(startH).padStart(2, "0")}`;

let txnCounter = 0;
const nextTxn = (prefix: string): string =>
  `${prefix}_${Date.now().toString(36).toUpperCase()}_${(++txnCounter)
    .toString()
    .padStart(7, "0")}`;

/** Làm tròn về bội số 10.000 cho giá VNĐ */
const roundVnd = (n: number): number => Math.round(n / 10_000) * 10_000;

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

/** Slot 2h cố định, mở từ 6h–22h */
const TIME_SLOTS = [6, 8, 10, 14, 16, 18, 20] as const;
const SLOT_HOURS = 2;

/** Trọng số chọn giờ: tập trung peak 18h–20h */
const SLOT_WEIGHTS: Record<number, number> = {
  6: 0.05,
  8: 0.08,
  10: 0.07,
  14: 0.08,
  16: 0.12,
  18: 0.32,
  20: 0.28,
};

/** Khoảng giá theo môn (VNĐ / 2h) */
const PRICE_RANGE: Record<SportType, [number, number]> = {
  FOOTBALL: [300_000, 800_000],
  BASKETBALL: [200_000, 500_000],
  TENNIS: [150_000, 400_000],
  BADMINTON: [100_000, 250_000],
  VOLLEYBALL: [120_000, 300_000],
  PICKLEBALL: [100_000, 200_000],
};

/** Sức chứa hợp lý theo môn */
const CAPACITY_BY_SPORT: Record<SportType, number[]> = {
  FOOTBALL: [10, 14, 22],
  BASKETBALL: [6, 10],
  TENNIS: [2, 4],
  BADMINTON: [2, 4],
  VOLLEYBALL: [10, 12],
  PICKLEBALL: [2, 4],
};

const SPORT_LABELS: Record<SportType, string> = {
  FOOTBALL: "Bóng đá",
  BASKETBALL: "Bóng rổ",
  TENNIS: "Tennis",
  BADMINTON: "Cầu lông",
  VOLLEYBALL: "Bóng chuyền",
  PICKLEBALL: "Pickleball",
};

/**
 * Curated Unsplash photo IDs cho từng loại sân thể thao.
 *
 * Tại sao không dùng loremflickr / tag-based API?
 *   - loremflickr trả về ảnh ngẫu nhiên theo tag nhưng rất hay lệch chủ đề
 *     (phong cảnh, động vật...) do index tag của họ không chính xác.
 *   - Unsplash Source API (source.unsplash.com) đã bị deprecated.
 *
 * Giải pháp: hardcode danh sách photo ID đã được kiểm tra thủ công từ Unsplash.
 *   - Không cần API key.
 *   - Không bị rate-limit khi seed.
 *   - Ảnh luôn đúng chủ đề, phù hợp cho UI web.
 *   - Đủ đa dạng (5–6 ảnh/loại) để tránh lặp trong dữ liệu seed.
 *
 * Nếu muốn dùng Pexels/Unsplash API để mở rộng thêm:
 *   - Pexels: https://www.pexels.com/api/ (miễn phí, tìm theo từ khóa)
 *   - Unsplash: https://unsplash.com/developers (miễn phí tier)
 *   Cần đặt PEXELS_API_KEY / UNSPLASH_ACCESS_KEY vào .env và gọi HTTP khi seed.
 */
const SPORT_IMAGES: Record<SportType, Record<"complex" | "subfield" | "product", string[]>> = {
  FOOTBALL: {
    complex: [
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1280&h=720&fit=crop",
      "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=1280&h=720&fit=crop",
      "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=1280&h=720&fit=crop",
      "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1280&h=720&fit=crop",
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1280&h=720&fit=crop",
    ],
    subfield: [
      "https://images.unsplash.com/photo-1551958219-acbc595b75bf?w=1000&h=700&fit=crop",
      "https://images.unsplash.com/photo-1520466809213-7b9a56adcd45?w=1000&h=700&fit=crop",
      "https://images.unsplash.com/photo-1598901847919-b641267b71dc?w=1000&h=700&fit=crop",
      "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=1000&h=700&fit=crop",
      "https://images.unsplash.com/photo-1571103080435-3d12d07f1df8?w=1000&h=700&fit=crop",
    ],
    product: [
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1614632537190-23e4146777db?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=600&h=600&fit=crop",
    ],
  },
  BASKETBALL: {
    complex: [
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1280&h=720&fit=crop",
      "https://images.unsplash.com/photo-1505666287802-931dc83948e9?w=1280&h=720&fit=crop",
      "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=1280&h=720&fit=crop",
      "https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=1280&h=720&fit=crop",
    ],
    subfield: [
      "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1000&h=700&fit=crop",
      "https://images.unsplash.com/photo-1588941288445-4de00ebf43a4?w=1000&h=700&fit=crop",
      "https://images.unsplash.com/photo-1594623930572-300a3011d9ae?w=1000&h=700&fit=crop",
      "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1000&h=700&fit=crop",
    ],
    product: [
      "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1542652694-40abf526446e?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=600&h=600&fit=crop",
    ],
  },
  TENNIS: {
    complex: [
      "https://images.unsplash.com/photo-1622279457486-62dbd0bbfc4a?w=1280&h=720&fit=crop",
      "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1280&h=720&fit=crop",
      "https://images.unsplash.com/photo-1554068865-24ceec13d068?w=1280&h=720&fit=crop",
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1280&h=720&fit=crop",
    ],
    subfield: [
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=1000&h=700&fit=crop",
      "https://images.unsplash.com/photo-1530915534664-4ac6423a5a84?w=1000&h=700&fit=crop",
      "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?w=1000&h=700&fit=crop",
      "https://images.unsplash.com/photo-1602211844066-d3bb556e983b?w=1000&h=700&fit=crop",
    ],
    product: [
      "https://images.unsplash.com/photo-1617083934551-ac1f314a7b02?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1570464197285-9949814674a7?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=600&h=600&fit=crop",
    ],
  },
  BADMINTON: {
    complex: [
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1280&h=720&fit=crop",
      "https://images.unsplash.com/photo-1593787406922-875b3e3aeaa3?w=1280&h=720&fit=crop",
      "https://images.unsplash.com/photo-1615395406786-ca74f9c59508?w=1280&h=720&fit=crop",
      "https://images.unsplash.com/photo-1643360058358-01f5cdbd3b3e?w=1280&h=720&fit=crop",
    ],
    subfield: [
      "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?w=1000&h=700&fit=crop",
      "https://images.unsplash.com/photo-1599474703894-2dec5b5c8977?w=1000&h=700&fit=crop",
      "https://images.unsplash.com/photo-1531315396756-905d68d21b56?w=1000&h=700&fit=crop",
      "https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=1000&h=700&fit=crop",
    ],
    product: [
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1617083934551-ac1f314a7b02?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1593787406922-875b3e3aeaa3?w=600&h=600&fit=crop",
    ],
  },
  VOLLEYBALL: {
    complex: [
      "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1280&h=720&fit=crop",
      "https://images.unsplash.com/photo-1593786961938-c8febe8e4ef4?w=1280&h=720&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1280&h=720&fit=crop",
      "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1280&h=720&fit=crop",
    ],
    subfield: [
      "https://images.unsplash.com/photo-1562552052-3c38e0d1a5da?w=1000&h=700&fit=crop",
      "https://images.unsplash.com/photo-1616610097222-5e3c8e77e4c3?w=1000&h=700&fit=crop",
      "https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=1000&h=700&fit=crop",
      "https://images.unsplash.com/photo-1598901847919-b641267b71dc?w=1000&h=700&fit=crop",
    ],
    product: [
      "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1593786961938-c8febe8e4ef4?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=600&h=600&fit=crop",
    ],
  },
  PICKLEBALL: {
    complex: [
      "https://images.unsplash.com/photo-1655491406070-8e2a11a0d0ce?w=1280&h=720&fit=crop",
      "https://images.unsplash.com/photo-1622279457486-62dbd0bbfc4a?w=1280&h=720&fit=crop",
      "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1280&h=720&fit=crop",
      "https://images.unsplash.com/photo-1554068865-24ceec13d068?w=1280&h=720&fit=crop",
    ],
    subfield: [
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=1000&h=700&fit=crop",
      "https://images.unsplash.com/photo-1602211844066-d3bb556e983b?w=1000&h=700&fit=crop",
      "https://images.unsplash.com/photo-1530915534664-4ac6423a5a84?w=1000&h=700&fit=crop",
      "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?w=1000&h=700&fit=crop",
    ],
    product: [
      "https://images.unsplash.com/photo-1617083934551-ac1f314a7b02?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1655491406070-8e2a11a0d0ce?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1570464197285-9949814674a7?w=600&h=600&fit=crop",
    ],
  },
};

// ─── Pexels image fetcher ─────────────────────────────────────────────────────
//
// Khi có PEXELS_API_KEY trong .env, seed sẽ fetch ảnh thực tế theo từng môn +
// loại (complex / subfield / product), cache trong process và pick xoay vòng
// theo seed. Nếu key không có hoặc fetch fail, sẽ fallback về danh sách
// SPORT_IMAGES curated phía trên để đảm bảo seed không tạo URL trắng.
// Với môi trường production deploy trên EC2, hãy đặt PEXELS_API_KEY trong
// file env được dùng để chạy lệnh seed (ví dụ: .env.production hoặc export env).
//
// Tham khảo: https://www.pexels.com/api/

const PEXELS_API_KEY = process.env.PEXELS_API_KEY ?? "";

const PEXELS_QUERIES: Record<
  SportType,
  Record<"complex" | "subfield" | "product", string>
> = {
  FOOTBALL: {
    complex: "football stadium aerial",
    subfield: "soccer field grass court",
    product: "football soccer ball",
  },
  BASKETBALL: {
    complex: "basketball arena indoor",
    subfield: "basketball court indoor",
    product: "basketball ball hoop",
  },
  TENNIS: {
    complex: "tennis club outdoor",
    subfield: "tennis court surface",
    product: "tennis racket ball",
  },
  BADMINTON: {
    complex: "badminton hall indoor",
    subfield: "badminton court shuttlecock",
    product: "badminton racket",
  },
  VOLLEYBALL: {
    complex: "volleyball court beach",
    subfield: "volleyball net indoor court",
    product: "volleyball ball net",
  },
  PICKLEBALL: {
    complex: "pickleball court outdoor",
    subfield: "pickleball court game",
    product: "pickleball paddle ball",
  },
};

/** Cache theo key "FOOTBALL_complex" → danh sách URL ảnh */
const imageCache = new Map<string, string[]>();

async function prefetchPexelsImages(): Promise<void> {
  if (!PEXELS_API_KEY) {
    console.warn(
      "  ⚠ PEXELS_API_KEY không có trong env — bỏ qua prefetch, dùng SPORT_IMAGES fallback.",
    );
    return;
  }

  console.log("  Prefetching sport images from Pexels...");

  const sizeParam: Record<"complex" | "subfield" | "product", string> = {
    complex: "large2x", // ~1280px
    subfield: "large", // ~940px
    product: "medium", // ~350px
  };

  for (const sport of Object.values(SportType)) {
    for (const kind of ["complex", "subfield", "product"] as const) {
      const query = PEXELS_QUERIES[sport][kind];
      const cacheKey = `${sport}_${kind}`;

      try {
        const res = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(
            query,
          )}&per_page=8&orientation=${
            kind === "product" ? "square" : "landscape"
          }`,
          { headers: { Authorization: PEXELS_API_KEY } },
        );

        if (!res.ok) {
          console.warn(
            `    ✗ Pexels fetch failed for ${cacheKey}: ${res.status}`,
          );
          continue;
        }

        const data = (await res.json()) as {
          photos: Array<{ src: Record<string, string> }>;
        };
        const urls = data.photos
          .map((p) => p.src?.[sizeParam[kind]])
          .filter((url): url is string => Boolean(url));

        if (urls.length === 0) {
          console.warn(`    ✗ Pexels returned 0 ảnh cho ${cacheKey}`);
          continue;
        }

        imageCache.set(cacheKey, urls);
        console.log(`    ✓ ${cacheKey}: ${urls.length} ảnh`);
      } catch (err) {
        console.warn(
          `    ✗ Pexels fetch error cho ${cacheKey}:`,
          (err as Error).message,
        );
      }

      // Rate limit (free tier 200 req/h): chờ nhẹ giữa các call.
      await new Promise((r) => setTimeout(r, 300));
    }
  }
}

const hashSeed = (seed: string): number =>
  seed.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

/**
 * Trả về URL ảnh đúng môn + loại.
 * Ưu tiên ảnh từ Pexels (đã prefetch), fallback về SPORT_IMAGES curated.
 */
const buildSportImageUrl = (
  sport: SportType,
  kind: "complex" | "subfield" | "product",
  seed: string,
): string => {
  const cached = imageCache.get(`${sport}_${kind}`);
  if (cached && cached.length > 0) {
    return cached[hashSeed(seed) % cached.length];
  }
  const fallback = SPORT_IMAGES[sport][kind];
  return fallback[hashSeed(seed) % fallback.length];
};

const PROVIDERS: PaymentProvider[] = [
  PaymentProvider.VNPAY,
  PaymentProvider.STRIPE,
];
const PROVIDER_WEIGHTS = [0.7, 0.3];

/** Phân phối rating thực tế (1★ ít, 5★ nhiều) */
const RATING_WEIGHTS = [0.05, 0.08, 0.15, 0.32, 0.4];

/** Tỉ lệ huỷ theo tháng cũ → mới */
const CANCEL_RATE_BY_MONTH = [0.18, 0.2, 0.22, 0.18, 0.15, 0.12];

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

const CLOSE_REASONS = [
  "Chủ kèo đóng do đủ team nội bộ",
  "Đổi lịch thi đấu",
  "Đã chuyển sang sân khác",
  "Thời tiết xấu",
];

// ─── Internal types ───────────────────────────────────────────────────────────

interface PlayerInfo {
  id: string;
  account_id: string;
  account_created_at: Date;
}

interface SubFieldInfo {
  id: string;
  complex_id: string;
  sport_type: SportType;
  capacity: number;
}

interface ProductInfo {
  id: string;
  price: number;
  status: ProductStatus;
  stock: number;
  type: ProductType;
}

// ─── Slot conflict tracking ──────────────────────────────────────────────────

const subfieldSlots = new Map<string, Set<string>>();
const playerSlots = new Map<string, Set<string>>();

const isSlotFree = (sfId: string, plId: string, key: string): boolean => {
  if (subfieldSlots.get(sfId)?.has(key)) return false;
  if (playerSlots.get(plId)?.has(key)) return false;
  return true;
};

const occupySlot = (sfId: string, plId: string, key: string): void => {
  let s = subfieldSlots.get(sfId);
  if (!s) {
    s = new Set();
    subfieldSlots.set(sfId, s);
  }
  s.add(key);
  let p = playerSlots.get(plId);
  if (!p) {
    p = new Set();
    playerSlots.set(plId, p);
  }
  p.add(key);
};

// ─── Pricing helpers ─────────────────────────────────────────────────────────

const computeFieldPrice = (sport: SportType, startH: number, isWeekend: boolean): number => {
  const [pMin, pMax] = PRICE_RANGE[sport];
  const base = roundVnd(randInt(pMin, pMax));
  const peakMul = startH >= 17 ? 1.3 : 1;
  const weekendMul = isWeekend ? 1.2 : 1;
  return roundVnd(base * peakMul * weekendMul);
};

// ─── 1. Accounts ─────────────────────────────────────────────────────────────

interface SeededOwner {
  ownerId: string;
  accountId: string;
  status: OwnerStatus;
}

async function seedAccounts() {
  console.log("  [1/9] Accounts (admin / owners / players)...");

  // 1 admin
  await prisma.account.create({
    data: {
      email: "admin@sportsbooking.vn",
      password: hash("Admin@123"),
      full_name: "Tổng Quản Trị",
      phone_number: "0900000001",
      email_verified: true,
      phone_verified: true,
      created_at: daysAgo(200),
      admin: { create: { status: AdminStatus.ACTIVE } },
    },
  });

  // 12 owners – 10 ACTIVE, 2 SUSPENDED
  const owners: SeededOwner[] = [];
  for (let i = 0; i < 12; i++) {
    const status = i < 10 ? OwnerStatus.ACTIVE : OwnerStatus.SUSPENDED;
    const acc = await prisma.account.create({
      data: {
        email: `owner${i + 1}@sportsbooking.vn`,
        password: hash("Owner@123"),
        full_name: faker.person.fullName(),
        phone_number: `091${String(i).padStart(7, "0")}`,
        email_verified: true,
        phone_verified: true,
        created_at: randDate(daysAgo(180), daysAgo(120)),
        owner: {
          create: {
            company_name: `${faker.company.name()} Sports`,
            status,
          },
        },
      },
      include: { owner: true },
    });
    owners.push({
      ownerId: acc.owner!.id,
      accountId: acc.id,
      status,
    });
  }

  // Players – phân bổ tăng dần theo 6 tháng
  const monthlyCounts = [12, 14, 16, 20, 24, 28]; // tháng cũ → tháng gần
  const players: PlayerInfo[] = [];
  let phoneSeq = 0;

  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const count = monthlyCounts[5 - monthOffset];
    const from = daysAgo((monthOffset + 1) * 30);
    const to = daysAgo(monthOffset * 30);
    for (let i = 0; i < count; i++) {
      const createdAt = randDate(from, to);
      const acc = await prisma.account.create({
        data: {
          email: `player${phoneSeq + 1}@sportsbooking.vn`,
          password: hash("Player@123"),
          full_name: faker.person.fullName(),
          phone_number: `093${String(phoneSeq).padStart(7, "0")}`,
          email_verified: rand() > 0.1,
          phone_verified: rand() > 0.2,
          created_at: createdAt,
          player: { create: { status: PlayerStatus.ACTIVE } },
        },
        include: { player: true },
      });
      phoneSeq++;
      players.push({
        id: acc.player!.id,
        account_id: acc.id,
        account_created_at: createdAt,
      });
    }
  }

  // 2 banned players để test edge case
  for (let i = 0; i < 2; i++) {
    const createdAt = daysAgo(randInt(60, 150));
    const acc = await prisma.account.create({
      data: {
        email: `banned${i + 1}@sportsbooking.vn`,
        password: hash("Player@123"),
        full_name: faker.person.fullName(),
        phone_number: `093${String(phoneSeq).padStart(7, "0")}`,
        email_verified: true,
        phone_verified: true,
        created_at: createdAt,
        player: { create: { status: PlayerStatus.BANNED } },
      },
      include: { player: true },
    });
    phoneSeq++;
    players.push({
      id: acc.player!.id,
      account_id: acc.id,
      account_created_at: createdAt,
    });
  }

  console.log(`     → 1 admin, ${owners.length} owners, ${players.length} players`);
  return { owners, players };
}

// ─── 2. Complexes / SubFields / PricingRules / Products ──────────────────────

interface SeededComplex {
  complexId: string;
  ownerId: string;
  status: ComplexStatus;
  sports: SportType[];
}

async function seedComplexesAndProducts(owners: SeededOwner[]) {
  console.log("  [2/9] Complexes / SubFields / PricingRules / Products...");

  const complexes: SeededComplex[] = [];
  const subfields: SubFieldInfo[] = [];
  const productsByComplex = new Map<string, ProductInfo[]>();

  for (let oi = 0; oi < owners.length; oi++) {
    const owner = owners[oi];

    // Owner SUSPENDED chỉ có complex INACTIVE/REJECTED
    const numComplexes =
      owner.status === OwnerStatus.SUSPENDED ? 1 : randInt(1, 2);

    for (let ci = 0; ci < numComplexes; ci++) {
      let status: ComplexStatus;
      if (owner.status === OwnerStatus.SUSPENDED) {
        status = pick([ComplexStatus.INACTIVE, ComplexStatus.REJECTED]);
      } else {
        status = weightedPick(
          [
            ComplexStatus.ACTIVE,
            ComplexStatus.PENDING,
            ComplexStatus.DRAFT,
            ComplexStatus.REJECTED,
          ],
          [0.78, 0.12, 0.06, 0.04],
        );
      }

      const sports = pickN(SPORT_TYPES, randInt(1, 3)) as SportType[];
      const coverSport = pick(sports);

      const complex = await prisma.complex.create({
        data: {
          owner_id: owner.ownerId,
          complex_name: `${pick(COMPLEX_NAMES)} ${faker.string
            .alphanumeric(3)
            .toUpperCase()}`,
          complex_address: `${randInt(1, 500)} ${pick(STREETS)}, ${pick(DISTRICTS)}`,
          status,
          verification_docs: {
            license: `https://docs.example.com/license-${oi}-${ci}.pdf`,
            tax: `https://docs.example.com/tax-${oi}-${ci}.pdf`,
            id_card: `https://docs.example.com/id-${oi}-${ci}.pdf`,
          },
          complex_image: buildSportImageUrl(
            coverSport,
            "complex",
            `complex-${oi}-${ci}`,
          ),
          sport_types: sports,
          created_at: randDate(daysAgo(180), daysAgo(60)),
        },
      });
      complexes.push({
        complexId: complex.id,
        ownerId: owner.ownerId,
        status,
        sports,
      });

      // Sub-fields: chỉ tạo cho complex ACTIVE / PENDING (DRAFT/REJECTED/INACTIVE
      // không có sân thực tế để tránh sinh dữ liệu thừa)
      if (status !== ComplexStatus.ACTIVE && status !== ComplexStatus.PENDING) {
        productsByComplex.set(complex.id, []);
        continue;
      }

      const numSubs = randInt(2, 5);
      for (let si = 0; si < numSubs; si++) {
        const sport = pick(sports);
        const capacity = pick(CAPACITY_BY_SPORT[sport]);

        const subField = await prisma.subField.create({
          data: {
            complex_id: complex.id,
            sub_field_name: `Sân ${si + 1} (${SPORT_LABELS[sport]})`,
            capacity,
            sub_field_image: buildSportImageUrl(
              sport,
              "subfield",
              `sub-${complex.id}-${si}`,
            ),
            sport_type: sport,
            created_at: randDate(
              new Date(complex.created_at),
              addDays(new Date(complex.created_at), 7),
            ),
          },
        });
        subfields.push({
          id: subField.id,
          complex_id: complex.id,
          sport_type: sport,
          capacity,
        });

        // PricingRule: 7 ngày × 7 slot = 49 rule, đảm bảo unique theo schema
        const rules: Prisma.PricingRuleCreateManyInput[] = [];
        for (let day = 0; day < 7; day++) {
          const isWeekend = day === 0 || day === 6;
          for (const startH of TIME_SLOTS) {
            const price = computeFieldPrice(sport, startH, isWeekend);
            const refDate = new Date(2000, 0, 1);
            const startTime = setHM(refDate, startH, 0);
            const endTime = setHM(refDate, startH + SLOT_HOURS, 0);
            rules.push({
              sub_field_id: subField.id,
              day_of_week: day,
              start_time: startTime,
              end_time: endTime,
              base_price: price,
            });
          }
        }
        await prisma.pricingRule.createMany({ data: rules });
      }

      // Products – chỉ ACTIVE complex mới mở bán
      const products: ProductInfo[] = [];
      if (status === ComplexStatus.ACTIVE) {
        const seenNames = new Set<string>();
        for (const sport of sports) {
          for (const tmpl of PRODUCT_TEMPLATES[sport]) {
            if (seenNames.has(tmpl.name)) continue;
            seenNames.add(tmpl.name);
            const productStatus =
              rand() > 0.05 ? ProductStatus.ACTIVE : ProductStatus.INACTIVE;
            const pType = tmpl.name.startsWith("Thuê")
              ? ProductType.RENTAL
              : ProductType.SALE;
            const product = await prisma.product.create({
              data: {
                complex_id: complex.id,
                sport_type: sport,
                name: tmpl.name,
                description: faker.commerce.productDescription(),
                price: tmpl.price,
                stock: randInt(20, 200),
                image: buildSportImageUrl(
                  sport,
                  "product",
                  `product-${complex.id}-${tmpl.name}`,
                ),
                status: productStatus,
                type: pType,
              },
            });
            products.push({
              id: product.id,
              price: tmpl.price,
              status: productStatus,
              stock: product.stock,
              type: pType,
            });
          }
        }
      }
      productsByComplex.set(complex.id, products);
    }
  }

  console.log(
    `     → ${complexes.length} complexes, ${subfields.length} sub-fields`,
  );
  return { complexes, subfields, productsByComplex };
}

// ─── 3. Bookings + Payments + Addons + Reviews ───────────────────────────────

/**
 * Cố gắng đặt 1 booking trên (player, subfield) tại 1 slot ngẫu nhiên.
 * Trả về booking nếu thành công, null nếu xung đột hoặc không phù hợp.
 */
async function tryCreateBooking(args: {
  player: PlayerInfo;
  subfield: SubFieldInfo;
  bookingDate: Date;
  startH: number;
  recurringId?: string | null;
  recurringStatus?: RecurringStatus | null;
  productsForComplex: ProductInfo[];
}) {
  const { player, subfield, bookingDate, startH, recurringId, recurringStatus } = args;

  // Player phải đã tồn tại trước khi tạo booking
  if (bookingDate.getTime() < player.account_created_at.getTime()) return null;

  const startTime = setHM(bookingDate, startH, 0);
  const endTime = setHM(bookingDate, startH + SLOT_HOURS, 0);
  const now = new Date();

  // Khoá xung đột slot
  const key = slotKey(bookingDate, startH);
  if (!isSlotFree(subfield.id, player.id, key)) return null;

  const isWeekend = bookingDate.getDay() === 0 || bookingDate.getDay() === 6;
  const fieldPrice = computeFieldPrice(subfield.sport_type, startH, isWeekend);

  // Xác định status theo quy ước nghiệp vụ:
  // - PENDING: chưa thanh toán
  // - COMPLETED: đã thanh toán, chờ chủ sân xác nhận
  // - CONFIRMED: đã được chủ sân xác nhận
  let status: BookingStatus;
  if (recurringId && recurringStatus) {
    if (recurringStatus === RecurringStatus.CONFIRMED) {
      status = rand() < 0.15 ? BookingStatus.CANCELED : BookingStatus.CONFIRMED;
    } else if (recurringStatus === RecurringStatus.COMPLETED) {
      status = rand() < 0.15 ? BookingStatus.CANCELED : BookingStatus.COMPLETED;
    } else {
      status = BookingStatus.PENDING;
    }
  } else if (endTime < now) {
    // Booking đã qua: không nên còn PENDING.
    const monthsAgo = Math.min(
      5,
      Math.floor((now.getTime() - endTime.getTime()) / (30 * 86_400_000)),
    );
    const cancelRate = CANCEL_RATE_BY_MONTH[5 - monthsAgo] ?? 0.18;
    status =
      rand() < cancelRate
        ? BookingStatus.CANCELED
        : weightedPick(
            [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
            [0.82, 0.18],
          );
  } else {
    // Booking trong tương lai (hoặc đang diễn ra)
    status = weightedPick(
      [
        BookingStatus.PENDING,
        BookingStatus.COMPLETED,
        BookingStatus.CONFIRMED,
        BookingStatus.CANCELED,
      ],
      [0.22, 0.24, 0.42, 0.12],
    );
  }

  // created_at:
  // - PENDING: rất gần hiện tại để đúng nghĩa \"đã tạo nhưng chưa thanh toán\".
  // - Trạng thái khác: đặt trước 1–7 ngày.
  const minCreated = player.account_created_at;
  const desiredCreated =
    status === BookingStatus.PENDING
      ? new Date(now.getTime() - randInt(0, 10) * 60_000)
      : new Date(startTime.getTime() - randInt(1, 7) * 86_400_000);
  const createdAt = new Date(
    Math.max(desiredCreated.getTime(), minCreated.getTime()),
  );
  if (createdAt.getTime() >= startTime.getTime()) return null;

  // PENDING chỉ hợp lý nếu hết thời gian giữ (5') CHƯA xảy ra → tức created_at
  // gần hiện tại. Nếu không hợp lệ, đổi thành CANCELED (hết hạn).
  let expiresAt = addMinutes(createdAt, 5);
  // Ràng buộc: expires_at phải < start_time
  if (expiresAt.getTime() >= startTime.getTime()) {
    expiresAt = new Date(startTime.getTime() - 60_000);
  }
  if (status === BookingStatus.PENDING && expiresAt < now) {
    status = BookingStatus.CANCELED;
  }

  // Payment chỉ tồn tại với CONFIRMED/COMPLETED
  let paidAt: Date | null = null;
  if (status === BookingStatus.CONFIRMED || status === BookingStatus.COMPLETED) {
    paidAt = new Date(
      createdAt.getTime() + randInt(1, 4) * 60_000,
    );
    if (paidAt >= expiresAt) {
      paidAt = new Date(expiresAt.getTime() - 10_000);
    }
    if (paidAt > startTime) paidAt = new Date(startTime.getTime() - 60_000);
    // expires_at cho booking đã thanh toán có thể giữ nguyên (5' từ created)
  }

  // Tạm chiếm slot trước khi insert (tránh seed song song trùng)
  occupySlot(subfield.id, player.id, key);

  const booking = await prisma.booking.create({
    data: {
      player_id: player.id,
      sub_field_id: subfield.id,
      start_time: startTime,
      end_time: endTime,
      total_price: fieldPrice,
      status,
      created_at: createdAt,
      paid_at: paidAt,
      expires_at: expiresAt,
      recurring_booking_id: recurringId ?? null,
    },
  });

  // Addons – booking đã thanh toán (COMPLETED/CONFIRMED) + complex ACTIVE
  let addonTotal = 0;
  let hasRentalAddon = false;
  if (
    (status === BookingStatus.COMPLETED || status === BookingStatus.CONFIRMED) &&
    rand() < 0.4
  ) {
    const candidates = args.productsForComplex.filter(
      (p) => p.status === ProductStatus.ACTIVE && p.stock > 0,
    );
    if (candidates.length > 0) {
      const chosen = pickN(candidates, randInt(1, Math.min(3, candidates.length)));
      const addonRows = chosen.map((p) => {
        const quantity = randInt(1, 3);
        addonTotal += p.price * quantity;
        if (p.type === ProductType.RENTAL) {
          hasRentalAddon = true;
        }
        return {
          booking_id: booking.id,
          product_id: p.id,
          quantity,
          unit_price: p.price,
        };
      });
      await prisma.bookingAddon.createMany({ data: addonRows });
    }
  }

  const finalTotal = fieldPrice + addonTotal;

  // Payment – tạo SAU addon để amount khớp total cuối cùng
  let paymentId: string | null = null;
  if (status === BookingStatus.CONFIRMED || status === BookingStatus.COMPLETED) {
    const provider = weightedPick(PROVIDERS, PROVIDER_WEIGHTS);
    const payment = await prisma.payment.create({
      data: {
        amount: finalTotal,
        provider,
        transaction_code: nextTxn(provider),
        status: PaymentStatus.SUCCESS,
        created_at: paidAt ?? createdAt,
      },
    });
    paymentId = payment.id;
  } else if (status === BookingStatus.CANCELED && rand() < 0.25) {
    // 25% đơn huỷ có refund (đã thanh toán rồi mới huỷ)
    const provider = weightedPick(PROVIDERS, PROVIDER_WEIGHTS);
    const payment = await prisma.payment.create({
      data: {
        amount: finalTotal,
        provider,
        transaction_code: nextTxn(provider),
        status: PaymentStatus.REFUNDED,
        created_at: createdAt,
      },
    });
    paymentId = payment.id;
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      total_price: finalTotal,
      payment_id: paymentId,
      rental_returned: status === BookingStatus.CONFIRMED && endTime < now && hasRentalAddon,
    },
  });

  // Review chỉ tạo khi booking đã CONFIRMED và đã kết thúc.
  if (status === BookingStatus.CONFIRMED && endTime < now && rand() < 0.55) {
    const rating = weightedPick([1, 2, 3, 4, 5], RATING_WEIGHTS);
    const reviewAt = new Date(
      endTime.getTime() + randInt(1, 72) * 3_600_000,
    );
    await prisma.review.create({
      data: {
        booking_id: booking.id,
        player_id: player.id,
        subfield_id: subfield.id,
        rating,
        comment:
          rating <= 2
            ? `Trải nghiệm chưa tốt. ${faker.lorem.sentence()}`
            : rand() > 0.3
              ? faker.lorem.sentence()
              : null,
        created_at: reviewAt < new Date() ? reviewAt : new Date(),
      },
    });
  }

  return {
    bookingId: booking.id,
    startTime,
    endTime,
    createdAt,
    status,
    sport: subfield.sport_type,
    capacity: subfield.capacity,
  };
}

async function seedBookings(
  players: PlayerInfo[],
  complexes: SeededComplex[],
  subfields: SubFieldInfo[],
  productsByComplex: Map<string, ProductInfo[]>,
) {
  console.log("  [3/9] Bookings / Payments / Addons / Reviews...");

  // Chỉ dùng subfields thuộc complex ACTIVE
  const activeComplexIds = new Set(
    complexes
      .filter((c) => c.status === ComplexStatus.ACTIVE)
      .map((c) => c.complexId),
  );
  const bookableSubfields = subfields.filter((s) =>
    activeComplexIds.has(s.complex_id),
  );

  if (bookableSubfields.length === 0) {
    console.log("     ! Không có sub-field nào thuộc complex ACTIVE, bỏ qua.");
    return;
  }

  const activePlayers = players.filter(() => true); // banned cũng có thể có booking cũ
  let totalBookings = 0;

  for (const player of activePlayers) {
    // Số booking mong muốn dựa trên tuổi tài khoản
    const ageDays = Math.max(
      1,
      (Date.now() - player.account_created_at.getTime()) / 86_400_000,
    );
    const desired = Math.min(40, Math.max(4, Math.round(ageDays / 6)));

    let attempts = 0;
    let succeeded = 0;
    while (succeeded < desired && attempts < desired * 4) {
      attempts++;
      const subfield = pick(bookableSubfields);

      // Phân phối ngày: ưu tiên gần hiện tại, có cả tương lai
      const monthOffset = weightedPick(
        [-1, 0, 1, 2, 3, 4, 5],
        [0.08, 0.28, 0.2, 0.16, 0.12, 0.1, 0.06],
      );
      let from: Date;
      let to: Date;
      if (monthOffset < 0) {
        from = daysFromNow(1);
        to = daysFromNow(45);
      } else {
        from = daysAgo((monthOffset + 1) * 30);
        to = daysAgo(monthOffset * 30);
      }
      const bookingDate = new Date(randDate(from, to));
      bookingDate.setHours(0, 0, 0, 0);

      const startH = weightedPick(
        TIME_SLOTS as unknown as number[],
        TIME_SLOTS.map((h) => SLOT_WEIGHTS[h] ?? 0.1),
      );

      const result = await tryCreateBooking({
        player,
        subfield,
        bookingDate,
        startH,
        productsForComplex: productsByComplex.get(subfield.complex_id) ?? [],
      });
      if (result) {
        succeeded++;
        totalBookings++;
      }
    }
  }

  console.log(`     → ${totalBookings} bookings`);
}

// ─── 4. Recurring bookings ────────────────────────────────────────────────────

async function seedRecurringBookings(
  players: PlayerInfo[],
  complexes: SeededComplex[],
  subfields: SubFieldInfo[],
  productsByComplex: Map<string, ProductInfo[]>,
) {
  console.log("  [4/9] Recurring bookings + child bookings...");

  const activeComplexIds = new Set(
    complexes
      .filter((c) => c.status === ComplexStatus.ACTIVE)
      .map((c) => c.complexId),
  );
  const bookableSubfields = subfields.filter((s) =>
    activeComplexIds.has(s.complex_id),
  );
  if (bookableSubfields.length === 0) return;

  // ~20% players có recurring
  const recurringCandidates = players
    .filter(() => rand() < 0.2)
    .filter((p) => p.account_created_at < daysAgo(60));

  let totalChildren = 0;
  let totalRecurring = 0;

  for (const player of recurringCandidates) {
    const subfield = pick(bookableSubfields);
    const recType: RecurrenceType =
      rand() > 0.5 ? RecurrenceType.WEEKLY : RecurrenceType.MONTHLY;
    const startH = pick([8, 10, 18, 20]);

    // Bắt đầu từ 1–3 tháng trước, kéo dài 8 tuần (weekly) / 3 tháng (monthly)
    const startDate = randDate(daysAgo(90), daysAgo(45));
    startDate.setHours(0, 0, 0, 0);
    const endDate =
      recType === RecurrenceType.WEEKLY
        ? addDays(startDate, 56)
        : addMonths(startDate, 3);

    const recurStatus: RecurringStatus =
      endDate < new Date()
        ? RecurringStatus.COMPLETED
        : RecurringStatus.CONFIRMED;

    const recurring = await prisma.recurringBooking.create({
      data: {
        player_id: player.id,
        sub_field_id: subfield.id,
        recurrence_type: recType,
        start_date: startDate,
        end_date: endDate,
        status: recurStatus,
        created_at: addDays(startDate, -1),
      },
    });
    totalRecurring++;

    const intervalDays = recType === RecurrenceType.WEEKLY ? 7 : 30;
    let cursor = new Date(startDate);
    const products = productsByComplex.get(subfield.complex_id) ?? [];

    while (cursor <= endDate) {
      const child = await tryCreateBooking({
        player,
        subfield,
        bookingDate: new Date(cursor),
        startH,
        recurringId: recurring.id,
        recurringStatus: recurStatus,
        productsForComplex: products,
      });
      if (child) totalChildren++;
      cursor = addDays(cursor, intervalDays);
    }
  }

  console.log(`     → ${totalRecurring} recurring, ${totalChildren} children`);
}

// ─── 5. Matches + Participants ────────────────────────────────────────────────

async function seedMatches(players: PlayerInfo[]) {
  console.log("  [5/9] Matches & participants...");

  // Lấy booking đủ điều kiện làm kèo: chỉ booking đã CONFIRMED.
  const candidates = await prisma.booking.findMany({
    where: {
      status: BookingStatus.CONFIRMED,
      match: null,
    },
    select: {
      id: true,
      created_at: true,
      start_time: true,
      end_time: true,
      player_id: true,
      sub_field: {
        select: { sport_type: true, capacity: true },
      },
    },
    take: 200,
    orderBy: { start_time: "desc" },
  });

  // Tạo match cho ~60% candidate
  const chosen = candidates.filter(() => rand() < 0.6);
  const playerIds = players.map((p) => p.id);
  const now = new Date();

  let totalMatches = 0;
  let totalParticipants = 0;

  for (const booking of chosen) {
    const sport = booking.sub_field.sport_type as SportType;
    const capacity = booking.sub_field.capacity;
    if (capacity <= 1) continue; // không thể tìm thêm người

    const slotsNeeded = randInt(1, Math.max(1, capacity - 1));
    const isPast = booking.end_time < now;
    const otherPlayers = playerIds.filter((id) => id !== booking.player_id);
    if (otherPlayers.length === 0) continue;

    // Quyết định status
    let status: MatchStatus;
    if (isPast) {
      status = MatchStatus.COMPLETED;
    } else {
      status = weightedPick(
        [
          MatchStatus.OPEN,
          MatchStatus.FULL,
          MatchStatus.CLOSED,
          MatchStatus.EXPIRED,
          MatchStatus.CANCELED,
        ],
        [0.5, 0.2, 0.12, 0.1, 0.08],
      );
    }

    // Tính số người ACCEPTED khớp với status
    let accepted: number;
    if (status === MatchStatus.FULL || status === MatchStatus.COMPLETED) {
      accepted = slotsNeeded;
    } else if (status === MatchStatus.CLOSED) {
      accepted = randInt(0, slotsNeeded);
    } else if (status === MatchStatus.EXPIRED) {
      accepted = 0;
    } else {
      accepted = slotsNeeded > 1 ? randInt(0, slotsNeeded - 1) : 0;
    }
    accepted = Math.min(accepted, otherPlayers.length);

    // join_deadline phải < start_time
    let joinDeadline: Date;
    if (status === MatchStatus.EXPIRED) {
      // EXPIRED: join_deadline đã qua
      joinDeadline = new Date(
        Math.min(now.getTime(), booking.start_time.getTime()) -
          randInt(60, 360) * 60_000,
      );
    } else if (status === MatchStatus.OPEN) {
      // OPEN: join_deadline chưa qua VÀ < start_time
      const minDeadline = new Date(now.getTime() + 30 * 60_000);
      const maxDeadline = new Date(booking.start_time.getTime() - 30 * 60_000);
      if (minDeadline.getTime() >= maxDeadline.getTime()) {
        // Booking quá gần hiện tại → không phù hợp cho OPEN, chuyển thành CLOSED
        status = MatchStatus.CLOSED;
        joinDeadline = new Date(
          booking.start_time.getTime() - randInt(60, 360) * 60_000,
        );
      } else {
        joinDeadline = randDate(minDeadline, maxDeadline);
      }
    } else {
      joinDeadline = new Date(
        booking.start_time.getTime() - randInt(60, 360) * 60_000,
      );
    }
    // Đảm bảo joinDeadline > created_at
    if (joinDeadline <= booking.created_at) {
      if (status === MatchStatus.EXPIRED) {
        joinDeadline = new Date(booking.created_at.getTime() + 60_000);
      } else {
        joinDeadline = new Date(
          Math.max(
            booking.created_at.getTime() + 60_000,
            booking.start_time.getTime() - 30 * 60_000,
          ),
        );
      }
    }

    const skillLevel = weightedPick(
      [
        MatchSkillLevel.BEGINNER,
        MatchSkillLevel.INTERMEDIATE,
        MatchSkillLevel.ADVANCED,
      ],
      [0.3, 0.5, 0.2],
    );

    const closedReason =
      status === MatchStatus.CLOSED
        ? pick(CLOSE_REASONS)
        : status === MatchStatus.EXPIRED
          ? "Quá hạn nhận người tham gia"
          : status === MatchStatus.CANCELED
            ? "Chủ kèo huỷ trận"
            : status === MatchStatus.COMPLETED
              ? "Trận đấu đã kết thúc"
              : null;

    const match = await prisma.match.create({
      data: {
        booking_id: booking.id,
        creator_id: booking.player_id,
        sport_type: sport,
        skill_level: skillLevel,
        title: `Tìm ${slotsNeeded} người chơi ${SPORT_LABELS[sport]} – ${booking.start_time.toLocaleDateString("vi-VN")}`,
        description: rand() > 0.3 ? faker.lorem.sentences(2) : null,
        slots_needed: slotsNeeded,
        slots_filled: accepted,
        join_deadline: joinDeadline,
        status,
        closed_reason: closedReason,
        created_at: booking.created_at,
      },
    });
    totalMatches++;

    // Sinh participants
    const matchCreatedAt = match.created_at;
    const responseUpper = new Date(
      Math.min(joinDeadline.getTime(), now.getTime()),
    );
    const safeUpper =
      responseUpper.getTime() <= matchCreatedAt.getTime()
        ? new Date(matchCreatedAt.getTime() + 60_000)
        : responseUpper;

    // Số participant cần (accepted + thêm pending/rejected/withdrawn)
    const extraSlots = Math.min(
      otherPlayers.length - accepted,
      randInt(0, Math.max(0, Math.min(5, otherPlayers.length - accepted))),
    );
    const totalParticipantsCount = accepted + extraSlots;
    const participantPool = pickN(otherPlayers, totalParticipantsCount);

    const acceptedSet = participantPool.slice(0, accepted);
    const otherSet = participantPool.slice(accepted);

    // ACCEPTED
    for (const playerId of acceptedSet) {
      const respondedAt = randDate(matchCreatedAt, safeUpper);
      await prisma.matchParticipant.create({
        data: {
          match_id: match.id,
          player_id: playerId,
          status: ParticipantStatus.ACCEPTED,
          introduction: rand() > 0.3 ? faker.lorem.sentence() : null,
          responded_at: respondedAt,
          created_at: matchCreatedAt,
        },
      });
      totalParticipants++;
    }

    // Còn lại: PENDING / REJECTED / WITHDRAWN / REMOVED
    const allowPending =
      status === MatchStatus.OPEN ||
      status === MatchStatus.CLOSED ||
      status === MatchStatus.CANCELED;
    const statusPool = allowPending
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
    const statusWeights = allowPending
      ? [0.4, 0.3, 0.2, 0.1]
      : [0.5, 0.3, 0.2];

    for (const playerId of otherSet) {
      const pStatus = weightedPick(statusPool, statusWeights);
      const respondedAt =
        pStatus === ParticipantStatus.PENDING
          ? null
          : randDate(matchCreatedAt, safeUpper);
      const leftAt =
        pStatus === ParticipantStatus.WITHDRAWN ||
        pStatus === ParticipantStatus.REMOVED
          ? respondedAt
            ? addMinutes(respondedAt, randInt(5, 120))
            : null
          : null;
      await prisma.matchParticipant.create({
        data: {
          match_id: match.id,
          player_id: playerId,
          status: pStatus,
          introduction: rand() > 0.4 ? faker.lorem.sentence() : null,
          responded_at: respondedAt,
          left_at: leftAt,
          created_at: matchCreatedAt,
        },
      });
      totalParticipants++;
    }
  }

  console.log(`     → ${totalMatches} matches, ${totalParticipants} participants`);
}

// ─── 6. OwnerPayouts & PayoutBatches ─────────────────────────────────────────

async function seedOwnerPayouts() {
  console.log("  [6/9] OwnerPayouts & PayoutBatches...");

  // Lấy tất cả Payment SUCCESS kèm thông tin booking → subfield → complex → owner
  const successPayments = await prisma.payment.findMany({
    where: { status: PaymentStatus.SUCCESS },
    include: {
      bookings: {
        take: 1,
        include: {
          sub_field: {
            include: {
              complex: { select: { owner_id: true } },
            },
          },
        },
      },
    },
  });

  const PLATFORM_FEE_RATE = 0.1; // 10% phí nền tảng
  const now = new Date();

  interface PayoutRecord {
    id: string;
    ownerId: string;
    payoutAmount: number;
    createdAt: Date;
    status: PayoutStatus;
  }

  const allPayouts: PayoutRecord[] = [];

  for (const payment of successPayments) {
    if (payment.bookings.length === 0) continue;

    const booking = payment.bookings[0];
    const ownerId = booking.sub_field.complex.owner_id;

    const totalAmount = Number(payment.amount);
    const platformFee = roundVnd(totalAmount * PLATFORM_FEE_RATE);
    const payoutAmount = totalAmount - platformFee;
    if (payoutAmount <= 0) continue;

    // Booking đã qua → chia các trạng thái: PAID, REQUESTED, PROCESSING, PENDING
    // Booking tương lai → PENDING
    const isPast = booking.end_time < now;
    let payoutStatus: PayoutStatus = PayoutStatus.PENDING;
    if (isPast) {
      const rVal = rand();
      if (rVal < 0.70) {
        payoutStatus = PayoutStatus.PAID;
      } else if (rVal < 0.85) {
        payoutStatus = PayoutStatus.REQUESTED;
      } else if (rVal < 0.95) {
        payoutStatus = PayoutStatus.PROCESSING;
      } else {
        payoutStatus = PayoutStatus.PENDING;
      }
    }

    const createdAt = new Date(
      payment.created_at.getTime() + randInt(1, 24) * 3_600_000,
    );
    let paidAt: Date | null = null;
    if (payoutStatus === PayoutStatus.PAID) {
      paidAt = new Date(
        createdAt.getTime() + randInt(1, 7) * 86_400_000,
      );
      // Đảm bảo paid_at không vượt quá hiện tại và >= created_at
      if (paidAt > now) paidAt = new Date(now.getTime() - randInt(1, 48) * 3_600_000);
      if (paidAt < createdAt) paidAt = new Date(createdAt.getTime() + 3_600_000);
    }

    const payout = await prisma.ownerPayout.create({
      data: {
        owner_id: ownerId,
        payment_id: payment.id,
        total_amount: totalAmount,
        platform_fee: platformFee,
        payout_amount: payoutAmount,
        status: payoutStatus,
        created_at: createdAt,
        paid_at: paidAt,
      },
    });

    allPayouts.push({
      id: payout.id,
      ownerId,
      payoutAmount,
      createdAt,
      status: payoutStatus,
    });
  }

  // ── PayoutBatch: gom các payout cùng owner + cùng tháng + cùng status ──
  let totalBatches = 0;

  const groupByKey = (statusFilter: PayoutStatus) => {
    const groups = new Map<string, PayoutRecord[]>();
    for (const p of allPayouts) {
      if (p.status !== statusFilter) continue;
      const month = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, "0")}`;
      const key = `${p.ownerId}||${month}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(p);
    }
    return groups;
  };

  // 1. Batch cho nhóm PAID
  for (const [key, payouts] of Array.from(groupByKey(PayoutStatus.PAID))) {
    if (payouts.length < 2) continue;
    const [ownerId, period] = key.split("||");
    const totalPayout = payouts.reduce((s, p) => s + p.payoutAmount, 0);
    const batchCreatedAt = payouts.reduce(
      (min, p) => (p.createdAt < min ? p.createdAt : min),
      payouts[0].createdAt,
    );
    const batchPaidAt = new Date(
      batchCreatedAt.getTime() + randInt(7, 14) * 86_400_000,
    );

    const batch = await prisma.payoutBatch.create({
      data: {
        owner_id: ownerId,
        total_payout: totalPayout,
        status: PayoutStatus.PAID,
        payout_period: `Quyết toán tháng ${period.split("-")[1]}/${period.split("-")[0]}`,
        transaction_ref: nextTxn("BATCH"),
        note: "Đã quyết toán chuyển khoản qua ngân hàng",
        created_at: batchCreatedAt,
        paid_at: batchPaidAt,
      },
    });
    await prisma.ownerPayout.updateMany({
      where: { id: { in: payouts.map((p) => p.id) } },
      data: { batch_id: batch.id },
    });
    totalBatches++;
  }

  // 2. Batch cho nhóm REQUESTED (Đang chờ Admin duyệt)
  for (const [key, payouts] of Array.from(groupByKey(PayoutStatus.REQUESTED))) {
    if (payouts.length < 2) continue;
    const [ownerId, period] = key.split("||");
    const totalPayout = payouts.reduce((s, p) => s + p.payoutAmount, 0);
    const batchCreatedAt = payouts.reduce(
      (min, p) => (p.createdAt < min ? p.createdAt : min),
      payouts[0].createdAt,
    );

    const batch = await prisma.payoutBatch.create({
      data: {
        owner_id: ownerId,
        total_payout: totalPayout,
        status: PayoutStatus.REQUESTED,
        payout_period: `Yêu cầu rút tiền tháng ${period.split("-")[1]}/${period.split("-")[0]}`,
        created_at: batchCreatedAt,
      },
    });
    await prisma.ownerPayout.updateMany({
      where: { id: { in: payouts.map((p) => p.id) } },
      data: { batch_id: batch.id },
    });
    totalBatches++;
  }

  // 3. Batch cho nhóm PROCESSING (Admin đang xử lý)
  for (const [key, payouts] of Array.from(groupByKey(PayoutStatus.PROCESSING))) {
    if (payouts.length < 2) continue;
    const [ownerId, period] = key.split("||");
    const totalPayout = payouts.reduce((s, p) => s + p.payoutAmount, 0);
    const batchCreatedAt = payouts.reduce(
      (min, p) => (p.createdAt < min ? p.createdAt : min),
      payouts[0].createdAt,
    );

    const batch = await prisma.payoutBatch.create({
      data: {
        owner_id: ownerId,
        total_payout: totalPayout,
        status: PayoutStatus.PROCESSING,
        payout_period: `Quyết toán đang xử lý tháng ${period.split("-")[1]}/${period.split("-")[0]}`,
        created_at: batchCreatedAt,
      },
    });
    await prisma.ownerPayout.updateMany({
      where: { id: { in: payouts.map((p) => p.id) } },
      data: { batch_id: batch.id },
    });
    totalBatches++;
  }

  console.log(
    `     → ${allPayouts.length} owner payouts, ${totalBatches} payout batches`,
  );
}

// ─── 7. Sync SubField caches ─────────────────────────────────────────────────

async function syncSubFieldCaches() {
  console.log("  [7/9] Sync SubField caches (avg_rating, total_reviews)...");
  const subFields = await prisma.subField.findMany({
    where: { isDelete: false },
    select: {
      id: true,
      reviews: { select: { rating: true } },
    },
  });

  for (const sf of subFields) {
    const ratings = sf.reviews.map((r) => r.rating);
    const avgRating =
      ratings.length > 0
        ? Number(
            (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2),
          )
        : null;
    await prisma.subField.update({
      where: { id: sf.id },
      data: {
        avg_rating: avgRating,
        total_reviews: ratings.length,
      },
    });
  }
  console.log(`     → ${subFields.length} sub-fields synced`);
}

// ─── 7. Sync Complex caches ──────────────────────────────────────────────────

async function syncComplexCaches() {
  console.log("  [8/9] Sync Complex caches (price range / sports / rating)...");
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
    const sportTypes = Array.from(
      new Set(c.sub_fields.map((sf) => sf.sport_type)),
    );

    const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : null;
    const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : null;
    const avgRating =
      allRatings.length > 0
        ? Number(
            (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(
              2,
            ),
          )
        : null;

    await prisma.complex.update({
      where: { id: c.id },
      data: {
        min_price: minPrice,
        max_price: maxPrice,
        total_subfields: c.sub_fields.length,
        sport_types: sportTypes,
        avg_rating: avgRating,
        total_reviews: allRatings.length,
      },
    });
  }
  console.log(`     → ${complexes.length} complexes synced`);
}

// ─── 8. Notifications ────────────────────────────────────────────────────────

async function seedNotifications(players: PlayerInfo[], owners: SeededOwner[]) {
  console.log("  [9/9] Notifications...");
  const playerTemplates: Array<{
    type: string;
    msg: string;
    role: NotificationTargetRole;
    link: string;
  }> = [
    {
      type: "BOOKING",
      msg: "Chủ sân đã xác nhận booking của bạn.",
      role: NotificationTargetRole.PLAYER,
      link: "/bookings",
    },
    {
      type: "BOOKING",
      msg: "Booking của bạn đã bị chủ sân hủy.",
      role: NotificationTargetRole.PLAYER,
      link: "/bookings",
    },
    {
      type: "BOOKING",
      msg: "Phiên đặt sân đã hết hạn và bị hủy tự động.",
      role: NotificationTargetRole.PLAYER,
      link: "/bookings",
    },
    {
      type: "SYSTEM",
      msg: "Nhắc lịch: bạn có lịch chơi trong 1 giờ nữa.",
      role: NotificationTargetRole.PLAYER,
      link: "/bookings",
    },
    {
      type: "MATCH",
      msg: "Có người mới xin tham gia kèo của bạn.",
      role: NotificationTargetRole.PLAYER,
      link: "/player/matches",
    },
    {
      type: "MATCH",
      msg: "Yêu cầu tham gia trận đấu của bạn đã được chấp nhận.",
      role: NotificationTargetRole.PLAYER,
      link: "/player/matches",
    },
    {
      type: "MATCH",
      msg: "Yêu cầu tham gia trận đấu của bạn đã bị từ chối.",
      role: NotificationTargetRole.PLAYER,
      link: "/player/matches",
    },
    {
      type: "PAYMENT",
      msg: "Thanh toán thành công. Booking đã chuyển sang trạng thái chờ xác nhận.",
      role: NotificationTargetRole.PLAYER,
      link: "/bookings",
    },
  ];

  const ownerTemplates: Array<{
    type: string;
    msg: string;
    role: NotificationTargetRole;
    link: string;
  }> = [
    {
      type: "BOOKING",
      msg: "Bạn vừa nhận một booking mới đã thanh toán.",
      role: NotificationTargetRole.OWNER,
      link: "/owner/bookings",
    },
    {
      type: "BOOKING",
      msg: "Player đã hủy booking đã thanh toán.",
      role: NotificationTargetRole.OWNER,
      link: "/owner/bookings",
    },
    {
      type: "BOOKING",
      msg: "Nhắc xác nhận: Có booking đã thanh toán sắp tới giờ đá, vui lòng xác nhận sớm cho khách.",
      role: NotificationTargetRole.OWNER,
      link: "/owner/bookings",
    },
    {
      type: "SYSTEM",
      msg: "Hồ sơ khu phức hợp của bạn đã được cập nhật trạng thái từ hệ thống.",
      role: NotificationTargetRole.OWNER,
      link: "/owner/complexes",
    },
  ];

  const adminTemplates: Array<{
    type: string;
    msg: string;
    role: NotificationTargetRole;
    link: string;
  }> = [
    {
      type: "SYSTEM",
      msg: "Có complex mới đang chờ admin duyệt.",
      role: NotificationTargetRole.ADMIN,
      link: "/admin/complexes",
    },
    {
      type: "SYSTEM",
      msg: "Báo cáo vận hành hệ thống theo ngày đã sẵn sàng.",
      role: NotificationTargetRole.ADMIN,
      link: "/admin",
    },
  ];

  let total = 0;
  const playerTargets = players.slice(0, Math.min(60, players.length));
  for (const player of playerTargets) {
    const num = randInt(2, 6);
    const rows: Prisma.NotificationCreateManyInput[] = [];
    for (let i = 0; i < num; i++) {
      const tmpl = pick(playerTemplates);
      rows.push({
        account_id: player.account_id,
        message: tmpl.msg,
        type: tmpl.type,
        target_role: tmpl.role,
        link_to: tmpl.link,
        is_read: rand() > 0.4,
        created_at: randDate(daysAgo(30), new Date()),
      });
      total++;
    }
    await prisma.notification.createMany({ data: rows });
  }

  const ownerTargets = owners.slice(0, Math.min(20, owners.length));
  for (const owner of ownerTargets) {
    const num = randInt(1, 4);
    const rows: Prisma.NotificationCreateManyInput[] = [];
    for (let i = 0; i < num; i++) {
      const tmpl = pick(ownerTemplates);
      rows.push({
        account_id: owner.accountId,
        message: tmpl.msg,
        type: tmpl.type,
        target_role: tmpl.role,
        link_to: tmpl.link,
        is_read: rand() > 0.45,
        created_at: randDate(daysAgo(30), new Date()),
      });
      total++;
    }
    await prisma.notification.createMany({ data: rows });
  }

  const admin = await prisma.admin.findFirst({
    where: { status: AdminStatus.ACTIVE },
    select: { account_id: true },
  });
  if (admin) {
    const rows: Prisma.NotificationCreateManyInput[] = [];
    const num = randInt(3, 6);
    for (let i = 0; i < num; i++) {
      const tmpl = pick(adminTemplates);
      rows.push({
        account_id: admin.account_id,
        message: tmpl.msg,
        type: tmpl.type,
        target_role: tmpl.role,
        link_to: tmpl.link,
        is_read: rand() > 0.5,
        created_at: randDate(daysAgo(30), new Date()),
      });
      total++;
    }
    await prisma.notification.createMany({ data: rows });
  }

  console.log(`     → ${total} notifications`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function cleanup() {
  console.log("Cleaning up existing data...");
  // Order theo FK (xóa bảng con trước bảng cha)
  await prisma.matchParticipant.deleteMany();
  await prisma.match.deleteMany();
  await prisma.review.deleteMany();
  await prisma.bookingAddon.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.ownerPayout.deleteMany();
  await prisma.payoutBatch.deleteMany();
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
}

async function summary() {
  console.log("\n========================================");
  console.log("  Seed Summary");
  console.log("========================================");
  const counts = await Promise.all([
    prisma.account.count(),
    prisma.complex.count(),
    prisma.subField.count(),
    prisma.pricingRule.count(),
    prisma.product.count(),
    prisma.booking.count(),
    prisma.payment.count(),
    prisma.bookingAddon.count(),
    prisma.recurringBooking.count(),
    prisma.match.count(),
    prisma.matchParticipant.count(),
    prisma.review.count(),
    prisma.ownerPayout.count(),
    prisma.payoutBatch.count(),
    prisma.notification.count(),
  ]);
  const labels = [
    "Accounts",
    "Complexes",
    "SubFields",
    "PricingRules",
    "Products",
    "Bookings",
    "Payments",
    "BookingAddons",
    "RecurringBookings",
    "Matches",
    "MatchParticipants",
    "Reviews",
    "OwnerPayouts",
    "PayoutBatches",
    "Notifications",
  ];
  labels.forEach((l, i) => console.log(`  ${l.padEnd(20)}: ${counts[i]}`));
  console.log("========================================\n");
  console.log("Test accounts:");
  console.log("  Admin:  admin@sportsbooking.vn  / Admin@123");
  console.log("  Owner:  owner1@sportsbooking.vn / Owner@123");
  console.log("  Player: player1@sportsbooking.vn / Player@123");
}

async function main() {
  console.log("========================================");
  console.log("  Sports Booking — Seed");
  console.log("========================================\n");

  await prefetchPexelsImages();
  await cleanup();

  const { owners, players } = await seedAccounts();
  const { complexes, subfields, productsByComplex } =
    await seedComplexesAndProducts(owners);
  await seedBookings(players, complexes, subfields, productsByComplex);
  await seedRecurringBookings(players, complexes, subfields, productsByComplex);
  await seedMatches(players);
  await seedOwnerPayouts();
  await syncSubFieldCaches();
  await syncComplexCaches();
  await seedNotifications(players, owners);
  await summary();
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