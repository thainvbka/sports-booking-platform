import { OwnerFilterShell } from "@/components/owner/OwnerFilterShell";
import { ProductFilters } from "@/components/owner/product/ProductFilters";
import { ProductFormDialog } from "@/components/owner/product/ProductFormDialog";
import { UpdateProductStockDialog } from "@/components/owner/product/UpdateProductStockDialog";
import { DataTable } from "@/components/shared/ui-utility/DataTable";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useProductManagement } from "@/hooks/owner/useProductManagement";
import { useProductColumns } from "@/hooks/owner/useProductColumns";
import { OwnerPageHero } from "@/components/owner/OwnerPageHero";
import { AlertCircle, CircleOff, Layers, PackagePlus, RotateCcw, ShieldAlert, Zap } from "lucide-react";

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
      {/*  HERO  */}
      <OwnerPageHero
        title={
          <h1 className="truncate font-display text-xl font-black leading-tight tracking-tight text-foreground md:text-2xl">
            Quản lý <span className="italic text-primary">sản phẩm</span>
          </h1>
        }
        description={
          <p className="hidden max-w-xl text-xs text-muted-foreground md:block">
            Theo dõi danh mục, giá bán và tồn kho của từng cơ sở — cảnh báo ngay
            khi có mặt hàng sắp hết.
          </p>
        }
        action={
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="h-9 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow shadow-primary/25 hover:bg-primary/92"
          >
            <PackagePlus data-icon="inline-start" />
            Thêm sản phẩm
          </Button>
        }
        stats={[
          {
            icon: Layers,
            label: "Tổng số sản phẩm",
            value: totalItems,
            tone: "slate",
            hint: "Toàn bộ mặt hàng",
          },
          {
            icon: Zap,
            label: "Đang bán",
            value: inventoryStats.active,
            tone: "emerald",
            hint: "Hiển thị công khai",
          },
          {
            icon: ShieldAlert,
            label: "Sắp hết",
            value: inventoryStats.lowStock,
            tone: "amber",
            hint: `≤ ${LOW_STOCK_THRESHOLD} đơn vị`,
          },
          {
            icon: CircleOff,
            label: "Tạm ngừng",
            value: inventoryStats.inactive,
            tone: "rose",
            hint: "Không bán ra",
          },
        ]}
      />

      {/*  TOOLBAR  */}
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

      {/*  TABLE  */}
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

      {/*  Dialogs  */}
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
