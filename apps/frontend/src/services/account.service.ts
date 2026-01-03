import { api } from "@/lib/axios";

export interface AddRoleResponse {
  message: string;
  data: {
    accessToken: string;
    user: {
      id: string;
      email: string;
      full_name: string;
      phone_number: string;
      avatar?: string;
      roles: string[];
      profiles: any;
    };
  };
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
