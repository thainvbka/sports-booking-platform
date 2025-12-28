import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { Footer } from "@/components/shared/Footer";
// import { NotificationPopover } from "@/components/ui/NotificationPopover";
import { cn } from "@/lib/utils";

export function MainLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => {
    const items = [
      { label: "Tìm sân", href: "/search" },
      { label: "Lịch đặt sân", href: "/bookings" },
      { label: "Về chúng tôi", href: "/about" },
      { label: "Liên hệ", href: "/contact" },
    ];

    return (
      <>
        {items.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              location.pathname === item.href
                ? "text-primary"
                : "text-muted-foreground",
              mobile && "text-base py-2"
            )}
          >
            {item.label}
          </Link>
        ))}
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans antialiased">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left side: Logo and Nav items */}
          <div className="flex items-center gap-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-6 mt-8">
                  <Link
                    to="/"
                    className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
                  >
                    T-Sport
                  </Link>
                  <div className="flex flex-col gap-2">
                    <NavItems mobile />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-lg">
                T
              </div>
              <span className="text-xl font-bold hidden sm:inline-block">
                T-Sport
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <NavItems />
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* {user && <NotificationPopover />} */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 pl-2 pr-3 gap-2 rounded-full hover:bg-muted"
                  >
                    <Avatar className="h-7 w-7 border">
                      <AvatarImage src={user.avatar} alt={user.full_name} />
                      <AvatarFallback>
                        {user.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden sm:inline-block line-clamp-1 max-w-[100px]">
                      {user.full_name}
                    </span>
                    <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.full_name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(user.roles.includes("OWNER") ||
                    user.roles.includes("ADMIN")) && (
                    <DropdownMenuItem asChild>
                      <Link
                        to={user.roles.includes("ADMIN") ? "/admin" : "/owner"}
                        className="cursor-pointer"
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Hồ sơ cá nhân
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hidden sm:inline-flex"
                >
                  <Link to="/auth/login">Đăng nhập</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="bg-gradient-to-r from-blue-600 to-blue-800 hover:opacity-90 border-0"
                >
                  <Link to="/auth/register">Đăng ký</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
