import { BookingStatus, ProductStatus, ProductType, SportType } from "@/types";
import { CheckCircle2, Clock, RefreshCw, XCircle, type LucideIcon } from "lucide-react";

export const SPORT_TYPE_LABELS: Record<SportType, string> = {
  [SportType.FOOTBALL]: "Bóng đá",
  [SportType.BASKETBALL]: "Bóng rổ",
  [SportType.TENNIS]: "Quần vợt",
  [SportType.BADMINTON]: "Cầu lông",
  [SportType.VOLLEYBALL]: "Bóng chuyền",
  [SportType.PICKLEBALL]: "Pickleball",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "Chưa thanh toán",
  [BookingStatus.CONFIRMED]: "Đã xác nhận",
  [BookingStatus.CANCELED]: "Đã hủy",
  [BookingStatus.COMPLETED]: "Đã hoàn thành",
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  [BookingStatus.CONFIRMED]: "bg-green-100 text-green-800 hover:bg-green-200",
  [BookingStatus.CANCELED]: "bg-red-100 text-red-800 hover:bg-red-200",
  [BookingStatus.COMPLETED]: "bg-blue-100 text-blue-800 hover:bg-blue-200",
};

export const RECURRENCE_TYPE_LABELS: Record<string, string> = {
  WEEKLY: "Hàng tuần",
  MONTHLY: "Hàng tháng",
};

export const RECURRING_STATUS_LABELS: Record<string, string> = {
  PENDING: "Chưa thanh toán",
  CONFIRMED: "Đã xác nhận",
  COMPLETED: "Đã hoàn thành",
  CANCELED: "Đã hủy",
};

export const RECURRING_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 hover:bg-amber-200",
  CONFIRMED: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
  COMPLETED: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  CANCELED: "bg-red-100 text-red-800 hover:bg-red-200",
};

// User Status & Roles for Admin
export const USER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Bị khóa",
  BANNED: "Bị cấm",
  SUSPENDED: "Tạm đình chỉ",
  PENDING: "Chờ duyệt",
  REJECTED: "Đã từ chối",
};

export const USER_STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800 hover:bg-green-200",
  INACTIVE: "bg-red-100 text-red-800 hover:bg-red-200",
  BANNED: "bg-red-100 text-red-800 hover:bg-red-200",
  SUSPENDED: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  REJECTED: "bg-gray-100 text-gray-800 hover:bg-gray-200",
};

export const ROLE_LABELS: Record<string, string> = {
  PLAYER: "Người chơi",
  OWNER: "Chủ sân",
  ADMIN: "Quản trị viên",
};

export const ROLE_COLORS: Record<string, string> = {
  PLAYER: "bg-blue-100 text-blue-800",
  OWNER: "bg-purple-100 text-purple-800",
  ADMIN: "bg-red-100 text-red-800",
};

// Complex Status
export const COMPLEX_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Bản nháp",
  PENDING: "Chờ duyệt",
  ACTIVE: "Đang hoạt động",
  REJECTED: "Đã từ chối",
  INACTIVE: "Tạm dừng",
};

export const COMPLEX_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  ACTIVE: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  INACTIVE: "bg-orange-100 text-orange-800",
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

export const PRODUCT_STATUS_COLORS: Record<ProductStatus, string> = {
  ACTIVE: "bg-green-100 text-green-800 hover:bg-green-200",
  INACTIVE: "bg-gray-100 text-gray-700 hover:bg-gray-200",
};

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  [ProductType.SALE]: "Bán lẻ",
  [ProductType.RENTAL]: "Cho thuê",
};

export const PRODUCT_TYPE_COLORS: Record<ProductType, string> = {
  [ProductType.SALE]: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300",
  [ProductType.RENTAL]: "bg-sky-100 text-sky-800 hover:bg-sky-200 dark:bg-sky-500/15 dark:text-sky-300",
};

// Payout & Wallet Statuses
export const PAYOUT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Tích lũy",
  REQUESTED: "Chờ duyệt",
  PROCESSING: "Đang xử lý",
  PAID: "Đã quyết toán",
  CANCELLED: "Đã từ chối",
};

export const PAYOUT_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-800 dark:bg-slate-500/15 dark:text-slate-300",
  REQUESTED: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  PROCESSING: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  PAID: "bg-green-100 text-green-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  CANCELLED: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
};

