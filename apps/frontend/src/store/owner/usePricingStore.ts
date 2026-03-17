import { ownerService } from "@/services/owner.service";
import type { ApiError, PricingRule } from "@/types";
import { create } from "zustand";

interface PricingState {
  pricingRules: PricingRule[];
  dayOfWeek: number | null;
  isLoading: boolean;
  error: string | null;

  setDayOfWeek: (day: number) => void;

  // Actions Fetching
  fetchPricingRules: (subFieldId: string, dayOfWeek: number) => Promise<void>;

  // Actions Mutations
  addPricingRule: (
    subFieldId: string,
    daysOfWeek: number[],
    data: {
      time_slots: {
        start_time: string;
        end_time: string;
        base_price: number;
      }[];
    },
  ) => Promise<void>;

  updatePricingRule: (
    ruleId: string,
    subFieldId: string,
    dayOfWeek: number,
    data: {
      day_of_week?: number;
      start_time?: string;
      end_time?: string;
      base_price?: number;
    },
  ) => Promise<void>;

  deletePricingRule: (
    ruleId: string,
    subFieldId: string,
    dayOfWeek: number,
  ) => Promise<void>;

  bulkDeletePricingRules: (
    ruleIds: string[],
    subFieldId: string,
    dayOfWeek: number,
  ) => Promise<void>;

  copyPricingRules: (
    subFieldId: string,
    sourceDay: number,
    targetDays: number[],
  ) => Promise<void>;
}

export const usePricingStore = create<PricingState>((set, get) => ({
  pricingRules: [],
  dayOfWeek: null,
  isLoading: false,
  error: null,

  setDayOfWeek: (day: number) => {
    set({ dayOfWeek: day });
  },

  fetchPricingRules: async (subFieldId: string, dayOfWeek: number) => {
    set({ isLoading: true, error: null });
    try {
      const res = await ownerService.getPricingRules(subFieldId, dayOfWeek);
      set({ pricingRules: res.data, isLoading: false });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        error: apiError?.message || "Failed to fetch pricing rules",
        isLoading: false,
        pricingRules: [],
      });
    }
  },

  addPricingRule: async (
    subFieldId: string,
    daysOfWeek: number[],
    data: {
      time_slots: {
        start_time: string;
        end_time: string;
        base_price: number;
      }[];
    },
  ) => {
    set({ isLoading: true, error: null });
    try {
      const payload = {
        sub_field_id: subFieldId,
        day_of_week: daysOfWeek,
        time_slots: data.time_slots,
      };
      await ownerService.createPricingRules(payload);
      set({ isLoading: false });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        error: apiError?.message || "Failed to add pricing rule",
        isLoading: false,
      });
    }
  },

  updatePricingRule: async (
    ruleId: string,
    subFieldId: string,
    dayOfWeek: number,
    data: {
      day_of_week?: number;
      start_time?: string;
      end_time?: string;
      base_price?: number;
    },
  ) => {
    set({ isLoading: true, error: null });
    try {
      await ownerService.updatePricingRule(ruleId, {
        sub_field_id: subFieldId,
        ...data,
      });
      await get().fetchPricingRules(subFieldId, dayOfWeek);
      set({ isLoading: false });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        error: apiError?.message || "Failed to update pricing rule",
        isLoading: false,
      });
    }
  },

  deletePricingRule: async (
    ruleId: string,
    subFieldId: string,
    dayOfWeek: number,
  ) => {
    set({ isLoading: true, error: null });
    try {
      await ownerService.deletePricingRule(ruleId);
      await get().fetchPricingRules(subFieldId, dayOfWeek);
      set({ isLoading: false });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        error: apiError?.message || "Failed to delete pricing rule",
        isLoading: false,
      });
    }
  },

  bulkDeletePricingRules: async (
    ruleIds: string[],
    subFieldId: string,
    dayOfWeek: number,
  ) => {
    set({ isLoading: true, error: null });
    try {
      await ownerService.bulkDeletePricingRules(ruleIds);
      await get().fetchPricingRules(subFieldId, dayOfWeek);
      set({ isLoading: false });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        error: apiError?.message || "Failed to bulk delete pricing rules",
        isLoading: false,
      });
    }
  },

  copyPricingRules: async (
    subFieldId: string,
    sourceDay: number,
    targetDays: number[],
  ) => {
    set({ isLoading: true, error: null });
    try {
      await ownerService.copyPricingRules(subFieldId, sourceDay, targetDays);
      set({ isLoading: false });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        error: apiError?.message || "Failed to copy pricing rules",
        isLoading: false,
      });
    }
  },
}));
