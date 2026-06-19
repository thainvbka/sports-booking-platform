import { CalendarIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePricingStore } from "@/store/owner/usePricingStore";
import type { PricingRule } from "@/types";
import { WEEKDAYS } from "@/constants";
import { formatTime, parseRuleTimeToMinutes, formatDateVn } from "@/utils";

import { DataTable } from "@/components/shared/ui-utility/DataTable";
import { EmptyState } from "@/components/shared/ui-utility/EmptyState";
import { DeletePricingRuleDialog } from "./DeletePricingRuleDialog";
import { PricingRuleFormDialog } from "./PricingRuleFormDialog";

// Extracted sub-components and hooks
import { usePricingColumns } from "@/hooks/owner/usePricingColumns";
import { useTimelineSegments } from "@/hooks/player/useTimelineSegments";
import { BulkSelectionBar } from "./BulkSelectionBar";
import { PricingConsoleHeader } from "./PricingConsoleHeader";

interface SubFieldPricingConsoleProps {
  subfieldId: string;
}

interface PricingRuleFormData {
  days: number[];
  time_slots: { start_time: string; end_time: string; base_price: number }[];
}

export function SubFieldPricingConsole({ subfieldId }: SubFieldPricingConsoleProps) {
  const {
    pricingRules,
    isLoading,
    fetchPricingRules,
    addPricingRule,
    updatePricingRule,
    deletePricingRule,
    bulkDeletePricingRules,
    copyPricingRules,
  } = usePricingStore();

  const [date, setDate] = useState<Date>(new Date());
  
  // Component dialog and editing states
  const [isPricingFormOpen, setIsPricingFormOpen] = useState(false);
  const [isPricingDeleteOpen, setIsPricingDeleteOpen] = useState(false);
  const [copyTargetDays, setCopyTargetDays] = useState<number[]>([]);
  const [pricingFormMode, setPricingFormMode] = useState<"create" | "edit">("create");
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [deletingRule, setDeletingRule] = useState<PricingRule | null>(null);
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);
  const [sortBy] = useState<"time" | "price">("time");
  const [sortOrder] = useState<"asc" | "desc">("asc");

  // Fetch pricing rules when date or subfield changes
  useEffect(() => {
    if (subfieldId && date) {
      fetchPricingRules(subfieldId, date.getDay());
    }
  }, [subfieldId, date, fetchPricingRules]);

  const handleCreatePricingRule = async (data: PricingRuleFormData) => {
    if (!subfieldId) return;
    try {
      await addPricingRule(subfieldId, data.days, {
        time_slots: data.time_slots,
      });
      toast.success("Thêm khung giờ thành công.");
      await fetchPricingRules(subfieldId, date.getDay());
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Không thể tạo khung giờ";
      toast.error(message);
      throw error;
    }
  };

  const handleEditPricingRule = async (data: PricingRuleFormData) => {
    if (!subfieldId || !editingRule) return;
    try {
      const timeSlot = data.time_slots[0];
      await updatePricingRule(editingRule.id, subfieldId, date.getDay(), {
        start_time: timeSlot.start_time,
        end_time: timeSlot.end_time,
        base_price: timeSlot.base_price,
      });
      toast.success("Cập nhật khung giờ thành công.");
      setEditingRule(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Không thể cập nhật khung giờ";
      toast.error(message);
      throw error;
    }
  };

  const handleDeletePricingRule = async () => {
    if (!subfieldId || !deletingRule) return;
    try {
      await deletePricingRule(deletingRule.id, subfieldId, date.getDay());
      toast.success("Xóa khung giờ thành công.");
      setDeletingRule(null);
      setSelectedRuleIds(selectedRuleIds.filter((ruleId) => ruleId !== deletingRule.id));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Không thể xóa khung giờ";
      toast.error(message);
    }
  };

  const handleBulkDelete = async () => {
    if (!subfieldId || selectedRuleIds.length === 0) return;
    try {
      await bulkDeletePricingRules(selectedRuleIds, subfieldId, date.getDay());
      toast.success("Xóa các khung giờ đã chọn thành công.");
      setSelectedRuleIds([]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Không thể xóa khung giờ";
      toast.error(message);
    }
  };

  const handleCopyPricing = async (targetDays: number[]) => {
    if (!subfieldId) return;
    const sourceDay = date.getDay();
    const filteredTargetDays = targetDays.filter((day) => day !== sourceDay);

    if (filteredTargetDays.length === 0) {
      toast.error("Không có ngày đích hợp lệ để sao chép giá.");
      return;
    }

    try {
      await copyPricingRules(subfieldId, sourceDay, filteredTargetDays);
      toast.success("Sao chép giá thành công.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Không thể sao chép giá";
      toast.error(message);
    }
  };

  const handleRuleSelect = (ruleId: string, checked: boolean) => {
    if (checked) {
      setSelectedRuleIds([...selectedRuleIds, ruleId]);
    } else {
      setSelectedRuleIds(selectedRuleIds.filter((id) => id !== ruleId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && pricingRules) {
      setSelectedRuleIds(pricingRules.map((r) => r.id));
    } else {
      setSelectedRuleIds([]);
    }
  };

  // Extract pure computations into custom hooks
  const segments = useTimelineSegments(pricingRules ?? []);

  const sortedRules = useMemo(() => {
    const rules = [...(pricingRules ?? [])];
    rules.sort((a, b) => {
      if (sortBy === "time") {
        const aStart = parseRuleTimeToMinutes(formatTime(a.start_time)) ?? 0;
        const bStart = parseRuleTimeToMinutes(formatTime(b.start_time)) ?? 0;
        return sortOrder === "asc" ? aStart - bStart : bStart - aStart;
      } else {
        const aPrice = Number(a.base_price);
        const bPrice = Number(b.base_price);
        return sortOrder === "asc" ? aPrice - bPrice : bPrice - aPrice;
      }
    });
    return rules;
  }, [pricingRules, sortBy, sortOrder]);

  const dayOfWeek = date.getDay();
  const currentDayLabel = WEEKDAYS.find((w) => w.dayOfWeek === dayOfWeek)?.full;
  const allSelected = (pricingRules ?? []).length > 0 && selectedRuleIds.length === (pricingRules ?? []).length;

  const listColumns = usePricingColumns({
    pricingRules: pricingRules ?? [],
    selectedRuleIds,
    allSelected,
    onSelectAll: handleSelectAll,
    onRuleSelect: handleRuleSelect,
    onEdit: (rule) => {
      setEditingRule(rule);
      setPricingFormMode("edit");
      setIsPricingFormOpen(true);
    },
    onDelete: (rule) => {
      setDeletingRule(rule);
      setIsPricingDeleteOpen(true);
    },
  });

  return (
    <>
      <Card className="relative overflow-hidden border-border/60 shadow-sm">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary via-accent-sport to-primary"
        />

        <PricingConsoleHeader
          date={date}
          setDate={setDate}
          pricingRules={pricingRules ?? []}
          isLoading={isLoading}
          copyTargetDays={copyTargetDays}
          setCopyTargetDays={setCopyTargetDays}
          onCopy={handleCopyPricing}
          onAddClick={() => {
            setPricingFormMode("create");
            setEditingRule(null);
            setIsPricingFormOpen(true);
          }}
          segments={segments}
          onSegmentClick={(rule) => {
            setEditingRule(rule);
            setPricingFormMode("edit");
            setIsPricingFormOpen(true);
          }}
        />

        <CardContent className="flex flex-col gap-3 pt-0">
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
              ))}
            </div>
          ) : pricingRules && pricingRules.length > 0 ? (
            <DataTable
              data={sortedRules}
              columns={listColumns}
              emptyMessage="Không có khung giờ nào"
            />
          ) : (
            <EmptyState
              title={`Chưa có bảng giá cho ${currentDayLabel}`}
              description={`Thiết lập khung giờ và giá để khách hàng có thể đặt sân vào ${formatDateVn(
                date,
                "EEEE, dd/MM/yyyy",
              )}.`}
              icon={<CalendarIcon className="size-7 text-muted-foreground/70" />}
              actionLabel="Thêm khung giờ đầu tiên"
              onAction={() => {
                setPricingFormMode("create");
                setEditingRule(null);
                setIsPricingFormOpen(true);
              }}
              className="py-12"
            />
          )}
        </CardContent>
      </Card>

      <BulkSelectionBar
        selectedCount={selectedRuleIds.length}
        onDelete={handleBulkDelete}
        onCancel={() => setSelectedRuleIds([])}
      />

      <PricingRuleFormDialog
        open={isPricingFormOpen}
        onOpenChange={setIsPricingFormOpen}
        mode={pricingFormMode}
        initialData={editingRule || undefined}
        onSubmit={pricingFormMode === "create" ? handleCreatePricingRule : handleEditPricingRule}
      />

      {deletingRule ? (
        <DeletePricingRuleDialog
          open={isPricingDeleteOpen}
          onOpenChange={setIsPricingDeleteOpen}
          timeRange={`${formatTime(deletingRule.start_time)} - ${formatTime(deletingRule.end_time)}`}
          onConfirm={handleDeletePricingRule}
        />
      ) : null}
    </>
  );
}
