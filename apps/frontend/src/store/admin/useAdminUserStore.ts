import { adminService } from "@/services/admin.service";
import type { AdminUser } from "@/types/admin.types";
import type { PaginationMeta } from "@/types/index";
import { create } from "zustand";

interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
}

interface AdminUserState {
  users: AdminUser[];
  pagination: PaginationMeta | null;
  queryParams: {
    page: number;
    limit: number;
  };
  filters: UserFilters;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchUsers: () => Promise<void>;
  setFilters: (filters: Partial<UserFilters>) => void;
  setPage: (page: number) => void;
  updateUserStatus: (id: string, role: string, status: string) => Promise<void>;
}

export const useAdminUserStore = create<AdminUserState>((set, get) => ({
  users: [],
  pagination: null,
  queryParams: {
    page: 1,
    limit: 10,
  },
  filters: {},
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    const { queryParams, filters } = get();
    try {
      const res = await adminService.getUsers({
        page: queryParams.page,
        limit: queryParams.limit,
        ...filters,
      });
      if (res.success) {
        set({
          users: res.data.users,
          pagination: res.data.pagination,
          isLoading: false,
        });
      } else {
        set({ error: res.message, isLoading: false });
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch users",
        isLoading: false,
      });
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      queryParams: { ...state.queryParams, page: 1 },
    }));
    get().fetchUsers();
  },

  setPage: (page: number) => {
    set((state) => ({
      queryParams: { ...state.queryParams, page },
    }));
    get().fetchUsers();
  },

  updateUserStatus: async (id, role, status) => {
    set({ isLoading: true });
    try {
      const res = await adminService.updateUserStatus(id, role, status);
      if (res.success) {
        await get().fetchUsers();
      } else {
        throw new Error(res.message);
      }
    } catch (error: any) {
      set({ error: error.message || "Failed to update user status" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
