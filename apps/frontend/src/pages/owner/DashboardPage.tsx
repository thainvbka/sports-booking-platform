import { useOwnerStore } from "@/store/useOwnerStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
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
  // Wallet,
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

export function OwnerDashboardPage() {
  const { complexes, fetchComplexes, isLoading, error } = useOwnerStore();
  const { user: owner } = useAuthStore();

  //fetch dữ liệu khi component được mount
  useEffect(() => {
    fetchComplexes();
  }, [fetchComplexes]);

  const stats = {
    totalComplexes: complexes.length,
    totalBookings: 124,
    revenue: 15400000,
    monthlyGrowth: 12.5,
  };

  const todayBookings = [
    {
      id: 1,
      time: "08:00 - 09:00",
      field: "Sân 1",
      customer: "Nguyễn Văn A",
      status: "confirmed",
      price: 200000,
      avatar: "https://github.com/shadcn.png",
    },
    {
      id: 2,
      time: "09:00 - 10:30",
      field: "Sân 2",
      customer: "Trần Thị B",
      status: "pending",
      price: 300000,
      avatar: null,
    },
    {
      id: 3,
      time: "17:00 - 18:00",
      field: "Sân 1",
      customer: "Lê Văn C",
      status: "confirmed",
      price: 250000,
      avatar: null,
    },
    {
      id: 4,
      time: "18:00 - 19:00",
      field: "Sân 3",
      customer: "Phạm Thị D",
      status: "confirmed",
      price: 250000,
      avatar: null,
    },
  ];

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
          <Link to="/owner/complexes">
            <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Thêm khu phức hợp mới
            </Button>
          </Link>
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
              Lượt Đặt Sân
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

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content - Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Today's Bookings */}
          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Lịch Đặt Hôm Nay</CardTitle>
                <CardDescription>
                  Danh sách khách hàng đặt sân trong ngày
                </CardDescription>
              </div>
              <Link to="/owner/schedule">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  Xem tất cả <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {todayBookings.length > 0 ? (
                <div className="space-y-4">
                  {todayBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/50 hover:border-accent transition-colors duration-200"
                    >
                      <div className="flex items-center gap-4 mb-3 sm:mb-0">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                          {booking.customer.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {booking.customer}
                          </h4>
                          <div className="flex items-center text-sm text-muted-foreground gap-3 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> {booking.time}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span>{booking.field}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pl-16 sm:pl-0">
                        <div className="text-right mr-2">
                          <div className="font-semibold">
                            {booking.price.toLocaleString()} đ
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Thanh toán tại sân
                          </div>
                        </div>
                        <Badge
                          variant={
                            booking.status === "confirmed"
                              ? "default"
                              : "secondary"
                          }
                          className={`px-3 py-1 capitalize ${
                            booking.status === "confirmed"
                              ? "bg-green-500 hover:bg-green-600"
                              : ""
                          }`}
                        >
                          {booking.status === "confirmed"
                            ? "Đã xác nhận"
                            : "Chờ duyệt"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-medium">Không có lịch đặt nào</h3>
                  <p className="text-muted-foreground max-w-sm mt-1 mb-4">
                    Hôm nay chưa có khách hàng nào đặt sân. Hãy kiểm tra lại
                    lịch hoặc tạo lịch đặt mới.
                  </p>
                  <Button>Tạo lịch đặt ngay</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Column (1/3) */}
        <div className="space-y-8">
          {/* Recent Notifications */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Thông Báo Mới</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {[
                  {
                    id: 1,
                    title: "Yêu cầu đặt sân mới",
                    description: "Nguyễn Văn A vừa đặt sân 1 (17:00 - 18:00)",
                    time: "5 phút trước",
                    type: "booking",
                    read: false,
                  },
                  {
                    id: 2,
                    title: "Thanh toán thành công",
                    description: "Nhận 200.000đ từ Trần Thị B",
                    time: "1 giờ trước",
                    type: "payment",
                    read: false,
                  },
                  {
                    id: 3,
                    title: "Đánh giá mới",
                    description: "Lê Văn C đã đánh giá 5 sao cho sân của bạn",
                    time: "2 giờ trước",
                    type: "review",
                    read: true,
                  },
                  {
                    id: 4,
                    title: "Cập nhật hệ thống",
                    description: "Bảo trì hệ thống vào 00:00 ngày mai",
                    time: "1 ngày trước",
                    type: "system",
                    read: true,
                  },
                ].map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 transition-colors ${
                      !notification.read
                        ? "bg-blue-50/50 dark:bg-blue-900/10"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                          !notification.read ? "bg-blue-500" : "bg-transparent"
                        }`}
                      />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.description}
                        </p>
                        <p className="text-[10px] text-muted-foreground pt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t">
                <Button
                  variant="ghost"
                  className="w-full text-xs text-muted-foreground h-8"
                >
                  Xem tất cả thông báo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Complexes List */}
          {/* <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">khu phức hợp Của Bạn</CardTitle>
              <Link
                to="/owner/complexes"
                className="text-xs text-primary hover:underline"
              >
                Xem tất cả
              </Link>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="aspect-video w-full bg-muted relative">
                  {complexes.slice(0, 3).map((complex) => (
                    <OwnerComplexCard key={complex.id} complex={complex} />
                  ))}
                </div>

                {complexes.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground mb-3">
                      Chưa có khu phức hợp nào
                    </p>
                    <Link to="/owner/complexes">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-dashed"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Thêm khu phức hợp
                      </Button>
                    </Link>
                  </div>
                )}

                {complexes.length > 0 && (
                  <Link to="/owner/complexes">
                    <Button
                      variant="ghost"
                      className="w-full text-xs text-muted-foreground mt-2"
                    >
                      Xem thêm {Math.max(0, complexes.length - 3)} khu phức hợp khác
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
}
