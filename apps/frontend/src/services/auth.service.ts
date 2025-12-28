import { api } from "@/lib/axios";
import type {
  loginInput,
  registerInput,
} from "@sports-booking-platform/validation";

export interface AuthResponse {
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      full_name: string;
      phone_number: string;
      avatar?: string;
      roles: string[];
    };
    accessToken: string;
  };
}

export interface RegisterResponse {
  message: string;
  data: {
    // user: {
    //   id: string;
    //   email: string;
    //   full_name: string;
    //   phone_number: string;
    //   avatar?: string;
    //   roles: string[];
    // };
    // accessToken: string;
    needVerify: boolean;
  };
}

export const authService = {
  login: async (data: loginInput) => {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  register: async (data: registerInput) => {
    // Backend expects 'signup' but standard is often register. Checking routes...
    // Routes say: router.post("/signup", ...)
    const response = await api.post<RegisterResponse>("/auth/signup", data);
    return response.data;
  },

  verifyEmail: async (token: string) => {
    //token gửi ở query param
    const response = await api.post<AuthResponse>(
      `/auth/verify-email?token=${token}`
    );
    return response.data;
  },

  logout: async () => {
    await api.post("/auth/logout");
  },

  refreshToken: async () => {
    const response = await api.post<{ data: { accessToken: string } }>(
      "/auth/refresh-token"
    );
    return response.data;
  },
};
