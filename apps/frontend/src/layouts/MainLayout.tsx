import { Logo } from "@/components/admin/Logo";
import { AddRoleDialog } from "@/components/shared/AddRoleDialog";
import { Footer } from "@/components/shared/Footer";
import { NotificationBell } from "@/components/shared/NotificationBell";
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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import type { User as AuthUser } from "@/types";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  ChevronDown,
  Info,
  LayoutDashboard,
  LifeBuoy,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  Swords,
  User,
  UserRound,
  Users,
} from "lucide-react";
import { useState, type ComponentType, type SVGProps } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  description?: string;
};

const BASE_NAV_ITEMS: NavItem[] = [
  { label: "Tìm sân", href: "/search", icon: MapPin, description: "Khám phá cụm sân quanh bạn" },
  { label: "Kèo đấu", href: "/matches", icon: Swords, description: "Tham gia trận mở đang tuyển" },
  { label: "Liên hệ", href: "/contact", icon: LifeBuoy, description: "Hỗ trợ & góp ý" },
  { label: "Về chúng tôi", href: "/about", icon: Info, description: "Câu chuyện T-Sport" },
];

const PLAYER_ITEMS: NavItem[] = [
  {
    label: "Kèo của tôi",
    href: "/player/matches",
    icon: Users,
    description: "Kèo đã tạo & đã tham gia",
  },
  {
    label: "Lịch đặt sân",
    href: "/bookings",
    icon: CalendarCheck,
    description: "Theo dõi các booking đang có",
  },
];

function useNavItems(isPlayer: boolean): NavItem[] {
  if (!isPlayer) return BASE_NAV_ITEMS;
  const items = [...BASE_NAV_ITEMS];
  items.splice(2, 0, ...PLAYER_ITEMS);
  return items;
}

