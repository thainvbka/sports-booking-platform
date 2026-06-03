import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { publicService } from "@/services/public.service";
import type { Complex, PublicSubfield } from "@/types";
import { RecommendedCourts } from "@/components/player/RecommendedCourts";
import { MarqueeBanner } from "@/components/home/MarqueeBanner";
import { HeroSection } from "@/components/home/HeroSection";
import { SportCategoriesSection } from "@/components/home/SportCategoriesSection";
import { LiveCourtsSection } from "@/components/home/LiveCourtsSection";
import { FeaturedComplexesSection } from "@/components/home/FeaturedComplexesSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { CtaSection } from "@/components/home/CtaSection";
import { SPORT_CATEGORIES, type HomeSportCategory } from "@/components/home/constants";

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
