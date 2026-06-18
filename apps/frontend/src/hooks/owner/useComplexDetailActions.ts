import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useComplexStore } from "@/store/owner/useComplexStore";
import { toast } from "sonner";

export function useComplexDetailActions(id: string | undefined) {
  const { updateComplex, deleteComplex, reactivateComplex } = useComplexStore();
  const navigate = useNavigate();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReactivateDialogOpen, setIsReactivateDialogOpen] = useState(false);
  const [isLegalDocsOpen, setIsLegalDocsOpen] = useState(false);

  const handleUpdateComplex = async (data: {
    complex_name?: string;
    complex_address?: string;
  }) => {
    if (!id) return;
    try {
      await updateComplex(id, data);
      toast.success(
        "Cập nhật thành công: Thông tin khu phức hợp đã được cập nhật.",
      );
    } catch {
      toast.error(
        "Đã có lỗi xảy ra khi cập nhật thông tin khu phức hợp. Vui lòng thử lại sau.",
      );
    }
  };

  const handleDeleteComplex = async () => {
    if (!id) return;
    try {
      await deleteComplex(id);
      toast.success("Ngừng hoạt động khu phức hợp thành công.");
      navigate("/owner/complexes", { replace: true });
    } catch {
      toast.error(
        "Đã có lỗi xảy ra khi ngừng hoạt động khu phức hợp. Vui lòng thử lại sau.",
      );
    }
  };

  const handleReactivateComplex = async () => {
    if (!id) return;
    try {
      await reactivateComplex(id);
      toast.success("Kích hoạt lại khu phức hợp thành công.");
    } catch {
      toast.error(
        "Đã có lỗi xảy ra khi kích hoạt lại khu phức hợp. Vui lòng thử lại sau.",
      );
    }
  };

  return {
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isReactivateDialogOpen,
    setIsReactivateDialogOpen,
    isLegalDocsOpen,
    setIsLegalDocsOpen,
    handleUpdateComplex,
    handleDeleteComplex,
    handleReactivateComplex,
  };
}
