import { DeleteComplexDialog } from "@/components/owner/DeleteComplexDialog";
import { EditComplexDialog } from "@/components/owner/EditComplexDialog";
import { ReactivateComplexDialog } from "@/components/owner/ReactivateComplexDialog";
import { ComplexDetailView } from "@/components/shared/ComplexDetailView";
import { LegalDocumentsDialog } from "@/components/shared/LegalDocumentsDialog";
import { SubFieldFormDialog } from "@/components/shared/SubFieldFormDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useComplexStore } from "@/store/owner/useComplexStore";
import { useSubfieldStore } from "@/store/owner/useSubfieldStore";
import type { ComplexDetail } from "@/types";
import { ComplexStatus } from "@/types";
import {
  Ban,
  Clock,
  FileText,
  Pencil,
  Plus,
  PowerOff,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export function ComplexDetailPage() {
  const {
    selectedComplex,
    selectedComplexPagination,
    isLoading,
    error,
    fetchComplexById,
    updateComplex,
    deleteComplex,
    reactivateComplex,
  } = useComplexStore();
  const {
    subfields,
    subfieldPagination,
    setSubfieldParams,
    setSubfieldPage,
    setSubfieldSearch,
  } = useSubfieldStore();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReactivateDialogOpen, setIsReactivateDialogOpen] = useState(false);
  const [isLegalDocsOpen, setIsLegalDocsOpen] = useState(false);

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

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handlePageChange = (page: number) => {
    setSubfieldPage(page);
  };

  const complex = selectedComplex as ComplexDetail;
  const canAddSubField = complex?.status === ComplexStatus.ACTIVE;

  // ── Owner action panel ──────────────────────────────────────
  const headerActions = complex && (
    <div className="flex flex-wrap items-center gap-2">
      {complex.status === ComplexStatus.INACTIVE ? (
        <Button
          size="sm"
          onClick={() => setIsReactivateDialogOpen(true)}
          className="h-9 rounded-full bg-emerald-600 px-4 text-xs font-semibold text-white shadow shadow-emerald-600/25 hover:bg-emerald-600/90"
        >
          <RotateCcw data-icon="inline-start" />
          Kích hoạt lại
        </Button>
      ) : (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
            className="h-9 rounded-full border-border/70 bg-background/70 px-4 text-xs font-semibold backdrop-blur-sm hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <Pencil data-icon="inline-start" />
            Chỉnh sửa
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLegalDocsOpen(true)}
            className="h-9 rounded-full border-border/70 bg-background/70 px-4 text-xs font-semibold backdrop-blur-sm hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <FileText data-icon="inline-start" />
            Tài liệu pháp lý
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="h-9 rounded-full border-destructive/30 bg-destructive/5 px-4 text-xs font-semibold text-destructive hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
          >
            <PowerOff data-icon="inline-start" />
            Ngừng hoạt động
          </Button>
        </>
      )}
    </div>
  );

  // ── Status alerts ───────────────────────────────────────────
  const statusAlerts = complex && (
    <div className="flex flex-col gap-2">
      {complex.status === ComplexStatus.PENDING && (
        <StatusRibbon
          tone="amber"
          icon={Clock}
          title="Đang chờ phê duyệt"
          description="Khu phức hợp đang chờ admin xét duyệt. Bạn sẽ có thể thêm sân con ngay khi yêu cầu được chấp thuận."
        />
      )}

      {complex.status === ComplexStatus.INACTIVE && (
        <StatusRibbon
          tone="slate"
          icon={Ban}
          title="Khu phức hợp đã ngừng hoạt động"
          description="Khách hàng không thể xem hoặc đặt lịch tại đây. Bạn có thể kích hoạt lại bất cứ lúc nào từ thanh thao tác phía trên."
        />
      )}

      {complex.status === ComplexStatus.REJECTED && (
        <StatusRibbon
          tone="rose"
          icon={ShieldAlert}
          title="Yêu cầu đã bị từ chối"
          description="Khu phức hợp không được chấp thuận. Vui lòng liên hệ quản trị viên để biết lý do và các bước tiếp theo."
        />
      )}
    </div>
  );

  // ── Add subfield buttons ────────────────────────────────────
  const addSubfieldButton = complex && (
    <SubFieldFormDialog
      complexId={complex.id}
      trigger={
        <Button
          size="sm"
          disabled={!canAddSubField}
          className="h-9 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow shadow-primary/25 hover:bg-primary/92"
        >
          <Plus data-icon="inline-start" />
          Thêm sân con
        </Button>
      }
    />
  );

  const emptyStateButton = complex && (
    <SubFieldFormDialog
      complexId={complex.id}
      trigger={
        <Button
          size="sm"
          disabled={!canAddSubField}
          className="h-9 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow shadow-primary/25 hover:bg-primary/92"
        >
          <Plus data-icon="inline-start" />
          Thêm sân con ngay
        </Button>
      }
    />
  );

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
        headerActions={headerActions}
        statusAlerts={statusAlerts}
        addSubfieldButton={addSubfieldButton}
        emptyStateButton={emptyStateButton}
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

// ── Reusable status ribbon (bigger alert with icon + left accent bar) ──
type RibbonTone = "amber" | "slate" | "rose";

function StatusRibbon({
  tone,
  icon: Icon,
  title,
  description,
}: {
  tone: RibbonTone;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  const tones: Record<
    RibbonTone,
    { wrap: string; bar: string; icon: string; title: string }
  > = {
    amber: {
      wrap: "border-amber-500/30 bg-amber-500/8 text-amber-900 dark:text-amber-200",
      bar: "bg-amber-500",
      icon: "text-amber-600 dark:text-amber-400",
      title: "text-amber-700 dark:text-amber-300",
    },
    slate: {
      wrap: "border-slate-500/30 bg-slate-500/8 text-slate-900 dark:text-slate-200",
      bar: "bg-slate-500",
      icon: "text-slate-600 dark:text-slate-300",
      title: "text-slate-700 dark:text-slate-300",
    },
    rose: {
      wrap: "border-rose-500/30 bg-rose-500/8 text-rose-900 dark:text-rose-200",
      bar: "bg-rose-500",
      icon: "text-rose-600 dark:text-rose-400",
      title: "text-rose-700 dark:text-rose-300",
    },
  };

  const t = tones[tone];

  return (
    <Alert
      className={cn(
        "relative overflow-hidden rounded-2xl border pl-5",
        t.wrap,
      )}
    >
      <span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 w-1", t.bar)}
      />
      <Icon className={cn("size-4", t.icon)} />
      <AlertTitle
        className={cn(
          "font-display text-sm font-bold italic tracking-tight",
          t.title,
        )}
      >
        {title}
      </AlertTitle>
      <AlertDescription className="text-xs leading-relaxed opacity-90">
        {description}
      </AlertDescription>
    </Alert>
  );
}
