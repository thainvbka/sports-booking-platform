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
import { ArrowUpDown, Search, Trophy } from "lucide-react";

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

const parseSportType = (value: string): SportType | undefined => {
  if (value === "ALL") {
    return undefined;
  }

  return MATCH_SPORT_TYPES.find((item) => item === value);
};

const parseMatchStatus = (value: string): MatchStatus | undefined => {
  if (value === "ALL") {
    return undefined;
  }

  return MATCH_STATUS_OPTIONS.find((item) => item === value);
};

const parseMatchSort = (value: string): MatchSortOption | undefined => {
  return MATCH_SORT_OPTIONS.find((item) => item === value);
};

export function MatchFilterBar({
  values,
  onValuesChange,
  onApply,
  onReset,
  isLoading,
}: MatchFilterBarProps) {
  return (
    <div className="sports-glow-success rounded-3xl border border-emerald-200/80 bg-white/90 p-5 shadow-lg shadow-emerald-900/10 backdrop-blur-sm md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 md:text-xl">
            Tinh chỉnh tìm kiếm kèo
          </h2>
          <p className="text-xs text-slate-600 md:text-sm">
            Lọc theo môn, trạng thái và cách sắp xếp để tìm kèo phù hợp nhanh hơn.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.1fr_repeat(3,minmax(0,1fr))_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
          <Input
            value={values.q}
            placeholder="Tìm theo tiêu đề, sân hoặc khu phức hợp"
            className="h-11 border-emerald-200 bg-white pl-9 shadow-xs focus-visible:border-emerald-400 focus-visible:ring-emerald-300"
            onChange={(event) =>
              onValuesChange({
                ...values,
                q: event.target.value,
              })
            }
          />
        </div>

        <Select
          value={values.sport_type ?? "ALL"}
          onValueChange={(value) =>
            onValuesChange({
              ...values,
              sport_type: parseSportType(value),
            })
          }
        >
          <SelectTrigger className="h-11 border-emerald-200 bg-white">
            <div className="flex items-center gap-2 text-slate-700">
              <Trophy className="h-4 w-4 text-emerald-600" />
              <SelectValue placeholder="Chọn môn" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả môn</SelectItem>
            {MATCH_SPORT_TYPES.map((sportType) => (
              <SelectItem key={sportType} value={sportType}>
                {SPORT_TYPE_LABELS[sportType]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={values.status ?? "ALL"}
          onValueChange={(value) =>
            onValuesChange({
              ...values,
              status: parseMatchStatus(value),
            })
          }
        >
          <SelectTrigger className="h-11 border-emerald-200 bg-white">
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
          value={values.sort}
          onValueChange={(value) =>
            onValuesChange({
              ...values,
              sort: parseMatchSort(value) ?? values.sort,
            })
          }
        >
          <SelectTrigger className="h-11 border-emerald-200 bg-white">
            <div className="flex items-center gap-2 text-slate-700">
              <ArrowUpDown className="h-4 w-4 text-emerald-600" />
              <SelectValue placeholder="Sắp xếp" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {MATCH_SORT_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {MATCH_SORT_LABELS[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 lg:justify-end">
          <Button
            className="h-11 min-w-24 bg-linear-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/40"
            onClick={onApply}
            disabled={isLoading}
          >
            Áp dụng
          </Button>
          <Button
            variant="outline"
            className="h-11 border-rose-200 text-rose-600 hover:bg-rose-50"
            onClick={onReset}
            disabled={isLoading}
          >
            Đặt lại
          </Button>
        </div>
      </div>
    </div>
  );
}
