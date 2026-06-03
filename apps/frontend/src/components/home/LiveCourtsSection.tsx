import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { SubFieldCard } from "@/components/shared/SubFieldCard";
import { SectionHeader } from "./SectionHeader";
import type { PublicSubfield } from "@/types";

interface LiveCourtsSectionProps {
  isLoading: boolean;
  courts: PublicSubfield[];
  onBrowse: () => void;
}

export function LiveCourtsSection({
  isLoading,
  courts,
  onBrowse,
}: LiveCourtsSectionProps) {
  return (
    <section className="relative bg-surface-2 py-20">
      <div className="page-shell">
        <SectionHeader
          title={
            <>
              Sẵn sàng thi đấu,
              <br className="hidden sm:block" /> chỉ đợi bạn ra sân.
            </>
          }
          description="Danh sách sân khả dụng được cập nhật liên tục cho vài khung giờ tới."
          action={
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link to="/search?tab=subfields">
                Xem tất cả
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          }
        />

        {isLoading ? (
          <LoadingState
            text="Đang tải danh sách sân khả dụng..."
            className="mt-10"
          />
        ) : courts.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 motion-safe-stagger">
            {courts.map((court) => (
              <SubFieldCard key={court.id} subField={court} showComplexInfo />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Chưa có sân phù hợp"
            description="Hiện chưa có sân khả dụng cho mục này. Vui lòng thử lại sau hoặc mở trang tìm kiếm để lọc thêm."
            actionLabel="Mở trang tìm sân"
            onAction={onBrowse}
            className="mt-10"
          />
        )}
      </div>
    </section>
  );
}
