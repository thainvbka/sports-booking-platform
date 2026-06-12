import { Logo } from "@/components/admin/layout/Logo";
import { AddRoleDialog } from "@/components/shared/dialogs/AddRoleDialog";
import { ProfileDialog } from "@/components/shared/dialogs/ProfileDialog";
import { NotificationBell } from "@/components/shared/layout/NotificationBell";
import { ThemeToggle } from "@/components/shared/layout/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { useMemo, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

type MenuItem = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  path: string;
  disabled?: boolean;
  badge?: string;
};

const OWNER_MENU_ITEMS: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/owner" },
  { icon: Building2, label: "Khu phức hợp", path: "/owner/complexes" },
  { icon: Calendar, label: "Lịch đặt sân", path: "/owner/bookings" },
  { icon: Package, label: "Sản phẩm", path: "/owner/products" },
  { icon: Wallet, label: "Ví & Đối soát", path: "/owner/wallet" },
  { icon: Settings, label: "Cài đặt", path: "/owner/settings", disabled: true },
];

const ADMIN_MENU_ITEMS: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: CheckCircle, label: "Duyệt chủ sân", path: "/admin/complexes" },
  { icon: Users, label: "Quản lý người dùng", path: "/admin/users" },
  { icon: Building2, label: "Quản lý nội dung", path: "/admin/content" },
];

export function OwnerLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const isAdmin = !!user?.roles.includes("ADMIN");
  const isPlayer = !!user?.roles.includes("PLAYER");
  const [addRoleDialogOpen, setAddRoleDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [roleToAdd, setRoleToAdd] = useState<"PLAYER" | "OWNER">("PLAYER");

  const menuItems = isAdmin ? ADMIN_MENU_ITEMS : OWNER_MENU_ITEMS;

  const currentItem = useMemo(
    () =>
      menuItems.find((item) => item.path === location.pathname) ??
      menuItems.find((item) =>
        item.path !== (isAdmin ? "/admin" : "/owner") &&
        location.pathname.startsWith(item.path),
      ) ??
      menuItems[0],
    [menuItems, location.pathname, isAdmin],
  );

  return (
    <SidebarProvider>
      <Sidebar
        variant="sidebar"
        collapsible="icon"
        className="border-sidebar-border"
      >
        {/* ── Brand ─────────────────────────────────────────────── */}
        <SidebarHeader className="gap-0 px-3 pb-2 pt-4">
          <Link
            to={isPlayer ? "/" : (isAdmin ? "/admin" : "/owner")}
            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-sidebar-accent/60"
          >
            <span className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
              <Logo size={18} />
              <span
                aria-hidden
                className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-accent-sport ring-2 ring-sidebar"
              />
            </span>
            <div className="flex min-w-0 flex-col leading-none group-data-[collapsible=icon]:hidden">
              <span className="text-[9.5px] font-semibold uppercase tracking-[0.26em] text-sidebar-foreground/60">
                T-Sport
              </span>
              <span className="font-display text-base font-black italic tracking-tight text-sidebar-foreground">
                {isAdmin ? "Admin Ops" : "Owner Ops"}
              </span>
            </div>
          </Link>
        </SidebarHeader>

        {/* ── Navigation ────────────────────────────────────────── */}
        <SidebarContent className="px-2">
          <SidebarGroup>
            <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden">
              Menu chính
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.path === location.pathname ||
                    (item.path !== "/owner" &&
                      item.path !== "/admin" &&
                      location.pathname.startsWith(item.path));

                  if (item.disabled) {
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          tooltip={item.label}
                          disabled
                          className="cursor-not-allowed opacity-50"
                        >
                          <Icon />
                          <span>{item.label}</span>
                          <Badge
                            variant="outline"
                            className="ml-auto h-5 rounded-full px-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] group-data-[collapsible=icon]:hidden"
                          >
                            Soon
                          </Badge>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }

                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                      >
                        <Link to={item.path}>
                          <Icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Secondary actions: back to site / upgrade */}
          <SidebarGroup>
            <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden">
              Khác
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {!isAdmin && isPlayer && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Trang người chơi">
                      <Link to="/">
                        <ArrowLeft />
                        <span>Quay về trang chủ</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {!isAdmin && !isPlayer && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip="Tham gia vai trò người chơi"
                      onClick={() => {
                        setRoleToAdd("PLAYER");
                        setAddRoleDialogOpen(true);
                      }}
                    >
                      <UserPlus />
                      <span>Trở thành người chơi</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* ── Footer · user card ────────────────────────────────── */}
        <SidebarFooter className="gap-2 border-t border-sidebar-border/60 p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="gap-3 data-[state=open]:bg-sidebar-accent"
              >
                <Avatar className="size-8 shrink-0 border border-sidebar-border">
                  <AvatarImage
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user?.full_name || "U",
                    )}&background=random`}
                  />
                  <AvatarFallback className="bg-sidebar-primary/15 text-[11px] font-bold text-sidebar-primary">
                    {user?.full_name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col items-start leading-tight">
                  <span className="max-w-full truncate text-sm font-semibold text-sidebar-foreground">
                    {user?.full_name ?? "User"}
                  </span>
                  <span className="max-w-full truncate text-[11px] text-sidebar-foreground/60">
                    {user?.email}
                  </span>
                </div>
                <ChevronDown className="ml-auto opacity-60 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="right"
              align="end"
              sideOffset={10}
              className="w-60"
            >
              <DropdownMenuLabel className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Tài khoản
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="gap-2 cursor-pointer"
                  onClick={() => setProfileDialogOpen(true)}
                >
                    <Settings className="size-4" />
                    Cài đặt tài khoản
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <LogOut className="size-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      {/* ── Main inset ──────────────────────────────────────────── */}
      <SidebarInset className="flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-3 backdrop-blur-md md:h-16 md:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 hidden h-5 md:block" />

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="hidden text-[10.5px] font-semibold uppercase tracking-[0.22em] text-muted-foreground md:inline-flex">
              {isAdmin ? "Admin" : "Owner"}
            </span>
            <span className="hidden text-muted-foreground md:inline">/</span>
            <span
              className={cn(
                "truncate font-display text-base font-bold italic tracking-tight text-foreground",
                "md:text-lg",
              )}
            >
              {currentItem?.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell targetRole={isAdmin ? "ADMIN" : "OWNER"} />
            <Badge
              variant="outline"
              className={cn(
                "hidden gap-1.5 rounded-full border-accent-sport/40 bg-accent-sport/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-accent-sport sm:inline-flex",
              )}
            >
              <span className="relative inline-flex size-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-accent-sport/70" />
                <span className="relative inline-block size-1.5 rounded-full bg-accent-sport" />
              </span>
              Live
            </Badge>

            {user && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2 px-2"
                onClick={() => setProfileDialogOpen(true)}
              >
                  <Avatar className="size-6">
                    <AvatarImage
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.full_name,
                      )}&background=random`}
                    />
                    <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">
                      {user.full_name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-xs font-semibold md:inline">
                    {user.full_name?.split(" ").slice(-1).join(" ")}
                  </span>
              </Button>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="relative flex-1 overflow-auto">
          {/* decorative background */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-primary/5 via-transparent to-transparent"
          />
          <div className="relative w-full px-3 py-4 md:px-4 md:py-5">
            <Outlet />
          </div>
        </div>
      </SidebarInset>

      <AddRoleDialog
        open={addRoleDialogOpen}
        onOpenChange={setAddRoleDialogOpen}
        roleToAdd={roleToAdd}
      />

      <ProfileDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
      />
    </SidebarProvider>
  );
}
