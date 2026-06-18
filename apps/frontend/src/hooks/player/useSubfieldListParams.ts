import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSubfieldStore } from "@/store/owner/useSubfieldStore";
import { useDebounce } from "@/hooks/useDebounce";

export function useSubfieldListParams(id: string | undefined) {
  const {
    setSubfieldParams,
    setSubfieldPage,
    setSubfieldSearch,
  } = useSubfieldStore();
  const [searchParams] = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Scroll to top on mount and when id changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Debounce search input
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  useEffect(() => {
    setSubfieldSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, setSubfieldSearch]);

  // Init params from URL
  useEffect(() => {
    if (id) {
      setSubfieldParams({ page: initialPage, search: initialSearch });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handlePageChange = (page: number) => {
    setSubfieldPage(page);
  };

  return {
    searchTerm,
    handleSearchChange,
    handlePageChange,
  };
}
