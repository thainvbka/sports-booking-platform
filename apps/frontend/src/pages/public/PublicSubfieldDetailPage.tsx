import { SubfieldHeroInfo } from "@/components/subfield-detail/SubfieldHeroInfo";
import { SubfieldReviewsList } from "@/components/subfield-detail/SubfieldReviewsList";
import { SubfieldStickySidebar } from "@/components/subfield-detail/SubfieldStickySidebar";
import { Button } from "@/components/ui/button";
import { useSubfieldData } from "@/hooks/useSubfieldData";
import { useSubfieldReviews } from "@/hooks/useSubfieldReviews";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const PAGE_SIZE = 6;

export function PublicSubfieldDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    subfield,
    isLoading: isSubfieldLoading,
    error: subfieldError,
  } = useSubfieldData({ subfieldId: id });

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

  useEffect(() => {
    if (!subfieldError) return;

    console.error("Failed to fetch subfield detail", subfieldError);
    toast.error("Không thể tải thông tin sân");
    navigate(-1);
  }, [subfieldError, navigate]);

  if (isSubfieldLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <div className="text-center text-muted-foreground">Đang tải sân...</div>
      </div>
    );
  }

  if (!subfield) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-lg border p-6 text-center">
          <p className="text-lg font-semibold">Không tìm thấy sân</p>
          <Button className="mt-4" onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-6xl space-y-8 px-4 py-8 md:py-10">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </button>

        <div className="grid gap-6 lg:items-start xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <SubfieldHeroInfo
              subfield={subfield}
              rating={summary.average}
              reviewCount={summary.total}
            />

            <SubfieldReviewsList
              reviews={reviews}
              isLoading={isReviewsLoading}
              totalReviews={summary.total}
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

          <SubfieldStickySidebar
            subfield={subfield}
            ratingAverage={summary.average}
            ratingTotal={summary.total}
            onBookNow={() => navigate(`/booking/${subfield.id}`)}
          />
        </div>
      </div>
    </div>
  );
}
