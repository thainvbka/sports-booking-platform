import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useOwnerStore } from "@/store/useOwnerStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Users,
  Calendar as CalendarIcon,
  Clock,
  Edit,
  Trash2,
  Plus,
  Copy,
} from "lucide-react";
import { getSportTypeLabel, formatPrice } from "@/services/mockData";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { EditSubfieldDialog } from "@/components/owner/EditSubfieldDialog";
import { DeleteSubfieldDialog } from "@/components/owner/DeleteSubfieldDialog";
import { PricingRuleFormDialog } from "@/components/owner/PricingRuleFormDialog";
import { DeletePricingRuleDialog } from "@/components/owner/DeletePricingRuleDialog";
// import { useToast } from "../../hooks/use-toast";
import { toast } from "sonner";
import type { PricingRule } from "@/types";

interface PricingRuleFormData {
  days: number[];
  time_slots: { start_time: string; end_time: string }[];
  base_price: number;
}

// Format time from backend (handles both string and Date)
// Always returns 24-hour format HH:MM
const formatTime = (time: string | Date | unknown): string => {
  if (!time) return "--:--";

  // If it's a string, handle different formats
  if (typeof time === "string") {
    // If already in HH:MM format (24h)
    if (/^\d{2}:\d{2}$/.test(time)) return time;

    // If in HH:MM:SS format
    if (/^\d{2}:\d{2}:\d{2}/.test(time)) return time.slice(0, 5);

    // If ISO string (e.g., "1970-01-01T21:00:00.000Z")
    if (time.includes("T") && time.includes("Z")) {
      // Extract time part from ISO string: "1970-01-01T21:00:00.000Z" -> "21:00:00"
      const timePart = time.split("T")[1].split("Z")[0];
      return timePart.slice(0, 5); // "21:00:00" -> "21:00"
    }

    // If contains date separator
    if (time.includes("T") || time.includes("-")) {
      const date = new Date(time);
      // Use UTC methods to avoid timezone conversion
      const hours = String(date.getUTCHours()).padStart(2, "0");
      const minutes = String(date.getUTCMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    }

    return time.slice(0, 5);
  }

  // If it's a Date object (Postgres Time type returns as Date with epoch date)
  if (time instanceof Date) {
    // Use UTC to avoid timezone issues
    const hours = String(time.getUTCHours()).padStart(2, "0");
    const minutes = String(time.getUTCMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  // Fallback: try to convert and extract time
  const str = String(time);
  if (str.includes(":")) {
    return str.slice(0, 5);
  }

  return "--:--";
};

export function SubFieldDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    selectedSubfield,
    isLoading,
    error,
    fetchSubfieldById,
    fetchPricingRules,
    pricingRules,
    updateSubfield,
    deleteSubfield,
    addPricingRule,
    updatePricingRule,
    deletePricingRule,
    bulkDeletePricingRules,
    copyPricingRules,
  } = useOwnerStore();

  // const { toast } = useToast();

  const [date, setDate] = useState<Date>(new Date());
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Pricing rule states
  const [isPricingFormOpen, setIsPricingFormOpen] = useState(false);
  const [isPricingDeleteOpen, setIsPricingDeleteOpen] = useState(false);
  const [pricingFormMode, setPricingFormMode] = useState<"create" | "edit">(
    "create"
  );
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [deletingRule, setDeletingRule] = useState<PricingRule | null>(null);
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);

  // Fetch subfield details on mount
  useEffect(() => {
    if (id) {
      fetchSubfieldById(id);
    }
  }, [id, fetchSubfieldById]);

  // Fetch pricing rules when date or subfield changes
  useEffect(() => {
    if (id && date) {
      // Convert JS day (0=Sunday) to backend day (0=Sunday, 1=Monday...)
      // Assuming backend uses same convention
      const dayOfWeek = date.getDay();
      fetchPricingRules(id, dayOfWeek);
    }
  }, [id, date, fetchPricingRules]);

  const handleUpdateSubfield = async (data: {
    subfield_name: string;
    sport_type: string;
    capacity: number;
  }) => {
    if (!id) return;
    try {
      await updateSubfield(id, data);
      toast.success("Cập nhật thành công: Thông tin sân con đã được cập nhật.");
      console.log("Cập nhật thành công: Thông tin sân con đã được cập nhật.");
    } catch {
      toast.error(
        "Cập nhật thất bại: Có lỗi xảy ra khi cập nhật thông tin sân con."
      );
      console.error(
        "Cập nhật thất bại: Có lỗi xảy ra khi cập nhật thông tin sân con."
      );
    }
  };

  const handleDeleteSubfield = async () => {
    if (!id || !selectedSubfield) return;
    const complexId = selectedSubfield.complex_id;
    try {
      await deleteSubfield(id);
      toast.success("Sân con đã được xóa thành công.");
      navigate(`/owner/complexes/${complexId}`, { replace: true });
    } catch {
      toast.error("Đã có lỗi xảy ra khi xóa sân con. Vui lòng thử lại sau.");
    }
  };

  // Pricing rule handlers
  const handleCreatePricingRule = async (data: PricingRuleFormData) => {
    if (!id) return;
    try {
      await addPricingRule(id, data.days, {
        time_slots: data.time_slots.map((slot) => ({
          ...slot,
          base_price: data.base_price,
        })),
      });
      toast.success("Thêm khung giờ thành công.");
      await fetchPricingRules(id, date.getDay());
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Không thể tạo khung giờ";
      toast.error(message);
    }
  };

  const handleEditPricingRule = async (data: PricingRuleFormData) => {
    if (!id || !editingRule) return;
    try {
      // For edit mode, we only support single time slot
      const timeSlot = data.time_slots[0];
      await updatePricingRule(editingRule.id, id, date.getDay(), {
        start_time: timeSlot.start_time,
        end_time: timeSlot.end_time,
        base_price: data.base_price,
      });
      toast.success("Cập nhật khung giờ thành công.");
      setEditingRule(null);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Không thể cập nhật khung giờ";
      toast.error(message);
    }
  };

  const handleDeletePricingRule = async () => {
    if (!id || !deletingRule) return;
    try {
      await deletePricingRule(deletingRule.id, id, date.getDay());
      toast.success("Xóa khung giờ thành công.");
      setDeletingRule(null);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Không thể xóa khung giờ";
      toast.error(message);
    }
  };

  const handleBulkDelete = async () => {
    if (!id || selectedRuleIds.length === 0) return;
    try {
      await bulkDeletePricingRules(selectedRuleIds, id, date.getDay());
      toast.success("Xóa các khung giờ đã chọn thành công.");
      setSelectedRuleIds([]);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Không thể xóa khung giờ";
      toast.error(message);
    }
  };

  const handleCopyPricing = async (targetDays: number[]) => {
    if (!id) return;
    const sourceDay = date.getDay();
    try {
      await copyPricingRules(id, sourceDay, targetDays);
      toast.success("Sao chép giá thành công.");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Không thể sao chép giá";
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

  if (isLoading && !selectedSubfield) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !selectedSubfield) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold mb-2">Không tìm thấy sân con</h2>
        <p className="text-muted-foreground mb-6">
          {error || "Sân con bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."}
        </p>
        <Link to="/owner/complexes">
          <Button>Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header with back navigation */}
      <div>
        <Link
          to={`/owner/complexes/${selectedSubfield.complex_id || ""}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại khu phức hợp
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4 flex-1">
            {/* Thumbnail image */}
            <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 border">
              <img
                src={
                  selectedSubfield.sub_field_image ||
                  "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=2070"
                }
                alt={selectedSubfield.sub_field_name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title and info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight mb-3">
                {selectedSubfield.sub_field_name}
              </h1>

              {/* Info badges - single source of truth */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary" className="text-sm">
                  {getSportTypeLabel(selectedSubfield.sport_type)}
                </Badge>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{selectedSubfield.capacity} người</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa
            </Button>
          </div>
        </div>
      </div>

      {/* Main content: Pricing Schedule - Full width for better visibility */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold">
                Quản lý giá theo khung giờ
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Chọn ngày để xem và quản lý bảng giá
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-60 justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                      format(date, "EEE, dd/MM/yyyy", { locale: vi })
                    ) : (
                      <span>Chọn ngày</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                onClick={() => {
                  setPricingFormMode("create");
                  setEditingRule(null);
                  setIsPricingFormOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm khung giờ
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : pricingRules && pricingRules.length > 0 ? (
            <>
              {/* Bulk actions toolbar */}
              {selectedRuleIds.length > 0 && (
                <div className="flex items-center justify-between p-3 mb-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <span className="text-sm font-medium">
                    Đã chọn {selectedRuleIds.length} khung giờ
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRuleIds([])}
                    >
                      Bỏ chọn
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa đã chọn
                    </Button>
                  </div>
                </div>
              )}

              {/* Copy pricing dropdown */}
              <div className="flex justify-end mb-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-2" />
                      Sao chép giá
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleCopyPricing([1])}>
                      Sang Thứ 2
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopyPricing([2])}>
                      Sang Thứ 3
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopyPricing([3])}>
                      Sang Thứ 4
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopyPricing([4])}>
                      Sang Thứ 5
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopyPricing([5])}>
                      Sang Thứ 6
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopyPricing([6])}>
                      Sang Thứ 7
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopyPricing([0])}>
                      Sang Chủ nhật
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleCopyPricing([1, 2, 3, 4, 5, 6, 0])}
                    >
                      Sang tất cả các ngày
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2">
                {/* Select all checkbox */}
                <div className="flex items-center gap-2 p-2 border-b">
                  <Checkbox
                    checked={selectedRuleIds.length === pricingRules.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">
                    Chọn tất cả
                  </span>
                </div>

                {pricingRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <Checkbox
                      checked={selectedRuleIds.includes(rule.id)}
                      onCheckedChange={(checked) =>
                        handleRuleSelect(rule.id, checked as boolean)
                      }
                    />

                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-base">
                          {formatTime(rule.start_time)} -{" "}
                          {formatTime(rule.end_time)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(Number(rule.base_price))} / giờ
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setEditingRule(rule);
                          setPricingFormMode("edit");
                          setIsPricingFormOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                        onClick={() => {
                          setDeletingRule(rule);
                          setIsPricingDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg">
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                <CalendarIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Chưa có bảng giá cho ngày này
              </h3>
              <p className="text-muted-foreground max-w-md">
                Thiết lập khung giờ và giá để khách hàng có thể đặt sân vào ngày{" "}
                {format(date, "EEEE, dd/MM/yyyy", { locale: vi })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {selectedSubfield && (
        <>
          <EditSubfieldDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            subfield={selectedSubfield}
            onSubmit={handleUpdateSubfield}
          />
          <DeleteSubfieldDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            subfieldName={selectedSubfield.sub_field_name}
            onConfirm={handleDeleteSubfield}
          />

          {/* Pricing Rule Dialogs */}
          <PricingRuleFormDialog
            open={isPricingFormOpen}
            onOpenChange={setIsPricingFormOpen}
            mode={pricingFormMode}
            currentDay={date.getDay()}
            initialData={
              editingRule
                ? {
                    id: editingRule.id,
                    day_of_week: editingRule.day_of_week,
                    start_time: formatTime(editingRule.start_time),
                    end_time: formatTime(editingRule.end_time),
                    base_price: Number(editingRule.base_price),
                  }
                : undefined
            }
            onSubmit={
              pricingFormMode === "create"
                ? (data) =>
                    handleCreatePricingRule({
                      ...data,
                      base_price: data.time_slots[0]?.base_price ?? 0,
                    })
                : (data) =>
                    handleEditPricingRule({
                      ...data,
                      base_price: data.time_slots[0]?.base_price ?? 0,
                    })
            }
          />

          {deletingRule && (
            <DeletePricingRuleDialog
              open={isPricingDeleteOpen}
              onOpenChange={setIsPricingDeleteOpen}
              timeRange={`${formatTime(deletingRule.start_time)} - ${formatTime(
                deletingRule.end_time
              )}`}
              onConfirm={handleDeletePricingRule}
            />
          )}
        </>
      )}
    </div>
  );
}
