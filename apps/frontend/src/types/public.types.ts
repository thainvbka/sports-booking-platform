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
