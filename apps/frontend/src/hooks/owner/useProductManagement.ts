import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useUrlPageSync } from "@/hooks/useUrlPageSync";
import { useProductStore } from "@/store/owner/useProductStore";
import type {
  CreateProductPayload,
  OwnerProduct,
  ProductStatus,
  UpdateProductPayload,
  UpdateProductStockPayload,
} from "@/types";
import type { OwnerProductFilterInput } from "@/validations";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export function useProductManagement(lowStockThreshold = 5) {
  const {
    products,
    complexes,
    pagination,
    queryParams,
    filters,
    isLoading,
    isSubmitting,
    error,
    fetchProducts,
    fetchComplexes,
    setPage,
    setSearch,
    setFilters,
    clearFilters,
    createProduct,
    updateProduct,
    incrementStock,
  } = useProductStore();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<OwnerProduct | null>(
    null,
  );
  const [stockProduct, setStockProduct] = useState<OwnerProduct | null>(null);

  const { searchValue, setSearchValue } = useDebouncedSearch({
    initialValue: queryParams.search || "",
    onSearch: setSearch,
    delay: 350,
  });

  useUrlPageSync({
    page: queryParams.page,
    search: queryParams.search,
    onInit: ({ page, search }) => {
      fetchComplexes();
      if (search) {
        setSearch(search);
        if (page > 1) {
          setPage(page);
        }
      } else if (page > 1) {
        setPage(page);
      } else {
        fetchProducts();
      }
    },
  });


  const hasActiveFilters = useMemo(() => {
    return Boolean(
      searchValue.trim() ||
        filters.complex_id ||
        filters.status ||
        filters.sport_type ||
        filters.min_price !== undefined ||
        filters.max_price !== undefined ||
        filters.min_stock !== undefined ||
        filters.max_stock !== undefined,
    );
  }, [filters, searchValue]);

  // Client-side counters
  const inventoryStats = useMemo(() => {
    const active = products.filter((p) => p.status === "ACTIVE").length;
    const inactive = products.filter((p) => p.status === "INACTIVE").length;
    const lowStock = products.filter(
      (p) => p.stock <= lowStockThreshold,
    ).length;
    return { active, inactive, lowStock };
  }, [products, lowStockThreshold]);

  const handleCreateProduct = async (
    payload: CreateProductPayload | UpdateProductPayload,
    imageFile?: File | null,
  ) => {
    await createProduct(payload as CreateProductPayload, imageFile);
    toast.success("Tạo sản phẩm thành công");
  };

  const handleUpdateProduct = async (
    payload: CreateProductPayload | UpdateProductPayload,
    imageFile?: File | null,
  ) => {
    if (!editingProduct) return;
    await updateProduct(
      editingProduct.id,
      payload as UpdateProductPayload,
      imageFile,
    );
    toast.success("Cập nhật sản phẩm thành công");
    setEditingProduct(null);
  };

  const handleIncrementStock = async (payload: UpdateProductStockPayload) => {
    if (!stockProduct) return;
    await incrementStock(stockProduct.id, payload);
    toast.success("Cập nhật tồn kho thành công");
    setStockProduct(null);
  };

  const handleToggleStatus = async (product: OwnerProduct) => {
    const nextStatus: ProductStatus =
      product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await updateProduct(product.id, { status: nextStatus });
    toast.success("Cập nhật trạng thái sản phẩm thành công");
  };

  const handleApplyFilters = (
    nextFilters: Partial<OwnerProductFilterInput>,
  ) => {
    setFilters(nextFilters);
  };

  const handleClearFilters = () => {
    setSearchValue("");
    clearFilters();
  };

  return {
    products,
    complexes,
    pagination,
    queryParams,
    filters,
    isLoading,
    isSubmitting,
    error,
    setPage,
    searchValue,
    setSearchValue,
    createDialogOpen,
    setCreateDialogOpen,
    editingProduct,
    setEditingProduct,
    stockProduct,
    setStockProduct,
    hasActiveFilters,
    inventoryStats,
    handleCreateProduct,
    handleUpdateProduct,
    handleIncrementStock,
    handleToggleStatus,
    handleApplyFilters,
    handleClearFilters,
  };
}
