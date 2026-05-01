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
  /** Reserved for future sub-line text. Currently rendered if provided. */
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
  title,
  titleAccent,
  description,
  metas,
  actions,
}: AdminPageHeaderProps) {
  return (
    <section className="flex flex-col gap-3 border-b border-border/60 pb-3 md:flex-row md:items-center md:justify-between md:gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/5 font-display text-[11px] font-black italic tracking-tight text-primary">
          {String(index).padStart(2, "0")}
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-xl font-bold italic tracking-tight text-foreground md:text-[1.6rem] md:leading-tight">
            {title}
            {titleAccent && (
              <span className="ml-1.5 text-primary">{titleAccent}</span>
            )}
          </h1>
          {description && (
            <p className="mt-0.5 max-w-3xl truncate text-xs text-muted-foreground md:text-[13px]">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">
        {metas && metas.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {metas.map((meta, idx) => {
              const Icon = meta.icon;
              return (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
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
        {actions}
      </div>
    </section>
  );
}
