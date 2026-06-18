import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  MATCH_SORT_LABELS,
  MATCH_SORT_OPTIONS,
  MATCH_STATUS_BADGE_CONFIG,
  MATCH_STATUS_OPTIONS,
  type MatchSortOption,
  type MatchStatus,
} from "@/types/match.type";
import { ArrowUpDown, ListChecks, ListFilter, RotateCcw, X } from "lucide-react";

export interface MatchFiltersValue {
  status?: MatchStatus;
  sort: MatchSortOption;
}

interface MatchFiltersProps {
  value: MatchFiltersValue;
  onChange: (next: MatchFiltersValue) => void;
  disabled?: boolean;
  className?: string;
}

export function MatchFilters({ value, onChange, disabled, className }: MatchFiltersProps) {
  const activeCount =
    Number(Boolean(value.status)) +
    Number(value.sort !== "created_at:desc");

  const update = (patch: Partial<MatchFiltersValue>) =>
    onChange({ ...value, ...patch });

  const clearAll = () =>
    onChange({
      status: undefined,
      sort: "created_at:desc",
    });

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 pr-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          <ListFilter className="size-3.5" />
          Bộ lọc
        </span>

        <Select
          value={value.status ?? "ALL"}
          onValueChange={(next) =>
            update({
              status:
                next === "ALL"
                  ? undefined
                  : (next as MatchStatus),
            })
          }
          disabled={disabled}
        >
          <SelectTrigger className="h-9 rounded-full border-border/70 bg-background text-xs font-medium md:w-52">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            {MATCH_STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {MATCH_STATUS_BADGE_CONFIG[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.sort}
          onValueChange={(next) => update({ sort: next as MatchSortOption })}
          disabled={disabled}
        >
          <SelectTrigger className="h-9 rounded-full border-border/70 bg-background text-xs font-medium md:w-52">
            <div className="inline-flex items-center gap-2">
              <ArrowUpDown className="size-3.5 text-muted-foreground" />
              <SelectValue placeholder="Sắp xếp" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {MATCH_SORT_OPTIONS.map((sort) => (
              <SelectItem key={sort} value={sort}>
                {MATCH_SORT_LABELS[sort]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeCount > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto h-8 rounded-full px-3 text-xs"
            onClick={clearAll}
            disabled={disabled}
          >
            <RotateCcw className="size-3.5" />
            Xóa tất cả ({activeCount})
          </Button>
        ) : null}
      </div>

      {activeCount > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-surface-2/70 px-3 py-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <ListChecks className="size-3.5" />
            Đang lọc
          </span>
          {value.status ? (
            <ActiveChip
              label={`Trạng thái: ${MATCH_STATUS_BADGE_CONFIG[value.status].label}`}
              onRemove={() => update({ status: undefined })}
            />
          ) : null}
          {value.sort !== "created_at:desc" ? (
            <ActiveChip
              label={`Sắp xếp: ${MATCH_SORT_LABELS[value.sort]}`}
              onRemove={() => update({ sort: "created_at:desc" })}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ActiveChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <Badge
      variant="secondary"
      className="gap-1.5 rounded-full bg-background px-2.5 py-1 text-xs font-medium shadow-xs"
    >
      <span className="truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Bỏ lọc ${label}`}
        className="-mr-1 inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition hover:bg-foreground hover:text-background"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}
