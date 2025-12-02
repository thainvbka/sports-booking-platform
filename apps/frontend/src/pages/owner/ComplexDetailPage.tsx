import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { useOwnerStore } from "@/store/useOwnerStore";
import { Button } from "@/components/ui/button";
// import { SubFieldFormDialog } from "@/components/shared/SubFieldFormDialog";
// import { PricingManagementDialog } from "@/components/shared/PricingRuleFormDialog";
import { ComplexStatus } from "@/types";
import { getSportTypeLabel } from "@/services/mockData";
import { formatPrice } from "@/utils/formatPrice";
import {
  ArrowLeft,
  MapPin,
  Users,
  Plus,
  Edit,
  Trash2,
  DollarSign,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
            Khu phức hợp này đang ở trạng thái{" "}
            <Badge
              variant="outline"
              className="ml-1 border-red-300 text-red-800"
            >
              {complex.status}
            </Badge>
            . Bạn chỉ có thể thêm sân con khi trạng thái là "Đang hoạt động".
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
          {/* <SubFieldFormDialog
            complexId={complex.id}
            trigger={
              <Button disabled={!canAddSubField} className="shadow-md">
                <Plus className="w-4 h-4 mr-2" />
                Thêm sân con
              </Button>
            }
          /> */}
        </div>

        {subfields && subfields.length > 0 ? ( // Sửa điều kiện check độ dài
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {subfields.map((subField) => {
              // Tạm thời để giá 0 hoặc lấy từ props nếu backend trả về min_price
              // Không nên fetch chi tiết từng sân ở đây để lấy giá, sẽ rất nặng
              const min = subField.min_price || 0;

              return (
                <Card
                  key={subField.id}
                  className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 group"
                >
                  <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {subField.sub_field_name}
                        </CardTitle>
                        <Badge variant="secondary" className="mt-2 font-normal">
                          {getSportTypeLabel(subField.sport_type)}
                        </Badge>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center text-primary">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">
                        Sức chứa
                      </span>
                      <span className="font-medium">
                        {subField.capacity} người
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">
                        Giá khởi điểm
                      </span>
                      <span className="font-bold text-primary text-lg">
                        {/* Hiển thị "Liên hệ" hoặc giá nếu có */}
                        {min > 0 ? formatPrice(min) : "Chưa thiết lập"}
                      </span>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          Bảng giá
                        </span>
                        {/* <PricingManagementDialog
                          complexId={complex.id}
                          subFieldId={subField.id}
                          subFieldName={subField.sub_field_name}
                        /> */}
                      </div>

                      {/* <div className="bg-muted/50 rounded-lg p-3 text-sm">
                        {subField.pricing_rules.length > 0 ? (
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span>Đã thiết lập</span>
                            <Badge variant="outline" className="bg-background">
                              {subField.pricing_rules.length} khung giờ
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">
                            Chưa có khung giờ giá nào
                          </span>
                        )}
                      </div> */}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
            {/* <SubFieldFormDialog
              complexId={complex.id}
              trigger={
                <Button disabled={!canAddSubField}>Thêm sân con ngay</Button>
              }
            /> */}
          </div>
        )}
      </div>
    </div>
  );
}
