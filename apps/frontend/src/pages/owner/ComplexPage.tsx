import { useOwnerStore } from "@/store/useOwnerStore";
import { OwnerComplexCard } from "@/components/shared/OwnerComplexCard";
import { ComplexFormDialog } from "@/components/shared/ComplexFormDialog";
import {
  AlertCircle,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export function ComplexesPage() {
  const {
    complexes,
    // fetchComplexes,
    pagination,
    setPage,
    setSearch,
    queryParams,
    setParams,
  } = useOwnerStore();
  const [searchParams, setSearchParams] = useSearchParams();

  //lay gia tri ban dau tu URL neu co
  const initialSearch = searchParams.get("search") || "";
  const initialPage = parseInt(searchParams.get("page") || "1");

  //khoi tao state search tu URL
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Debounce search input để không gọi API liên tục khi gõ
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, setSearch]);

  //khoi tao store khi trang load lan dau
  useEffect(() => {
    setParams({ page: initialPage, search: initialSearch });
  }, []); //chi chay 1 lan khi component mount

  // Cập nhật URL khi searchTerm hoặc page thay đổi
  useEffect(() => {
    const params: any = {};
    if (queryParams.page > 1) {
      params.page = queryParams.page.toString();
    }
    if (queryParams.search) {
      params.search = queryParams.search;
    }
    setSearchParams(params);
  }, [queryParams.page, queryParams.search, setSearchParams]);

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Khu Phức Hợp
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý và theo dõi trạng thái các khu phức hợp của bạn
          </p>
        </div>
        <ComplexFormDialog />
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm khu phức hợp..."
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Complex List */}
      {complexes.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {complexes.map((complex) => (
              <OwnerComplexCard key={complex.id} complex={complex} />
            ))}
          </div>
          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Sau
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl bg-muted/30">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-medium">Chưa có khu phức hợp nào</h3>
          <p className="text-muted-foreground max-w-sm text-center mt-1 mb-6">
            Bạn chưa tạo khu phức hợp nào. Hãy bắt đầu bằng việc tạo khu phức
            hợp đầu tiên của bạn.
          </p>
          <ComplexFormDialog />
        </div>
      )}
    </div>
  );
}
