import { publicService } from "@/services/public.service";
import type { GetSubfieldReviewsResponse, PublicSubfieldReview } from "@/types";
import { useCallback, useEffect, useState } from "react";

export type ReviewRatingFilter = "all" | "1" | "2" | "3" | "4" | "5";
export type ReviewSortBy = "newest" | "oldest" | "rating_desc" | "rating_asc";

type ReviewRatingCounts = Record<1 | 2 | 3 | 4 | 5, number>;

interface ReviewSummary {
  total: number;
  average: number;
  counts: ReviewRatingCounts;
}

interface UseSubfieldReviewsOptions {
  subfieldId?: string;
  pageSize?: number;
  initialSortBy?: ReviewSortBy;
  initialRatingFilter?: ReviewRatingFilter;
  initialHasImagesOnly?: boolean;
}

interface UseSubfieldReviewsResult {
  reviews: PublicSubfieldReview[];
  pagination: GetSubfieldReviewsResponse["pagination"] | null;
  summary: ReviewSummary;
  isReviewsLoading: boolean;
  ratingFilter: ReviewRatingFilter;
  hasImagesOnly: boolean;
  sortBy: ReviewSortBy;
  setPage: (nextPage: number) => void;
  setRatingFilter: (value: ReviewRatingFilter) => void;
  setHasImagesOnly: (value: boolean) => void;
  setSortBy: (value: ReviewSortBy) => void;
}

const DEFAULT_COUNTS: ReviewRatingCounts = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
};

export function useSubfieldReviews({
  subfieldId,
  pageSize = 6,
  initialSortBy = "newest",
  initialRatingFilter = "all",
  initialHasImagesOnly = false,
}: UseSubfieldReviewsOptions): UseSubfieldReviewsResult {
  const [reviews, setReviews] = useState<PublicSubfieldReview[]>([]);
  const [pagination, setPagination] =
    useState<GetSubfieldReviewsResponse["pagination"] | null>(null);

  const [summary, setSummary] = useState<ReviewSummary>({
    total: 0,
    average: 0,
    counts: DEFAULT_COUNTS,
  });

  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [ratingFilter, setRatingFilterState] =
    useState<ReviewRatingFilter>(initialRatingFilter);
  const [hasImagesOnly, setHasImagesOnlyState] = useState(initialHasImagesOnly);
  const [sortBy, setSortByState] = useState<ReviewSortBy>(initialSortBy);
  const [page, setPageState] = useState(1);

  const setPage = useCallback((nextPage: number) => {
    setPageState(Math.max(1, nextPage));
  }, []);

  const setRatingFilter = useCallback((value: ReviewRatingFilter) => {
    setRatingFilterState(value);
    setPageState(1);
  }, []);

  const setHasImagesOnly = useCallback((value: boolean) => {
    setHasImagesOnlyState(value);
    setPageState(1);
  }, []);

  const setSortBy = useCallback((value: ReviewSortBy) => {
    setSortByState(value);
    setPageState(1);
  }, []);

  const refetchReviews = useCallback(async () => {
    if (!subfieldId) {
      setReviews([]);
      setPagination(null);
      return;
    }

    setIsReviewsLoading(true);

    try {
      const response = await publicService.getSubfieldReviews(subfieldId, {
        page,
        limit: pageSize,
        sort_by: sortBy,
        rating: ratingFilter === "all" ? undefined : Number(ratingFilter),
        has_images: hasImagesOnly || undefined,
      });

      setReviews(response.data.reviews || []);
      setPagination(response.data.pagination || null);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
      setReviews([]);
      setPagination(null);
    } finally {
      setIsReviewsLoading(false);
    }
  }, [subfieldId, page, pageSize, sortBy, ratingFilter, hasImagesOnly]);

  const refetchSummary = useCallback(async () => {
    if (!subfieldId) {
      setSummary({
        total: 0,
        average: 0,
        counts: DEFAULT_COUNTS,
      });
      return;
    }

    try {
      const ratingRequests = [1, 2, 3, 4, 5].map((rating) =>
        publicService.getSubfieldReviews(subfieldId, {
          rating,
          page: 1,
          limit: 1,
          sort_by: "newest",
        }),
      );

      const results = await Promise.all(ratingRequests);
      const counts: ReviewRatingCounts = {
        1: results[0].data.pagination.total,
        2: results[1].data.pagination.total,
        3: results[2].data.pagination.total,
        4: results[3].data.pagination.total,
        5: results[4].data.pagination.total,
      };

      const total = counts[1] + counts[2] + counts[3] + counts[4] + counts[5];
      const weightedTotal =
        counts[1] * 1 +
        counts[2] * 2 +
        counts[3] * 3 +
        counts[4] * 4 +
        counts[5] * 5;

      setSummary({
        total,
        average: total > 0 ? weightedTotal / total : 0,
        counts,
      });
    } catch (error) {
      console.error("Failed to fetch review summary", error);
      setSummary({
        total: 0,
        average: 0,
        counts: DEFAULT_COUNTS,
      });
    }
  }, [subfieldId]);

  useEffect(() => {
    refetchReviews();
  }, [refetchReviews]);

  useEffect(() => {
    refetchSummary();
  }, [refetchSummary]);

  return {
    reviews,
    pagination,
    summary,
    isReviewsLoading,
    ratingFilter,
    hasImagesOnly,
    sortBy,
    setPage,
    setRatingFilter,
    setHasImagesOnly,
    setSortBy,
  };
}
