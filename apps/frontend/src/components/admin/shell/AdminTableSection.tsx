import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface AdminTableSectionProps {
  index?: number;
  /** Kept for API compatibility; intentionally unused in the compact design. */
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
    <section className={cn("flex flex-col gap-2", className)}>
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {index !== undefined ? (
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/40 font-display text-[10px] font-black italic tracking-tight text-muted-foreground">
              {String(index).padStart(2, "0")}
            </span>
          ) : Icon ? (
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/40 text-muted-foreground">
              <Icon className="size-3.5" />
            </span>
          ) : null}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-base font-bold italic tracking-tight text-foreground md:text-[1.05rem]">
                {title}
              </h3>
              {count !== undefined && (
                <Badge
                  variant="secondary"
                  className="rounded-full border border-border/60 bg-muted/60 px-2 py-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {count} {countLabel}
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-[11px] text-muted-foreground md:text-xs">
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
