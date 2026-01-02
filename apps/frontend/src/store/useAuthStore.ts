import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/auth.service";
import type {
  loginInput,
  registerInput,
} from "@sports-booking-platform/validation";
import { set } from "react-hook-form";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  avatar?: string;
  roles: string[];
  profiles?: any;
}

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
  verifyEmail: (token: string) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (token: string, new_password: string) => Promise<any>;
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
          const response = await authService.login(data);
          const { user, accessToken } = response.data;
          localStorage.setItem("accessToken", accessToken);

          // Sắp xếp role theo độ ưu tiên: ADMIN > OWNER > PLAYER
          const sortedRoles = user.roles.sort((a: string, b: string) => {
            const pA = ROLE_PRIORITY[a as keyof typeof ROLE_PRIORITY] || 0;
            const pB = ROLE_PRIORITY[b as keyof typeof ROLE_PRIORITY] || 0;
            return pB - pA; // Giảm dần
          });

          // Chọn role cao nhất làm mặc định
          const defaultRole = sortedRoles[0] || "PLAYER";

          set({
            user,
            isAuthenticated: true,
            currentRole: defaultRole,
            isLoading: false,
          });
        } catch (error: any) {
          let message = "Login failed";
          if (error.response) {
            if (error.response.status === 401) {
              message =
                error.response.data?.message ||
                "Tài khoản chưa được kích hoạt hoặc thông tin không đúng";
            } else if (error.response.status === 429) {
              message =
                "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau.";
            } else {
              message =
                error.response.data?.message || "Đã xảy ra lỗi khi đăng nhập";
            }
          }
          set({
            error: message,
            isLoading: false,
          });
          throw error;
        }
      },
      // Hàm cho phép user tự chuyển đổi giao diện
      // switchRole: (role: string) => {
      //   const { user } = get();
      //   if (user && user.roles.includes(role)) {
      //     set({ currentRole: role });
      //     // Lưu ý: Việc điều hướng (navigate) sẽ thực hiện ở Component gọi hàm này
      //   }
      // },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await authService.register(data);

          // localStorage.setItem("accessToken", accessToken);
          // set({ user, isAuthenticated: true, isLoading: false });
          set({ isLoading: false });

          // return response;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Đăng ký thất bại",
            isLoading: false,
          });
          throw error;
        }
      },

      verifyEmail: async (token: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.verifyEmail(token);
          const { user, accessToken } = response.data;

          // Lưu token và set state user
          localStorage.setItem("accessToken", accessToken);

          // Logic sắp xếp role (copy từ hàm login)
          const sortedRoles = user.roles.sort((a: string, b: string) => {
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

          return user;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Xác thực thất bại",
            isLoading: false,
          });
          throw error;
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
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await authService.forgotPassword(email);
          toast.success(
            result.message || "Yêu cầu thành công. Vui lòng kiểm tra email."
          );
          set({ isLoading: false });
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Yêu cầu thất bại");
          set({
            error: error.response?.data?.message || "Yêu cầu thất bại",
            isLoading: false,
          });
          throw error;
        }
      },
      resetPassword: async (token: string, new_password: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await authService.resetPassword(token, new_password);
          toast.success(
            result.message || "Đặt lại mật khẩu thành công. Vui lòng đăng nhập."
          );
          set({ isLoading: false });
        } catch (error: any) {
          toast.error(
            error.response?.data?.message || "Đặt lại mật khẩu thất bại"
          );
          set({
            error: error.response?.data?.message || "Đặt lại mật khẩu thất bại",
            isLoading: false,
          });
          throw error;
        }
      },

      refreshUser: async () => {
        try {
          const response = await authService.getCurrentUser();
          const { user } = response.data;

          // Sắp xếp role theo độ ưu tiên: ADMIN > OWNER > PLAYER
          const sortedRoles = user.roles.sort((a: string, b: string) => {
            const pA = ROLE_PRIORITY[a as keyof typeof ROLE_PRIORITY] || 0;
            const pB = ROLE_PRIORITY[b as keyof typeof ROLE_PRIORITY] || 0;
            return pB - pA;
          });

          // Chọn role cao nhất làm mặc định
          const defaultRole = sortedRoles[0] || "PLAYER";

          set({
            user,
            isAuthenticated: true,
            currentRole: defaultRole,
          });
        } catch (error: any) {
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
    }
  )
);
