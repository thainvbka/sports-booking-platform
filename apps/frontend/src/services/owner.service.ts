import { api } from "@/lib/axios";
import type { ComplexListItem, ComplexDetail, ApiResponse } from "@/types";

//payload and response types
interface GetOwnerComplexesResponse {
  complexes: ComplexListItem[];
}

interface GetOwnerComplexByIdResponse {
  complex: ComplexDetail;
}

interface CreateComplexResponse {
  complex: ComplexListItem;
}

export const ownerService = {
  //complexes
  getComplexes: async () => {
    const response = await api.get<ApiResponse<GetOwnerComplexesResponse>>(
      "/complexes"
    );
    return response.data;
  },
  getComplexById: async (id: string) => {
    const response = await api.get<ApiResponse<GetOwnerComplexByIdResponse>>(
      `/complexes/${id}`
    );
    return response.data;
  },
  createComplex: async (formData: FormData) => {
    const response = await api.post<ApiResponse<CreateComplexResponse>>(
      "/complexes",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
};
