import { api } from "@/lib/axios";
import type { AddRoleRequest, ApiResponse, AuthUserData } from "@/types";

export const accountService = {
  addRole: async (data: AddRoleRequest) => {
    const response = await api.post<ApiResponse<AuthUserData>>(
      "/account/roles",
      data,
    );
    return response.data;
  },
};
