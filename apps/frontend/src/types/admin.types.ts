import type { ApiResponse, PaginationMeta } from "./index";

export interface AdminStats {
  totalUsers: number;
  totalComplexes: number;
  totalBookings: number;
  totalRevenue: number;
  pendingComplexesCount: number;
  revenueGrowth: number;
  bookingGrowth: number;
  userGrowth: number;
}

export interface KpiDelta {
  thisMonth: number;
  lastMonth: number;
  growth: number;
}

export interface AddonUpsellKpi {
  revenue30d: number;
  revenueSharePct: number;
  totalAddons: number;
}

export interface AdminKpis {
  revenue: KpiDelta;
  bookings: KpiDelta;
  newUsers: KpiDelta;
  avgRating: number;
  addonUpsell: AddonUpsellKpi;
}

export interface RevenueTrendPoint {
  name: string;
  revenue: number;
  bookings: number;
  completed: number;
  canceled: number;
  cancelRate: number;
  completionRate: number;
}

export interface RetentionPoint {
  name: string;
  new: number;
  returning: number;
}

export interface ConversionFunnelPoint {
  stage: string;
  value: number;
  dropOffPct: number;
}

export interface HourlyDistributionPoint {
  hour: number;
  name: string;
  bookings: number;
  revenue: number;
}

export interface DailyDistributionPoint {
  name: string;
  bookings: number;
  revenue: number;
}

export interface SportRevenuePoint {
  name: string;
  revenue: number;
  bookings: number;
  avgBookingValue: number;
}

export interface TopComplexPoint {
  name: string;
  revenue: number;
  bookings: number;
  avgRating: number;
  totalReviews: number;
  utilizationRate: number;
}

export interface PaymentProviderPoint {
  provider: string;
  revenue: number;
  bookings: number;
  avgTransaction: number;
}

export interface RatingDistributionPoint {
  star: number;
  count: number;
}

export interface UserGrowthPoint {
  name: string;
  newUsers: number;
}

export interface AdminAnalytics {
  kpis: AdminKpis;
  revenueTrend: RevenueTrendPoint[];
  retentionData: RetentionPoint[];
  conversionFunnel: ConversionFunnelPoint[];
  hourlyDistribution: HourlyDistributionPoint[];
  dailyDistribution: DailyDistributionPoint[];
  sportRevenue: SportRevenuePoint[];
  topComplexes: TopComplexPoint[];
  paymentProviderData: PaymentProviderPoint[];
  ratingDist: RatingDistributionPoint[];
  userGrowth: UserGrowthPoint[];
}

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  created_at: string;
  player?: { status: string };
  owner?: { status: string };
  admin?: { status: string };
}

export interface AdminUsersResponse {
  users: AdminUser[];
  pagination: PaginationMeta;
}

export type AdminStatsResponse = ApiResponse<{ stats: AdminStats }>;
export type AdminAnalyticsResponse = ApiResponse<{ analytics: AdminAnalytics }>;
