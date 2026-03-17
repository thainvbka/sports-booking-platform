import { authService } from "@/services/auth.service";
import type { ApiError, User } from "@/types";
import type { loginInput, registerInput } from "@/validations";
import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const ROLE_PRIORITY = {
  ADMIN: 3,
  OWNER: 2,
  PLAYER: 1,
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  currentRole: string | null;
  isLoading: boolean;
  error: string | null;
  login: (data: loginInput) => Promise<void>;
  register: (data: registerInput) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  verifyEmail: (token: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, new_password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      currentRole: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.login(data);
          const { user, accessToken } = res.data;
          localStorage.setItem("accessToken", accessToken);

          const sortedRoles = [...user.roles].sort((a, b) => {
            const pA = ROLE_PRIORITY[a as keyof typeof ROLE_PRIORITY] || 0;
            const pB = ROLE_PRIORITY[b as keyof typeof ROLE_PRIORITY] || 0;
            return pB - pA;
          });

          const defaultRole = sortedRoles[0] || "PLAYER";

          set({
            user,
            isAuthenticated: true,
            currentRole: defaultRole,
            isLoading: false,
          });
        } catch (error: unknown) {
          const apiError = error as ApiError;
          set({
            error: apiError?.message || "Đăng nhập thất bại",
            isLoading: false,
          });
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await authService.register(data);
          set({ isLoading: false });
        } catch (error: unknown) {
          const apiError = error as ApiError;
          set({
            error: apiError?.message || "Đăng ký thất bại",
            isLoading: false,
          });
        }
      },

      verifyEmail: async (token: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.verifyEmail(token);
          const { user, accessToken } = res.data;

          localStorage.setItem("accessToken", accessToken);

          const sortedRoles = [...user.roles].sort((a, b) => {
            const pA = ROLE_PRIORITY[a as keyof typeof ROLE_PRIORITY] || 0;
            const pB = ROLE_PRIORITY[b as keyof typeof ROLE_PRIORITY] || 0;
            return pB - pA;
          });
          const defaultRole = sortedRoles[0] || "PLAYER";

          set({
            user,
            isAuthenticated: true,
            currentRole: defaultRole,
            isLoading: false,
          });
        } catch (error: unknown) {
          const apiError = error as ApiError;
          set({
            error: apiError?.message || "Xác thực thất bại",
            isLoading: false,
          });
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await authService.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          localStorage.removeItem("accessToken");
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            currentRole: null,
          });
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.forgotPassword(email);
          toast.success(
            res.message || "Yêu cầu thành công. Vui lòng kiểm tra email.",
          );
          set({ isLoading: false });
        } catch (error: unknown) {
          const apiError = error as ApiError;
          set({
            error: apiError?.message || "Yêu cầu thất bại",
            isLoading: false,
          });
        }
      },

      resetPassword: async (token: string, new_password: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.resetPassword(token, new_password);
          toast.success(res.message || "Đặt lại mật khẩu thành công.");
          set({ isLoading: false });
        } catch (error: unknown) {
          const apiError = error as ApiError;
          set({
            error: apiError?.message || "Đặt lại mật khẩu thất bại",
            isLoading: false,
          });
        }
      },

      refreshUser: async () => {
        try {
          const res = await authService.getCurrentUser();
          const { user } = res.data;

          const sortedRoles = [...user.roles].sort((a, b) => {
            const pA = ROLE_PRIORITY[a as keyof typeof ROLE_PRIORITY] || 0;
            const pB = ROLE_PRIORITY[b as keyof typeof ROLE_PRIORITY] || 0;
            return pB - pA;
          });

          const defaultRole = sortedRoles[0] || "PLAYER";

          set({
            user,
            isAuthenticated: true,
            currentRole: defaultRole,
          });
        } catch (error: unknown) {
          console.error("Failed to refresh user:", error);
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
