import { OwnerFilterShell } from "@/components/owner/OwnerFilterShell";
import { ProductFilters } from "@/components/owner/product/ProductFilters";
import { ProductFormDialog } from "@/components/owner/product/ProductFormDialog";
import { UpdateProductStockDialog } from "@/components/owner/product/UpdateProductStockDialog";
import { DataTable } from "@/components/shared/ui-utility/DataTable";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ProductsHero } from "@/components/owner/product/ProductsHero";
import { useProductManagement } from "@/hooks/owner/useProductManagement";
import { useProductColumns } from "@/hooks/owner/useProductColumns";
import { AlertCircle, RotateCcw } from "lucide-react";

const LOW_STOCK_THRESHOLD = 5;

export function ProductManagementPage() {
  const {
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
  } = useProductManagement(LOW_STOCK_THRESHOLD);

  const columns = useProductColumns({
    isSubmitting,
    onEdit: setEditingProduct,
    onUpdateStock: setStockProduct,
    onToggleStatus: handleToggleStatus,
    lowStockThreshold: LOW_STOCK_THRESHOLD,
  });

  const totalItems = pagination?.total ?? products.length;

  return (
    <div className="flex flex-col gap-5 pb-10">
      {/* ── HERO ─────────────────────────────────────────── */}
      <ProductsHero
        totalItems={totalItems}
        inventoryStats={inventoryStats}
        onCreateClick={() => setCreateDialogOpen(true)}
        lowStockThreshold={LOW_STOCK_THRESHOLD}
      />

      {/* ── TOOLBAR ──────────────────────────────────────── */}
      <OwnerFilterShell
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        placeholder="Tìm theo tên sản phẩm, mô tả, cơ sở…"
      >
        <ProductFilters
          complexes={complexes}
          value={filters}
          isLoading={isLoading || isSubmitting}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />
      </OwnerFilterShell>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {/* ── TABLE ────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 px-0.5">
        {hasActiveFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-7 rounded-full px-2 text-[11px] font-semibold"
          >
            <RotateCcw data-icon="inline-start" />
            Đặt lại
          </Button>
        ) : null}
      </div>

      <DataTable
        data={products}
        columns={columns}
        isLoading={isLoading}
        paginationStyle="search"
        pagination={{
          page: queryParams.page,
          totalPages: pagination?.totalPages || 1,
          onPageChange: setPage,
        }}
        emptyMessage={
          hasActiveFilters
            ? "Không có sản phẩm phù hợp với bộ lọc hiện tại"
            : "Chưa có sản phẩm nào — hãy tạo SKU đầu tiên của cơ sở."
        }
      />

      {/* ── Dialogs ─────────────────── */}
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
