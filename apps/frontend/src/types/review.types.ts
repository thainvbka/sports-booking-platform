export interface CreateReviewPayload {
  booking_id: string;
  rating: number;
  comment?: string;
}

export interface ReviewItem {
  id: string;
  booking_id: string;
  player_id: string;
  subfield_id: string;
  rating: number;
  comment?: string | null;
  images: string[];
  created_at: string;
  updated_at: string;
}
