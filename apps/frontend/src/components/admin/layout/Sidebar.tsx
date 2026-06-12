"use client";

import { Logo } from "@/components/admin/layout/Logo";
import {
  Building2,
  Calendar,
  CreditCard,
  LayoutPanelLeft,
  Users,
  Wallet,
} from "lucide-react";
import * as React from "react";
import { Link } from "react-router-dom";

import { NavMain } from "@/components/admin/layout/NavMain";
import { NavUser } from "@/components/admin/layout/NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/useAuthStore";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore();

  const navGroups = [
    {
      label: "Tổng quan",
      items: [
        {
          title: "Bảng điều khiển",
          url: "/admin/dashboard",
          icon: LayoutPanelLeft,
        },
      ],
    },
    {
      label: "Quản lý",
      items: [
        {
          title: "Người dùng",
          url: "/admin/users",
          icon: Users,
        },
        {
          title: "Khu phức hợp",
          url: "/admin/complexes",
          icon: Building2,
        },
      ],
    },
    {
      label: "Giám sát",
      items: [
        {
          title: "Đặt sân",
          url: "/admin/bookings",
          icon: Calendar,
        },
        {
          title: "Thanh toán",
          url: "/admin/payments",
          icon: CreditCard,
        },
        {
          title: "Đối soát Payout",
          url: "/admin/payouts",
          icon: Wallet,
        },
      ],
    },
  ];

  const userData = {
    name: user?.full_name || "Admin",
    email: user?.email || "",
    avatar: user?.avatar || "",
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-b border-sidebar-border/60">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="group/brand data-[state=open]:bg-sidebar-accent"
            >
              <Link to="/admin/dashboard">
                <div className="relative flex aspect-square size-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary to-emerald-500 text-primary-foreground shadow-sm ring-1 ring-primary/30">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_60%)]"
                  />
                  <Logo size={22} className="relative text-current" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="font-display text-[15px] font-bold italic tracking-tight">
                    T-Sport
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Admin Console
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/60">
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
