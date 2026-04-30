import { ComplexCard } from "@/components/shared/ComplexCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchBar } from "@/components/shared/SearchBar";
import {
  SearchFilters,
  type SearchFiltersValue,
} from "@/components/shared/SearchFilters";
import { SubFieldCard } from "@/components/shared/SubFieldCard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { publicService } from "@/services/public.service";
import { SportType, type SportType as SportTypeValue, type Complex, type SubField } from "@/types";
import { Building2, Flag } from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

type TabValue = "complexes" | "subfields";

const ALL_SPORT_TYPES = new Set<string>(Object.values(SportType));

const parseSportTypesFromParams = (
  params: URLSearchParams,
): SportTypeValue[] => {
  // Primary: comma-separated `sport_types`
  const csv = params.get("sport_types");
  if (csv) {
    const tokens = csv
      .split(",")
      .map((token) => token.trim())
      .filter((token) => ALL_SPORT_TYPES.has(token));
    if (tokens.length > 0) return tokens as SportTypeValue[];
  }

  // Legacy fallback: single `sport_type`
  const legacy = params.get("sport_type");
  if (legacy && ALL_SPORT_TYPES.has(legacy)) {
    return [legacy as SportTypeValue];
  }
  return [];
};

const parseNumberParam = (
  params: URLSearchParams,
  key: string,
): number | undefined => {
  const raw = params.get(key);
  if (raw === null || raw === "") return undefined;
  const num = Number(raw);
  return Number.isFinite(num) && num >= 0 ? num : undefined;
};

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [complexResults, setComplexResults] = useState<Complex[]>([]);
  const [subFieldResults, setSubFieldResults] = useState<
    (SubField & { complex_name?: string; complex_address?: string })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [complexPagination, setComplexPagination] = useState({
    total: 0,
    page: 1,
    limit: 8,
    totalPages: 0,
  });
  const [subfieldPagination, setSubfieldPagination] = useState({
    total: 0,
    page: 1,
    limit: 8,
    totalPages: 0,
  });

  // Parse all filter values from URL — URL remains the source of truth.
  const location = searchParams.get("location") || undefined;
  const sportTypes = useMemo(
    () => parseSportTypesFromParams(searchParams),
    [searchParams],
  );
  const minPrice = parseNumberParam(searchParams, "minPrice");
  const maxPrice = parseNumberParam(searchParams, "maxPrice");
  const minCapacity = parseNumberParam(searchParams, "minCapacity");
  const maxCapacity = parseNumberParam(searchParams, "maxCapacity");

  const complexPage = Number(searchParams.get("complexPage")) || 1;
  const subfieldPage = Number(searchParams.get("subfieldPage")) || 1;
  const defaultTab = (searchParams.get("tab") as TabValue) || "complexes";

  // SearchBar binds to a single sport. Show the first sport from the URL,
  // or "ALL" when none is selected. Multi-select still flows through SearchFilters.
  const primarySport = sportTypes[0];

  // Local state for the search bar, seeded from URL.
  const [keyword, setKeyword] = useState<string>(location ?? "");
  const [sportValue, setSportValue] = useState<string>(primarySport ?? "ALL");

  useEffect(() => {
    setKeyword(location ?? "");
  }, [location]);
  useEffect(() => {
    setSportValue(primarySport ?? "ALL");
  }, [primarySport]);

  // Stable key for sport_types so the data-fetch effect re-runs on changes
  // without needing the array reference to be referentially stable.
  const sportTypesKey = sportTypes.join(",");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const sport_types = sportTypes.length > 0 ? sportTypes : undefined;

        const [complexesRes, subfieldsRes] = await Promise.all([
          publicService.getComplexes({
            page: complexPage,
            limit: 8,
            search: location,
            sport_types,
            minPrice,
            maxPrice,
          }),
          publicService.getSubfields({
            page: subfieldPage,
            limit: 8,
            search: location,
            sport_types,
            minCapacity,
            maxCapacity,
            minPrice,
            maxPrice,
          }),
        ]);

        setComplexResults(complexesRes.data?.complexes || []);
        setComplexPagination(
          complexesRes.data?.pagination || {
            total: 0,
            page: 1,
            limit: 8,
            totalPages: 0,
          },
        );

        setSubFieldResults(subfieldsRes.data?.subfields || []);
        setSubfieldPagination(
          subfieldsRes.data?.pagination || {
            total: 0,
            page: 1,
            limit: 8,
            totalPages: 0,
          },
        );
      } catch (error) {
        toast.error("Đã có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau.");
        console.error("Error fetching search results:", error);
        setComplexResults([]);
        setSubFieldResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [
    location,
    sportTypesKey,
    minPrice,
    maxPrice,
    minCapacity,
    maxCapacity,
    complexPage,
    subfieldPage,
  ]);

  const handleComplexPageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("complexPage", newPage.toString());
    setSearchParams(newParams);
  };

  const handleSubfieldPageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("subfieldPage", newPage.toString());
    setSearchParams(newParams);
  };

  /**
   * Apply a partial change to URL filter params and reset pagination.
   * Pass `undefined` to remove a key, or `null` to leave it untouched.
   */
  const updateFilterParams = (changes: Record<string, string | undefined | null>) => {
    const newParams = new URLSearchParams(searchParams);
    for (const [key, val] of Object.entries(changes)) {
      if (val === null) continue;
      if (val === undefined || val === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, val);
      }
    }
    // any filter change resets pagination
    newParams.delete("complexPage");
    newParams.delete("subfieldPage");
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = keyword.trim();
    updateFilterParams({
      location: trimmed || undefined,
      // SearchBar selects a single sport — override the multi-selection
      sport_types: sportValue && sportValue !== "ALL" ? sportValue : undefined,
      sport_type: undefined, // drop legacy param when user submits
    });
  };

  const filtersValue: SearchFiltersValue = {
    location,
    sportTypes,
    minPrice,
    maxPrice,
    minCapacity,
    maxCapacity,
  };

  const handleFiltersChange = (next: SearchFiltersValue) => {
    updateFilterParams({
      location: next.location ?? undefined,
      sport_types:
        next.sportTypes.length > 0 ? next.sportTypes.join(",") : undefined,
      sport_type: undefined,
      minPrice: next.minPrice !== undefined ? String(next.minPrice) : undefined,
      maxPrice: next.maxPrice !== undefined ? String(next.maxPrice) : undefined,
      minCapacity:
        next.minCapacity !== undefined ? String(next.minCapacity) : undefined,
      maxCapacity:
        next.maxCapacity !== undefined ? String(next.maxCapacity) : undefined,
    });
  };

  const hasActiveFilters =
    Boolean(location) ||
    sportTypes.length > 0 ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    minCapacity !== undefined ||
    maxCapacity !== undefined;

  const clearAllFilters = () => {
    const preserved = new URLSearchParams();
    const tab = searchParams.get("tab");
    if (tab) preserved.set("tab", tab);
    setSearchParams(preserved);
  };

  const totalResults = complexPagination.total + subfieldPagination.total;

  return (
    <div className="min-h-screen bg-background">
      <SearchHero
        totalResults={totalResults}
        isLoading={isLoading}
        keyword={keyword}
        sportValue={sportValue}
        onKeywordChange={setKeyword}
        onSportChange={setSportValue}
        onSubmit={handleSearchSubmit}
      />

      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <SearchFilters
            value={filtersValue}
            onChange={handleFiltersChange}
            className="mb-6"
          />

          <Tabs defaultValue={defaultTab} className="flex flex-col gap-6">
            <ResultTabsList
              complexesCount={complexPagination.total}
              subfieldsCount={subfieldPagination.total}
            />

            <TabsContent value="complexes" className="m-0">
              <ResultsPanel
                isLoading={isLoading}
                isEmpty={complexResults.length === 0}
                emptyTitle="Không tìm thấy khu phức hợp"
                emptyDescription="Thử điều chỉnh lại từ khoá hoặc bộ lọc để mở rộng kết quả."
                emptyActionLabel={hasActiveFilters ? "Xóa bộ lọc" : undefined}
                onEmptyAction={hasActiveFilters ? clearAllFilters : undefined}
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 motion-safe-stagger">
                  {complexResults.map((complex) => (
                    <ComplexCard key={complex.id} complex={complex} />
                  ))}
                </div>
              </ResultsPanel>

              <PaginationBar
                page={complexPagination.page}
                totalPages={complexPagination.totalPages}
                onPageChange={handleComplexPageChange}
              />
            </TabsContent>

            <TabsContent value="subfields" className="m-0">
              <ResultsPanel
                isLoading={isLoading}
                isEmpty={subFieldResults.length === 0}
                emptyTitle="Không tìm thấy sân lẻ"
                emptyDescription="Thử đổi môn thể thao, thay đổi khoảng giá hoặc mở rộng khu vực tìm kiếm."
                emptyActionLabel={hasActiveFilters ? "Xóa bộ lọc" : undefined}
                onEmptyAction={hasActiveFilters ? clearAllFilters : undefined}
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 motion-safe-stagger">
                  {subFieldResults.map((subField) => (
                    <SubFieldCard
                      key={subField.id}
                      subField={subField}
                      showComplexInfo
                    />
                  ))}
                </div>
              </ResultsPanel>

              <PaginationBar
                page={subfieldPagination.page}
                totalPages={subfieldPagination.totalPages}
                onPageChange={handleSubfieldPageChange}
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero                                                                        */
/* -------------------------------------------------------------------------- */

interface SearchHeroProps {
  totalResults: number;
  isLoading: boolean;
  keyword: string;
  sportValue: string;
  onKeywordChange: (value: string) => void;
  onSportChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function SearchHero({
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

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-14 pt-8 sm:px-6 lg:px-8 lg:pb-16 lg:pt-10">
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
          <div className="motion-safe-fade-up">
           

            <h1 className="mt-4 font-display text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-[3.75rem]">
              Tìm sân, chốt lịch,
              <br className="hidden sm:block" />{" "}
              <span className="italic text-accent-sport">ra sân ngay hôm nay.</span>
            </h1>

            <p className="mt-4 max-w-xl text-sm text-white/65 sm:text-base">
              Lọc theo môn thể thao, khu vực, khung giá và sức chứa — Tìm sân phù hợp nhanh chóng.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <ResultTicker isLoading={isLoading} totalResults={totalResults} />
          </div>
        </div>

        <div className="motion-safe-fade-up">
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
            disabled={isLoading}
          />
        </div>
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
        {isLoading ? (
          <Skeleton className="h-11 w-28 bg-white/15" />
        ) : (
          <span className="font-display text-4xl font-black leading-none sm:text-5xl">
            {totalResults.toLocaleString("vi-VN")}
          </span>
        )}
        <span className="pb-1 text-xs uppercase tracking-wider text-white/55">
          kết quả phù hợp
        </span>
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Tabs                                                                        */
/* -------------------------------------------------------------------------- */

interface ResultTabsListProps {
  complexesCount: number;
  subfieldsCount: number;
}

function ResultTabsList({
  complexesCount,
  subfieldsCount,
}: ResultTabsListProps) {
  return (
    <TabsList
      className={cn(
        "grid h-auto w-full grid-cols-2 gap-2 rounded-2xl bg-transparent p-0",
        "md:w-auto md:inline-grid md:min-w-[520px]",
      )}
    >
      <TabsTrigger value="complexes" asChild>
        <button
          type="button"
          className={cn(
            "group relative flex h-auto flex-col items-start gap-1 overflow-hidden rounded-2xl border border-border/70 bg-card px-5 py-4 text-left",
            "transition-all",
            "data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-card",
          )}
        >
          <span className="flex w-full items-center justify-between">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] opacity-70">
              <Building2 className="h-3 w-3" />
              Khu phức hợp
            </span>
            <span
              className={cn(
                "inline-block h-1.5 w-1.5 rounded-full bg-accent-sport opacity-0",
                "group-data-[state=active]:opacity-100",
              )}
              aria-hidden="true"
            />
          </span>
          <span className="font-display text-2xl font-black leading-none">
            {complexesCount.toLocaleString("vi-VN")}
          </span>
        </button>
      </TabsTrigger>

      <TabsTrigger value="subfields" asChild>
        <button
          type="button"
          className={cn(
            "group relative flex h-auto flex-col items-start gap-1 overflow-hidden rounded-2xl border border-border/70 bg-card px-5 py-4 text-left",
            "transition-all",
            "data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-card",
          )}
        >
          <span className="flex w-full items-center justify-between">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] opacity-70">
              <Flag className="h-3 w-3" />
              Sân lẻ
            </span>
            <span
              className={cn(
                "inline-block h-1.5 w-1.5 rounded-full bg-accent-sport opacity-0",
                "group-data-[state=active]:opacity-100",
              )}
              aria-hidden="true"
            />
          </span>
          <span className="font-display text-2xl font-black leading-none">
            {subfieldsCount.toLocaleString("vi-VN")}
          </span>
        </button>
      </TabsTrigger>
    </TabsList>
  );
}

/* -------------------------------------------------------------------------- */
/* Result panel                                                                */
/* -------------------------------------------------------------------------- */

interface ResultsPanelProps {
  isLoading: boolean;
  isEmpty: boolean;
  emptyTitle: string;
  emptyDescription: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  children: ReactNode;
}

function ResultsPanel({
  isLoading,
  isEmpty,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  children,
}: ResultsPanelProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <ResultCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return <>{children}</>;
}

function ResultCardSkeleton() {
  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden rounded-2xl border-border/70 p-0">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="mt-auto flex items-center justify-between border-t border-dashed border-border pt-3">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-2.5 w-10" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Pagination                                                                  */
/* -------------------------------------------------------------------------- */

interface PaginationBarProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function PaginationBar({ page, totalPages, onPageChange }: PaginationBarProps) {
  if (totalPages <= 1) return null;

  const pageItems = buildPageList(page, totalPages);

  const go = (event: React.MouseEvent, target: number) => {
    event.preventDefault();
    if (target < 1 || target > totalPages || target === page) return;
    onPageChange(target);
  };

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={page === 1}
            className={cn(page === 1 && "pointer-events-none opacity-50")}
            onClick={(event) => go(event, page - 1)}
          />
        </PaginationItem>

        {pageItems.map((item, idx) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href="#"
                isActive={item === page}
                onClick={(event) => go(event, item)}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={page === totalPages}
            className={cn(
              page === totalPages && "pointer-events-none opacity-50",
            )}
            onClick={(event) => go(event, page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function buildPageList(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const items: (number | "ellipsis")[] = [1];

  if (current > 3) items.push("ellipsis");

  const from = Math.max(2, current - 1);
  const to = Math.min(total - 1, current + 1);
  for (let i = from; i <= to; i++) items.push(i);

  if (current < total - 2) items.push("ellipsis");

  items.push(total);
  return items;
}
