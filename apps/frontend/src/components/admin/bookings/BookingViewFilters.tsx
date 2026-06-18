import { AdminFiltersBar } from "@/components/admin/shell/AdminFiltersBar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { LayoutList, Repeat2, Search } from "lucide-react";
import { BOOKING_STATUS_LABELS, RECURRING_STATUS_LABELS } from "@/lib/constants";
import type { BookingView } from "@/types/admin.types";

interface BookingViewFiltersProps {
  activeView: BookingView;
  onViewChange: (view: BookingView) => void;
  singleSearch: string;
  setSingleSearch: (search: string) => void;
  singleFilters: { status?: string; search?: string };
  setSingleFilters: (filters: { status?: string; search?: string }) => void;
  recurringSearch: string;
  setRecurringSearch: (search: string) => void;
  recurringFilters: { status?: string; search?: string };
  setRecurringFilters: (filters: { status?: string; search?: string }) => void;
}

export function BookingViewFilters({
  activeView,
  onViewChange,
  singleSearch,
  setSingleSearch,
  singleFilters,
  setSingleFilters,
  recurringSearch,
  setRecurringSearch,
  recurringFilters,
  setRecurringFilters,
}: BookingViewFiltersProps) {
  return (
    <AdminFiltersBar
      leading={
        <ToggleGroup
          type="single"
          value={activeView}
          onValueChange={(v) => v && onViewChange(v as BookingView)}
          variant="outline"
          size="sm"
          className="rounded-lg"
        >
          <ToggleGroupItem
            value="single"
            aria-label="Đơn lẻ"
            className="gap-1.5"
          >
            <LayoutList className="size-3.5" />
            Đơn lẻ
          </ToggleGroupItem>
          <ToggleGroupItem
            value="recurring"
            aria-label="Định kỳ"
            className="gap-1.5"
          >
            <Repeat2 className="size-3.5" />
            Định kỳ
          </ToggleGroupItem>
        </ToggleGroup>
      }
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        {activeView === "single" ? (
          <Input
            key="single-search"
            placeholder="Tìm theo tên khách, tên sân..."
            className="h-9 pl-9"
            value={singleSearch}
            onChange={(e) => setSingleSearch(e.target.value)}
          />
        ) : (
          <Input
            key="recurring-search"
            placeholder="Tìm theo tên khách, tên sân..."
            className="h-9 pl-9"
            value={recurringSearch}
            onChange={(e) => setRecurringSearch(e.target.value)}
          />
        )}
      </div>

      {activeView === "single" ? (
        <Select
          value={singleFilters.status || "ALL"}
          onValueChange={(value) =>
            setSingleFilters({ status: value === "ALL" ? undefined : value })
          }
        >
          <SelectTrigger className="h-9 w-full shrink-0 md:w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            {Object.entries(BOOKING_STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Select
          value={recurringFilters.status || "ALL"}
          onValueChange={(value) =>
            setRecurringFilters({
              status: value === "ALL" ? undefined : value,
            })
          }
        >
          <SelectTrigger className="h-9 w-full shrink-0 md:w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            {Object.entries(RECURRING_STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </AdminFiltersBar>
  );
}
