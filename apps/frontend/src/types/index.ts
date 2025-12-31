// Enums matching Prisma schema (using object literals for erasableSyntaxOnly compatibility)
export const SportType = {
  FOOTBALL: "FOOTBALL",
  BASKETBALL: "BASKETBALL",
  TENNIS: "TENNIS",
  BADMINTON: "BADMINTON",
  VOLLEYBALL: "VOLLEYBALL",
  PICKLEBALL: "PICKLEBALL",
} as const;
export type SportType = (typeof SportType)[keyof typeof SportType];

export const BookingStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELED: "CANCELED",
  COMPLETED: "COMPLETED",
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const ComplexStatus = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  REJECTED: "REJECTED",
  INACTIVE: "INACTIVE",
} as const;
export type ComplexStatus = (typeof ComplexStatus)[keyof typeof ComplexStatus];

export const RecurrenceType = {
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
} as const;
export type RecurrenceType =
  (typeof RecurrenceType)[keyof typeof RecurrenceType];

export const RecurringStatus = {
  ACTIVE: "ACTIVE",
  CANCELED: "CANCELED",
} as const;
export type RecurringStatus =
  (typeof RecurringStatus)[keyof typeof RecurringStatus];

// --- Interfaces ---

// 1. Base Interface (Những trường luôn có)
export interface ComplexBase {
  id: string;
  complex_name: string;
  complex_address: string;
  complex_image?: string;
  status: ComplexStatus;
  _count?: {
    sub_fields: number;
  };
}

// 2. Dùng cho danh sách (Get All)
export interface ComplexListItem extends ComplexBase {
  // Backend trả về created_at là string (ISO), không phải Date
  // created_at?: string;
}

// 3. Dùng cho chi tiết (Get Detail)
export interface ComplexDetail extends ComplexBase {
  _count: {
    sub_fields: number;
  };
  // created_at: string;
  // updated_at: string;
  sub_fields: SubField[];
}

// 4. SubField
export interface SubField {
  id: string;
  complex_id?: string;
  sub_field_name: string;
  capacity: number;
  sub_field_image?: string;
  sport_type: SportType;
  min_price?: number;
  pricing_rules: PricingRule[];
}

// 5. API Response Wrapper (Quan trọng)
export interface ApiResponse<T> {
  message: string;
  status: number;
  reason: string;
  data: T;
}

// Interfaces
export interface PricingRule {
  id: string;
  // sub_field_id: string;
  day_of_week: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time: string; // "HH:MM"
  end_time: string; // "HH:MM"
  base_price: number;
}

export interface SubfieldDetail {
  id: string;
  complex_id: string;
  sub_field_name: string;
  sport_type: SportType;
  sub_field_image?: string;
  capacity: number;
}

export interface Owner {
  id: string;
  account_id: string;
  company_name: string;
  stripe_account_id?: string;
  stripe_onboarding_complete: boolean;
  status: string;
}

export interface Complex {
  id: string;
  owner_id: string;
  owner?: Owner;
  complex_name: string;
  complex_address: string;
  status: ComplexStatus;
  complex_image?: string;
  verification_docs?: string[];
  sub_fields: SubField[];
  created_at: string;
  updated_at: string;
}

export interface RecurringBooking {
  id: string;
  player_id: string;
  sub_field_id: string;
  recurrence_type: RecurrenceType;
  recurrence_detail: {
    day_of_week: number;
    start_time: string;
    end_time: string;
  };
  start_date: string;
  end_date: string;
  status: RecurringStatus;
  created_at: string;
}

export interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: BookingStatus;
  player_id: string;
  sub_field_id: string;
  recurring_booking_id?: string;
  created_at: string;
  paid_at?: string;
  expires_at: string;
}

// Owner Booking Management
export interface OwnerBooking {
  id: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: BookingStatus;
  player: {
    account: {
      full_name: string;
      phone_number: string;
    };
  };
  sub_field: {
    sub_field_name: string;
    sport_type: SportType;
    complex: {
      complex_name: string;
      complex_address: string;
    };
  };
}

export interface OwnerBookingFilter {
  search?: string;
  status?: BookingStatus;
  start_date?: Date;
  end_date?: Date;
  min_price?: number;
  max_price?: number;
}

export interface OwnerBookingsResponse {
  bookings: OwnerBooking[];
  pagination: PaginationMeta;
}

// Search filters
export interface SearchFilters {
  location?: string;
  sport_type?: SportType;
  sport_types?: SportType[];
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  maxCapacity?: number;
  date?: string;
  start_time?: string;
  end_time?: string;
}

// Pagination metadata
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
