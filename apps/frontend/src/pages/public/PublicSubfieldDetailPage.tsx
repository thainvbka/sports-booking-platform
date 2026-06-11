import { SubfieldHeroInfo } from "@/components/shared/subfield/SubFieldHeroInfo";
import { SubfieldReviewsList } from "@/components/shared/subfield/SubFieldReviewsList";
import { SubfieldStickySidebar } from "@/components/shared/subfield/SubFieldStickySidebar";
import { EmptyState } from "@/components/shared/ui-utility/EmptyState";
import { LoadingState } from "@/components/shared/ui-utility/LoadingState";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSubfieldData } from "@/hooks/useSubfieldData";
import { useSubfieldReviews } from "@/hooks/useSubfieldReviews";
import { getSportTypeLabel } from "@/utils";
import { formatMinutesToTime, parseRuleTimeToMinutes } from "@/utils/time.utils";
import {
  CalendarCheck2,
  Clock3,
  MapPin,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
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
      <div className="min-h-[60vh]">
        <LoadingState text="Đang tải thông tin sân..." className="py-24" />
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

  const sportLabel = getSportTypeLabel(subfield.sport_type);

  return (
    <div className="bg-background motion-safe-fade-up">
      <SubfieldHeroInfo
        subfield={subfield}
        rating={summary.average}
        reviewCount={summary.total}
        operatingHours={operatingHours}
      />

      <div className="page-shell pt-10 pb-16">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
          <div className="flex flex-col gap-10">
            <VenueBriefCard
              sportLabel={sportLabel}
              capacity={subfield.capacity}
              operatingHours={operatingHours}
              complexName={subfield.complex.complex_name}
              complexAddress={subfield.complex.complex_address}
            />

            <Separator className="bg-border/60" />

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

interface VenueBriefCardProps {
  sportLabel: string;
  capacity: number;
  operatingHours: string;
  complexName: string;
  complexAddress: string;
}

function VenueBriefCard({
  sportLabel,
  capacity,
  operatingHours,
  complexName,
  complexAddress,
}: VenueBriefCardProps) {
  return (
    <section className="flex flex-col gap-5">
      {/* <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        <span className="h-px w-8 bg-border-strong" />
        Section · The venue
      </div> */}

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
        <Card className="rounded-3xl border-border/70 bg-card shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6">
            <h2 className="leading-tight tracking-tight italic md:text-4xl text-title">
              Sẵn sàng <span className="text-primary">vào trận</span>.
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
              Một không gian chơi chuẩn chỉnh cho môn{" "}
              <span className="font-semibold text-foreground">{sportLabel}</span>, sức chứa{" "}
              <span className="font-semibold text-foreground">{capacity} người</span>, mở cửa{" "}
              <span className="font-semibold text-foreground">{operatingHours}</span>. Đặt online,
              xác nhận tức thì, đến sân là chơi — không lằng nhằng.
            </p>

            <div className="flex items-start gap-2 rounded-2xl border border-dashed border-border/70 bg-surface-2/50 px-4 py-3 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{complexName}</p>
                <p className="text-xs text-muted-foreground">{complexAddress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <BriefTile
            icon={<Trophy className="h-4 w-4 text-primary" />}
            label="Môn thi đấu"
            value={sportLabel}
          />
          <BriefTile
            icon={<Users className="h-4 w-4 text-primary" />}
            label="Sức chứa"
            value={`${capacity} người`}
          />
          <BriefTile
            icon={<Clock3 className="h-4 w-4 text-primary" />}
            label="Giờ sân"
            value={operatingHours}
          />
          <BriefTile
            icon={<CalendarCheck2 className="h-4 w-4 text-accent-sport" />}
            label="Đặt sân"
            value="Xác nhận tức thì"
            accent
          />
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-accent-sport/20 bg-accent-sport/5 px-4 py-3 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 shrink-0 text-accent-sport" />
        <p>
          Mẹo: đặt trước khung giờ vàng (17:00 – 21:00) để giữ đúng slot yêu thích của bạn.
        </p>
      </div>
    </section>
  );
}

interface BriefTileProps {
  icon: ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}

function BriefTile({ icon, label, value, accent }: BriefTileProps) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-2xl border p-4 ${
        accent
          ? "border-accent-sport/25 bg-accent-sport/5"
          : "border-border/70 bg-card"
      }`}
    >
      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-foreground">
        {value}
      </span>
    </div>
  );
}
