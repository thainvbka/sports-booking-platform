import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { heroBg } from "@/assets";
import { SearchBar } from "@/components/shared/SearchBar";
import { SPORT_CATEGORIES, HERO_STATS, parseSportType } from "./constants";

export function HeroSection() {
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

      <div className="page-shell relative z-10 pb-24 pt-20 lg:pt-28">
        <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="motion-safe-fade-up">
            <h1 className="mt-6 leading-[0.95] text-white sm:text-6xl lg:text-[5.25rem] text-display">
              Chốt sân.
              <br />
              <span className="italic text-accent-sport">Ra trận</span>{" "}
              <span className="text-stroke-white">cùng đồng đội.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base text-white/70 sm:text-lg">
              Nền tảng đặt sân thể thao toàn diện. Tìm sân phù hợp, giữ chỗ trong
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
                  <div className="text-white sm:text-4xl text-title">
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
  const [sportType, setSportType] = useState<string>("ALL");

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
