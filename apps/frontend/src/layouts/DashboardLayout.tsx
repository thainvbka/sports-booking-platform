import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  LayoutDashboard,
  Building2,
  Calendar,
  Users,
  CheckCircle,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const isAdmin = user?.roles.includes("ADMIN");

  const ownerMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/owner" },
    { icon: Building2, label: "Quản lý Cơ sở", path: "/owner/complexes" },
    { icon: Calendar, label: "Lịch Đặt Sân", path: "/owner/schedule" },
    { icon: Settings, label: "Cài đặt", path: "/owner/settings" },
  ];

  const adminMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: CheckCircle, label: "Duyệt Chủ Sân", path: "/admin/complexes" },
    { icon: Users, label: "Quản lý User", path: "/admin/users" },
    { icon: Building2, label: "Quản lý Nội dung", path: "/admin/content" },
  ];

  const menuItems = isAdmin ? adminMenuItems : ownerMenuItems;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <Link
          to="/"
          className="text-xl font-bold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent"
        >
          SportBook {isAdmin ? "Admin" : "Owner"}
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-primary text-primary-foreground"
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t mt-auto">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {user?.full_name?.[0] || "U"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={logout}>
          Đăng xuất
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-muted/20">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-background border-r hidden md:flex flex-col">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-background px-6 flex items-center justify-between md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <span className="font-bold">Menu</span>
          <div className="w-9" /> {/* Spacer for centering title */}
        </header>
        <div className="flex-1 p-6 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
