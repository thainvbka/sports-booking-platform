import { type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { SearchBar } from "@/components/shared/ui-utility/SearchBar";
import { cn } from "@/lib/utils";

interface SearchHeroProps {
  totalResults: number;
  isLoading: boolean;
  keyword: string;
  sportValue: string;
  onKeywordChange: (value: string) => void;
  onSportChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function SearchHero({
  totalResults,
  isLoading,
  keyword,
  sportValue,
  onKeywordChange,
  onSportChange,
  onSubmit,
}: SearchHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950 text-white">
      <div
        className="absolute inset-0 bg-linear-to-br from-slate-950 via-slate-900 to-blue-950/80"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-grid-dark" aria-hidden="true" />
      <div
        className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-primary/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-accent-sport/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="page-shell relative z-10 flex flex-col gap-6 lg:gap-8 pb-14 pt-10 sm:pt-12 lg:pb-16 lg:pt-14">
        <Breadcrumb>
          <BreadcrumbList className="text-white/60">
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="hover:text-white">
                <Link to="/">Trang chủ</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/30" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-white">
                Tìm sân
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <h1 className="mt-4 font-display text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-[3.75rem]">
              Săn sân cực khét,
              <br className="hidden sm:block" />{" "}
              <span className="italic text-accent-sport">chốt kèo siêu nét.</span>
            </h1>

            <p className="mt-4 max-w-xl text-sm text-white/65 sm:text-base">
              Bộ lọc theo môn thể thao, tên sân, khu vực, khung giá và sức chứa — Tìm sân phù hợp nhanh chóng.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <ResultTicker isLoading={isLoading} totalResults={totalResults} />
          </div>
        </div>

        <SearchBar
          keyword={keyword}
          onKeywordChange={onKeywordChange}
          sportValue={sportValue}
          onSportChange={onSportChange}
          onSubmit={onSubmit}
          placeholder="Tìm sân theo tên, địa chỉ, khu vực..."
          submitLabel="Tìm kiếm"
          allSportsValue="ALL"
          variant="hero"
        />
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-b from-transparent to-background"
        aria-hidden="true"
      />
    </section>
  );
}

interface ResultTickerProps {
  isLoading: boolean;
  totalResults: number;
}

function ResultTicker({ isLoading, totalResults }: ResultTickerProps) {
  return (
    <Card className="w-full max-w-sm gap-0 rounded-2xl border-white/10 bg-white/[0.06] p-5 text-white shadow-none backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
          Sân và Khu phức hợp
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/75">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-accent-sport" />
            <span className="relative inline-flex size-1.5 rounded-full bg-accent-sport" />
          </span>
          Đang hoạt động
        </span>
      </div>

      <div className="mt-3 flex items-end gap-2">
        <span className={cn("font-display text-4xl font-black leading-none sm:text-5xl transition-opacity duration-200", isLoading && "opacity-60")}>
          {totalResults.toLocaleString("vi-VN")}
        </span>
        <span className="pb-1 text-xs uppercase tracking-wider text-white/55">
          kết quả phù hợp
        </span>
      </div>
    </Card>
  );
}
