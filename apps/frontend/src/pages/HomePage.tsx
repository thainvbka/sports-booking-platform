import { heroBg } from "@/assets";
import { ComplexCard } from "@/components/shared/ComplexCard";
import { CourtCard } from "@/components/shared/CourtCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import { SearchBar } from "@/components/shared/SearchBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { publicService } from "@/services/public.service";
import type { Complex, PublicSubfield, SportType } from "@/types";
import { SportType as SportTypeValue } from "@/types";
import {
    ArrowRight,
    CalendarCheck,
    CheckCircle2,
    Search as SearchIcon,
    Sparkles,
} from "lucide-react";
import {
    Fragment,
    useEffect,
    useState,
    type FormEvent,
    type ReactNode,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface HomeSportCategory {
  name: string;
  emoji: string;
  type: SportType;
  courtCount: number;
  tagline: string;
}

interface HowItWorksStep {
  step: string;
  title: string;
  description: string;
  icon: ReactNode;
}

interface HomeStat {
  value: string;
  label: string;
}

const SPORT_TYPE_OPTIONS = Object.values(SportTypeValue) as SportType[];
const parseSportType = (value: string): SportType | "ALL" => {
  if (value === "ALL") {
    return "ALL";
  }

  return SPORT_TYPE_OPTIONS.find((sportType) => sportType === value) ?? "ALL";
};

const SPORT_CATEGORIES: HomeSportCategory[] = [
  {
    name: "Cầu lông",
    emoji: "🏸",
    type: SportTypeValue.BADMINTON,
    courtCount: 24,
    tagline: "Indoor • Đèn LED",
  },
  {
    name: "Bóng đá",
    emoji: "⚽",
    type: SportTypeValue.FOOTBALL,
    courtCount: 19,
    tagline: "Sân 5 / 7 / 11",
  },
  {
    name: "Pickleball",
    emoji: "🏓",
    type: SportTypeValue.PICKLEBALL,
    courtCount: 17,
    tagline: "Hot • Thịnh hành",
  },
  {
    name: "Tennis",
    emoji: "🎾",
    type: SportTypeValue.TENNIS,
    courtCount: 14,
    tagline: "Clay • Hard court",
  },
  {
    name: "Bóng rổ",
    emoji: "🏀",
    type: SportTypeValue.BASKETBALL,
    courtCount: 11,
    tagline: "3x3 • Full court",
  },
];

const HERO_STATS: HomeStat[] = [
  { value: "2.5K+", label: "Sân đang hoạt động" },
  { value: "150+", label: "Khu phức hợp" },
  { value: "50K+", label: "Booking đã chốt" },
  { value: "4.9★", label: "Đánh giá trung bình" },
];

const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    step: "01",
    icon: <SearchIcon className="h-5 w-5" />,
    title: "Tìm kiếm",
    description: "Tìm sân theo môn thể thao, khu vực và khung giờ phù hợp.",
  },
  {
    step: "02",
    icon: <CalendarCheck className="h-5 w-5" />,
    title: "Chọn lịch",
    description: "Xem lịch trống realtime và giữ chỗ chỉ trong vài giây.",
  },
  {
    step: "03",
    icon: <CheckCircle2 className="h-5 w-5" />,
    title: "Xác nhận",
    description: "Thanh toán nhanh, nhận thông tin booking và ra sân thi đấu.",
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const [featuredComplexes, setFeaturedComplexes] = useState<Complex[]>([]);
  const [availableCourts, setAvailableCourts] = useState<PublicSubfield[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // TODO: Replace with dedicated homepage endpoint when backend supports /public/home.
        const [complexesRes, subfieldsRes] = await Promise.all([
          publicService.getComplexes({ page: 1, limit: 4 }),
          publicService.getSubfields({ page: 1, limit: 6 }),
        ]);

        setFeaturedComplexes((complexesRes.data?.complexes || []).slice(0, 4));
        setAvailableCourts((subfieldsRes.data?.subfields || []).slice(0, 6));
      } catch {
        toast.error("Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
        setFeaturedComplexes([]);
        setAvailableCourts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <SportCategoriesSection />
      <LiveCourtsSection
        isLoading={isLoading}
        courts={availableCourts}
        onBrowse={() => navigate("/search?tab=subfields")}
      />
      <FeaturedComplexesSection
        isLoading={isLoading}
        complexes={featuredComplexes}
        onBrowse={() => navigate("/search?tab=complexes")}
      />
      <HowItWorksSection />
      <CtaSection />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero                                                                        */
/* -------------------------------------------------------------------------- */

function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950 text-white">
      <img
        src={heroBg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-25"
      />
      <div
        className="absolute inset-0 bg-linear-to-br from-slate-950 via-slate-950/85 to-blue-950/80"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-grid-dark" aria-hidden="true" />
      <div
        className="absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-primary/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent-sport/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-20 lg:pt-28">
        <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="motion-safe-fade-up">
            <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-accent-sport" />
                <span className="relative inline-flex size-2 rounded-full bg-accent-sport" />
              </span>
              Live on T-Sport · Est. 2025
            </div>

            <h1 className="mt-6 font-display text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-[5.25rem]">
              Chốt sân.
              <br />
              <span className="italic text-accent-sport">Ra trận</span>{" "}
              <span className="text-stroke-white">cùng đồng đội.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base text-white/70 sm:text-lg">
              Nền tảng đặt sân thể thao realtime. Tìm sân phù hợp, giữ chỗ trong
              vài giây, thanh toán gọn — sẵn sàng thi đấu trong hôm nay.
            </p>

            <HeroSearchForm />

            <div className="mt-6 flex items-center gap-3 text-xs text-white/60">
              <span className="font-semibold uppercase tracking-[0.18em] text-white/70">
                Phổ biến
              </span>
              <span className="h-px flex-1 bg-white/15" aria-hidden="true" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {SPORT_CATEGORIES.map((sport) => (
                <Link
                  key={sport.type}
                  to={`/search?sport_type=${sport.type}`}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full",
                    "border border-white/20 bg-white/5 px-3 py-1.5",
                    "text-sm text-white/85 backdrop-blur-sm transition",
                    "hover:-translate-y-0.5 hover:border-accent-sport/60 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <span aria-hidden="true">{sport.emoji}</span>
                  {sport.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative lg:pl-8">
            <div
              className="pointer-events-none absolute -left-4 -top-4 hidden text-[11px] font-semibold uppercase tracking-[0.3em] text-white/30 lg:block"
              aria-hidden="true"
            >
              / overview
            </div>

            <div className="grid grid-cols-2 gap-4 motion-safe-stagger">
              {HERO_STATS.map((stat, index) => (
                <div
                  key={stat.label}
                  className={cn(
                    "relative rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm",
                    "transition hover:border-accent-sport/40 hover:bg-white/[0.07]",
                    index % 2 === 1 && "lg:translate-y-6",
                  )}
                >
                  <div className="font-display text-3xl font-black text-white sm:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-wider text-white/60">
                    {stat.label}
                  </div>
                  <div
                    className="absolute right-4 top-4 size-1.5 rounded-full bg-accent-sport/80"
                    aria-hidden="true"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm lg:flex">
              <Sparkles className="h-5 w-5 text-accent-sport" />
              <div className="flex-1 text-sm text-white/80">
                Hơn{" "}
                <span className="font-semibold text-white">
                  1.200 booking
                </span>{" "}
                được chốt trong 24 giờ qua.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-transparent to-background"
        aria-hidden="true"
      />
    </section>
  );
}

function HeroSearchForm() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [sportType, setSportType] = useState<SportType | "ALL">("ALL");

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams();
    const trimmedKeyword = keyword.trim();

    if (trimmedKeyword) {
      params.set("location", trimmedKeyword);
    }

    if (sportType !== "ALL") {
      params.set("sport_type", sportType);
    }

    navigate(`/search?${params.toString()}`);
  };

  return (
    <SearchBar
      keyword={keyword}
      onKeywordChange={setKeyword}
      sportValue={sportType}
      onSportChange={(value) => setSportType(parseSportType(value))}
      onSubmit={handleSearch}
      placeholder="Tìm sân theo tên, địa chỉ..."
      submitLabel="Tìm kiếm"
      allSportsValue="ALL"
      variant="hero"
      className="mt-10 max-w-2xl"
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Section header                                                              */
/* -------------------------------------------------------------------------- */

interface SectionHeaderProps {
  eyebrow: ReactNode;
  title: ReactNode;
  description?: string;
  action?: ReactNode;
  tone?: "light" | "dark";
}

function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  tone = "light",
}: SectionHeaderProps) {
  const isDark = tone === "dark";

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <div
          className={cn(
            "flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em]",
            isDark ? "text-white/55" : "text-muted-foreground",
          )}
        >
          <span
            className={cn(
              "h-px w-8",
              isDark ? "bg-white/30" : "bg-border-strong",
            )}
            aria-hidden="true"
          />
          {eyebrow}
        </div>
        <h2
          className={cn(
            "mt-3 font-display text-3xl font-black leading-tight tracking-tight sm:text-4xl",
            isDark ? "text-white" : "text-foreground",
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              "mt-3 text-sm sm:text-base",
              isDark ? "text-white/65" : "text-muted-foreground",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sports bento                                                                */
/* -------------------------------------------------------------------------- */

function SportCategoriesSection() {
  const [hero, ...rest] = SPORT_CATEGORIES;

  return (
    <section className="relative bg-background py-20">
      <div className="absolute inset-0 bg-grid-faint opacity-60" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Section 01 — Môn thể thao"
          title={
            <>
              Chọn môn bạn yêu,
              <br className="hidden sm:block" /> chúng tôi lo phần còn lại.
            </>
          }
          description="Năm bộ môn phổ biến nhất trên T-Sport — khung giờ realtime, giá minh bạch, không phí ẩn."
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
          <SportBentoCard category={hero} featured className="lg:row-span-2" />
          {rest.map((category) => (
            <SportBentoCard key={category.type} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface SportBentoCardProps {
  category: HomeSportCategory;
  featured?: boolean;
  className?: string;
}

function SportBentoCard({ category, featured, className }: SportBentoCardProps) {
  return (
    <Link
      to={`/search?sport_type=${category.type}`}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6",
        "transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-card-hover",
        featured &&
          "bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 text-white border-transparent",
        className,
      )}
    >
      {featured ? (
        <div
          className="pointer-events-none absolute inset-0 bg-grid-dark opacity-70"
          aria-hidden="true"
        />
      ) : null}
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 size-40 rounded-full blur-3xl transition-opacity",
          featured ? "bg-accent-sport/25" : "bg-primary/10",
          "opacity-60 group-hover:opacity-100",
        )}
        aria-hidden="true"
      />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <span
            className={cn(
              "text-[11px] font-semibold uppercase tracking-[0.22em]",
              featured ? "text-accent-sport" : "text-primary",
            )}
          >
            {category.tagline}
          </span>
          <ArrowRight
            className={cn(
              "h-5 w-5 -rotate-45 transition-transform group-hover:rotate-0",
              featured ? "text-white/70" : "text-muted-foreground",
            )}
          />
        </div>

        <div
          className={cn(
            "mt-4 leading-none drop-shadow-sm",
            featured
              ? "text-[8rem] sm:text-[9rem]"
              : "text-6xl sm:text-7xl",
          )}
          aria-hidden="true"
        >
          {category.emoji}
        </div>

        <div className={cn("mt-auto pt-6", featured && "pt-10")}>
          <h3
            className={cn(
              "font-display font-black leading-tight tracking-tight",
              featured ? "text-4xl sm:text-5xl" : "text-2xl",
            )}
          >
            {category.name}
          </h3>
          <div
            className={cn(
              "mt-3 flex items-center gap-2 text-xs",
              featured ? "text-white/65" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "font-display font-bold",
                featured ? "text-accent-sport text-base" : "text-primary text-sm",
              )}
            >
              {category.courtCount}
            </span>
            sân đang sẵn sàng
          </div>
        </div>
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Live courts                                                                 */
/* -------------------------------------------------------------------------- */

interface LiveCourtsSectionProps {
  isLoading: boolean;
  courts: PublicSubfield[];
  onBrowse: () => void;
}

function LiveCourtsSection({
  isLoading,
  courts,
  onBrowse,
}: LiveCourtsSectionProps) {
  return (
    <section className="relative bg-surface-2 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow={
            <span className="inline-flex items-center gap-2">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-accent-sport" />
                <span className="relative inline-flex size-1.5 rounded-full bg-accent-sport" />
              </span>
              Section 02 — Live / Sân đang trống
            </span>
          }
          title={
            <>
              Sẵn sàng thi đấu,
              <br className="hidden sm:block" /> chỉ đợi bạn ra sân.
            </>
          }
          description="Danh sách sân khả dụng được cập nhật theo thời gian thực trong vài khung giờ tới."
          action={
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link to="/search?tab=subfields">
                Xem tất cả
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          }
        />

        {isLoading ? (
          <LoadingState
            text="Đang tải danh sách sân khả dụng..."
            className="mt-10"
          />
        ) : courts.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 motion-safe-stagger">
            {courts.map((court) => (
              <CourtCard key={court.id} court={court} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Chưa có sân phù hợp"
            description="Hiện chưa có sân khả dụng cho mục này. Vui lòng thử lại sau hoặc mở trang tìm kiếm để lọc thêm."
            actionLabel="Mở trang tìm sân"
            onAction={onBrowse}
            className="mt-10"
          />
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Featured complexes                                                          */
/* -------------------------------------------------------------------------- */

interface FeaturedComplexesSectionProps {
  isLoading: boolean;
  complexes: Complex[];
  onBrowse: () => void;
}

function FeaturedComplexesSection({
  isLoading,
  complexes,
  onBrowse,
}: FeaturedComplexesSectionProps) {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950 py-20 text-white">
      <div className="absolute inset-0 bg-grid-dark opacity-60" aria-hidden="true" />
      <div
        className="absolute -right-40 top-0 h-80 w-80 rounded-full bg-primary/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-accent-sport/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Section 03 — Signature venues"
          tone="dark"
          title={
            <>
              Khu phức hợp
              <br className="hidden sm:block" />{" "}
              <span className="italic text-accent-sport">được chọn lọc.</span>
            </>
          }
          description="Không gian chất lượng cao, đa bộ môn, được cộng đồng T-Sport yêu thích."
          action={
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white"
            >
              <Link to="/search?tab=complexes">
                Xem tất cả
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          }
        />

        {isLoading ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm">
            <LoadingState
              text="Đang tải khu phức hợp nổi bật..."
              className="border-0 bg-transparent text-white/70"
            />
          </div>
        ) : complexes.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 motion-safe-stagger">
            {complexes.map((complex) => (
              <ComplexCard key={complex.id} complex={complex} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-white/15 bg-white/[0.04] p-12 text-center backdrop-blur-sm">
            <p className="font-display text-lg font-semibold text-white">
              Chưa có khu phức hợp nổi bật
            </p>
            <p className="mt-1 text-sm text-white/60">
              Dữ liệu khu phức hợp đang được cập nhật. Bạn có thể vào trang tìm
              sân để xem toàn bộ danh sách.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-5 rounded-full border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white"
              onClick={onBrowse}
            >
              Xem trang tìm sân
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* How it works                                                                */
/* -------------------------------------------------------------------------- */

function HowItWorksSection() {
  return (
    <section className="relative bg-background py-20">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Section 04 — Quy trình"
          title={
            <>
              Ba bước,
              <br className="hidden sm:block" /> ra sân trong ngày.
            </>
          }
          description="Từ lúc mở app đến lúc đứng trên sân chỉ còn một vài cú chạm."
        />

        <div className="relative mt-14 grid gap-10 md:grid-cols-3">
          <div
            className="pointer-events-none absolute inset-x-0 top-6 hidden h-px md:block"
            aria-hidden="true"
          >
            <div className="mx-auto h-full max-w-3xl border-t border-dashed border-border-strong/80" />
          </div>

          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <Fragment key={step.step}>
              <article className="relative flex flex-col">
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "relative flex size-12 shrink-0 items-center justify-center rounded-full",
                      "bg-foreground text-background shadow-sm",
                    )}
                  >
                    {step.icon}
                    <span
                      className="absolute -right-1 -top-1 inline-flex h-5 items-center justify-center rounded-full bg-accent-sport px-1.5 font-display text-[10px] font-black text-white"
                      aria-hidden="true"
                    >
                      {step.step}
                    </span>
                  </span>
                  <div
                    className="h-px flex-1 border-t border-dashed border-border md:hidden"
                    aria-hidden="true"
                  />
                </div>

                <h3 className="mt-6 font-display text-2xl font-bold leading-tight">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  {step.description}
                </p>

                {index < HOW_IT_WORKS_STEPS.length - 1 ? (
                  <div
                    className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground md:hidden"
                    aria-hidden="true"
                  >
                    <span className="h-px w-6 bg-border-strong" />
                    Tiếp theo
                  </div>
                ) : null}
              </article>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* CTA                                                                         */
/* -------------------------------------------------------------------------- */

function CtaSection() {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950 py-24 text-white">
      <div
        className="absolute inset-0 bg-linear-to-br from-primary via-blue-700 to-slate-950 opacity-95"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-grid-dark opacity-50" aria-hidden="true" />
      <div
        className="absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-accent-sport/30 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid items-end gap-10 md:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
              <span className="h-px w-8 bg-white/40" aria-hidden="true" />
              Bắt đầu ngay hôm nay
            </div>
            <h2 className="mt-4 font-display text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
              Sẵn sàng ra sân?
              <br />
              <span className="italic text-accent-sport">
                Đồng đội đang đợi.
              </span>
            </h2>
            <p className="mt-5 max-w-xl text-base text-white/75">
              Chọn sân, chốt lịch, mời đồng đội — và để phần còn lại cho
              T-Sport. Không phí đặt chỗ, không phí ẩn.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row md:flex-col md:items-stretch">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-white px-6 text-primary shadow-cta hover:bg-white/90"
            >
              <Link to="/search">
                Đặt sân ngay
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/matches">Tìm kèo đấu</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
