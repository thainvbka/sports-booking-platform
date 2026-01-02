import { api } from "@/lib/axios";

export interface AddRoleResponse {
  message: string;
}

export interface AddRoleRequest {
  role: "PLAYER" | "OWNER";
  company_name?: string;
}

export const accountService = {
  addRole: async (data: AddRoleRequest) => {
    const response = await api.post<AddRoleResponse>("/account/roles", data);
    return response.data;
  },
};