// Payment Statuses
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  SUCCESS: "Thành công",
  FAILED: "Thất bại",
  REFUNDED: "Đã hoàn tiền",
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  SUCCESS: "bg-green-100 text-green-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  FAILED: "bg-red-100 text-red-800 dark:bg-rose-500/15 dark:text-rose-300",
  REFUNDED: "bg-blue-100 text-blue-800 dark:bg-sky-500/15 dark:text-sky-300",
};

// Colors for charts (SVG Hex values)
export const CHART_COLORS = {
  // Booking Statuses
  STATUS_COMPLETED: "#10b981",
  STATUS_CONFIRMED: "#3b82f6",
  STATUS_PENDING: "#f59e0b",
  STATUS_CANCELLED: "#ef4444",

  // Top fields & Revenue
  BOOKINGS: "#8b5cf6",
  BOOKINGS_LIGHT: "#a78bfa",
  REVENUE: "#f97316",
  REVENUE_LIGHT: "#fb923c",

  // Hourly Distribution
  CYAN_DARK: "#06b6d4",
  CYAN_MEDIUM: "#22d3ee",
  CYAN_LIGHT: "#67e8f9",
};

export const STATUS_TONES: Record<
  string,
  { bg: string; border: string; label: string; icon: LucideIcon }
> = {
  PENDING: {
    bg: PAYOUT_STATUS_COLORS.PENDING,
    border: "border-slate-300/60 dark:border-slate-800",
    label: PAYOUT_STATUS_LABELS.PENDING,
    icon: Clock,
  },
  REQUESTED: {
    bg: PAYOUT_STATUS_COLORS.REQUESTED,
    border: "border-amber-300/60 dark:border-amber-800",
    label: PAYOUT_STATUS_LABELS.REQUESTED,
    icon: Clock,
  },
  PROCESSING: {
    bg: PAYOUT_STATUS_COLORS.PROCESSING,
    border: "border-blue-300/60 dark:border-blue-800",
    label: PAYOUT_STATUS_LABELS.PROCESSING,
    icon: RefreshCw,
  },
  PAID: {
    bg: PAYOUT_STATUS_COLORS.PAID,
    border: "border-emerald-300/60 dark:border-emerald-800",
    label: PAYOUT_STATUS_LABELS.PAID,
    icon: CheckCircle2,
  },
  CANCELLED: {
    bg: PAYOUT_STATUS_COLORS.CANCELLED,
    border: "border-rose-300/60 dark:border-rose-800",
    label: PAYOUT_STATUS_LABELS.CANCELLED,
    icon: XCircle,
  },
};

// Sport Type Options & Parsing
export const SPORT_TYPE_OPTIONS = Object.values(SportType) as SportType[];

export const parseSportType = (value: string): SportType | "ALL" => {
  if (value === "ALL") {
    return "ALL";
  }
  return SPORT_TYPE_OPTIONS.find((sportType) => sportType === value) ?? "ALL";
};

// Sport Emojis & Taglines
export const SPORT_EMOJIS: Record<SportType, string> = {
  FOOTBALL: "⚽",
  BASKETBALL: "🏀",
  TENNIS: "🎾",
  BADMINTON: "🏸",
  VOLLEYBALL: "🏐",
  PICKLEBALL: "🏓",
};

export const SPORT_TAGLINES: Record<SportType, string> = {
  BADMINTON: "Indoor • Đèn LED",
  FOOTBALL: "Sân 5 / 7 / 11",
  PICKLEBALL: "Hot • Thịnh hành",
  TENNIS: "Clay • Hard court",
  BASKETBALL: "3x3 • Full court",
  VOLLEYBALL: "Sân tiêu chuẩn",
};

// Homepage specific structures
export interface HomeSportCategory {
  name: string;
  emoji: string;
  type: SportType;
  courtCount: number;
  tagline: string;
}

export interface HomeStat {
  value: string;
  label: string;
}

