import { Schema, Type } from "@google/genai";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { generateRecommendationRerank } from "../../libs/gemini";
import { InternalServerError } from "../../utils/error.response";

export interface UserProfileSummary {
  player_id: string;
  recent_bookings_count: number;
  favorite_sport: string;
  preferred_time: string;
  preferred_days: string;
  average_price: string;
  preferred_district: string;
  average_rating: string;
  current_context: {
    time: string;
    day_of_week: string;
    is_weekend: boolean;
  };
}

export interface RerankCandidate {
  id: string;
  name: string;
  complex_name: string;
  district: string;
  sport_type: string;
  avg_rating: Prisma.Decimal | number | null;
  price_min: Prisma.Decimal | number;
  similarity_score: number;
}

export const recommendationRerankZodSchema = z.object({
  items: z.array(
    z.object({
      sub_field_id: z.string(),
      score: z.number().min(0).max(1),
      reason: z.string().nullable(),
    }),
  ),
});

export type RerankedItem = z.infer<
  typeof recommendationRerankZodSchema
>["items"][0];

// The schema format expected by @google/genai structured outputs
const geminiJsonSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      description: "Danh sách 10 sân được gợi ý phù hợp nhất",
      items: {
        type: Type.OBJECT,
        properties: {
          sub_field_id: { type: Type.STRING },
          score: {
            type: Type.NUMBER,
            description: "Điểm phù hợp từ 0.0 đến 1.0",
          },
          reason: {
            type: Type.STRING,
            description:
              "Lý do ngắn gọn bằng tiếng Việt vì sao sân này phù hợp",
          },
        },
        required: ["sub_field_id", "score", "reason"],
      },
    },
  },
  required: ["items"],
};

export const buildRerankPrompt = (
  userProfile: UserProfileSummary,
  candidates: RerankCandidate[],
): string => {
  const cleanCandidates = candidates.map((c) => ({
    sub_field_id: c.id,
    sub_field_name: c.name,
    complex_name: c.complex_name,
    district: c.district,
    sport_type: c.sport_type,
    avg_rating: c.avg_rating ? Number(c.avg_rating) : null,
    price_per_hour: `${Number(c.price_min).toLocaleString("vi-VN")} đ`,
    similarity_score: Math.round(c.similarity_score * 100) / 100,
  }));

  return `
Bạn là một chuyên gia gợi ý sân thể thao thông minh. Nhiệm vụ của bạn là sắp xếp lại (rerank) danh sách các sân (candidates) dựa trên hồ sơ thói quen của người chơi và ngữ cảnh tìm kiếm hiện tại, chọn ra top 10 sân phù hợp nhất theo thứ tự từ cao xuống thấp. Trả về JSON đúng cấu trúc yêu cầu.

Hồ sơ người chơi & Ngữ cảnh hiện tại:
${JSON.stringify(userProfile, null, 2)}

Danh sách sân ứng viên (đã được tìm kiếm tương đồng véc-tơ ban đầu):
${JSON.stringify(cleanCandidates, null, 2)}

Nguyên tắc sắp xếp lại (Reranking rules):
1. Ưu tiên cao nhất cho sân có môn thể thao (sport_type) trùng với môn yêu thích (favorite_sport) của người chơi.
2. Đánh giá sự tương thích về mặt địa lý (district vs preferred_district). Ưu tiên các sân cùng quận hoặc lân cận.
3. So sánh mức giá (price_per_hour) với ngân sách trung bình (average_price) của người chơi. Ưu tiên sân có mức giá tương đương hoặc rẻ hơn.
4. Đánh giá tính chất thời gian thực: Đối chiếu ngày hiện tại (day_of_week) và giờ hiện tại (time) với thói quen của người chơi (preferred_time, preferred_days) để đưa ra đề xuất phù hợp.
5. Cân nhắc điểm số tương đồng gốc (similarity_score) và điểm đánh giá trung bình (avg_rating) của sân.

Lý do gợi ý (reason): Phải viết cực kỳ tự nhiên, bằng tiếng Việt, tối đa 80 ký tự. Giải thích rõ tại sao sân này phù hợp với họ (ví dụ: "Phù hợp ngân sách và đúng môn Cầu lông yêu thích của bạn", "Nằm tại ${userProfile.preferred_district} gần khu vực bạn thường chơi", "Sân có đánh giá cao (${userProfile.average_rating} sao) thích hợp chơi cuối tuần"). KHÔNG được viết lý do chung chung theo kiểu khuôn mẫu AI.
`;
};

export const rerankWithGemini = async (
  userProfile: UserProfileSummary,
  candidates: RerankCandidate[],
): Promise<RerankedItem[]> => {
  const prompt = buildRerankPrompt(userProfile, candidates);

  try {
    const jsonStr = await generateRecommendationRerank(
      prompt,
      geminiJsonSchema,
    );
    const parsed = JSON.parse(jsonStr);

    // Validate schema
    const validated = recommendationRerankZodSchema.parse(parsed);

    if (!validated.items || validated.items.length === 0) {
      throw new InternalServerError("Empty items returned from Gemini");
    }

    // Make sure we only return top 10
    return validated.items.slice(0, 10);
  } catch (error) {
    console.error("Gemini reranking failed:", error);
    throw error;
  }
};
