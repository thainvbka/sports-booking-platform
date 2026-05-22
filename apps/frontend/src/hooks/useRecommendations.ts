import { recommendationService } from "@/services/recommendation.service";
import { useAuthStore } from "@/store/useAuthStore";
import type { RecommendationResponse } from "@/types";
import { useEffect } from "react";
import { create } from "zustand";

// 1. Global Zustand Store for caching recommendation data across page navigations
interface RecommendationState {
  data: RecommendationResponse | null;
  loading: boolean;
  error: boolean;
  fetched: boolean;
  fetchRecommendations: () => Promise<void>;
  clearRecommendations: () => void;
}

const useRecommendationStore = create<RecommendationState>((set, get) => ({
  data: null,
  loading: false,
  error: false,
  fetched: false,

  fetchRecommendations: async () => {
    if (get().loading) return;

    set({ loading: true, error: false });
    try {
      const res = await recommendationService.getMyRecommendations();
      set({ data: res.data, error: false, fetched: true });
    } catch {
      set({ error: true, data: null });
    } finally {
      set({ loading: false });
    }
  },

  clearRecommendations: () => {
    set({ data: null, error: false, fetched: false, loading: false });
  },
}));

// 2. Unified Custom Hook used by both RecommendedCourts (Grid) and RecommendedCourtsBanner (Carousel)
interface UseRecommendationsResult {
  data: RecommendationResponse | null;
  loading: boolean;
  error: boolean;
  refetch: () => void;
}

export function useRecommendations(): UseRecommendationsResult {
  const { data, loading, error, fetched, fetchRecommendations, clearRecommendations } =
    useRecommendationStore();

  const { isAuthenticated, currentRole } = useAuthStore();
  const isPlayer = isAuthenticated && currentRole === "PLAYER";

  // Reactive fetch: triggers when user logs in or role switches to player
  useEffect(() => {
    if (isPlayer && !fetched && !loading) {
      fetchRecommendations();
    }
  }, [isPlayer, fetched, loading, fetchRecommendations]);

  // Secure cleanup: clears cache when user logs out or role changes
  useEffect(() => {
    if (!isPlayer) {
      clearRecommendations();
    }
  }, [isPlayer, clearRecommendations]);

  return {
    data,
    loading,
    error,
    refetch: fetchRecommendations,
  };
}
