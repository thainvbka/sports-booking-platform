import { api } from "@/lib/axios";
import type { ApiResponse, ReviewItem } from "@/types";

export const reviewService = {
  createReview: async (formData: FormData) => {
    const response = await api.post<ApiResponse<{ review: ReviewItem }>>(
      "/reviews",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  },
};
