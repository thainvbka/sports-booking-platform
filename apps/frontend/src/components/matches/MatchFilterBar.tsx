import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SPORT_TYPE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  MATCH_SORT_LABELS,
  MATCH_SORT_OPTIONS,
  MATCH_SPORT_TYPES,
  MATCH_STATUS_BADGE_CONFIG,
  MATCH_STATUS_OPTIONS,
  type MatchSortOption,
  type MatchStatus,
  type SportType,
} from "@/types/match.type";
import {
  ArrowUpDown,
  RotateCcw,
  Search,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";

export interface MatchFilterValues {
  q: string;
  sport_type?: SportType;
  status?: MatchStatus;
  sort: MatchSortOption;
}

interface MatchFilterBarProps {
  values: MatchFilterValues;
  onValuesChange: (next: MatchFilterValues) => void;
  onApply: () => void;
  onReset: () => void;
  isLoading?: boolean;
}

const parseSportType = (v: string): SportType | undefined =>
  v === "ALL" ? undefined : MATCH_SPORT_TYPES.find((s) => s === v);

const parseMatchStatus = (v: string): MatchStatus | undefined =>
  v === "ALL" ? undefined : MATCH_STATUS_OPTIONS.find((s) => s === v);

const parseMatchSort = (v: string): MatchSortOption | undefined =>
  MATCH_SORT_OPTIONS.find((s) => s === v);

export function MatchFilterBar({
  values,
  onValuesChange,
  onApply,
  onReset,
  isLoading,
}: MatchFilterBarProps) {
  const activeCount =
    Number(Boolean(values.q.trim())) +
    Number(Boolean(values.sport_type)) +
    Number(Boolean(values.status));

  const update = (patch: Partial<MatchFilterValues>) =>
    onValuesChange({ ...values, ...patch });

  const clear = (key: "q" | "sport_type" | "status") => {
    if (key === "q") update({ q: "" });
    else update({ [key]: undefined } as Partial<MatchFilterValues>);
    onApply();
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Compact control row */}
      <div className="group flex flex-wrap items-center gap-2 rounded-full border border-border/80 bg-card/60 p-1.5 pl-3 shadow-sm backdrop-blur-sm focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/15">
        {/* Eyebrow icon */}
        <span className="hidden items-center gap-1.5 pl-1 pr-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground sm:inline-flex">
          <Sparkles className="size-3 text-primary" />
          Lọc
        </span>

        {/* Search */}
        <div className="relative flex min-w-0 flex-1 items-center">
          <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
          <Input
            value={values.q}
            placeholder="Tìm kèo, sân, khu phức hợp…"
            className="h-9 min-w-0 border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0"
            onChange={(e) => update({ q: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onApply();
              }
            }}
          />
          {values.q && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
              onClick={() => {
                update({ q: "" });
                onApply();
              }}
              aria-label="Xóa từ khóa"
            >
              <X />
            </Button>
          )}
        </div>

        {/* Divider */}
        <span
          aria-hidden
          className="hidden h-6 w-px bg-border md:inline-block"
        />

        {/* Sport */}
        <Select
          value={values.sport_type ?? "ALL"}
          onValueChange={(v) => update({ sport_type: parseSportType(v) })}
        >
          <SelectTrigger
            size="sm"
            className="h-8 gap-1.5 rounded-full border-border/60 bg-background pl-3 pr-2 text-xs font-medium"
          >
            <Trophy className="size-3 text-muted-foreground" />
            <SelectValue placeholder="Môn" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả môn</SelectItem>
            {MATCH_SPORT_TYPES.map((s) => (
              <SelectItem key={s} value={s}>
                {SPORT_TYPE_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status */}
        <Select
          value={values.status ?? "ALL"}
          onValueChange={(v) => update({ status: parseMatchStatus(v) })}
        >
          <SelectTrigger
            size="sm"
            className="h-8 gap-1.5 rounded-full border-border/60 bg-background pl-3 pr-2 text-xs font-medium"
          >
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            {MATCH_STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {MATCH_STATUS_BADGE_CONFIG[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={values.sort}
          onValueChange={(v) =>
            update({ sort: parseMatchSort(v) ?? values.sort })
          }
        >
          <SelectTrigger
            size="sm"
            className="h-8 gap-1.5 rounded-full border-border/60 bg-background pl-3 pr-2 text-xs font-medium"
          >
            <ArrowUpDown className="size-3 text-muted-foreground" />
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent align="end">
            {MATCH_SORT_OPTIONS.map((o) => (
              <SelectItem key={o} value={o}>
                {MATCH_SORT_LABELS[o]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1.5">
          {activeCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground"
              onClick={onReset}
              disabled={isLoading}
            >
              <RotateCcw data-icon="inline-start" />
              Đặt lại
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            className="h-8 rounded-full px-4 text-xs font-semibold"
            onClick={onApply}
            disabled={isLoading}
          >
            Áp dụng
            {activeCount > 0 && (
              <span className="ml-1 inline-flex size-4 items-center justify-center rounded-full bg-primary-foreground/20 text-[10px] font-bold tabular-nums">
                {activeCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Active filter chips — only when active */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 px-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Đang lọc
          </span>
          {values.q.trim() && (
            <ActiveChip
              label={`Từ khóa: "${values.q.trim()}"`}
              onRemove={() => clear("q")}
            />
          )}
          {values.sport_type && (
            <ActiveChip
              label={`Môn: ${SPORT_TYPE_LABELS[values.sport_type]}`}
              onRemove={() => clear("sport_type")}
            />
          )}
          {values.status && (
            <ActiveChip
              label={`Trạng thái: ${MATCH_STATUS_BADGE_CONFIG[values.status].label}`}
              onRemove={() => clear("status")}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── Active filter chip ───────────────────────────────────────────────────
function ActiveChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "group/chip h-6 gap-1 rounded-full border-border/70 bg-background pl-2.5 pr-1 text-[11px] font-medium",
        "hover:border-primary/30 hover:bg-primary/5",
      )}
    >
      <span className="truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={`Xóa bộ lọc ${label}`}
      >
        <X className="size-3" />
      </button>
    </Badge>
  );
}
