import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface OwnerHeroShellProps {
  title: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  alignItems?: "center" | "end";
}

export function OwnerHeroShell({
  title,
  description,
  badge,
  action,
  children,
  alignItems = "end",
}: OwnerHeroShellProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/8 via-background to-accent-sport/5 px-4 py-4 shadow-sm md:px-6 md:py-5">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-14 size-56 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 left-10 size-48 rounded-full bg-accent-sport/10 blur-3xl"
      />

      <div
        className={cn(
          "relative flex flex-col gap-3 md:flex-row md:justify-between",
          alignItems === "center" ? "md:items-center" : "md:items-end",
        )}
      >
        <div className="flex min-w-0 flex-col gap-1.5">
          {badge}
          {title}
          {description}
        </div>

        {action && (
          <div className="flex shrink-0 items-center gap-2">
            {action}
          </div>
        )}
      </div>

      {children}
    </section>
  );
}
