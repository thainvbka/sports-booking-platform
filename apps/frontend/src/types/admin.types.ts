import type {
  ApiResponse,
  ComplexStatus,
  PaginationMeta,
  SportType,
} from "./index";

export interface KpiDelta {
  thisMonth: number;
  lastMonth: number;
  growth: number;
  total?: number;
}

export interface AddonUpsellKpi {
  revenue30d: number;
  revenueSharePct: number;
  totalAddons: number;
}

export interface AdminComplexesKpi {
  total: number;
  pending: number;
}

export interface AdminKpis {
  revenue: KpiDelta;
  bookings: KpiDelta;
  users: KpiDelta;
  complexes: AdminComplexesKpi;
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

export interface AdminComplex {
  id: string;
  complex_name: string;
  complex_address: string;
  complex_image?: string;
  status: ComplexStatus;
  verification_docs: unknown;
  created_at: string;
  min_price?: number | null;
  max_price?: number | null;
  total_subfields: number;
  sport_types: SportType[];
  avg_rating?: number | null;
  total_reviews?: number;
  owner: {
    id: string;
    company_name: string;
    account: {
      full_name: string;
      email: string;
      phone_number: string;
    };
  };
}

export interface AdminComplexStats {
  total: number;
  active: number;
  pending: number;
  inactive: number;
  rejected: number;
  draft: number;
}

export interface AdminComplexesResponse {
  complexes: AdminComplex[];
  pagination: PaginationMeta;
  stats: AdminComplexStats;
}

export type AdminAnalyticsResponse = ApiResponse<{ analytics: AdminAnalytics }>;
export type AdminComplexesApiResponse = ApiResponse<AdminComplexesResponse>;
