import { Schema, Type } from "@google/genai";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { generateRecommendationRerank } from "../../libs/gemini";
import { InternalServerError } from "../../utils/error.response";

export interface UserProfileSummary {
  player_id: string;
  recent_bookings_count: number;
  feature_vector: number[];
  summary: string;
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
      description: "Danh sách 5 sân được gợi ý phù hợp nhất",
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
  return `
Bạn là một chuyên gia gợi ý sân thể thao thông minh. Nhiệm vụ của bạn là sắp xếp lại (rerank) danh sách các sân (candidates) dựa trên hồ sơ của người chơi, và chọn ra 5 sân phù hợp nhất. Trả về JSON đúng cấu trúc yêu cầu.
Lý do (reason) phải cực kỳ ngắn gọn, tiếng Việt, tối đa 80 ký tự, giải thích chính xác tại sao chọn sân này (ví dụ: "Cùng môn yêu thích và phù hợp ngân sách của bạn", "Gần khu vực bạn hay đặt", "Sân có đánh giá rất tốt").

Hồ sơ người chơi:
${JSON.stringify(userProfile, null, 2)}

Danh sách ứng viên (đã được lọc ban đầu):
${JSON.stringify(candidates, null, 2)}
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
