import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useOwnerStore } from "@/store/useOwnerStore";
import { Button } from "@/components/ui/button";
import { SubFieldFormDialog } from "@/components/shared/SubFieldFormDialog";
import { EditComplexDialog } from "@/components/owner/EditComplexDialog";
import { DeleteComplexDialog } from "@/components/owner/DeleteComplexDialog";
import { ReactivateComplexDialog } from "@/components/owner/ReactivateComplexDialog";
import { ComplexDetailView } from "@/components/shared/ComplexDetailView";
import { ComplexStatus } from "@/types";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { ComplexDetail } from "@/types";
import { toast } from "sonner";

export function ComplexDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
    subfieldPagination,
    updateComplex,
    deleteComplex,
    reactivateComplex,
  } = useOwnerStore();

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReactivateDialogOpen, setIsReactivateDialogOpen] = useState(false);

  // Scroll to top on mount and when id changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSubfieldSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, setSubfieldSearch]);

  // Init params from URL
  useEffect(() => {
    if (id) {
      setSubfieldParams({ page: initialPage, search: initialSearch });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch complex and subfields
  useEffect(() => {
    if (id) {
      fetchComplexById(id);
    }
  }, [id, fetchComplexById]);

  const handleUpdateComplex = async (data: {
    complex_name?: string;
    complex_address?: string;
  }) => {
    if (!id) return;
    try {
      await updateComplex(id, data);
      toast.success(
        "Cập nhật thành công: Thông tin khu phức hợp đã được cập nhật."
      );
      console.log("Cập nhật thành công");
    } catch {
      toast.error(
        "Đã có lỗi xảy ra khi cập nhật thông tin khu phức hợp. Vui lòng thử lại sau."
      );
      console.error("Cập nhật thất bại");
    }
  };

  const handleDeleteComplex = async () => {
    if (!id) return;
    try {
      await deleteComplex(id);
      toast.success("Ngừng hoạt động khu phức hợp thành công.");
      console.log("Xóa thành công");
      navigate("/owner/complexes", { replace: true });
    } catch {
      toast.error(
        "Đã có lỗi xảy ra khi ngừng hoạt động khu phức hợp. Vui lòng thử lại sau."
      );
      console.error("Xóa thất bại");
    }
  };

  const handleReactivateComplex = async () => {
    if (!id) return;
    try {
      await reactivateComplex(id);
      toast.success("Kích hoạt lại khu phức hợp thành công.");
      console.log("Kích hoạt thành công");
    } catch {
      toast.error(
        "Đã có lỗi xảy ra khi kích hoạt lại khu phức hợp. Vui lòng thử lại sau."
      );
      console.error("Kích hoạt thất bại");
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handlePageChange = (page: number) => {
    setSubfieldPage(page);
  };

  const complex = selectedComplex as ComplexDetail;
  const canAddSubField = complex?.status === ComplexStatus.ACTIVE;

  // Render owner-specific header actions
  const headerActions = complex && (
    <>
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
    </>
  );

  // Render status alerts
  const statusAlerts = complex && (
    <>
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
    </>
  );

  // Add subfield button
  const addSubfieldButton = complex && (
    <SubFieldFormDialog
      complexId={complex.id}
      trigger={
        <Button disabled={!canAddSubField} className="shadow-md">
          <Plus className="w-4 h-4 mr-2" />
          Thêm sân con
        </Button>
      }
    />
  );

  // Empty state button
  const emptyStateButton = complex && (
    <SubFieldFormDialog
      complexId={complex.id}
      trigger={<Button disabled={!canAddSubField}>Thêm sân con ngay</Button>}
    />
  );

  return (
    <>
      <ComplexDetailView
        mode="owner"
        complex={complex}
        subfields={subfields || []}
        pagination={subfieldPagination}
        isLoading={isLoading}
        error={error}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onPageChange={handlePageChange}
        headerActions={headerActions}
        statusAlerts={statusAlerts}
        addSubfieldButton={addSubfieldButton}
        emptyStateButton={emptyStateButton}
        backLink="/owner/complexes"
        backLabel="Quay lại danh sách"
      />

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
    </>
  );
}
