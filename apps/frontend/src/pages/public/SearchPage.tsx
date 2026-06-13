import { RecommendedCourtsBanner } from "@/components/player/recommendation/RecommendedCourtsBanner";
import { ComplexCard } from "@/components/shared/complex/ComplexCard";
import { SubFieldCard } from "@/components/shared/subfield/SubFieldCard";
import { SearchFilters } from "@/components/shared/ui-utility/SearchFilters";
import { Tabs } from "@/components/ui/tabs";
import { SearchHero } from "@/components/shared/search/SearchHero";
import { ResultTabsList } from "@/components/shared/search/ResultTabsList";
import { SearchResultTab } from "@/components/shared/search/SearchResultTab";
import { useSearchResults } from "@/hooks/useSearchResults";

export function SearchPage() {
  const {
    complexResults,
    subFieldResults,
    isLoading,
    complexPagination,
    subfieldPagination,
    filtersValue,
    handleFiltersChange,
    handleComplexPageChange,
    handleSubfieldPageChange,
    hasActiveFilters,
    clearAllFilters,
    keyword,
    sportValue,
    setKeyword,
    setSportValue,
    handleSearchSubmit,
    defaultTab,
  } = useSearchResults();

  const totalResults = complexPagination.total + subfieldPagination.total;

  return (
    <div className="min-h-screen bg-background">
      <SearchHero
        totalResults={totalResults}
        isLoading={isLoading}
        keyword={keyword}
        sportValue={sportValue}
        onKeywordChange={setKeyword}
        onSportChange={setSportValue}
        onSubmit={handleSearchSubmit}
      />

      <section className="relative">
        <div className="page-shell py-8">
          <SearchFilters
            value={filtersValue}
            onChange={handleFiltersChange}
            className="mb-6"
          />

          <RecommendedCourtsBanner />

          <Tabs defaultValue={defaultTab} className="mt-6 flex flex-col gap-6">
            <ResultTabsList
              complexesCount={complexPagination.total}
              subfieldsCount={subfieldPagination.total}
            />

            <SearchResultTab
              value="complexes"
              items={complexResults}
              pagination={complexPagination}
              isLoading={isLoading}
              emptyTitle="Không tìm thấy khu phức hợp"
              emptyDescription="Thử điều chỉnh lại từ khoá hoặc bộ lọc để mở rộng kết quả."
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearAllFilters}
              onPageChange={handleComplexPageChange}
              gridKey={`complexes-grid-${complexPagination.page}-${complexResults.map((c) => c.id).join(",")}`}
              renderItem={(complex) => (
                <ComplexCard key={complex.id} complex={complex} />
              )}
            />

            <SearchResultTab
              value="subfields"
              items={subFieldResults}
              pagination={subfieldPagination}
              isLoading={isLoading}
              emptyTitle="Không tìm thấy sân lẻ"
              emptyDescription="Thử đổi môn thể thao, thay đổi khoảng giá hoặc mở rộng khu vực tìm kiếm."
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearAllFilters}
              onPageChange={handleSubfieldPageChange}
              gridKey={`subfields-grid-${subfieldPagination.page}-${subFieldResults.map((s) => s.id).join(",")}`}
              renderItem={(subField) => (
                <SubFieldCard
                  key={subField.id}
                  subField={subField}
                  showComplexInfo
                />
              )}
            />
          </Tabs>
        </div>
      </section>
    </div>
  );
}
