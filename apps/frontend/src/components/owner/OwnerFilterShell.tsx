import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
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
