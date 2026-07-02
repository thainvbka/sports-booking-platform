import { DeleteSubfieldDialog } from "@/components/owner/subfield/DeleteSubfieldDialog";
import { EditSubfieldDialog } from "@/components/owner/subfield/EditSubfieldDialog";
import { SubFieldHeroCard } from "@/components/owner/subfield/SubFieldHeroCard";
import { SubFieldPricingConsole } from "@/components/owner/subfield/SubFieldPricingConsole";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubfieldStore } from "@/store/owner/useSubfieldStore";
import { FileWarning } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export function SubFieldDetailPage() {
  const {
    selectedSubfield,
    isLoading,
    error,
    fetchSubfieldById,
    updateSubfield,
    deleteSubfield,
  } = useSubfieldStore();
  const navigate = useNavigate();
  const { id } = useParams();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch subfield details on mount
  useEffect(() => {
    if (id) {
      fetchSubfieldById(id);
    }
  }, [id, fetchSubfieldById]);

  const handleUpdateSubfield = async (data: {
    subfield_name: string;
    sport_type: string;
    capacity: number;
  }) => {
    if (!id) return;
    try {
      await updateSubfield(id, data);
      toast.success("Cập nhật thành công: Thông tin sân con đã được cập nhật.");
    } catch {
      toast.error(
        "Cập nhật thất bại: Có lỗi xảy ra khi cập nhật thông tin sân con.",
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

  if (isLoading && !selectedSubfield) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-6 w-48 rounded-md" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !selectedSubfield) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileWarning className="size-12 text-destructive opacity-80" />
        <h2 className="mt-4 text-lg font-bold text-foreground">Không tìm thấy sân con</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {error || "Sân con này không tồn tại hoặc bạn không có quyền truy cập."}
        </p>
        <Link
          to="/owner/complexes"
          className="mt-6 text-sm font-semibold text-primary hover:underline"
        >
          Quay lại danh sách khu phức hợp
        </Link>
      </div>
    );
  }

  const sub = selectedSubfield;

  return (
    <div className="flex flex-col gap-5 pb-10">
      {/*  BREADCRUMB  */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/owner/complexes">Khu phức hợp</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/owner/complexes/${sub.complex_id || ""}`}>
                Chi tiết khu phức hợp
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold">
              {sub.sub_field_name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <SubFieldHeroCard
        subfield={sub}
        onEditClick={() => setIsEditDialogOpen(true)}
        onDeleteClick={() => setIsDeleteDialogOpen(true)}
      />

      <SubFieldPricingConsole subfieldId={sub.id} />

      {/* Subfield Management Dialogs */}
      <EditSubfieldDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        subfield={sub}
        onSubmit={handleUpdateSubfield}
      />
      <DeleteSubfieldDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        subfieldName={sub.sub_field_name}
        onConfirm={handleDeleteSubfield}
      />
    </div>
  );
}
