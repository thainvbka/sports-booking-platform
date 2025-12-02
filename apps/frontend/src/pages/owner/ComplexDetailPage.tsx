import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { useOwnerStore } from "@/store/useOwnerStore";
import { Button } from "@/components/ui/button";
import { SubFieldFormDialog } from "@/components/shared/SubFieldFormDialog";
import { SubFieldCard } from "@/components/shared/SubFieldCar";
// import { PricingManagementDialog } from "@/components/shared/PricingRuleFormDialog";
import { ComplexStatus } from "@/types";
import { ArrowLeft, MapPin, Plus, Edit, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ComplexDetail } from "@/types";

export function ComplexDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { selectedComplex, isLoading, error, subfields, fetchComplexById } =
    useOwnerStore();

  // 1. Chỉ fetch Complex và Subfields khi ID trên URL thay đổi
  useEffect(() => {
    if (id) {
      fetchComplexById(id);
    }
  }, [id]);

  // 1. Xử lý Loading
  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 2. Xử lý Error hoặc Not Found
  if (error || !selectedComplex) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold mb-2">Không tìm thấy khu phức hợp</h2>
        <p className="text-muted-foreground mb-6">
          {error ||
            "Khu phức hợp bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."}
        </p>
        <Link to="/owner/complexes">
          <Button>Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  const complex = selectedComplex as ComplexDetail;
  const canAddSubField = complex.status === ComplexStatus.ACTIVE;

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div>
        <Link
          to="/owner/complexes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {complex.complex_name}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-2">
              <MapPin className="w-4 h-4" />
              <span>{complex.complex_address}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
            <Button variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa
            </Button>
          </div>
        </div>
      </div>

      {complex.status !== ComplexStatus.ACTIVE && (
        <Alert
          variant="destructive"
          className="bg-red-50 border-red-200 text-red-900"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Khu phức hợp hiện đang chờ phê duyệt, bạn sẽ có thể thêm sân con khi
            quản trị viên duyệt yêu cầu này.
          </AlertDescription>
        </Alert>
      )}

      {/* SubFields Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Danh Sách Sân Con
            </h2>
            <p className="text-muted-foreground text-sm">
              Quản lý các sân và giá thuê trong khu phức hợp
            </p>
          </div>
          <SubFieldFormDialog
            complexId={complex.id}
            trigger={
              <Button disabled={!canAddSubField} className="shadow-md">
                <Plus className="w-4 h-4 mr-2" />
                Thêm sân con
              </Button>
            }
          />
        </div>

        {subfields && subfields.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {subfields.map((subField) => (
              <SubFieldCard
                key={subField.id}
                subField={subField}
                mode="owner"
                showComplexInfo={false}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl bg-muted/10">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium">Chưa có sân con nào</h3>
            <p className="text-muted-foreground max-w-sm text-center mt-1 mb-6">
              Khu phức hợp này chưa có sân con nào. Hãy thêm sân con để bắt đầu
              nhận lịch đặt.
            </p>
            <SubFieldFormDialog
              complexId={complex.id}
              trigger={
                <Button disabled={!canAddSubField}>Thêm sân con ngay</Button>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
