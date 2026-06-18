import {
  OwnerPageHero,
  type OwnerHeroStatItem,
} from "@/components/owner/OwnerPageHero";
import { Badge } from "@/components/ui/badge";
import {
  AlarmClock,
  Ban,
  CheckCircle2,
  Layers,
  Sparkles,
  Wallet,
} from "lucide-react";

interface BookingsHeroProps {
  total: number;
  stats: {
    total: number;
    confirmed: number;
    completed: number;
    pending: number;
    canceled: number;
  };
}

export function BookingsHero({ total, stats }: BookingsHeroProps) {
  const statItems: OwnerHeroStatItem[] = [
    {
      icon: Layers,
      label: "Tổng",
      value: stats.total,
      tone: "slate",
      hint: "Tất cả lượt đặt",
    },
    {
      icon: CheckCircle2,
      label: "Đã xác nhận",
      value: stats.confirmed,
      tone: "emerald",
      hint: "Sẵn sàng đón khách",
    },
    {
      icon: AlarmClock,
      label: "Chờ xác nhận",
      value: stats.completed,
      tone: "sky",
      hint: "Cần bạn duyệt",
    },
    {
      icon: Wallet,
      label: "Chưa thanh toán",
      value: stats.pending,
      tone: "amber",
      hint: "Đang chờ ví",
    },
    {
      icon: Ban,
      label: "Đã hủy",
      value: stats.canceled,
      tone: "rose",
      hint: "Không hoạt động",
    },
  ];

  return (
    <OwnerPageHero
      title={
        <h1 className="truncate font-display text-xl font-black leading-tight tracking-tight text-foreground md:text-2xl">
          Quản lý lịch sử <span className="italic text-primary">đặt sân</span>
        </h1>
      }
      description={
        <p className="hidden max-w-xl text-xs text-muted-foreground md:block">
          Theo dõi, xác nhận và điều phối mọi lượt đặt — đơn lẻ lẫn định kỳ —
          từ một bảng điều khiển duy nhất.
        </p>
      }
      action={
        <Badge
          variant="outline"
          className="h-5 gap-1 rounded-full border-primary/30 bg-primary/10 px-2 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-primary"
        >
          <Sparkles className="size-2.5" />
          {total} lịch đặt
        </Badge>
      }
      stats={statItems}
    />
  );
}
