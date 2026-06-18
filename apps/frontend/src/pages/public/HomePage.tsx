import { CtaSection } from "@/components/shared/home/CtaSection";
import { FeaturedComplexesSection } from "@/components/shared/home/FeaturedComplexesSection";
import { HeroSection } from "@/components/shared/home/HeroSection";
import { HowItWorksSection } from "@/components/shared/home/HowItWorksSection";
import { LiveCourtsSection } from "@/components/shared/home/LiveCourtsSection";
import { MarqueeBanner } from "@/components/shared/home/MarqueeBanner";
import { SportCategoriesSection } from "@/components/shared/home/SportCategoriesSection";
import { SPORT_CATEGORIES, type HomeSportCategory } from "@/lib/constants";
import { RecommendedCourts } from "@/components/player/recommendation/RecommendedCourts";
import { publicService } from "@/services/public.service";
import type { Complex, PublicSubfield } from "@/types";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function HomePage() {
  const navigate = useNavigate();
  const [featuredComplexes, setFeaturedComplexes] = useState<Complex[]>([]);
  const [availableCourts, setAvailableCourts] = useState<PublicSubfield[]>([]);
  const [categories, setCategories] = useState<HomeSportCategory[]>(SPORT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [complexesRes, subfieldsRes] = await Promise.all([
          publicService.getComplexes({ page: 1, limit: 4 }),
          publicService.getSubfields({ page: 1, limit: 6 }),
        ]);

        setFeaturedComplexes((complexesRes.data?.complexes || []).slice(0, 4));
        setAvailableCourts((subfieldsRes.data?.subfields || []).slice(0, 6));

        // Fetch actual court counts for each sport type dynamically from the database
        const countMap: Record<string, number> = {};
        await Promise.all(
          SPORT_CATEGORIES.map(async (cat) => {
            try {
              const res = await publicService.getSubfields({
                sport_types: [cat.type],
                limit: 1,
              });
              countMap[cat.type] = res.data?.pagination?.total || 0;
            } catch {
              countMap[cat.type] = 0;
            }
          })
        );

        setCategories(
          SPORT_CATEGORIES.map((cat) => ({
            ...cat,
            courtCount: countMap[cat.type] || 0,
          }))
        );
      } catch {
        toast.error("Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
        setFeaturedComplexes([]);
        setAvailableCourts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <MarqueeBanner />
      <HeroSection />
      <RecommendedCourts />
      <SportCategoriesSection categories={categories} />
      <LiveCourtsSection
        isLoading={isLoading}
        courts={availableCourts}
        onBrowse={() => navigate("/search?tab=subfields")}
      />
      <FeaturedComplexesSection
        isLoading={isLoading}
        complexes={featuredComplexes}
        onBrowse={() => navigate("/search?tab=complexes")}
      />
      <HowItWorksSection />
      <CtaSection />
    </div>
  );
}
