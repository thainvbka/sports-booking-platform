"use client";

import { Logo } from "@/components/admin/Logo";
import {
  Building2,
  Calendar,
  CreditCard,
  LayoutPanelLeft,
  Users,
} from "lucide-react";
import * as React from "react";
import { Link } from "react-router-dom";

import { NavMain } from "@/components/admin/NavMain";
import { NavUser } from "@/components/admin/NavUser";
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
      label: "General",
      items: [
        {
          title: "Dashboard",
          url: "/admin/dashboard",
          icon: LayoutPanelLeft,
        },
      ],
    },
    {
      label: "Management",
      items: [
        {
          title: "User Management",
          url: "/admin/users",
          icon: Users,
        },
        {
          title: "Complex Verification",
          url: "/admin/complexes",
          icon: Building2,
        },
      ],
    },
    {
      label: "Monitoring",
      items: [
        {
          title: "Bookings",
          url: "/admin/bookings",
          icon: Calendar,
        },
        {
          title: "Payments",
          url: "/admin/payments",
          icon: CreditCard,
        },
      ],
    },
  ];

  const userData = {
    name: user?.full_name || "Admin",
    email: user?.email || "",
    avatar: "",
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Logo size={24} className="text-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">T-Sport</span>
                  <span className="truncate text-xs">Sport Booking Admin</span>
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
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
