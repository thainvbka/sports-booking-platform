import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultTabsListProps {
  complexesCount: number;
  subfieldsCount: number;
}

export function ResultTabsList({
  complexesCount,
  subfieldsCount,
}: ResultTabsListProps) {
  return (
    <TabsList
      className={cn(
        "grid h-auto w-full grid-cols-2 gap-2 rounded-2xl bg-transparent p-0",
        "md:w-auto md:inline-grid md:min-w-[520px]",
      )}
    >
      <TabsTrigger value="complexes" asChild>
        <button
          type="button"
          className={cn(
            "group relative flex h-auto flex-col items-start gap-1 overflow-hidden rounded-2xl border border-border/70 bg-card px-5 py-4 text-left",
            "transition-all",
            "data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-card",
          )}
        >
          <span className="flex w-full items-center justify-between">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] opacity-70">
              <Building2 className="h-3 w-3" />
              Khu phức hợp
            </span>
            <span
              className={cn(
                "inline-block h-1.5 w-1.5 rounded-full bg-accent-sport opacity-0",
                "group-data-[state=active]:opacity-100",
              )}
              aria-hidden="true"
            />
          </span>
          <span className="font-display text-2xl font-black leading-none">
            {complexesCount.toLocaleString("vi-VN")}
          </span>
        </button>
      </TabsTrigger>

      <TabsTrigger value="subfields" asChild>
        <button
          type="button"
          className={cn(
            "group relative flex h-auto flex-col items-start gap-1 overflow-hidden rounded-2xl border border-border/70 bg-card px-5 py-4 text-left",
            "transition-all",
            "data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-card",
          )}
        >
          <span className="flex w-full items-center justify-between">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] opacity-70">
              <Flag className="h-3 w-3" />
              Sân lẻ
            </span>
            <span
              className={cn(
                "inline-block h-1.5 w-1.5 rounded-full bg-accent-sport opacity-0",
                "group-data-[state=active]:opacity-100",
              )}
              aria-hidden="true"
            />
          </span>
          <span className="font-display text-2xl font-black leading-none">
            {subfieldsCount.toLocaleString("vi-VN")}
          </span>
        </button>
      </TabsTrigger>
    </TabsList>
  );
}