export function MainLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [addRoleDialogOpen, setAddRoleDialogOpen] = useState(false);
  const [roleToAdd, setRoleToAdd] = useState<"PLAYER" | "OWNER">("OWNER");
  const [mobileOpen, setMobileOpen] = useState(false);

  const isPlayer = !!user?.roles.includes("PLAYER");
  const isOwner = !!user?.roles.includes("OWNER");
  const isAdmin = !!user?.roles.includes("ADMIN");
  const navItems = useNavItems(isPlayer);

  const primaryRole = isAdmin
    ? { label: "Admin", tone: "primary" as const }
    : isOwner
      ? { label: "Owner", tone: "sport" as const }
      : { label: "Player", tone: "muted" as const };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans antialiased">
      <a href="#main-content" className="skip-nav-link">
        Bỏ qua điều hướng và đến nội dung chính
      </a>

      {/* ── HEADER ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full">
        {/* scoreboard strip */}
        <div
          aria-hidden
          className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        />

        <div className="border-b border-border/60 bg-background/75 backdrop-blur-md supports-backdrop-filter:bg-background/60">
          <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">
            {/* LEFT · Mobile trigger + Brand + Desktop nav */}
            <div className="flex min-w-0 items-center gap-2 md:gap-4">
              {/* Mobile menu */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 md:hidden"
                    aria-label="Mở menu điều hướng"
                  >
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="flex w-[min(86vw,22rem)] flex-col gap-0 p-0"
                >
                  <MobileSheetBody
                    navItems={navItems}
                    currentPath={location.pathname}
                    user={user}
                    logout={logout}
                    isOwner={isOwner}
                    isAdmin={isAdmin}
                    onRequestOwner={() => {
                      setRoleToAdd("OWNER");
                      setAddRoleDialogOpen(true);
                      setMobileOpen(false);
                    }}
                    onClose={() => setMobileOpen(false)}
                  />
                </SheetContent>
              </Sheet>

              {/* Brand */}
              <Link
                to="/"
                className="group flex shrink-0 items-center gap-2.5"
                aria-label="T-Sport · Trang chủ"
              >
                <span className="relative flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/25 transition-transform group-hover:-rotate-3">
                  <Logo size={18} />
                  <span
                    aria-hidden
                    className="absolute -right-0.5 -top-0.5 flex size-2.5"
                  >
                    <span className="absolute inset-0 animate-ping rounded-full bg-accent-sport/70" />
                    <span className="relative inline-block size-2.5 rounded-full bg-accent-sport ring-2 ring-background" />
                  </span>
                </span>
                <span className="hidden flex-col leading-none xl:flex">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                    Matchday
                  </span>
                  <span className="font-display text-lg font-black italic tracking-tight text-foreground">
                    T-Sport
                  </span>
                </span>
              </Link>

              {/* Desktop nav */}
              <nav
                aria-label="Điều hướng chính"
                className="hidden items-center gap-0.5 md:flex"
              >
                {navItems.map((item) => {
                  const active = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group/nav relative inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full px-2.5 text-sm font-medium transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                        active
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <span className="relative">
                        {item.label}
                        <span
                          aria-hidden
                          className={cn(
                            "pointer-events-none absolute -bottom-1.5 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-accent-sport transition-all duration-300",
                            active
                              ? "w-5 opacity-100"
                              : "w-0 opacity-0 group-hover/nav:w-3 group-hover/nav:opacity-60",
                          )}
                        />
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* RIGHT · Auth actions */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  {isPlayer ? <NotificationBell targetRole="PLAYER" /> : null}
                  <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-9 shrink-0 gap-2 rounded-full border border-transparent px-1 transition-colors hover:border-border/70 hover:bg-muted/70 data-[state=open]:border-border data-[state=open]:bg-muted/70 lg:pr-2.5"
                    >
                      <Avatar className="size-7 border border-border/70">
                        <AvatarImage src={user.avatar} alt={user.full_name} />
                        <AvatarFallback className="bg-primary/10 text-[11px] font-bold text-primary">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden min-w-0 flex-col items-start leading-tight lg:flex">
                        <span className="max-w-[10rem] truncate text-[13px] font-semibold text-foreground">
                          {user.full_name}
                        </span>
                        <span className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          {primaryRole.label}
                        </span>
                      </span>
                      <ChevronDown className="hidden size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180 lg:block" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    className="w-64 overflow-hidden p-0"
                    align="end"
                    sideOffset={10}
                    forceMount
                  >
                    {/* Header card */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-accent-sport/10 p-4">
                      <div
                        aria-hidden
                        className="absolute -right-8 -top-8 size-20 rounded-full bg-primary/20 blur-2xl"
                      />
                      <div className="relative flex items-center gap-3">
                        <Avatar className="size-11 border-2 border-background shadow-sm">
                          <AvatarImage src={user.avatar} alt={user.full_name} />
                          <AvatarFallback className="bg-primary text-sm font-bold text-primary-foreground">
                            {getInitials(user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-col">
                          <DropdownMenuLabel className="px-0 pb-0 pt-0 font-display text-sm font-bold italic leading-tight">
                            {user.full_name}
                          </DropdownMenuLabel>
                          <span className="truncate text-[11px] text-muted-foreground">
                            {user.email}
                          </span>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {user.roles.slice(0, 3).map((r) => (
                              <Badge
                                key={r}
                                variant="outline"
                                className={cn(
                                  "h-5 rounded-full px-1.5 text-[9.5px] font-semibold uppercase tracking-[0.18em]",
                                  r === "ADMIN" &&
                                    "border-primary/30 bg-primary/10 text-primary",
                                  r === "OWNER" &&
                                    "border-accent-sport/30 bg-accent-sport/10 text-accent-sport",
                                  r === "PLAYER" &&
                                    "border-border/70 bg-background text-muted-foreground",
                                )}
                              >
                                {r}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <DropdownMenuGroup className="p-1">
                      {(isOwner || isAdmin) && (
                        <DropdownMenuItem asChild className="cursor-pointer gap-2 rounded-md px-2 py-2">
                          <Link to={isAdmin ? "/admin" : "/owner"}>
                            <LayoutDashboard className="size-4 text-primary" />
                            <span className="text-sm">Dashboard</span>
                            <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              {isAdmin ? "Admin" : "Owner"}
                            </span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild className="cursor-pointer gap-2 rounded-md px-2 py-2">
                        <Link to="">
                          <User className="size-4" />
                          <span className="text-sm">Hồ sơ cá nhân</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        asChild
                        className="cursor-pointer gap-2 rounded-md px-2 py-2"
                      >
                        <Link to="/bookings">
                          <CalendarCheck className="size-4" />
                          <span className="text-sm">Lịch đặt sân</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>

                    {!isOwner && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup className="p-1">
                          <DropdownMenuItem
                            onClick={() => {
                              setRoleToAdd("OWNER");
                              setAddRoleDialogOpen(true);
                            }}
                            className="cursor-pointer gap-2 rounded-md border border-dashed border-accent-sport/30 bg-accent-sport/5 px-2 py-2 focus:border-accent-sport/50 focus:bg-accent-sport/10"
                          >
                            <Building2 className="size-4 text-accent-sport" />
                            <span className="text-sm leading-tight">
                              Trở thành chủ sân
                            </span>
                            <ArrowRight className="ml-auto size-3.5 text-accent-sport" />
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuGroup className="p-1">
                      <DropdownMenuItem
                        onClick={logout}
                        className="cursor-pointer gap-2 rounded-md px-2 py-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                      >
                        <LogOut className="size-4" />
                        <span className="text-sm">Đăng xuất</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="hidden h-9 px-3 text-sm font-medium sm:inline-flex"
                  >
                    <Link to="/auth/login">
                      <LogIn data-icon="inline-start" />
                      Đăng nhập
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    asChild
                    className="group/cta h-9 gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/25 hover:bg-primary/92 hover:shadow-primary/40"
                  >
                    <Link to="/auth/register">
                      Đăng ký
                      <ArrowRight
                        data-icon="inline-end"
                        className="transition-transform group-hover/cta:translate-x-0.5"
                      />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 focus:outline-none"
      >
        <Outlet />
      </main>

      <Footer />

      <AddRoleDialog
        open={addRoleDialogOpen}
        onOpenChange={setAddRoleDialogOpen}
        roleToAdd={roleToAdd}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/* Mobile Sheet body                                                */
/* ─────────────────────────────────────────────────────────────── */
function MobileSheetBody({
  navItems,
  currentPath,
  user,
  logout,
  isOwner,
  isAdmin,
  onRequestOwner,
  onClose,
}: {
  navItems: NavItem[];
  currentPath: string;
  user: AuthUser | null;
  logout: () => void;
  isOwner: boolean;
  isAdmin: boolean;
  onRequestOwner: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <SheetHeader className="border-b border-border/60 bg-gradient-to-b from-primary/5 to-transparent p-5">
        <div className="flex items-center gap-2.5">
          <span className="relative flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Logo size={18} />
            <span
              aria-hidden
              className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-accent-sport ring-2 ring-background"
            />
          </span>
          <div className="flex min-w-0 flex-col leading-none">
            <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Matchday menu
            </span>
            <SheetTitle className="font-display text-lg font-black italic tracking-tight">
              T-Sport
            </SheetTitle>
          </div>
        </div>
        <SheetDescription className="sr-only">
          Điều hướng chính trên di động
        </SheetDescription>
      </SheetHeader>

      {/* Nav list */}
      <nav
        aria-label="Điều hướng chính trên di động"
        className="flex-1 overflow-y-auto p-3"
      >
        <div className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPath === item.href;
            return (
              <SheetClose asChild key={item.href}>
                <Link
                  to={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group/mitem flex items-start gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-colors",
                    active
                      ? "border-primary/30 bg-primary/8 text-foreground"
                      : "text-foreground/85 hover:border-border/70 hover:bg-muted/60",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground group-hover/mitem:bg-muted-foreground/10",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="text-sm font-semibold">{item.label}</span>
                    {item.description && (
                      <span className="truncate text-[11px] text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </div>
                  {active && (
                    <span className="mt-1.5 inline-block size-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              </SheetClose>
            );
          })}
        </div>
      </nav>

      <Separator />

      {/* Footer account */}
      <div className="flex flex-col gap-3 p-4">
        {user ? (
          <>
            <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-surface-2/60 p-3">
              <Avatar className="size-10 border-2 border-background">
                <AvatarImage src={user.avatar} alt={user.full_name} />
                <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="truncate font-display text-sm font-bold italic text-foreground">
                  {user.full_name}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>

            <div className="grid gap-2">
              {(isOwner || isAdmin) && (
                <SheetClose asChild>
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 justify-start"
                  >
                    <Link to={isAdmin ? "/admin" : "/owner"}>
                      <LayoutDashboard data-icon="inline-start" />
                      Dashboard {isAdmin ? "Admin" : "Owner"}
                    </Link>
                  </Button>
                </SheetClose>
              )}
              <SheetClose asChild>
                <Button
                  asChild
                  variant="outline"
                  className="h-10 justify-start"
                >
                  <Link to="">
                    <UserRound data-icon="inline-start" />
                    Hồ sơ cá nhân
                  </Link>
                </Button>
              </SheetClose>
              {!isOwner && (
                <Button
                  variant="outline"
                  onClick={onRequestOwner}
                  className="h-10 justify-start border-dashed border-accent-sport/40 bg-accent-sport/5 text-accent-sport hover:bg-accent-sport/10 hover:text-accent-sport"
                >
                  <Building2 data-icon="inline-start" />
                  Trở thành chủ sân
                  <ArrowRight data-icon="inline-end" className="ml-auto" />
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="h-10 justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut data-icon="inline-start" />
                Đăng xuất
              </Button>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <SheetClose asChild>
              <Button asChild variant="outline" className="h-10">
                <Link to="/auth/login">
                  <LogIn data-icon="inline-start" />
                  Đăng nhập
                </Link>
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button asChild className="h-10">
                <Link to="/auth/register">
                  Đăng ký
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </SheetClose>
          </div>
        )}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/* Utils                                                            */
/* ─────────────────────────────────────────────────────────────── */
function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}
