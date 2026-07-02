"use client";

import { NotificationBell } from "@/components/shared/layout/NotificationBell";
import { ThemeToggle } from "@/components/shared/layout/ThemeToggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Clock3 } from "lucide-react";
import * as React from "react";
import { Link, useLocation } from "react-router-dom";

// Route → breadcrumb label map 
const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Bảng điều khiển",
  users: "Người dùng",
  complexes: "Khu phức hợp",
  bookings: "Đặt sân",
  payments: "Thanh toán",
};

function formatSegment(segment: string) {
  return (
    ROUTE_LABELS[segment] ??
    segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
  );
}

// Tiny realtime clock pill 
function useLiveTime() {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

function formatTimeVN(d: Date) {
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateVN(d: Date) {
  return d.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

export function SiteHeader() {
  const location = useLocation();
  const now = useLiveTime();

  // Build breadcrumb segments (skip the empty first element after split).
  const segments = location.pathname.split("/").filter(Boolean);
  // If the first segment is "admin", drop it — we already render the root label.
  const crumbSegments =
    segments[0] === "admin" ? segments.slice(1) : segments;

  return (
    <header className="sticky top-0 z-30 flex h-(--header-height) shrink-0 items-center gap-2 border-b border-border/60 bg-background/75 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 px-4 py-3 lg:gap-3 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-1 data-[orientation=vertical]:h-4"
        />

        <Breadcrumb className="min-w-0 flex-1">
          <BreadcrumbList className="flex-nowrap">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground"
                >
                  <span className="inline-block size-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px] shadow-emerald-500/20" />
                  Admin
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {crumbSegments.length === 0 ? (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-display text-sm font-bold italic tracking-tight">
                    Tổng quan
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : (
              crumbSegments.map((segment, idx) => {
                const isLast = idx === crumbSegments.length - 1;
                const href =
                  "/admin/" + crumbSegments.slice(0, idx + 1).join("/");
                return (
                  <React.Fragment key={href}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage className="truncate font-display text-sm font-bold italic tracking-tight">
                          {formatSegment(segment)}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link
                            to={href}
                            className="truncate text-sm hover:text-foreground"
                          >
                            {formatSegment(segment)}
                          </Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                );
              })
            )}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-[11px] font-medium text-muted-foreground md:inline-flex">
            <Clock3 className="size-3 text-emerald-500" />
            <span className="font-mono tabular-nums text-foreground">
              {formatTimeVN(now)}
            </span>
            <Separator
              orientation="vertical"
              className="mx-0.5 data-[orientation=vertical]:h-3"
            />
            <span className="uppercase tracking-widest">
              {formatDateVN(now)}
            </span>
          </div>

          <ThemeToggle />
          <NotificationBell targetRole="ADMIN" />
        </div>
      </div>
    </header>
  );
}
