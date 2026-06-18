import { ComplexCard } from "@/components/shared/complex/ComplexCard";
import { LoadingState } from "@/components/shared/ui-utility/LoadingState";
import { Button } from "@/components/ui/button";
import type { Complex } from "@/types";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionHeader } from "./SectionHeader";

interface FeaturedComplexesSectionProps {
  isLoading: boolean;
  complexes: Complex[];
  onBrowse: () => void;
}

export function FeaturedComplexesSection({
  isLoading,
  complexes,
  onBrowse,
}: FeaturedComplexesSectionProps) {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950 py-20 text-white">
      <div className="absolute inset-0 bg-grid-dark opacity-60" aria-hidden="true" />
      <div
        className="absolute -right-40 top-0 h-80 w-80 rounded-full bg-primary/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-accent-sport/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="page-shell relative">
        <SectionHeader
          tone="dark"
          title={
            <>
              Khu phức hợp
              <br className="hidden sm:block" />{" "}
              <span className="italic text-accent-sport">được chọn lọc.</span>
            </>
          }
          description="Không gian chất lượng cao, đa bộ môn, được cộng đồng T-Sport yêu thích."
          action={
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white"
            >
              <Link to="/search?tab=complexes">
                Xem tất cả
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          }
        />

        {isLoading ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm">
            <LoadingState
              text="Đang tải khu phức hợp nổi bật..."
              className="border-0 bg-transparent text-white/70"
            />
          </div>
        ) : complexes.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 motion-safe-stagger">
            {complexes.map((complex) => (
              <ComplexCard key={complex.id} complex={complex} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-white/15 bg-white/[0.04] p-12 text-center backdrop-blur-sm">
            <p className="font-display text-lg font-semibold text-white">
              Chưa có khu phức hợp nổi bật
            </p>
            <p className="mt-1 text-sm text-white/60">
              Dữ liệu khu phức hợp đang được cập nhật. Bạn có thể vào trang tìm
              sân để xem toàn bộ danh sách.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-5 rounded-full border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white"
              onClick={onBrowse}
            >
              Xem trang tìm sân
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
