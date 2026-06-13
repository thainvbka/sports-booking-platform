import { SubfieldHeroInfo } from "@/components/shared/subfield/SubFieldHeroInfo";
import { SubfieldPricingTabs } from "@/components/shared/subfield/SubFieldPricingTabs";
import { SubfieldReviewsList } from "@/components/shared/subfield/SubFieldReviewsList";
import { SubfieldStickySidebar } from "@/components/shared/subfield/SubFieldStickySidebar";
import { EmptyState } from "@/components/shared/ui-utility/EmptyState";
import { LoadingState } from "@/components/shared/ui-utility/LoadingState";
import { useSubfieldData } from "@/hooks/useSubfieldData";
import { useSubfieldReviews } from "@/hooks/useSubfieldReviews";
import { formatMinutesToTime, parseRuleTimeToMinutes } from "@/utils/time.utils";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const PAGE_SIZE = 6;

export function PublicSubfieldDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    subfield,
    products,
    isLoading: isSubfieldLoading,
    error: subfieldError,
  } = useSubfieldData({ subfieldId: id, includeProducts: true });

  const {
    reviews,
    pagination,
    summary,
    isReviewsLoading,
    ratingFilter,
    hasImagesOnly,
    sortBy,
    setRatingFilter,
    setHasImagesOnly,
    setSortBy,
    setPage,
  } = useSubfieldReviews({
    subfieldId: id,
    pageSize: PAGE_SIZE,
    initialSortBy: "newest",
  });

  const operatingHours = useMemo(() => {
    const starts: number[] = [];
    const ends: number[] = [];

    for (const rule of subfield?.pricing_rules || []) {
      const startMin = parseRuleTimeToMinutes(rule.start_time);
      const endMin = parseRuleTimeToMinutes(rule.end_time);

      if (startMin !== null) starts.push(startMin);
      if (endMin !== null) ends.push(endMin);
    }

    if (starts.length === 0 || ends.length === 0) {
      return "--:-- - --:--";
    }

    return `${formatMinutesToTime(Math.min(...starts))} - ${formatMinutesToTime(Math.max(...ends))}`;
  }, [subfield?.pricing_rules]);

  useEffect(() => {
    if (!subfieldError) return;

    console.error("Failed to fetch subfield detail", subfieldError);
    toast.error("Không thể tải thông tin sân");
    navigate(-1);
  }, [subfieldError, navigate]);

  if (isSubfieldLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingState text="Đang tải thông tin sân..." className="py-12" />
      </div>
    );
  }

  if (!subfield) {
    return (
      <div className="page-shell py-16">
        <EmptyState
          title="Không tìm thấy sân"
          description="Sân bạn đang tìm có thể đã bị gỡ hoặc đường dẫn không đúng."
          actionLabel="Quay lại"
          onAction={() => navigate(-1)}
        />
      </div>
    );
  }

  return (
    <div className="bg-background motion-safe-fade-up min-h-0 h-auto">
      <SubfieldHeroInfo
        subfield={subfield}
        rating={summary.average}
        reviewCount={summary.total}
        operatingHours={operatingHours}
      />

      <div className="page-shell pt-6 pb-12 min-h-0 h-auto">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_320px] xl:grid-cols-[minmax(0,1.7fr)_350px] lg:items-start min-h-0 h-auto">
          {/* Left Main Column */}
          <div className="flex flex-col gap-6 min-w-0">
            {/* 1. Pricing Section */}
            <SubfieldPricingTabs
              subfieldId={subfield.id}
              pricingRules={subfield.pricing_rules || []}
              onBookNow={(date, start, end) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                const dateStr = `${year}-${month}-${day}`;
                navigate(`/booking/${subfield.id}?date=${dateStr}&start=${start}&end=${end}`);
              }}
            />

            {/* 2. Review Section */}
            <SubfieldReviewsList
              reviews={reviews}
              isLoading={isReviewsLoading}
              summary={summary}
              ratingFilter={ratingFilter}
              hasImagesOnly={hasImagesOnly}
              sortBy={sortBy}
              onRatingFilterChange={setRatingFilter}
              onHasImagesOnlyChange={setHasImagesOnly}
              onSortByChange={setSortBy}
              pagination={pagination}
              onPageChange={setPage}
            />
          </div>

          {/* Right Sidebar Column */}
          <SubfieldStickySidebar
            subfield={subfield}
            products={products}
            ratingAverage={summary.average}
            ratingTotal={summary.total}
            onBookNow={() => navigate(`/booking/${subfield.id}`)}
          />
        </div>
      </div>
    </div>
  );
}
