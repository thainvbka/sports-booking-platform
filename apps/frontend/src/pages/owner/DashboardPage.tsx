import { useOwnerStore } from "@/store/useOwnerStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import {
  Building2,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Plus,
  MoreHorizontal,
  Wallet,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ownerService } from "@/services/owner.service";
import { toast } from "sonner";

export function OwnerDashboardPage() {
  const { complexes, isLoading, error, fetchComplexes } = useOwnerStore();
  const { user: owner } = useAuthStore();

  // Trong DashboardPage.tsx
  const [isConnected, setIsConnected] = useState(false);
  useEffect(() => {
    if (complexes.length === 0) {
      fetchComplexes(); // Fetch nếu chưa có dữ liệu
    }
  }, [complexes.length, fetchComplexes]);

  useEffect(() => {
    ownerService
      .getStripeStatus()
      .then((data) => {
        setIsConnected(data.isComplete);
      })
      .catch((error) => {
        toast.error(
          "Đã có lỗi xảy ra khi kiểm tra trạng thái kết nối Stripe. Vui lòng thử lại sau."
        );
        console.error("Lỗi khi lấy trạng thái Stripe:", error);
      });
  }, []);
  console.log("isConnected:", isConnected);

  const stats = {
    totalComplexes: complexes.length,
    totalBookings: 124,
    revenue: 15400000,
    monthlyGrowth: 12.5,
  };

  const currentDate = format(new Date(), "EEEE, d MMMM, yyyy", { locale: vi });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-destructive bg-destructive/10 rounded-md m-4">
        Error: {error}
      </div>
    );
  }

  const handleConnectStripe = async () => {
    try {
      const data = await ownerService.createStripeLink();
      window.location.href = data.url; // Redirect sang Stripe
    } catch (error) {
      toast.error(
        "Đã có lỗi xảy ra khi kết nối với Stripe. Vui lòng thử lại sau."
      );
      console.error("Lỗi kết nối Stripe:", error);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Xin chào, {owner?.full_name || "Chủ sân"} 👋
          </h1>
          <p className="text-muted-foreground mt-1 capitalize">
            {currentDate} • Tổng quan hoạt động kinh doanh
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isConnected ? (
            //nếu đã kết nối stripe
            <>
              {/* Badge trạng thái (chỉ hiện trên màn hình desktop cho đỡ chật) */}
              <div className="hidden md:flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-full border border-green-200 text-sm font-medium animate-in fade-in">
                <CheckCircle className="w-4 h-4" />
                <span className="whitespace-nowrap">Ví đã kết nối</span>
              </div>

              {/* Nút Thêm sân */}
              <Link to="/owner/complexes">
                <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm khu phức hợp mới
                </Button>
              </Link>
            </>
          ) : (
            //nếu chưa kết nối stripe
            <Button
              onClick={handleConnectStripe}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Kết nối Ví thanh toán
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Doanh Thu Tháng
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {stats.revenue.toLocaleString()} đ
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full flex items-center mr-2 font-medium">
                <TrendingUp className="h-3 w-3 mr-1" />+{stats.monthlyGrowth}%
              </span>
              so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lượt Đặt Sân Đã Hoàn Thành
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {stats.totalBookings}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">+12</span> lượt đặt
              mới tuần này
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng khu phức hợp
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">
              {stats.totalComplexes}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Đang hoạt động ổn định
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-pink-50 to-white dark:from-pink-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Khách Hàng
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-pink-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-700">89</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">+5</span> khách hàng
              mới
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
