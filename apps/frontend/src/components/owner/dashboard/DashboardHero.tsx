import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Clock3, CheckCircle, AlertCircle, Plus, ArrowRight, Wallet } from "lucide-react";
import { OwnerHeroShell } from "@/components/owner/OwnerHeroShell";

interface DashboardHeroProps {
  owner: { full_name?: string | null } | null;
  currentDate: string;
  isConnected: boolean;
  onConnectStripe: () => void;
}

export function DashboardHero({
  owner,
  currentDate,
  isConnected,
  onConnectStripe,
}: DashboardHeroProps) {
  return (
    <OwnerHeroShell
      alignItems="center"
      badge={
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant="outline"
            className="h-5 gap-1 rounded-full border-border/60 bg-background/70 px-2 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-sm"
          >
            <Clock3 className="size-2.5" />
            <span className="capitalize">{currentDate}</span>
          </Badge>
          {isConnected ? (
            <Badge
              variant="outline"
              className="h-5 gap-1 rounded-full border-emerald-500/30 bg-emerald-500/10 px-2 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400"
            >
              <CheckCircle className="size-2.5" />
              Ví đã kết nối
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="h-5 gap-1 rounded-full border-amber-500/40 bg-amber-500/10 px-2 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400"
            >
              <AlertCircle className="size-2.5" />
              Chưa kết nối Stripe
            </Badge>
          )}
        </div>
      }
      title={
        <h1 className="truncate font-display text-xl font-black leading-tight tracking-tight text-foreground md:text-2xl">
          Xin chào,{" "}
          <span className="italic text-primary">
            {owner?.full_name || "Chủ sân"}
          </span>
        </h1>
      }
      action={
        isConnected ? (
          <Button
            asChild
            size="sm"
            className="group/cta h-9 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow shadow-primary/25 hover:bg-primary/92"
          >
            <Link to="/owner/complexes">
              <Plus data-icon="inline-start" />
              Thêm khu phức hợp
              <ArrowRight
                data-icon="inline-end"
                className="transition-transform group-hover/cta:translate-x-0.5"
              />
            </Link>
          </Button>
        ) : (
          <Button
            onClick={onConnectStripe}
            size="sm"
            className="group/cta h-9 rounded-full bg-foreground px-4 text-xs font-semibold text-background shadow hover:bg-foreground/90"
          >
            <Wallet data-icon="inline-start" />
            Kết nối Stripe
            <ArrowRight
              data-icon="inline-end"
              className="transition-transform group-hover/cta:translate-x-0.5"
            />
          </Button>
        )
      }
    />
  );
}

