import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ComplexDetailView } from "@/components/shared/ComplexDetailView";
import { publicService } from "@/services/public.service";
import type { ComplexDetail, SubField, PaginationMeta } from "@/types";
import { toast } from "sonner";

export function PublicComplexDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialPage = parseInt(searchParams.get("page") || "1");
  const initialSearch = searchParams.get("search") || "";

  const [complex, setComplex] = useState<ComplexDetail | null>(null);
  const [subfields, setSubfields] = useState<SubField[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  // Scroll to top on mount and when id changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to page 1 when search changes
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data when id, page, or debounced search changes
  useEffect(() => {
    if (id) {
      fetchComplexData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, currentPage, debouncedSearch]);

  const fetchComplexData = async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await publicService.getComplexById(id, {
        page: currentPage,
        limit: 6,
        search: debouncedSearch,
      });

      if (response.data) {
        const complexData = response.data.complex as any;
        setComplex({
          ...complexData,
          _count: complexData._count || {
            sub_fields: complexData.sub_fields?.length || 0,
          },
        } as ComplexDetail);
        setSubfields(complexData.sub_fields || []);
        setPagination(response.data.pagination);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Không thể tải thông tin khu phức hợp";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ComplexDetailView
        mode="public"
        complex={complex}
        subfields={subfields}
        pagination={pagination}
        isLoading={isLoading}
        error={error}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onPageChange={handlePageChange}
        onBack={handleBack}
        backLabel="Quay lại"
      />
    </div>
  );
}
