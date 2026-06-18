import { publicService } from "@/services/public.service";
import type { PublicSubfieldDetail, SubfieldProduct } from "@/types";
import { useCallback, useEffect, useState } from "react";

interface UseSubfieldDataOptions {
  subfieldId?: string;
  includeProducts?: boolean;
}

interface UseSubfieldDataResult {
  subfield: PublicSubfieldDetail | null;
  products: SubfieldProduct[];
  isLoading: boolean;
  error: unknown;
  refetch: () => Promise<void>;
}

export function useSubfieldData({
  subfieldId,
  includeProducts = false,
}: UseSubfieldDataOptions): UseSubfieldDataResult {
  const [subfield, setSubfield] = useState<PublicSubfieldDetail | null>(null);
  const [products, setProducts] = useState<SubfieldProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const refetch = useCallback(async () => {
    if (!subfieldId) {
      setSubfield(null);
      setProducts([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!includeProducts) {
        const subfieldResponse = await publicService.getSubfieldById(subfieldId);
        setSubfield(subfieldResponse.data.subfield);
        setProducts([]);
        return;
      }

      const [subfieldResult, productsResult] = await Promise.allSettled([
        publicService.getSubfieldById(subfieldId),
        publicService.getSubfieldProducts(subfieldId),
      ]);

      if (subfieldResult.status === "fulfilled") {
        setSubfield(subfieldResult.value.data.subfield);
      } else {
        setSubfield(null);
        setError(subfieldResult.reason);
      }

      if (productsResult.status === "fulfilled") {
        setProducts(productsResult.value.data.products || []);
      } else {
        setProducts([]);
      }
    } catch (fetchError) {
      setSubfield(null);
      setProducts([]);
      setError(fetchError);
    } finally {
      setIsLoading(false);
    }
  }, [includeProducts, subfieldId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    subfield,
    products,
    isLoading,
    error,
    refetch,
  };
}
