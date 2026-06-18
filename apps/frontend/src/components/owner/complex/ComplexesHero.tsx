import {
  OwnerPageHero,
  type OwnerHeroStatItem,
} from "@/components/owner/OwnerPageHero";
import { ComplexFormDialog } from "@/components/shared/complex/ComplexFormDialog";
import { ComplexStatus } from "@/types";
import { CheckCircle2, Clock, Layers, MinusCircle } from "lucide-react";

interface ComplexesHeroProps {
  pagination?: {
    total: number;
    [key: string]: unknown;
  } | null;
  complexesCount: number;
  statusCounts: Record<ComplexStatus, number>;
}

export function ComplexesHero({
  pagination,
  complexesCount,
  statusCounts,
}: ComplexesHeroProps) {
  const stats: OwnerHeroStatItem[] = [
    {
      icon: Layers,
      label: "Tổng khu",
      value: pagination?.total ?? complexesCount,
      tone: "slate",
      hint: "Toàn bộ cơ sở",
    },
    {
      icon: CheckCircle2,
      label: "Hoạt động",
      value: statusCounts[ComplexStatus.ACTIVE],
      tone: "emerald",
      hint: "Đang nhận đặt",
    },
    {
      icon: Clock,
      label: "Chờ duyệt",
      value: statusCounts[ComplexStatus.PENDING],
      tone: "amber",
      hint: "Đợi admin duyệt",
    },
    {
      icon: MinusCircle,
      label: "Đã ngừng",
      value: statusCounts[ComplexStatus.INACTIVE],
      tone: "rose",
      hint: "Tạm dừng vận hành",
    },
  ];

  return (
    <OwnerPageHero
      title={
        <h1 className="truncate font-display text-xl font-black leading-tight tracking-tight text-foreground md:text-2xl">
          Quản lý <span className="italic text-primary">khu phức hợp</span>
        </h1>
      }
      description={
        <p className="hidden max-w-xl text-xs text-muted-foreground md:block">
          Theo dõi trạng thái khai thác, tiến độ duyệt và khả năng phục vụ của
          toàn bộ cơ sở trong một khung quản trị duy nhất.
        </p>
      }
      action={<ComplexFormDialog />}
      stats={stats}
    />
  );
}
