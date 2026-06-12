import { api } from "@/lib/axios";
import type { AddRoleRequest, ApiResponse, AuthUserData } from "@/types";
import type { User } from "@/types/user.types";

export const accountService = {
  addRole: async (data: AddRoleRequest) => {
    const response = await api.post<ApiResponse<AuthUserData>>(
      "/account/roles",
      data,
    );
    return response.data;
  },

  updateProfile: async (data: FormData) => {
    const response = await api.put<ApiResponse<{ user: User }>>(
      "/account/profile",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },
};
