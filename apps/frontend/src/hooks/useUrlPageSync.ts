import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

interface UseUrlPageSyncProps {
  page: number;
  search?: string;
  onInit: (params: { page: number; search: string }) => void;
}

export function useUrlPageSync({
  page,
  search = "",
  onInit,
}: UseUrlPageSyncProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Seed initial state from URL on mount
  useEffect(() => {
    const initialPage = parseInt(searchParams.get("page") || "1", 10);
    const initialSearch = searchParams.get("search") || "";
    onInit({
      page: Number.isNaN(initialPage) || initialPage < 1 ? 1 : initialPage,
      search: initialSearch,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep URL in sync with state params
  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    let changed = false;

    const currentPage = nextParams.get("page") || "1";
    const targetPage = page > 1 ? page.toString() : "1";
    if (currentPage !== targetPage) {
      if (page > 1) {
        nextParams.set("page", targetPage);
      } else {
        nextParams.delete("page");
      }
      changed = true;
    }

    const currentSearch = nextParams.get("search") || "";
    if (currentSearch !== search) {
      if (search) {
        nextParams.set("search", search);
      } else {
        nextParams.delete("search");
      }
      changed = true;
    }

    if (changed) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [page, search, searchParams, setSearchParams]);
}

