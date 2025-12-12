import type { Complex, SubField, PricingRule, SearchFilters } from "@/types";
import { SportType, ComplexStatus } from "@/types";

// Mock pricing rules
const generatePricingRules = (subFieldId: string): PricingRule[] => {
  const rules: PricingRule[] = [];

  // Generate 1-hour slots from 6:00 to 22:00 for each day
  for (let day = 0; day <= 6; day++) {
    for (let hour = 6; hour < 22; hour++) {
      const startTime = `${hour.toString().padStart(2, "0")}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;

      let price = 200000; // Default morning price

      // Weekend surcharge
      if (day === 0 || day === 6) {
        price += 50000;
      }

      // Peak hours (17:00 - 21:00)
      if (hour >= 17 && hour <= 20) {
        price += 100000;
      }

      rules.push({
        id: `${subFieldId}-${day}-${hour}`,
        sub_field_id: subFieldId,
        day_of_week: day,
        start_time: startTime,
        end_time: endTime,
        base_price: price,
      });
    }
  }

  return rules;
};

// Mock complexes data
const mockComplexes: Complex[] = [
  {
    id: "1",
    owner_id: "owner-1",
    complex_name: "Khu Phức Hợp Thể Thao Bách Khoa",
    complex_address: "số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
    status: ComplexStatus.ACTIVE,
    complex_image:
      "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=2070",
    verification_docs: [],
    sub_fields: [
      {
        id: "sf-1-1",
        complex_id: "1",
        sub_field_name: "Sân bóng đá 1",
        capacity: 22,
        sport_type: SportType.FOOTBALL,
        sub_field_image:
          "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=2071",
        pricing_rules: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "sf-1-2",
        complex_id: "1",
        sub_field_name: "Sân bóng đá 2",
        capacity: 14,
        sport_type: SportType.FOOTBALL,
        pricing_rules: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "sf-1-3",
        complex_id: "1",
        sub_field_name: "Sân tennis 1",
        capacity: 4,
        sport_type: SportType.TENNIS,
        sub_field_image:
          "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=2070",
        pricing_rules: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    owner_id: "owner-2",
    complex_name: "Khu Phức Hợp Thể Thao Bách Khoa",
    complex_address: "số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội ",
    status: ComplexStatus.ACTIVE,
    complex_image:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=2070",
    verification_docs: [],
    sub_fields: [
      {
        id: "sf-2-1",
        complex_id: "2",
        sub_field_name: "Sân bóng rổ A",
        capacity: 10,
        sport_type: SportType.BASKETBALL,
        sub_field_image:
          "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2090",
        pricing_rules: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "sf-2-2",
        complex_id: "2",
        sub_field_name: "Sân cầu lông 1",
        capacity: 4,
        sport_type: SportType.BADMINTON,
        sub_field_image:
          "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=2070",
        pricing_rules: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "sf-2-3",
        complex_id: "2",
        sub_field_name: "Sân cầu lông 2",
        capacity: 4,
        sport_type: SportType.BADMINTON,
        pricing_rules: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    owner_id: "owner-3",
    complex_name: "Khu Phức Hợp Thể Thao Bách Khoa",
    complex_address: "số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
    status: ComplexStatus.ACTIVE,
    complex_image:
      "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=2070",
    verification_docs: [],
    sub_fields: [
      {
        id: "sf-3-1",
        complex_id: "3",
        sub_field_name: "Sân bóng chuyền 1",
        capacity: 12,
        sport_type: SportType.VOLLEYBALL,
        sub_field_image:
          "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=2007",
        pricing_rules: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "sf-3-2",
        complex_id: "3",
        sub_field_name: "Sân pickleball 1",
        capacity: 4,
        sport_type: SportType.PICKLEBALL,
        pricing_rules: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Add pricing rules to all sub-fields
mockComplexes.forEach((complex) => {
  complex.sub_fields.forEach((subField) => {
    subField.pricing_rules = generatePricingRules(subField.id);
  });
});

// Service functions
export const getComplexes = (): Complex[] => {
  return mockComplexes.filter((c) => c.status === ComplexStatus.ACTIVE);
};

export const getComplexById = (id: string): Complex | undefined => {
  return mockComplexes.find((c) => c.id === id);
};

export const searchComplexes = (filters: SearchFilters): Complex[] => {
  let results = getComplexes();

  if (filters.location) {
    const searchTerm = filters.location.toLowerCase();
    results = results.filter(
      (c) =>
        c.complex_name.toLowerCase().includes(searchTerm) ||
        c.complex_address.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.sport_type) {
    results = results.filter((c) =>
      c.sub_fields.some((sf) => sf.sport_type === filters.sport_type)
    );
  }

  return results;
};

export const getAllSubFields = (): (SubField & {
  complex_name: string;
  complex_address: string;
})[] => {
  const allSubFields: (SubField & {
    complex_name: string;
    complex_address: string;
  })[] = [];
  mockComplexes.forEach((complex) => {
    if (complex.status === ComplexStatus.ACTIVE) {
      complex.sub_fields.forEach((sf) => {
        allSubFields.push({
          ...sf,
          complex_name: complex.complex_name,
          complex_address: complex.complex_address,
        });
      });
    }
  });
  return allSubFields;
};

export const searchSubFields = (
  filters: SearchFilters
): (SubField & { complex_name: string; complex_address: string })[] => {
  let results = getAllSubFields();

  if (filters.location) {
    const searchTerm = filters.location.toLowerCase();
    results = results.filter(
      (sf) =>
        sf.complex_name.toLowerCase().includes(searchTerm) ||
        sf.complex_address.toLowerCase().includes(searchTerm) ||
        sf.sub_field_name.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.sport_type) {
    results = results.filter((sf) => sf.sport_type === filters.sport_type);
  }

  return results;
};

export const getSportTypeLabel = (sportType: SportType): string => {
  const labels: Record<SportType, string> = {
    [SportType.FOOTBALL]: "Bóng đá",
    [SportType.BASKETBALL]: "Bóng rổ",
    [SportType.TENNIS]: "Tennis",
    [SportType.BADMINTON]: "Cầu lông",
    [SportType.VOLLEYBALL]: "Bóng chuyền",
    [SportType.PICKLEBALL]: "Pickleball",
  };
  return labels[sportType];
};

export const getPriceRange = (
  subField: SubField
): { min: number; max: number } => {
  const prices = subField.pricing_rules.map((r) => r.base_price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

// Mock Bookings
import { BookingStatus } from "@/types";
import type { Booking } from "@/types";

const mockBookings: Booking[] = [
  {
    id: "b-1",
    start_time: "2023-12-01T08:00:00Z",
    end_time: "2023-12-01T09:00:00Z",
    total_price: 200000,
    status: BookingStatus.COMPLETED,
    player_id: "player-1",
    sub_field_id: "sf-1-1",
    created_at: "2023-11-25T10:00:00Z",
    expires_at: "2023-11-25T10:15:00Z",
    paid_at: "2023-11-25T10:05:00Z",
  },
  {
    id: "b-2",
    start_time: "2023-12-05T18:00:00Z",
    end_time: "2023-12-05T20:00:00Z",
    total_price: 600000,
    status: BookingStatus.CONFIRMED,
    player_id: "player-1",
    sub_field_id: "sf-2-2",
    created_at: "2023-12-01T14:00:00Z",
    expires_at: "2023-12-01T14:15:00Z",
    paid_at: "2023-12-01T14:05:00Z",
  },
  {
    id: "b-3",
    start_time: "2023-12-10T07:00:00Z",
    end_time: "2023-12-10T09:00:00Z",
    total_price: 400000,
    status: BookingStatus.PENDING,
    player_id: "player-1",
    sub_field_id: "sf-3-1",
    created_at: "2023-12-09T08:00:00Z",
    expires_at: "2023-12-09T08:15:00Z",
  },
  {
    id: "b-4",
    start_time: "2023-12-12T19:00:00Z",
    end_time: "2023-12-12T20:00:00Z",
    total_price: 300000,
    status: BookingStatus.CANCELED,
    player_id: "player-1",
    sub_field_id: "sf-1-2",
    created_at: "2023-12-08T09:00:00Z",
    expires_at: "2023-12-08T09:15:00Z",
  },
];

export const getPlayerBookings = (
  playerId: string
): (Booking & {
  sub_field: SubField & { complex_name: string; complex_address: string };
})[] => {
  const allSubFields = getAllSubFields();
  return mockBookings
    .filter((b) => b.player_id === playerId)
    .map((b) => {
      const subField = allSubFields.find((sf) => sf.id === b.sub_field_id);
      if (!subField) throw new Error(`SubField ${b.sub_field_id} not found`);
      return { ...b, sub_field: subField };
    })
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
};

export const getOwnerBookings = (
  ownerId: string
): (Booking & { sub_field: SubField & { complex_name: string } })[] => {
  const ownerComplexes = mockComplexes.filter((c) => c.owner_id === ownerId);
  const ownerSubFieldIds = ownerComplexes.flatMap((c) =>
    c.sub_fields.map((sf) => sf.id)
  );

  const allSubFields = getAllSubFields();

  return mockBookings
    .filter((b) => ownerSubFieldIds.includes(b.sub_field_id))
    .map((b) => {
      const subField = allSubFields.find((sf) => sf.id === b.sub_field_id);
      if (!subField) throw new Error(`SubField ${b.sub_field_id} not found`);
      return { ...b, sub_field: subField };
    })
    .sort(
      (a, b) =>
        new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    );
};
