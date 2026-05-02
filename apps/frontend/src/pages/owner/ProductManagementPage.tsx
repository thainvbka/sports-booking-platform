import { OwnerFilterShell } from "@/components/owner/OwnerFilterShell";
import { ProductFilters } from "@/components/owner/ProductFilters";
import { ProductFormDialog } from "@/components/owner/ProductFormDialog";
import { UpdateProductStockDialog } from "@/components/owner/UpdateProductStockDialog";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PRODUCT_STATUS_COLORS,
  PRODUCT_STATUS_LABELS,
  SPORT_TYPE_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
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
import {
  AlertCircle,
  ArrowUpRight,
  CircleOff,
  Layers,
  MoreVertical,
  Package2,
  PackagePlus,
  Pencil,
  PowerOff,
  ShieldAlert,
  Tag,
  ToggleLeft,
  Zap,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type SVGProps,
} from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type InventoryTone = "slate" | "emerald" | "amber" | "rose";

const TONE: Record<
  InventoryTone,
  { chip: string; value: string; bar: string; bg: string; ring: string }
> = {
  slate: {
    chip: "border-slate-300/60 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200",
    value: "text-slate-900 dark:text-slate-100",
    bar: "bg-slate-400",
    bg: "from-slate-500/8 via-transparent to-transparent",
    ring: "ring-slate-500/10",
  },
  emerald: {
    chip: "border-emerald-300/60 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
    value: "text-emerald-700 dark:text-emerald-300",
    bar: "bg-emerald-500",
    bg: "from-emerald-500/10 via-transparent to-transparent",
    ring: "ring-emerald-500/15",
  },
  amber: {
    chip: "border-amber-300/60 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    value: "text-amber-700 dark:text-amber-300",
    bar: "bg-amber-500",
    bg: "from-amber-500/10 via-transparent to-transparent",
    ring: "ring-amber-500/15",
  },
  rose: {
    chip: "border-rose-300/60 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
    value: "text-rose-700 dark:text-rose-300",
    bar: "bg-rose-500",
    bg: "from-rose-500/10 via-transparent to-transparent",
    ring: "ring-rose-500/15",
  },
};

const LOW_STOCK_THRESHOLD = 5;

interface StatTileProps {
  icon: IconType;
  label: string;
  value: number | string;
  tone: InventoryTone;
  hint?: string;
}

