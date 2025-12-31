import { useSearchParams } from "react-router-dom";
import { publicService } from "@/services/public.service";
import type { Complex, SubField, SportType } from "@/types";
import { ComplexCard } from "@/components/shared/ComplexCard";
import { SubFieldCard } from "@/components/shared/SubFieldCard";
import { SearchBar } from "@/components/shared/SearchBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [complexResults, setComplexResults] = useState<Complex[]>([]);
  const [subFieldResults, setSubFieldResults] = useState<
    (SubField & { complex_name?: string; complex_address?: string })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [complexPagination, setComplexPagination] = useState({
    total: 0,
    page: 1,
    limit: 8,
    totalPages: 0,
  });
  const [subfieldPagination, setSubfieldPagination] = useState({
    total: 0,
    page: 1,
    limit: 8,
    totalPages: 0,
  });

  // Parse search params
  const location = searchParams.get("location") || undefined;
  const sport_type = searchParams.get("sport_type") as SportType | undefined;
  const minPrice = searchParams.get("minPrice")
    ? Number(searchParams.get("minPrice"))
    : undefined;
  const maxPrice = searchParams.get("maxPrice")
    ? Number(searchParams.get("maxPrice"))
    : undefined;
  const minCapacity = searchParams.get("minCapacity")
    ? Number(searchParams.get("minCapacity"))
    : undefined;
  const maxCapacity = searchParams.get("maxCapacity")
    ? Number(searchParams.get("maxCapacity"))
    : undefined;

  const complexPage = Number(searchParams.get("complexPage")) || 1;
  const subfieldPage = Number(searchParams.get("subfieldPage")) || 1;
  const defaultTab = searchParams.get("tab") || "complexes";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const sport_types = sport_type ? [sport_type] : undefined;

        const [complexesRes, subfieldsRes] = await Promise.all([
          publicService.getComplexes({
            page: complexPage,
            limit: 8,
            search: location,
            sport_types,
            minPrice,
            maxPrice,
          }),
          publicService.getSubfields({
            page: subfieldPage,
            limit: 8,
            search: location,
            sport_types,
            minCapacity,
            maxCapacity,
            minPrice,
            maxPrice,
          }),
        ]);

        setComplexResults(complexesRes.data?.complexes || []);
        setComplexPagination(
          complexesRes.data?.pagination || {
            total: 0,
            page: 1,
            limit: 8,
            totalPages: 0,
          }
        );

        setSubFieldResults(subfieldsRes.data?.subfields || []);
        setSubfieldPagination(
          subfieldsRes.data?.pagination || {
            total: 0,
            page: 1,
            limit: 8,
            totalPages: 0,
          }
        );
      } catch (error) {
        toast.error("Đã có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau.");
        console.error("Error fetching search results:", error);
        setComplexResults([]);
        setSubFieldResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [
    location,
    sport_type,
    minPrice,
    maxPrice,
    minCapacity,
    maxCapacity,
    complexPage,
    subfieldPage,
  ]);

  const handleComplexPageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("complexPage", newPage.toString());
    setSearchParams(newParams);
  };

  const handleSubfieldPageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("subfieldPage", newPage.toString());
    setSearchParams(newParams);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Tìm kiếm sân thể thao</h1>
        <SearchBar />
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="complexes">
            Khu phức hợp ({complexPagination.total})
          </TabsTrigger>
          <TabsTrigger value="subfields">
            Sân lẻ ({subfieldPagination.total})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="complexes" className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : complexResults.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {complexResults.map((complex) => (
                  <ComplexCard key={complex.id} complex={complex} />
                ))}
              </div>

              {/* Pagination */}
              {complexPagination.totalPages > 1 && (
                <div className="flex items-center justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleComplexPageChange(complexPagination.page - 1)
                    }
                    disabled={complexPagination.page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Trước
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Trang {complexPagination.page} /{" "}
                    {complexPagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleComplexPageChange(complexPagination.page + 1)
                    }
                    disabled={
                      complexPagination.page === complexPagination.totalPages
                    }
                  >
                    <ChevronRight className="w-4 h-4" />
                    Sau  
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                Không tìm thấy khu phức hợp nào phù hợp.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="subfields" className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-96 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : subFieldResults.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {subFieldResults.map((subField) => (
                  <div key={subField.id} className="h-full">
                    <SubFieldCard subField={subField} showComplexInfo />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {subfieldPagination.totalPages > 1 && (
                <div className="flex items-center justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleSubfieldPageChange(subfieldPagination.page - 1)
                    }
                    disabled={subfieldPagination.page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Trước
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Trang {subfieldPagination.page} /{" "}
                    {subfieldPagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleSubfieldPageChange(subfieldPagination.page + 1)
                    }
                    disabled={
                      subfieldPagination.page === subfieldPagination.totalPages
                    }
                  >
                    <ChevronRight className="w-4 h-4" />
                    Sau
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                Không tìm thấy sân lẻ nào phù hợp.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
