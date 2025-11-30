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
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    <div className="flex flex-col h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
            S
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            SportBook
          </span>
        </Link>
        <div className="mt-2 px-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {isAdmin ? "Admin Portal" : "Owner Portal"}
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start mb-1 transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary font-medium hover:bg-primary/15"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon
                  className={cn(
                    "mr-3 h-4 w-4",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t bg-muted/20">
        <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-background border shadow-sm">
          <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
            <AvatarImage
              src={`https://ui-avatars.com/api/?name=${user?.full_name}&background=random`}
            />
            <AvatarFallback>{user?.full_name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate text-foreground">
              {user?.full_name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full text-muted-foreground hover:text-destructive hover:border-destructive/50 hover:bg-destructive/5 transition-colors"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Đăng xuất
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50/50 dark:bg-gray-900/50">
      {/* Desktop Sidebar */}
      <aside className="w-72 bg-background border-r hidden md:flex flex-col sticky top-0 h-screen shadow-sm z-20">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-background/80 backdrop-blur-sm px-6 flex items-center justify-between md:hidden sticky top-0 z-10">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 border-r">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <span className="font-bold text-lg">SportBook</span>
          <div className="w-9" />
        </header>
        <div className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
