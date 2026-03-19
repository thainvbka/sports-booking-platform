import type { ApiResponse } from "@/types";
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: {
    indexes: null,
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    // Backend returns { success: boolean, ... }
    const res = response.data as ApiResponse<unknown>;

    // Handle case where backend returns 200 but success is false
    if (res && res.success === false) {
      console.log(res.message);

      return Promise.reject(res);
    }

    return response;
  },
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const data = error.response?.data;

    // 1. Handle specialized 401 (e.g. account not activated)
    if (
      error.response?.status === 401 &&
      data?.message ===
        "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email của bạn."
    ) {
      return Promise.reject(data);
    }

    // 2. Handle Token Refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true },
        );

        const { accessToken } = response.data.data;
        localStorage.setItem("accessToken", accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }

    // 3. Global Error Toast
    // Don't show toast for 401 because it's handled by refresh logic or redirect
    if (error.response?.status !== 401) {
      const errorMessage = data?.message || "Lỗi kết nối máy chủ";
      toast.error(errorMessage);
    }

    return Promise.reject(data || error);
  },
);
