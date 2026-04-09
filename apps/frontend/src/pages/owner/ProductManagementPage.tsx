import { ProductFilters } from "@/components/owner/ProductFilters";
import { ProductFormDialog } from "@/components/owner/ProductFormDialog";
import { UpdateProductStockDialog } from "@/components/owner/UpdateProductStockDialog";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    PRODUCT_STATUS_COLORS,
    PRODUCT_STATUS_LABELS,
    SPORT_TYPE_LABELS,
} from "@/lib/constants";
import { useProductStore } from "@/store/owner/useProductStore";
import type {
    CreateProductPayload,
    OwnerProduct,
    ProductStatus,
    UpdateProductPayload,
    UpdateProductStockPayload,
} from "@/types";
import { formatPrice } from "@/utils";
import type { OwnerProductFilterInput } from "@/validations";
import { MoreVertical, Package2, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export function ProductManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();

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

  const [searchValue, setSearchValue] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<OwnerProduct | null>(null);
  const [stockProduct, setStockProduct] = useState<OwnerProduct | null>(null);

  useEffect(() => {
    const pageFromQuery = Number(searchParams.get("page") || "1");

    fetchComplexes();

    if (pageFromQuery > 1) {
      setPage(pageFromQuery);
      return;
    }

    fetchProducts();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchValue);
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchValue, setSearch]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (queryParams.page > 1) {
      params.set("page", String(queryParams.page));
    } else {
      params.delete("page");
    }

    setSearchParams(params, { replace: true });
  }, [queryParams.page]);

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

  const handleApplyFilters = (nextFilters: Partial<OwnerProductFilterInput>) => {
    setFilters(nextFilters);
  };

  const handleClearFilters = () => {
    setSearchValue("");
    clearFilters();
  };

  const columns: Column<OwnerProduct>[] = [
    {
      header: "Ảnh",
      className: "w-24",
      cell: (product) => (
        <div className="h-14 w-14 overflow-hidden rounded-lg border bg-muted">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Package2 className="h-5 w-5" />
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Tên sản phẩm",
      className: "w-56",
      cell: (product) => (
        <div className="space-y-1">
          <p className="font-medium leading-none">{product.name}</p>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {product.description || "Không có mô tả"}
          </p>
        </div>
      ),
    },
    {
      header: "Cơ sở",
      className: "w-56",
      cell: (product) => (
        <span className="text-sm font-medium">{product.complex.complex_name}</span>
      ),
    },
    {
      header: "Loại thể thao",
      className: "w-40",
      cell: (product) => (
        <span className="text-sm">
          {product.sport_type
            ? SPORT_TYPE_LABELS[product.sport_type]
            : "Tất cả môn"}
        </span>
      ),
    },
    {
      header: "Giá",
      className: "w-40 whitespace-nowrap",
      cell: (product) => (
        <span className="font-semibold text-emerald-700">
          {formatPrice(product.price)}
        </span>
      ),
    },
    {
      header: "Tồn kho",
      className: "w-28",
      cell: (product) => (
        <span className="font-semibold">{product.stock}</span>
      ),
    },
    {
      header: "Trạng thái",
      className: "w-32",
      cell: (product) => (
        <Badge className={PRODUCT_STATUS_COLORS[product.status]}>
          {PRODUCT_STATUS_LABELS[product.status]}
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "w-16",
      cell: (product) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={isSubmitting}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditingProduct(product)}>
              Sửa thông tin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStockProduct(product)}>
              Nhập thêm kho
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleStatus(product)}>
              {product.status === "ACTIVE"
                ? "Đổi trạng thái: Inactive"
                : "Đổi trạng thái: Active"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Quản lý sản phẩm
          </h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi danh mục sản phẩm, tồn kho và trạng thái bán hàng theo cơ sở
          </p>
        </div>

        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm sản phẩm mới
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Tìm kiếm theo tên, mô tả, cơ sở..."
          className="pl-9"
        />
      </div>

      <ProductFilters
        complexes={complexes}
        value={filters}
        isLoading={isLoading || isSubmitting}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <DataTable
        data={products}
        columns={columns}
        isLoading={isLoading}
        pagination={{
          page: queryParams.page,
          totalPages: pagination?.totalPages || 1,
          onPageChange: setPage,
        }}
        emptyMessage={
          hasActiveFilters
            ? "Không có sản phẩm phù hợp với bộ lọc hiện tại"
            : "Chưa có sản phẩm nào"
        }
      />

      <ProductFormDialog
        open={createDialogOpen}
        mode="create"
        complexes={complexes}
        isSubmitting={isSubmitting}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateProduct}
      />

      <ProductFormDialog
        open={Boolean(editingProduct)}
        mode="edit"
        complexes={complexes}
        product={editingProduct}
        isSubmitting={isSubmitting}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setEditingProduct(null);
          }
        }}
        onSubmit={handleUpdateProduct}
      />

      <UpdateProductStockDialog
        open={Boolean(stockProduct)}
        product={stockProduct}
        isSubmitting={isSubmitting}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setStockProduct(null);
          }
        }}
        onSubmit={handleIncrementStock}
      />
    </div>
  );
}
