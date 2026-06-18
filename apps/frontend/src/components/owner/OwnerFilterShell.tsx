import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Filter, RotateCcw, Search, X } from "lucide-react";
import type { ReactNode } from "react";

interface OwnerFilterShellProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder: string;
  children?: ReactNode;
  searchClassName?: string;
  inline?: boolean;
}

export function OwnerFilterShell({
  searchValue,
  onSearchChange,
  placeholder,
  children,
  searchClassName,
  inline = false,
}: OwnerFilterShellProps) {
  return (
    <section className={cn(
      "rounded-2xl border border-border/60 bg-card p-3 shadow-xs md:p-3.5",
      inline ? "flex flex-col md:flex-row md:items-end gap-3" : "flex flex-col gap-3"
    )}>
      <div className={searchClassName ?? cn(
        "relative",
        inline ? "w-full md:max-w-sm" : "w-full md:max-w-md"
      )}>
        <Input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={placeholder}
          className="h-10 rounded-full pl-10 pr-10 text-sm shadow-none focus-visible:ring-1"
        />
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        {searchValue ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute right-1.5 top-1/2 size-7 -translate-y-1/2 rounded-full"
            onClick={() => onSearchChange("")}
            aria-label="Xóa từ khóa"
          >
            <X />
          </Button>
        ) : null}
      </div>

      {children}
    </section>
  );
}

interface OwnerFilterActiveBadgeProps {
  count: number;
}

export function OwnerFilterActiveBadge({ count }: OwnerFilterActiveBadgeProps) {
  if (count <= 0) return null;
  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="outline"
        className="rounded-full border-primary/30 bg-primary/10 text-[10px] font-semibold uppercase tracking-wider text-primary"
      >
        {count} đang áp dụng
      </Badge>
      <Separator
        orientation="horizontal"
        className="ml-1 flex-1 bg-border/70"
      />
    </div>
  );
}

interface OwnerFilterActionsProps {
  onApply: () => void;
  onClear: () => void;
  isLoading?: boolean;
  clearDisabled?: boolean;
  className?: string;
}

export function OwnerFilterActions({
  onApply,
  onClear,
  isLoading,
  clearDisabled,
  className,
}: OwnerFilterActionsProps) {
  return (
    <div className={cn("flex items-end gap-2", className)}>
      <Button
        onClick={onApply}
        disabled={isLoading}
        className="rounded-full"
      >
        <Filter data-icon="inline-start" />
        Áp dụng lọc
      </Button>
      <Button
        variant="outline"
        onClick={onClear}
        disabled={isLoading || clearDisabled}
        className="rounded-full"
      >
        <RotateCcw data-icon="inline-start" />
        Xóa bộ lọc
      </Button>
    </div>
  );
}
