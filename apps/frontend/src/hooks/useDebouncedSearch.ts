import { useEffect, useRef, useState } from "react";
import { useDebounce } from "./useDebounce";

interface UseDebouncedSearchProps {
  initialValue: string;
  onSearch: (value: string) => void;
  delay?: number;
}

export function useDebouncedSearch({
  initialValue,
  onSearch,
  delay = 500,
}: UseDebouncedSearchProps) {
  const [searchValue, setSearchValue] = useState(initialValue);
  const debouncedValue = useDebounce(searchValue, delay);
  const lastSearchedValue = useRef(initialValue);

  // Sync with initialValue when it changes from outside
  useEffect(() => {
    setSearchValue(initialValue);
    lastSearchedValue.current = initialValue;
  }, [initialValue]);

  useEffect(() => {
    if (debouncedValue !== lastSearchedValue.current) {
      lastSearchedValue.current = debouncedValue;
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch]);

  return {
    searchValue,
    setSearchValue,
  };
}
