import {
  OwnerPageHero,
  type OwnerHeroStatItem,
} from "@/components/owner/OwnerPageHero";
import { Button } from "@/components/ui/button";
import { CircleOff, Layers, PackagePlus, ShieldAlert, Zap } from "lucide-react";

interface ProductsHeroProps {
  totalItems: number;
  inventoryStats: {
    active: number;
    lowStock: number;
    inactive: number;
  };
  onCreateClick: () => void;
  lowStockThreshold?: number;
}

export function ProductsHero({
  totalItems,
  inventoryStats,
  onCreateClick,
  lowStockThreshold = 5,
}: ProductsHeroProps) {
  const stats: OwnerHeroStatItem[] = [
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
      hint: `≤ ${lowStockThreshold} đơn vị`,
    },
    {
      icon: CircleOff,
      label: "Tạm ngừng",
      value: inventoryStats.inactive,
      tone: "rose",
      hint: "Không bán ra",
    },
  ];

  return (
    <OwnerPageHero
      title={
        <h1 className="truncate font-display text-xl font-black leading-tight tracking-tight text-foreground md:text-2xl">
          Quản lý <span className="italic text-primary">Sản phẩm</span>
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
          onClick={onCreateClick}
          className="h-9 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow shadow-primary/25 hover:bg-primary/92"
        >
          <PackagePlus data-icon="inline-start" />
          Thêm sản phẩm
        </Button>
      }
      stats={stats}
    />
  );
}


