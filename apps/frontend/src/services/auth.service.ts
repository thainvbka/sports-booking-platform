import { api } from "@/lib/axios";
import type {
  ApiResponse,
  AuthUserData,
  ForgotPasswordData,
  RegisterData,
} from "@/types";
import type { loginInput, registerInput } from "../validations";

/**
 * Service for Authentication-related API calls
 * @author thainvbka
 *
 * @type {{ login: (data: loginInput) => unknown; register: (data: registerInput) => unknown; verifyEmail: (token: string) => unknown; logout: () => unknown; refreshToken: () => unknown; forgotPassword: (email: string) => unknown; resetPassword: (token: string, new_password: string) => unknown; getCurrentUser: () => unknown; }}
 */
export const authService = {
  login: async (data: loginInput) => {
    const response = await api.post<ApiResponse<AuthUserData>>(
      "/auth/login",
      data,
    );
    return response.data;
  },

  register: async (data: registerInput) => {
    const response = await api.post<ApiResponse<RegisterData>>(
      "/auth/signup",
      data,
    );
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await api.post<ApiResponse<AuthUserData>>(
      `/auth/verify-email/${token}`,
    );
    return response.data;
  },

  logout: async () => {
    const response = await api.post<ApiResponse<null>>("/auth/logout");
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post<ApiResponse<{ accessToken: string }>>(
      "/auth/refresh-token",
    );
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post<ApiResponse<ForgotPasswordData>>(
      "/auth/forgot-password",
      { email },
    );
    return response.data;
  },

  resetPassword: async (token: string, new_password: string) => {
    const response = await api.put<ApiResponse<null>>(
      `/auth/reset-password/${token}`,
      { new_password },
    );
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get<ApiResponse<AuthUserData>>("/auth/me");
    return response.data;
  },
};
