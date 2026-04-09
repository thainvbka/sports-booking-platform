import type { Complex, PaginationMeta, SubField } from "./index";

export interface GetPublicComplexesResponse {
  complexes: Complex[];
  pagination: PaginationMeta;
}

export interface GetPublicComplexByIdResponse {
  complex: Complex;
  pagination: PaginationMeta;
}

export interface PublicSubfield extends SubField {
  complex_name?: string;
  complex_address?: string;
}

export interface GetPublicSubfieldsResponse {
  subfields: PublicSubfield[];
  pagination: PaginationMeta;
}

export interface PublicSubfieldDetail
  extends Omit<SubField, "pricing_rules" | "complex_id"> {
  pricing_rules: SubField["pricing_rules"];
  complex: {
    id: string;
    complex_name: string;
    complex_address: string;
  };
}

export interface BookingSlot {
  start: string;
  end: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED";
  expiresAt: string | null;
}

export interface SubfieldAvailabilityResponse {
  date: string;
  bookings: BookingSlot[];
}

export interface PublicSubfieldReview {
  id: string;
  booking_id: string;
  player_id: string;
  subfield_id: string;
  rating: number;
  comment?: string | null;
  images: string[];
  created_at: string;
  updated_at: string;
  player: {
    account: {
      full_name: string;
      avatar?: string | null;
    };
  };
}

export interface GetSubfieldReviewsResponse {
  reviews: PublicSubfieldReview[];
  pagination: PaginationMeta;
}

export interface GetSubfieldReviewsParams {
  page?: number;
  limit?: number;
  rating?: number;
  has_images?: boolean;
  sort_by?: "newest" | "oldest" | "rating_desc" | "rating_asc";
}

export interface SubfieldProduct {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  image?: string | null;
  sport_type?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface GetSubfieldProductsResponse {
  products: SubfieldProduct[];
}
