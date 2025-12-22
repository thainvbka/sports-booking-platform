import { useSearchParams } from "react-router-dom";
import { searchComplexes, searchSubFields } from "@/services/mockData";
import type { SearchFilters, SportType } from "@/types";
import { ComplexCard } from "@/components/shared/ComplexCard";
import { SubFieldCard } from "@/components/shared/SubFieldCard";
import { SearchBar } from "@/components/shared/SearchBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SearchPage() {
  const [searchParams] = useSearchParams();

  const filters: SearchFilters = {
    location: searchParams.get("location") || undefined,
    sport_type: (searchParams.get("sport_type") as SportType) || undefined,
  };

  const complexResults = searchComplexes(filters);
  const subFieldResults = searchSubFields(filters);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Tìm kiếm sân thể thao</h1>
        <SearchBar />
      </div>

      <Tabs defaultValue="complexes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="complexes">
            Khu phức hợp ({complexResults.length})
          </TabsTrigger>
          <TabsTrigger value="subfields">
            Sân lẻ ({subFieldResults.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="complexes" className="space-y-6">
          {complexResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {complexResults.map((complex) => (
                <ComplexCard key={complex.id} complex={complex} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                Không tìm thấy khu phức hợp nào phù hợp.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="subfields" className="space-y-6">
          {subFieldResults.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subFieldResults.map((subField) => (
                <div key={subField.id} className="h-full">
                  <SubFieldCard subField={subField} showComplexInfo />
                </div>
              ))}
            </div>
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
