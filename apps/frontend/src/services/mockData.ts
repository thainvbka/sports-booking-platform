import type { Complex, SubField, PricingRule, SearchFilters } from "@/types";
import { SportType, ComplexStatus } from "@/types";

// Mock pricing rules
const generatePricingRules = (subFieldId: string): PricingRule[] => {
  const rules: PricingRule[] = [];

  // Weekday pricing (Monday-Friday)
  for (let day = 1; day <= 5; day++) {
    rules.push({
      id: `${subFieldId}-${day}-morning`,
      sub_field_id: subFieldId,
      day_of_week: day,
      start_time: "06:00",
      end_time: "12:00",
      base_price: 200000,
    });
    rules.push({
      id: `${subFieldId}-${day}-afternoon`,
      sub_field_id: subFieldId,
      day_of_week: day,
      start_time: "12:00",
      end_time: "18:00",
      base_price: 300000,
    });
    rules.push({
      id: `${subFieldId}-${day}-evening`,
      sub_field_id: subFieldId,
      day_of_week: day,
      start_time: "18:00",
      end_time: "22:00",
      base_price: 400000,
    });
  }

  // Weekend pricing (Saturday-Sunday)
  for (let day = 0; day <= 0; day++) {
    rules.push({
      id: `${subFieldId}-${day}-allday`,
      sub_field_id: subFieldId,
      day_of_week: day,
      start_time: "06:00",
      end_time: "22:00",
      base_price: 500000,
    });
  }
  rules.push({
    id: `${subFieldId}-6-allday`,
    sub_field_id: subFieldId,
    day_of_week: 6,
    start_time: "06:00",
    end_time: "22:00",
    base_price: 500000,
  });

  return rules;
};

// Mock complexes data
const mockComplexes: Complex[] = [
  {
    id: "1",
    owner_id: "owner-1",
    complex_name: "Sân Thể Thao Bình Thạnh",
    complex_address: "123 Đường Phan Văn Trị, Phường 5, Bình Thạnh, TP.HCM",
    status: ComplexStatus.ACTIVE,
    complex_image:
      "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=2070",
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
    complex_name: "Khu Liên Hợp Thể Thao Quận 1",
    complex_address: "456 Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM",
    status: ComplexStatus.ACTIVE,
    complex_image:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=2070",
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
    complex_name: "Sân Thể Thao Tân Phú",
    complex_address: "789 Tân Kỳ Tân Quý, Tân Phú, TP.HCM",
    status: ComplexStatus.ACTIVE,
    complex_image:
      "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=2070",
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
