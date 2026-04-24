import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface AdminTableSectionProps {
  index?: number;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  icon?: LucideIcon;
  count?: number | string;
  countLabel?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AdminTableSection({
  index,
  eyebrow,
  title,
  description,
  icon: Icon,
  count,
  countLabel = "bản ghi",
  actions,
  children,
  className,
}: AdminTableSectionProps) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {index !== undefined ? (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/5 font-display text-xs font-black italic tracking-tight text-primary shadow-sm">
              {String(index).padStart(2, "0")}
            </span>
          ) : Icon ? (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-muted-foreground">
              <Icon className="size-4" />
            </span>
          ) : null}
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                {eyebrow}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-lg font-bold italic tracking-tight text-foreground md:text-xl">
                {title}
              </h3>
              {count !== undefined && (
                <Badge
                  variant="secondary"
                  className="rounded-full border border-border/60 bg-muted/60 px-2.5 py-0 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  {count} {countLabel}
                </Badge>
              )}
            </div>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground md:text-[13px]">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </header>

      {children}
    </section>
  );
}
