import {
  useParams,
  Link,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { useOwnerStore } from "@/store/useOwnerStore";
import { Button } from "@/components/ui/button";
import { SubFieldFormDialog } from "@/components/shared/SubFieldFormDialog";
import { SubFieldCard } from "@/components/shared/SubFieldCar";
import { EditComplexDialog } from "@/components/owner/EditComplexDialog";
import { DeleteComplexDialog } from "@/components/owner/DeleteComplexDialog";
import { ReactivateComplexDialog } from "@/components/owner/ReactivateComplexDialog";
import { ComplexStatus } from "@/types";
import {
  ArrowLeft,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { ComplexDetail } from "@/types";

export function ComplexDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const initialPage = parseInt(searchParams.get("page") || "1");
  const initialSearch = searchParams.get("search") || "";

  const {
    selectedComplex,
    isLoading,
    error,
    subfields,
    fetchComplexById,
    setSubfieldParams,
    setSubfieldPage,
    setSubfieldSearch,
    subfieldQueryParams,
    subfieldPagination,
    updateComplex,
    deleteComplex,
    reactivateComplex,
  } = useOwnerStore();

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReactivateDialogOpen, setIsReactivateDialogOpen] = useState(false);

  // Debounce search input để không gọi API liên tục khi gõ
  useEffect(() => {
    const timer = setTimeout(() => {
      setSubfieldSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, setSubfieldSearch]);

  //init param tu url
  useEffect(() => {
    if (id) {
      setSubfieldParams({ page: initialPage, search: initialSearch });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once

  // fetch Complex và Subfields khi ID trên URL thay đổi va khi param thay doi
  useEffect(() => {
    if (id) {
      fetchComplexById(id);
    }
  }, [id, fetchComplexById]);

  // Sync URL
  useEffect(() => {
    const params: Record<string, string> = {};
    if (subfieldQueryParams.page > 1)
      params.page = subfieldQueryParams.page.toString();
    if (subfieldQueryParams.search) params.search = subfieldQueryParams.search;
    setSearchParams(params);
  }, [subfieldQueryParams.page, subfieldQueryParams.search, setSearchParams]);

  const handleUpdateComplex = async (data: {
    complex_name?: string;
    complex_address?: string;
  }) => {
    if (!id) return;
    try {
      await updateComplex(id, data);
      console.log(
        "Cập nhật thành công: Thông tin khu phức hợp đã được cập nhật."
      );
    } catch {
      console.error(
        "Cập nhật thất bại: Có lỗi xảy ra khi cập nhật thông tin khu phức hợp."
      );
    }
  };

  const handleDeleteComplex = async () => {
    if (!id) return;
    try {
      await deleteComplex(id);
      console.log("Xóa thành công: Khu phức hợp đã được xóa.");
      // Navigate back to complexes list
      navigate("/owner/complexes", { replace: true });
    } catch {
      console.error("Xóa thất bại: Có lỗi xảy ra khi xóa khu phức hợp.");
    }
  };

  const handleReactivateComplex = async () => {
    if (!id) return;
    try {
      await reactivateComplex(id);
      console.log("Kích hoạt thành công: Khu phức hợp đã được kích hoạt lại.");
    } catch {
      console.error(
        "Kích hoạt thất bại: Có lỗi xảy ra khi kích hoạt khu phức hợp."
      );
    }
  };

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
            {complex.status === ComplexStatus.INACTIVE ? (
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsReactivateDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Kích hoạt lại
              </Button>
            ) : (
              <>
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
                  Ngừng hoạt động
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {complex.status === ComplexStatus.PENDING && (
        <Alert
          variant="default"
          className="bg-yellow-50 border-yellow-200 text-yellow-900"
        >
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            Khu phức hợp hiện đang chờ phê duyệt, bạn sẽ có thể thêm sân con khi
            quản trị viên duyệt yêu cầu này.
          </AlertDescription>
        </Alert>
      )}

      {complex.status === ComplexStatus.INACTIVE && (
        <Alert
          variant="default"
          className="bg-orange-50 border-orange-200 text-orange-900"
        >
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            Khu phức hợp đã ngừng hoạt động. Khách hàng không thể xem hoặc đặt
            lịch. Bạn có thể kích hoạt lại bất cứ lúc nào.
          </AlertDescription>
        </Alert>
      )}

      {complex.status === ComplexStatus.REJECTED && (
        <Alert
          variant="destructive"
          className="bg-red-50 border-red-200 text-red-900"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Khu phức hợp đã bị từ chối. Vui lòng liên hệ quản trị viên để biết
            thêm chi tiết.
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

        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm sân con..."
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {subfields && subfields.length > 0 ? (
          <>
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
            {/* Pagination Controls */}
            {subfieldPagination && subfieldPagination.totalPages > 1 && (
              <div className="flex items-center justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSubfieldPage(subfieldPagination.page - 1)}
                  disabled={subfieldPagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </Button>
                <span className="text-sm text-muted-foreground">
                  Trang {subfieldPagination.page} /{" "}
                  {subfieldPagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSubfieldPage(subfieldPagination.page + 1)}
                  disabled={
                    subfieldPagination.page >= subfieldPagination.totalPages
                  }
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
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

      {/* Dialogs */}
      {selectedComplex && (
        <>
          <EditComplexDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            complex={complex}
            onSubmit={handleUpdateComplex}
          />
          <DeleteComplexDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            complexName={complex.complex_name}
            onConfirm={handleDeleteComplex}
          />
          <ReactivateComplexDialog
            open={isReactivateDialogOpen}
            onOpenChange={setIsReactivateDialogOpen}
            complexName={complex.complex_name}
            onConfirm={handleReactivateComplex}
          />
        </>
      )}
    </div>
  );
}
