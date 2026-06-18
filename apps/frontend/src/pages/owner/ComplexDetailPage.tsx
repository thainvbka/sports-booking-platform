import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useComplexStore } from "@/store/owner/useComplexStore";
import { useSubfieldStore } from "@/store/owner/useSubfieldStore";
import { ComplexStatus, type ComplexDetail } from "@/types";
import { ComplexDetailView } from "@/components/shared/complex/ComplexDetailView";
import { EditComplexDialog } from "@/components/owner/complex/EditComplexDialog";
import { DeleteComplexDialog } from "@/components/owner/complex/DeleteComplexDialog";
import { ReactivateComplexDialog } from "@/components/owner/complex/ReactivateComplexDialog";
import { LegalDocumentsDialog } from "@/components/shared/dialogs/LegalDocumentsDialog";
import { ComplexHeaderActions } from "@/components/owner/complex/ComplexHeaderActions";
import { ComplexStatusAlerts } from "@/components/owner/complex/ComplexStatusAlerts";
import { AddSubfieldButton } from "@/components/owner/complex/AddSubfieldButton";
import { useComplexDetailActions } from "@/hooks/owner/useComplexDetailActions";
import { useSubfieldListParams } from "@/hooks/player/useSubfieldListParams";

export function ComplexDetailPage() {
  const { id } = useParams();
  const {
    selectedComplex,
    selectedComplexPagination,
    isLoading,
    error,
    fetchComplexById,
  } = useComplexStore();
  const { subfields, subfieldPagination } = useSubfieldStore();

  const {
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
  } = useComplexDetailActions(id);

  const {
    searchTerm,
    handleSearchChange,
    handlePageChange,
  } = useSubfieldListParams(id);

  // Fetch complex on id change
  useEffect(() => {
    if (id) {
      fetchComplexById(id);
    }
  }, [id, fetchComplexById]);

  const complex = selectedComplex as ComplexDetail;
  const canAddSubField = complex?.status === ComplexStatus.ACTIVE;

  return (
    <>
      <ComplexDetailView
        complex={complex}
        subfields={complex?.sub_fields || subfields || []}
        pagination={selectedComplexPagination || subfieldPagination}
        isLoading={isLoading}
        error={error}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onPageChange={handlePageChange}
        headerActions={
          <ComplexHeaderActions
            complex={complex}
            onEdit={() => setIsEditDialogOpen(true)}
            onLegalDocs={() => setIsLegalDocsOpen(true)}
            onDeactivate={() => setIsDeleteDialogOpen(true)}
            onReactivate={() => setIsReactivateDialogOpen(true)}
          />
        }
        statusAlerts={<ComplexStatusAlerts status={complex?.status} />}
        addSubfieldButton={
          complex && (
            <AddSubfieldButton
              complexId={complex.id}
              disabled={!canAddSubField}
              label="Thêm sân con"
            />
          )
        }
        emptyStateButton={
          complex && (
            <AddSubfieldButton
              complexId={complex.id}
              disabled={!canAddSubField}
              label="Thêm sân con ngay"
            />
          )
        }
        backLink="/owner/complexes"
        backLabel="Quay lại danh sách"
        parentLabel="Khu phức hợp"
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
          <LegalDocumentsDialog
            open={isLegalDocsOpen}
            onOpenChange={setIsLegalDocsOpen}
            title={`Tài liệu pháp lý · ${complex.complex_name}`}
            description="Đây là các tài liệu bạn đã gửi khi đăng ký khu phức hợp."
            verificationDocs={complex.verification_docs}
          />
        </>
      )}
    </>
  );
}
