import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./SectionHeader";
import type { HomeSportCategory } from "@/constants";

interface SportCategoriesSectionProps {
  categories: HomeSportCategory[];
}

export function SportCategoriesSection({ categories }: SportCategoriesSectionProps) {
  if (!categories || categories.length === 0) return null;
  const [hero, ...rest] = categories;

  return (
    <section className="relative bg-background py-20">
      <div className="absolute inset-0 bg-grid-faint opacity-60" aria-hidden="true" />
      <div className="page-shell relative">
        <SectionHeader
          title={
            <>
              Chọn môn bạn yêu,
              <br className="hidden sm:block" /> chúng tôi lo phần còn lại.
            </>
          }
          description="Năm bộ môn phổ biến nhất trên T-Sport — khung giờ đa dạng, giá cả minh bạch."
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
