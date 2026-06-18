import { type SearchFiltersValue } from "@/components/shared/search/filters/SearchFilters";
import { publicService } from "@/services/public.service";
import { type Complex, type SubField } from "@/types";
import {
  parseNumberParam,
  parseSportTypesFromParams,
  type TabValue,
} from "@/utils/search.util";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export function useSearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [complexResults, setComplexResults] = useState<Complex[]>([]);
  const [subFieldResults, setSubFieldResults] = useState<
    (SubField & { complex_name?: string; complex_address?: string })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [complexPagination, setComplexPagination] = useState({
    total: 0,
    page: 1,
    limit: 8,
    totalPages: 0,
  });
  const [subfieldPagination, setSubfieldPagination] = useState({
    total: 0,
    page: 1,
    limit: 8,
    totalPages: 0,
  });

  const location = searchParams.get("location") || undefined;
  const sportTypes = useMemo(
    () => parseSportTypesFromParams(searchParams),
    [searchParams],
  );
  const minPrice = parseNumberParam(searchParams, "minPrice");
  const maxPrice = parseNumberParam(searchParams, "maxPrice");
  const minCapacity = parseNumberParam(searchParams, "minCapacity");
  const maxCapacity = parseNumberParam(searchParams, "maxCapacity");

  const complexPage = Number(searchParams.get("complexPage")) || 1;
  const subfieldPage = Number(searchParams.get("subfieldPage")) || 1;
  const defaultTab = (searchParams.get("tab") as TabValue) || "complexes";

  const primarySport = sportTypes[0];

  const [keyword, setKeyword] = useState<string>(location ?? "");
  const [sportValue, setSportValue] = useState<string>(primarySport ?? "ALL");

  useEffect(() => {
    setKeyword(location ?? "");
  }, [location]);

  useEffect(() => {
    setSportValue(primarySport ?? "ALL");
  }, [primarySport]);

  const sportTypesKey = sportTypes.join(",");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const sport_types = sportTypesKey ? (sportTypesKey.split(",") as typeof sportTypes) : undefined;

        const [complexesRes, subfieldsRes] = await Promise.all([
          publicService.getComplexes({
            page: complexPage,
            limit: 8,
            search: location,
            sport_types,
            minPrice,
            maxPrice,
          }),
          publicService.getSubfields({
            page: subfieldPage,
            limit: 8,
            search: location,
            sport_types,
            minCapacity,
            maxCapacity,
            minPrice,
            maxPrice,
          }),
        ]);

        setComplexResults(complexesRes.data?.complexes || []);
        setComplexPagination(
          complexesRes.data?.pagination || {
            total: 0,
            page: 1,
            limit: 8,
            totalPages: 0,
          },
        );

        setSubFieldResults(subfieldsRes.data?.subfields || []);
        setSubfieldPagination(
          subfieldsRes.data?.pagination || {
            total: 0,
            page: 1,
            limit: 8,
            totalPages: 0,
          },
        );
      } catch (error) {
        toast.error("Đã có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau.");
        console.error("Error fetching search results:", error);
        setComplexResults([]);
        setSubFieldResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [
    location,
    sportTypesKey,
    minPrice,
    maxPrice,
    minCapacity,
    maxCapacity,
    complexPage,
    subfieldPage,
  ]);

  const handleComplexPageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("complexPage", newPage.toString());
    setSearchParams(newParams);
  };

  const handleSubfieldPageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("subfieldPage", newPage.toString());
    setSearchParams(newParams);
  };

  const updateFilterParams = (
    changes: Record<string, string | undefined | null>,
  ) => {
    const newParams = new URLSearchParams(searchParams);
    for (const [key, val] of Object.entries(changes)) {
      if (val === null) continue;
      if (val === undefined || val === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, val);
      }
    }
    newParams.delete("complexPage");
    newParams.delete("subfieldPage");
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = keyword.trim();
    updateFilterParams({
      location: trimmed || undefined,
      sport_types: sportValue && sportValue !== "ALL" ? sportValue : undefined,
      sport_type: undefined,
    });
  };

  const filtersValue: SearchFiltersValue = {
    location,
    sportTypes,
    minPrice,
    maxPrice,
    minCapacity,
    maxCapacity,
  };

  const handleFiltersChange = (next: SearchFiltersValue) => {
    updateFilterParams({
      location: next.location ?? undefined,
      sport_types:
        next.sportTypes.length > 0 ? next.sportTypes.join(",") : undefined,
      sport_type: undefined,
      minPrice: next.minPrice !== undefined ? String(next.minPrice) : undefined,
      maxPrice: next.maxPrice !== undefined ? String(next.maxPrice) : undefined,
      minCapacity:
        next.minCapacity !== undefined ? String(next.minCapacity) : undefined,
      maxCapacity:
        next.maxCapacity !== undefined ? String(next.maxCapacity) : undefined,
    });
  };

  const hasActiveFilters =
    Boolean(location) ||
    sportTypes.length > 0 ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    minCapacity !== undefined ||
    maxCapacity !== undefined;

  const clearAllFilters = () => {
    const preserved = new URLSearchParams();
    const tab = searchParams.get("tab");
    if (tab) preserved.set("tab", tab);
    setSearchParams(preserved);
  };

  return {
    searchParams,
    setSearchParams,
    complexResults,
    subFieldResults,
    isLoading,
    complexPagination,
    subfieldPagination,
    filtersValue,
    handleFiltersChange,
    handleComplexPageChange,
    handleSubfieldPageChange,
    hasActiveFilters,
    clearAllFilters,
    keyword,
    sportValue,
    setKeyword,
    setSportValue,
    handleSearchSubmit,
    defaultTab,
  };
}
