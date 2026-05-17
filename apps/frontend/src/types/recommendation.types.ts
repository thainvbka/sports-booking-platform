import type { SportType } from "./index";

export interface RecommendationSubfield {
  id: string;
  sub_field_name: string;
  sport_type: SportType;
  avg_rating: number | null;
  sub_field_image?: string;
  complex: {
    id: string;
    complex_name: string;
    complex_address: string;
  };
  price_min: number | null;
}

export interface RecommendationItem {
  sub_field_id: string;
  score: number;
  reason: string | null;
  sub_field?: RecommendationSubfield;
}

export interface RecommendationResponse {
  type: "PERSONALIZED" | "POPULAR";
  generated_at: string;
  items: RecommendationItem[];
}
