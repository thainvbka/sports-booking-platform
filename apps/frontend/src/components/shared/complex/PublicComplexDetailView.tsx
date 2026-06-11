import { SubFieldCard } from "@/components/shared/subfield/SubFieldCard";
import { EmptyState } from "@/components/shared/ui-utility/EmptyState";
import { LoadingState } from "@/components/shared/ui-utility/LoadingState";
import { SportImage } from "@/components/shared/ui-utility/SportImage";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import type {
  ComplexDetail,
  PaginationMeta,
  SportType,
  SubField,
} from "@/types";
import { buildPageList, formatPrice, getSportTypeLabel } from "@/utils";
import {
  LayoutGrid,
  Navigation,
  Search,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ComplexFacilities } from "./ComplexFacilities";
import { ComplexHeader } from "./ComplexHeader";
import { ComplexLocationMap } from "./ComplexLocationMap";

interface PublicComplexDetailViewProps {
  complex: ComplexDetail | null;
  subfields: SubField[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onRetry?: () => void;
}

export function PublicComplexDetailView({
  complex,
  subfields,
  pagination,
  isLoading,
  error,
  searchTerm,
  onSearchChange,
  onPageChange,
  onRetry,
}: PublicComplexDetailViewProps) {
  if (isLoading && !complex) {
    return (
      <div className="flex min-h-[60vh] flex-col">
        <HeroSkeleton />
        <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <LoadingState text="Đang tải chi tiết khu phức hợp..." />
        </section>
      </div>
    );
  }

  if (error || !complex) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col justify-center px-4 py-20 sm:px-6">
        <EmptyState
          title={
            error ? "Không thể tải khu phức hợp" : "Không tìm thấy khu phức hợp"
          }
          description={
            error ??
            "Khu phức hợp bạn đang tìm không tồn tại hoặc đã ngừng hoạt động."
          }
          actionLabel={error && onRetry ? "Thử lại" : "Về trang tìm sân"}
          onAction={
            error && onRetry
              ? onRetry
              : () => {
                  window.location.href = "/search";
                }
          }
          className="py-16"
        />
      </section>
    );
  }

  const totalSubfields = complex._count?.sub_fields ?? subfields.length;
  const sportTypes = Array.from(
    new Set(subfields.map((sf) => sf.sport_type)),
  ) as SportType[];
  const validPrices = subfields
    .map((sf) => sf.min_price)
    .filter((price): price is number => typeof price === "number" && price > 0);
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;
  const capacities = subfields
    .map((sf) => sf.capacity)
    .filter((n) => typeof n === "number" && n > 0);
  const maxCapacity = capacities.length > 0 ? Math.max(...capacities) : null;
  const totalResults = pagination?.total ?? subfields.length;

  return (
    <div className="flex min-h-[60vh] flex-col bg-background motion-safe-fade-up">
      <ComplexHero
        complex={complex}
        totalSubfields={totalSubfields}
        sportTypes={sportTypes}
        minPrice={minPrice}
        maxCapacity={maxCapacity}
      />

      <section
        id="subfields"
        className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12"
      >
        <SubfieldBrowser
          complex={complex}
          subfields={subfields}
          pagination={pagination}
          searchTerm={searchTerm}
          totalResults={totalResults}
          isLoading={isLoading}
          onSearchChange={onSearchChange}
          onPageChange={onPageChange}
        />

        <div className="border-t border-border pt-8">
          <ComplexLocationMap complexAddress={complex.complex_address} />
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero                                                                        */
/* -------------------------------------------------------------------------- */

interface ComplexHeroProps {
  complex: ComplexDetail;
  totalSubfields: number;
  sportTypes: SportType[];
  minPrice: number | null;
  maxCapacity: number | null;
}

function ComplexHero({
  complex,
  totalSubfields,
  sportTypes,
  minPrice,
  maxCapacity,
}: ComplexHeroProps) {
  const primarySport = sportTypes[0];
  const sportSummary =
    sportTypes.length === 0
      ? "Đa dạng"
      : sportTypes.length === 1
        ? getSportTypeLabel(sportTypes[0])
        : `${sportTypes.length} môn`;
  const sportSub =
    sportTypes.length > 1
      ? sportTypes
          .slice(0, 3)
          .map((s) => getSportTypeLabel(s))
          .join(" · ")
      : undefined;

  const mapsHref = `https://www.google.com/maps/search/${encodeURIComponent(
    complex.complex_address,
  )}`;

  return (
    <section className="relative isolate overflow-hidden bg-slate-950 text-white">
      {complex.complex_image ? (
        <img
          aria-hidden
          src={complex.complex_image}
          alt=""
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-40 blur-[2px]"
        />
      ) : null}
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-b from-slate-950/65 via-slate-950/85 to-slate-950"
      />
      <div
        aria-hidden
        className="absolute inset-0 sports-field-pattern opacity-12"
      />
      <div
        aria-hidden
        className="absolute -left-24 top-6 size-64 rounded-full bg-primary/30 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -right-20 bottom-0 size-56 rounded-full bg-accent-sport/25 blur-3xl"
      />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6 lg:gap-8 px-4 pt-10 sm:pt-12 lg:pt-14 pb-10 lg:pb-14">
        <Breadcrumb>
          <BreadcrumbList className="text-white/60">
            <BreadcrumbItem>
              <BreadcrumbLink
                asChild
                className="text-white/60 hover:text-white"
              >
                <Link to="/">Trang chủ</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="[&>svg]:text-white/30" />
            <BreadcrumbItem>
              <BreadcrumbLink
                asChild
                className="text-white/60 hover:text-white"
              >
                <Link to="/search?tab=complexes">Tìm sân</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="[&>svg]:text-white/30" />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[220px] truncate text-white sm:max-w-none">
                {complex.complex_name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="flex flex-col gap-5 text-left">
            <ComplexHeader
              complexName={complex.complex_name}
              complexAddress={complex.complex_address}
              sportTypes={sportTypes}
              avgRating={complex.avg_rating}
            />

            <ComplexFacilities
              totalSubfields={totalSubfields}
              sportSummary={sportSummary}
              sportSub={sportSub}
              priceMinLabel={minPrice ? `${formatPrice(minPrice)}` : "Liên hệ"}
              priceMinSub={minPrice ? "từ /giờ" : undefined}
              maxCapacityLabel={maxCapacity ? `${maxCapacity}` : "—"}
              maxCapacitySub={maxCapacity ? "người / sân" : undefined}
            />

            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild size="sm" className="rounded-full">
                <a href="#subfields">
                  <LayoutGrid className="size-4 mr-2" />
                  Xem {totalSubfields} sân
                </a>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <a href={mapsHref} target="_blank" rel="noopener noreferrer">
                  <Navigation className="size-4 mr-2" />
                  Chỉ đường
                </a>
              </Button>
            </div>
          </div>

          <HeroImage
            image={complex.complex_image}
            sportType={primarySport}
            title={complex.complex_name}
          />
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-b from-transparent to-background"
      />
    </section>
  );
}

interface HeroImageProps {
  image?: string;
  sportType?: SportType;
  title: string;
}

function HeroImage({ image, sportType, title }: HeroImageProps) {
  return (
    <div className="relative lg:pl-4">
      <div className="relative aspect-[16/11] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/40">
        <SportImage
          src={image}
          sportType={sportType}
          title={title}
          className="h-full w-full"
          showFallbackLabel
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-tr from-slate-950/55 via-transparent to-transparent"
        />
        <span className="absolute bottom-2 left-2 rounded-full border border-white/20 bg-slate-950/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80 backdrop-blur-sm">
          Venue
        </span>
      </div>
    </div>
  );
}

function HeroSkeleton() {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-14 sm:px-6 lg:px-8">
        <Skeleton className="h-4 w-64 bg-white/10" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-3 w-40 bg-white/10" />
            <Skeleton className="h-10 w-3/4 bg-white/10" />
            <Skeleton className="h-4 w-2/3 bg-white/10" />
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[72px] bg-white/10" />
              ))}
            </div>
          </div>
          <Skeleton className="aspect-[16/11] w-full rounded-2xl bg-white/10" />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Subfield browser                                                            */
