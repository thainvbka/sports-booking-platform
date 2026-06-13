import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import { getNameInitials } from "@/utils/review.utils";
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
    <section className="relative isolate overflow-hidden bg-slate-950 text-white">
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-br from-slate-950 via-slate-900 to-blue-950/80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,hsl(142_76%_36%/0.35),transparent_55%),radial-gradient(circle_at_85%_30%,hsl(217_91%_60%/0.35),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 sports-field-pattern opacity-[0.1]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-24 size-72 rounded-full bg-accent-sport/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-12 size-80 rounded-full bg-primary/25 blur-3xl"
      />

      <div className="page-shell relative flex min-h-[340px] flex-col gap-6 lg:gap-8 pt-10 sm:pt-12 lg:pt-14 pb-12 sm:pb-16 lg:pb-20">
        <Breadcrumb>
          <BreadcrumbList className="text-white/60">
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="hover:text-white">
                <Link to="/">Trang chủ</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/30" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-white">Kèo của tôi</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3">
            <h1 className="font-display text-4xl font-black italic leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Kèo xịn trong{" "}
              <span className="bg-gradient-to-r from-primary via-blue-500 to-accent-sport bg-clip-text text-transparent">
                tay
              </span>
              <br className="hidden sm:block" />
              ra sân cực cháy
            </h1>

            <p className="max-w-xl text-base text-white/70 sm:text-lg">
              Sổ tay cá nhân cho các kèo bạn đã tạo, đã tham gia và đang chờ
              chủ kèo duyệt.
            </p>

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
          </div>

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
        </header>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-background"
      />
    </section>
  );
}
