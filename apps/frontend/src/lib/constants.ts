import { BookingStatus, ProductStatus, SportType } from "@/types";

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