/* -------------------------------------------------------------------------- */

interface SubfieldBrowserProps {
  complex: ComplexDetail;
  subfields: SubField[];
  pagination: PaginationMeta | null;
  searchTerm: string;
  totalResults: number;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
}

function SubfieldBrowser({
  complex,
  subfields,
  pagination,
  searchTerm,
  totalResults,
  isLoading,
  onSearchChange,
  onPageChange,
}: SubfieldBrowserProps) {
  const hasResults = subfields.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 space-y-1.5 text-left">
          {/* <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-px w-6 bg-border" />
            Đặt sân
          </div> */}
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground italic sm:text-3xl">
            Các sân có sẵn
          </h2>
          <p className="text-sm text-muted-foreground">
            {totalResults > 0
              ? `${totalResults} sân con đang mở đặt tại ${complex.complex_name}`
              : "Khu phức hợp này chưa có sân nào để đặt."}
          </p>
        </div>

        <div className="flex w-full max-w-md items-center gap-2 sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              aria-label="Tìm kiếm sân con"
              placeholder="Tìm tên sân..."
              className="h-10 rounded-full border-border bg-card pl-9 pr-4"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
        </div>
      </div>

      {searchTerm ? (
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="rounded-full bg-surface-2 py-1 pl-3 pr-1 text-xs"
          >
            <span className="text-muted-foreground">Từ khoá:</span>
            <span className="ml-1 font-semibold">{searchTerm}</span>
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Xoá từ khoá"
              className="ml-1 inline-flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          </Badge>
        </div>
      ) : null}

      {isLoading ? (
        <SubfieldGridSkeleton />
      ) : hasResults ? (
        <>
          <div
            key={`complex-subfields-grid-${pagination?.page ?? 1}-${searchTerm}-${subfields.map((sf) => sf.id).join(",")}`}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 motion-safe-stagger"
          >
            {subfields.map((subField) => (
              <SubFieldCard
                key={subField.id}
                subField={{
                  ...subField,
                  complex_name: complex.complex_name,
                  complex_address: complex.complex_address,
                }}
                mode="player"
                showComplexInfo={false}
              />
            ))}
          </div>
          <PaginationBar
            page={pagination?.page ?? 1}
            totalPages={pagination?.totalPages ?? 1}
            onPageChange={onPageChange}
          />
        </>
      ) : (
        <Card className="border-dashed bg-surface-2/40 py-4">
          <EmptyState
            title={
              searchTerm ? "Không tìm thấy sân phù hợp" : "Chưa có sân nào"
            }
            description={
              searchTerm
                ? `Không có sân nào khớp với "${searchTerm}". Thử từ khoá khác nhé.`
                : "Khu phức hợp này hiện chưa có sân con để đặt."
            }
            actionLabel={searchTerm ? "Xoá tìm kiếm" : undefined}
            onAction={searchTerm ? () => onSearchChange("") : undefined}
            className="border-0 bg-transparent py-12"
          />
        </Card>
      )}
    </div>
  );
}

function SubfieldGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-3">
          <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
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
    <Pagination className="mt-6">
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

