import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/auth.service";
import type {
  loginInput,
  registerInput,
} from "@sports-booking-platform/validation";

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
          set({
            error: error.response?.data?.message || "Login failed",
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
          const response = await authService.register(data);
          const { user, accessToken } = response.data;
          localStorage.setItem("accessToken", accessToken);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Registration failed",
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
