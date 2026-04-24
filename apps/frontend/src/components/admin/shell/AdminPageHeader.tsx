import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface AdminPageHeaderMeta {
  icon?: LucideIcon;
  label: ReactNode;
  accent?: "primary" | "emerald" | "amber" | "rose" | "violet" | "sky";
}

interface AdminPageHeaderProps {
  index: number;
  eyebrow: string;
  title: string;
  titleAccent?: string;
  description?: ReactNode;
  metas?: AdminPageHeaderMeta[];
  actions?: ReactNode;
}

const ACCENT: Record<NonNullable<AdminPageHeaderMeta["accent"]>, string> = {
  primary: "text-primary",
  emerald: "text-emerald-600 dark:text-emerald-400",
  amber: "text-amber-600 dark:text-amber-400",
  rose: "text-rose-600 dark:text-rose-400",
  violet: "text-violet-600 dark:text-violet-400",
  sky: "text-sky-600 dark:text-sky-400",
};

export function AdminPageHeader({
  index,
  eyebrow,
  title,
  titleAccent,
  description,
  metas,
  actions,
}: AdminPageHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-card px-5 py-5 md:px-7 md:py-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-60 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-24 size-56 rounded-full bg-sky-500/5 blur-3xl"
      />

      <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/5 font-display text-sm font-black italic tracking-tight text-primary shadow-sm">
            {String(index).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              {eyebrow}
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold italic tracking-tight text-foreground md:text-3xl">
              {title}
              {titleAccent && (
                <span className="ml-2 bg-gradient-to-r from-primary via-sky-500 to-emerald-500 bg-clip-text text-transparent">
                  {titleAccent}
                </span>
              )}
            </h1>
            {description && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 md:pt-1">
            {actions}
          </div>
        )}
      </div>

      {metas && metas.length > 0 && (
        <div className="relative mt-5 flex flex-wrap items-center gap-2 border-t border-dashed border-border/60 pt-4">
          {metas.map((meta, idx) => {
            const Icon = meta.icon;
            return (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-[11px] font-medium text-muted-foreground"
              >
                {Icon && (
                  <Icon
                    className={cn(
                      "size-3.5",
                      ACCENT[meta.accent ?? "primary"],
                    )}
                  />
                )}
                <span className="text-foreground">{meta.label}</span>
              </span>
            );
          })}
        </div>
      )}
    </section>
  );
}
