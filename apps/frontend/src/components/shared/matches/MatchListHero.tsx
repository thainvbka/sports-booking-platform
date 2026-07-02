import { SearchBar } from "@/components/shared/ui-utility/SearchBar";
import { PlayerDarkHeroShell } from "@/components/shared/layout/PlayerDarkHeroShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SportType } from "@/types";
import {
  ArrowRight,
  Flame,
  Sparkles,
  Trophy,
  UsersRound,
  Zap,
} from "lucide-react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

// Private: Scoreboard chip 
interface ScoreboardChipProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent?: "default" | "primary" | "danger" | "success";
  hint?: string;
}

function ScoreboardChip({
  label,
  value,
  icon,
  accent = "default",
  hint,
}: ScoreboardChipProps) {
  const accentRing: Record<NonNullable<ScoreboardChipProps["accent"]>, string> =
    {
      default: "ring-white/10",
      primary: "ring-primary/50",
      danger: "ring-rose-400/60",
      success: "ring-accent-sport/60",
    };
  const accentValue: Record<
    NonNullable<ScoreboardChipProps["accent"]>,
    string
  > = {
    default: "text-white",
    primary: "text-primary-foreground",
    danger: "text-rose-300",
    success: "text-accent-sport",
  };
  const accentIcon: Record<
    NonNullable<ScoreboardChipProps["accent"]>,
    string
  > = {
    default: "text-white/60",
    primary: "text-primary-foreground/80",
    danger: "text-rose-300/80",
    success: "text-accent-sport/80",
  };

  return (
    <div
      className={cn(
        "relative flex min-w-[128px] flex-col gap-1 rounded-xl bg-white/5 px-4 py-3 ring-1 backdrop-blur-sm",
        accentRing[accent],
      )}
    >
      <div
        className={cn(
          "flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em]",
          accentIcon[accent],
        )}
      >
        {icon}
        {label}
      </div>
      <p
        className={cn(
          "italic leading-none tabular-nums text-title",
          accentValue[accent],
        )}
      >
        {value}
      </p>
      {hint ? <p className="text-[11px] text-white/50">{hint}</p> : null}
    </div>
  );
}

// Public: MatchListHero 
const VALID_SPORT_TYPES = new Set<string>(Object.values(SportType));

export interface MatchListHeroProps {
  total: number;
  openCount: number;
  almostFullCount: number;
  totalSlotsLeft: number;
  isAuthenticated: boolean;
  keyword: string;
  sportValue: string;
  onKeywordChange: (value: string) => void;
  onSportChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function MatchListHero({
  total,
  openCount,
  almostFullCount,
  totalSlotsLeft,
  isAuthenticated,
  keyword,
  sportValue,
  onKeywordChange,
  onSportChange,
  onSubmit,
}: MatchListHeroProps) {
  return (
    <PlayerDarkHeroShell
      breadcrumbs={[
        { label: "Trang chủ", href: "/" },
        { label: "Kèo đấu" },
      ]}
      title={
        <h1 className="font-display text-4xl font-black italic leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl text-white">
          Kèo đấu{" "}
          <span className="bg-gradient-to-r from-accent-sport via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
            bùng nổ
          </span>
          <br className="hidden sm:block" />
          chốt sổ ra sân
        </h1>
      }
      description={
        <p className="max-w-xl text-base text-white/70 sm:text-lg">
          Chọn kèo theo môn thể thao, trình độ và khung giờ. Danh sách cập nhật
          liên tục để bạn vào đội nhanh trước khi đội đối thủ kịp chào sân.
        </p>
      }
      leftExtra={
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Badge
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10"
          >
            <Sparkles data-icon="inline-start" />
            Khám phá ngay
          </Badge>
          <span className="inline-flex items-center gap-1.5 text-sm text-white/70">
            <UsersRound className="size-4 text-accent-sport" />
            <span className="font-display font-black italic tabular-nums text-white">
              {totalSlotsLeft}
            </span>
            <span className="text-white/60">chỗ trống đang chờ bạn</span>
          </span>

          {!isAuthenticated && (
            <Button
              asChild
              size="sm"
              className="ml-auto bg-white text-slate-950 hover:bg-white/90"
            >
              <Link to="/auth/login">
                Đăng nhập để tham gia
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          )}
        </div>
      }
      rightExtra={
        <div className="flex flex-col gap-5 w-full lg:max-w-xl">
          {/* Scoreboard */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ScoreboardChip
              label="Tổng kèo"
              value={total}
              icon={<Trophy className="size-3" />}
              hint="Trên toàn hệ thống"
            />
            <ScoreboardChip
              label="Đang mở"
              value={openCount}
              icon={<Zap className="size-3" />}
              accent="success"
              hint="Sẵn sàng để tham gia ngay"
            />
            <ScoreboardChip
              label="Sắp full"
              value={almostFullCount}
              icon={<Flame className="size-3" />}
              accent="danger"
              hint="Nhanh tay chốt ngay kẻo lỡ"
            />
            <ScoreboardChip
              label="Chỗ trống"
              value={totalSlotsLeft}
              icon={<UsersRound className="size-3" />}
              accent="primary"
              hint="Cơ hội để bạn đặt chân vào đội"
            />
          </div>

          {/* Search bar */}
          <SearchBar
            keyword={keyword}
            onKeywordChange={onKeywordChange}
            sportValue={sportValue}
            onSportChange={(value) =>
              onSportChange(
                value === "ALL" || VALID_SPORT_TYPES.has(value) ? value : "ALL",
              )
            }
            onSubmit={onSubmit}
            placeholder="Tìm kèo theo tiêu đề, sân, khu phức hợp..."
            submitLabel="Tìm kèo"
            allSportsValue="ALL"
            variant="hero"
          />
        </div>
      }
    />
  );
}