function StatTile({ icon: Icon, label, value, tone, hint }: StatTileProps) {
  const t = TONE[tone];
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/60 bg-card p-3 shadow-xs ring-1",
        t.ring,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br",
          t.bg,
        )}
      />
      <span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 w-0.5", t.bar)}
      />
      <div className="relative flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </span>
          <span
            className={cn(
              "font-display text-2xl font-black italic tabular-nums tracking-tight",
              t.value,
            )}
          >
            {value}
          </span>
          {hint ? (
            <span className="text-[10.5px] text-muted-foreground">{hint}</span>
          ) : null}
        </div>
        <span
          className={cn(
            "inline-flex size-8 shrink-0 items-center justify-center rounded-xl border",
            t.chip,
          )}
        >
          <Icon className="size-3.5" />
        </span>
      </div>
    </div>
  );
}

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
  const [editingProduct, setEditingProduct] = useState<OwnerProduct | null>(
    null,
  );
  const [stockProduct, setStockProduct] = useState<OwnerProduct | null>(null);

  useEffect(() => {
    const pageFromQuery = Number(searchParams.get("page") || "1");

    fetchComplexes();

    if (pageFromQuery > 1) {
      setPage(pageFromQuery);
      return;
    }

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Client-side counters (from current page)
  const inventoryStats = useMemo(() => {
    const active = products.filter((p) => p.status === "ACTIVE").length;
    const inactive = products.filter((p) => p.status === "INACTIVE").length;
    const lowStock = products.filter(
      (p) => p.stock <= LOW_STOCK_THRESHOLD,
    ).length;
    return { active, inactive, lowStock };
  }, [products]);

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

  // ── Table columns ─────────────────────────────────────────
  const columns: Column<OwnerProduct>[] = [
    {
      header: "Sản phẩm",
      className: "w-64",
      cell: (product) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <Package2 className="size-4 opacity-50" />
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold">
              {product.name}
            </span>
            <span className="line-clamp-1 text-xs text-muted-foreground">
              {product.description || "Không có mô tả"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Cơ sở",
      className: "w-48",
      cell: (product) => (
        <span className="line-clamp-2 text-sm font-medium">
          {product.complex.complex_name}
        </span>
      ),
    },
    {
      header: "Loại",
      className: "w-36 whitespace-nowrap",
      cell: (product) => (
        <Badge
          variant="outline"
          className="h-5 gap-1 rounded-full border-border/60 bg-background/70 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
        >
          <Tag className="size-2.5" />
          {product.sport_type
            ? SPORT_TYPE_LABELS[product.sport_type]
            : "Tất cả"}
        </Badge>
      ),
    },
    {
      header: "Giá",
      className: "w-32 whitespace-nowrap text-right",
      cell: (product) => (
        <div className="text-right">
          <span className="font-display text-sm font-black italic tabular-nums tracking-tight text-foreground">
            {formatPrice(product.price)}
          </span>
        </div>
      ),
    },
    {
      header: "Tồn kho",
      className: "w-32 whitespace-nowrap",
      cell: (product) => {
        const lowStock = product.stock <= LOW_STOCK_THRESHOLD;
        const empty = product.stock === 0;
        return (
          <div className="flex items-center gap-1.5">
            <span
              aria-hidden
              className={cn(
                "size-1.5 rounded-full",
                empty
                  ? "bg-rose-500"
                  : lowStock
                  ? "bg-amber-500"
                  : "bg-emerald-500",
              )}
            />
            <span className="font-display text-sm font-bold italic tabular-nums tracking-tight">
              {product.stock}
            </span>
            {empty ? (
              <Badge
                variant="outline"
                className="h-4 rounded-full border-rose-300/60 bg-rose-50 px-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
              >
                Hết
              </Badge>
            ) : lowStock ? (
              <Badge
                variant="outline"
                className="h-4 rounded-full border-amber-300/60 bg-amber-50 px-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
              >
                Sắp hết
              </Badge>
            ) : null}
          </div>
        );
      },
    },
    {
      header: "Trạng thái",
      className: "w-32 whitespace-nowrap",
      cell: (product) => (
        <Badge
          className={cn(
            "h-6 rounded-full px-2.5 text-[10.5px] font-semibold uppercase tracking-[0.14em]",
            PRODUCT_STATUS_COLORS[product.status],
          )}
        >
          {PRODUCT_STATUS_LABELS[product.status]}
        </Badge>
      ),
    },
    {
      header: "",
      className: "w-12",
      cell: (product) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Thao tác"
              disabled={isSubmitting}
            >
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem
              onClick={() => setEditingProduct(product)}
              className="cursor-pointer gap-2"
            >
              <Pencil className="size-3.5 text-muted-foreground" />
              Sửa thông tin
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setStockProduct(product)}
              className="cursor-pointer gap-2"
            >
              <PackagePlus className="size-3.5 text-muted-foreground" />
              Nhập thêm kho
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleToggleStatus(product)}
              className={cn(
                "cursor-pointer gap-2",
                product.status === "ACTIVE"
                  ? "text-rose-700 focus:text-rose-700 dark:text-rose-400 dark:focus:text-rose-400"
                  : "text-emerald-700 focus:text-emerald-700 dark:text-emerald-400 dark:focus:text-emerald-400",
              )}
            >
              {product.status === "ACTIVE" ? (
                <PowerOff className="size-3.5" />
              ) : (
                <ToggleLeft className="size-3.5" />
              )}
              {product.status === "ACTIVE"
                ? "Tạm dừng bán"
                : "Bật bán trở lại"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const totalItems = pagination?.total ?? products.length;

  return (
    <div className="flex flex-col gap-5 pb-10">
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/8 via-background to-accent-sport/5 px-4 py-4 shadow-sm md:px-6 md:py-5">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-14 size-56 rounded-full bg-primary/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 left-10 size-48 rounded-full bg-accent-sport/10 blur-3xl"
        />

        <div className="relative flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex min-w-0 flex-col gap-1.5">

            <h1 className="truncate font-display text-xl font-black leading-tight tracking-tight text-foreground md:text-2xl">
              Kho hàng · <span className="italic text-primary">Pro shop</span>
            </h1>
            <p className="hidden max-w-xl text-xs text-muted-foreground md:block">
              Theo dõi danh mục, giá bán và tồn kho của từng cơ sở — cảnh báo
              ngay khi có mặt hàng sắp hết.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="h-9 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow shadow-primary/25 hover:bg-primary/92"
            >
              <PackagePlus data-icon="inline-start" />
              Thêm sản phẩm
            </Button>
          </div>
        </div>

        {/* Stat strip */}
        <div className="relative mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatTile
            icon={Layers}
            label="Tổng SKU"
            value={totalItems}
            tone="slate"
            hint="Toàn bộ mặt hàng"
          />
          <StatTile
            icon={Zap}
            label="Đang bán"
            value={inventoryStats.active}
            tone="emerald"
            hint="Hiển thị công khai"
          />
          <StatTile
            icon={ShieldAlert}
            label="Sắp hết"
            value={inventoryStats.lowStock}
            tone="amber"
            hint={`≤ ${LOW_STOCK_THRESHOLD} đơn vị`}
          />
          <StatTile
            icon={CircleOff}
            label="Tạm ngừng"
            value={inventoryStats.inactive}
            tone="rose"
            hint="Không bán ra"
          />
        </div>
      </section>

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
            <ArrowUpRight data-icon="inline-start" />
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

      {/* ── Dialogs (logic unchanged) ─────────────────── */}
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
