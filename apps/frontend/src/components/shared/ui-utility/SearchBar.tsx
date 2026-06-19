import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SPORT_TYPE_OPTIONS } from "@/constants";
import { getSportTypeLabel } from "@/utils";
import { Search, Trophy } from "lucide-react";
import type { FormEvent } from "react";
type SearchBarVariant = "default" | "hero";

interface SearchBarProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  sportValue: string;
  onSportChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  placeholder?: string;
  submitLabel?: string;
  allSportsLabel?: string;
  allSportsValue?: string;
  variant?: SearchBarVariant;
  className?: string;
  disabled?: boolean;
}

const SEARCH_BAR_VARIANT_CLASS: Record<SearchBarVariant, string> = {
  default: "rounded-xl border border-border dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm",
  hero: "rounded-2xl border border-white/40 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 p-3 shadow-2xl backdrop-blur-sm",
};

export function SearchBar({
  keyword,
  onKeywordChange,
  sportValue,
  onSportChange,
  onSubmit,
  placeholder = "Tìm theo tên sân hoặc địa chỉ...",
  submitLabel = "Tìm kiếm",
  allSportsLabel = "Tất cả môn",
  allSportsValue = "ALL",
  variant = "default",
  className,
  disabled,
}: SearchBarProps) {
  return (
    <form onSubmit={onSubmit} className={cn("w-full", className)}>
      <div
        className={cn(
          "flex flex-col gap-3 md:flex-row md:items-center",
          SEARCH_BAR_VARIANT_CLASS[variant],
        )}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder={placeholder}
            className="h-11 border-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-9 text-slate-900 dark:text-white"
            disabled={disabled}
          />
        </div>

        <Select value={sportValue} onValueChange={onSportChange} disabled={disabled}>
          <SelectTrigger className="h-11 w-full border-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 md:w-56 text-slate-900 dark:text-white">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder={allSportsLabel} />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={allSportsValue}>{allSportsLabel}</SelectItem>
            {SPORT_TYPE_OPTIONS.map((sportType) => (
              <SelectItem key={sportType} value={sportType}>
                {getSportTypeLabel(sportType)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="submit" className="h-11 px-6" disabled={disabled}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
