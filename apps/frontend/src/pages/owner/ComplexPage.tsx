import { useOwnerStore } from "@/store/useOwnerStore";
import { OwnerComplexCard } from "@/components/shared/OwnerComplexCard";
import { ComplexFormDialog } from "@/components/shared/ComplexFormDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export function ComplexesPage() {
  const { complexes, fetchComplexes } = useOwnerStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchComplexes();
  }, [fetchComplexes]);

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

      {/* {!user?.stripe_onboarding_complete && (
        <Alert
          variant="destructive"
          className="bg-red-50 border-red-200 text-red-900"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bạn cần kết nối Stripe trước khi tạo khu phức hợp. Vui lòng vào
            Dashboard để kết nối.
          </AlertDescription>
        </Alert>
      )} */}

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm khu phức hợp..."
            className="pl-9 bg-background"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {complexes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complexes.map((complex) => (
            <OwnerComplexCard key={complex.id} complex={complex} />
          ))}
        </div>
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
