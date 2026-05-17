import { api } from "@/lib/axios";
import type { ApiResponse, RecommendationResponse } from "@/types";

export const recommendationService = {
  getMyRecommendations: async () => {
    const response = await api.get<ApiResponse<RecommendationResponse>>(
      "/recommendations",
    );
    return response.data;
  },
};
