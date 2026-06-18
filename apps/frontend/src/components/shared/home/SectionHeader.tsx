import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface SectionHeaderProps {
  title: ReactNode;
  description?: string;
  action?: ReactNode;
  tone?: "light" | "dark";
}

export function SectionHeader({
  title,
  description,
  action,
  tone = "light",
}: SectionHeaderProps) {
  const isDark = tone === "dark";

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <h2
          className={cn(
            "mt-3 leading-tight tracking-tight sm:text-4xl text-title",
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
