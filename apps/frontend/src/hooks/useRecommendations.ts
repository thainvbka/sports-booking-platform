import { recommendationService } from "@/services/recommendation.service";
import { useAuthStore } from "@/store/useAuthStore";
import type { RecommendationResponse } from "@/types";
import { useCallback, useEffect, useState } from "react";

interface UseRecommendationsResult {
  data: RecommendationResponse | null;
  loading: boolean;
  error: boolean;
  refetch: () => void;
}

export function useRecommendations(): UseRecommendationsResult {
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const { isAuthenticated, currentRole } = useAuthStore();
  const isPlayer = isAuthenticated && currentRole === "PLAYER";

  const fetchRecommendations = useCallback(async () => {
    if (!isPlayer) return;

    setLoading(true);
    setError(false);

    try {
      const res = await recommendationService.getMyRecommendations();
      setData(res.data);
    } catch {
      setError(true);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [isPlayer]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    data,
    loading,
    error,
    refetch: fetchRecommendations,
  };
}
