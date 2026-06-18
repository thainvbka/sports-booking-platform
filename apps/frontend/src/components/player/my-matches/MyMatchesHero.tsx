import { PlayerDarkHeroShell } from "@/components/shared/layout/PlayerDarkHeroShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MATCH_STATUS_BADGE_CONFIG,
  MATCH_STATUS_OPTIONS,
  type MatchStatus,
} from "@/types/match.type";
import { getNameInitials } from "@/utils/review.util";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface MyMatchesHeroProps {
  user: { avatar?: string | null; full_name?: string } | null;
  displayName: string;
  status: MatchStatus | "ALL";
  onStatusChange: (status: MatchStatus | "ALL") => void;
  onPageReset: () => void;
}

const parseMatchStatus = (value: string): MatchStatus | "ALL" => {
  if (value === "ALL") return "ALL";
  return MATCH_STATUS_OPTIONS.find((item) => item === value) ?? "ALL";
};

export function MyMatchesHero({
  user,
  displayName,
  status,
  onStatusChange,
  onPageReset,
}: MyMatchesHeroProps) {
  return (
    <PlayerDarkHeroShell
      breadcrumbs={[
        { label: "Trang chủ", href: "/" },
        { label: "Kèo của tôi" },
      ]}
      title={
        <h1 className="font-display text-4xl font-black italic leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl text-white">
          Kèo xịn trong{" "}
          <span className="bg-gradient-to-r from-primary via-blue-500 to-accent-sport bg-clip-text text-transparent">
            tay
          </span>
          <br className="hidden sm:block" />
          ra sân cực cháy
        </h1>
      }
      description={
        <p className="max-w-xl text-base text-white/70 sm:text-lg">
          Sổ tay cá nhân cho các kèo bạn đã tạo, đã tham gia và đang chờ
          chủ kèo duyệt.
        </p>
      }
      leftExtra={
        <div className="mt-1 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 py-1 pl-1 pr-3 shadow-sm backdrop-blur-sm">
          <Avatar className="size-6 shrink-0 ring-1 ring-white/30">
            <AvatarImage src={user?.avatar ?? undefined} alt={displayName} />
            <AvatarFallback className="bg-white/20 text-[10px] font-semibold text-white">
              {getNameInitials(displayName, "P")}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-semibold text-white">
            {displayName}
          </span>
          <span
            aria-hidden
            className="inline-block h-3 w-px bg-white/30"
          />
          <span className="text-[11px] uppercase tracking-[0.18em] text-white/70">
            Player
          </span>
        </div>
      }
      rightExtra={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
          <Select
            value={status}
            onValueChange={(value) => {
              onStatusChange(parseMatchStatus(value));
              onPageReset();
            }}
          >
            <SelectTrigger
              size="sm"
              className="h-10 gap-1.5 rounded-lg border-white/30 bg-white/10 text-sm font-medium text-white"
            >
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              {MATCH_STATUS_OPTIONS.map((item) => (
                <SelectItem key={item} value={item}>
                  {MATCH_STATUS_BADGE_CONFIG[item].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            asChild
            size="lg"
            className="self-start bg-white text-slate-950 hover:bg-white/90 sm:self-auto"
          >
            <Link to="/matches">
              <Sparkles data-icon="inline-start" />
              Khám phá kèo mới
              <ArrowUpRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      }
    />
  );
}