export const SPORT_CATEGORIES: HomeSportCategory[] = [
  SportType.BADMINTON,
  SportType.FOOTBALL,
  SportType.PICKLEBALL,
  SportType.TENNIS,
  SportType.BASKETBALL,
].map((type) => ({
  type,
  name: SPORT_TYPE_LABELS[type] || String(type),
  emoji: SPORT_EMOJIS[type] || "🔥",
  courtCount: 0,
  tagline: SPORT_TAGLINES[type] || "Tiêu chuẩn",
}));

export const HERO_STATS: HomeStat[] = [
  { value: "500+", label: "Sân đối tác" },
  { value: "50K+", label: "Người chơi" },
  { value: "100K+", label: "Lượt đặt sân" },
  { value: "4.8/5", label: "Đánh giá trung bình" },
];

export const DAYS_OF_WEEK_FULL: Record<number, string> = {
  0: "Chủ nhật",
  1: "Thứ 2",
  2: "Thứ 3",
  3: "Thứ 4",
  4: "Thứ 5",
  5: "Thứ 6",
  6: "Thứ 7",
};

export const DAYS_OF_WEEK_SHORT: Record<number, string> = {
  0: "CN",
  1: "T2",
  2: "T3",
  3: "T4",
  4: "T5",
  5: "T6",
  6: "T7",
};

export interface BankItem {
  code: string;
  fullName: string;
}

export const VIETNAM_BANKS: BankItem[] = [
  { code: "970436", fullName: "Vietcombank (VCB)" },
  { code: "970415", fullName: "VietinBank (ICB)" },
  { code: "970418", fullName: "BIDV" },
  { code: "970405", fullName: "Agribank" },
  { code: "970422", fullName: "MB Bank (MB)" },
  { code: "970414", fullName: "Techcombank (TCB)" },
  { code: "970432", fullName: "VPBank (VPB)" },
  { code: "970416", fullName: "ACB" },
  { code: "970403", fullName: "Sacombank (STB)" },
  { code: "970441", fullName: "VIB" },
  { code: "970423", fullName: "TPBank (TPB)" },
  { code: "970426", fullName: "MSB" },
  { code: "970448", fullName: "OCB" },
  { code: "970428", fullName: "SHB" },
  { code: "970431", fullName: "Eximbank (EIB)" },
  { code: "970437", fullName: "HDBank (HDB)" },
];

export const BANK_LEGACY_MAPPINGS: Record<string, string> = {
  vietcombank: "970436",
  vietinbank: "970415",
  bidv: "970418",
  agribank: "970405",
  mb: "970422",
  techcombank: "970414",
  vpb: "970432",
  acb: "970416",
  sacombank: "970403",
  vib: "970441",
  tpb: "970423",
  msb: "970426",
  ocb: "970448",
  shb: "970428",
  eximbank: "970431",
  hdbank: "970437",
};

export type PricingTier = "PEAK" | "BUDGET" | "REGULAR";

export interface PricingTierConfig {
  label: string;
  subLabel: string;
  badgeClass: string;
  textClass: string;
  colorClass: string;
  cardClass: string;
  solidBadgeClass: string;
}

export const PRICING_TIER_CONFIGS: Record<PricingTier, PricingTierConfig> = {
  PEAK: {
    label: "Giờ cao điểm",
    subLabel: "cao điểm",
    badgeClass: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/30 dark:bg-orange-950/20 dark:text-orange-400",
    textClass: "text-orange-600 dark:text-orange-400",
    colorClass: "bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 text-white",
    cardClass: "border-orange-200 bg-orange-50/20 dark:border-orange-900/30 dark:bg-orange-950/10",
    solidBadgeClass: "border-orange-300 bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  },
  BUDGET: {
    label: "Giá tiết kiệm",
    subLabel: "tiết kiệm nhất",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400",
    textClass: "text-emerald-600 dark:text-emerald-400",
    colorClass: "bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white",
    cardClass: "border-emerald-200 bg-emerald-50/20 dark:border-emerald-900/30 dark:bg-emerald-950/10",
    solidBadgeClass: "border-emerald-300 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  REGULAR: {
    label: "Giờ thường",
    subLabel: "bình thường",
    badgeClass: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400",
    textClass: "text-blue-600 dark:text-blue-400",
    colorClass: "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white",
    cardClass: "border-blue-200 bg-blue-50/20 dark:border-blue-900/30 dark:bg-blue-950/10",
    solidBadgeClass: "border-blue-300 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
};




