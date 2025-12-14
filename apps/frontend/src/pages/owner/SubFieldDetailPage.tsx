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
} from "lucide-react";
import { getSportTypeLabel, formatPrice } from "@/services/mockData";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { EditSubfieldDialog } from "@/components/owner/EditSubfieldDialog";
import { DeleteSubfieldDialog } from "@/components/owner/DeleteSubfieldDialog";

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
  } = useOwnerStore();

  const [date, setDate] = useState<Date>(new Date());
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
      console.log("Cập nhật thành công: Thông tin sân con đã được cập nhật.");
    } catch {
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
      console.log("Xóa thành công: Sân con đã được xóa.");
      // Navigate back and force refresh complex data
      navigate(`/owner/complexes/${complexId}`, { replace: true });
      // The complex page will fetch fresh data on mount
    } catch {
      console.error("Xóa thất bại: Có lỗi xảy ra khi xóa sân con.");
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
              <Button>
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
            <div className="space-y-2">
              {pricingRules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-base">
                        {String(rule.start_time).slice(0, 5)} -{" "}
                        {String(rule.end_time).slice(0, 5)}
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
                    >
                      Chỉnh sửa
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
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
        </>
      )}
    </div>
  );
}
