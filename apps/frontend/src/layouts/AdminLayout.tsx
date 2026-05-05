"use client";

import { AppSidebar } from "@/components/admin/Sidebar";
import { SiteFooter } from "@/components/admin/SiteFooter";
import { SiteHeader } from "@/components/admin/SiteHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSidebarConfig } from "@/hooks/use-sidebar-config";
import { cn } from "@/lib/utils";
import * as React from "react";
import { Outlet } from "react-router-dom";

interface BaseLayoutProps {
  children?: React.ReactNode;
}

// Editorial admin shell: sidebar + glass header + ambient content + slim footer.
export function BaseLayout({ children }: BaseLayoutProps) {
  const { config } = useSidebarConfig();
  const content = children ?? <Outlet />;

  const sidebar = (
    <AppSidebar
      variant={config.variant}
      collapsible={config.collapsible}
      side={config.side}
    />
  );

  const inset = (
    <SidebarInset className="relative flex min-h-svh flex-col bg-background">
      <SiteHeader />

      <main className="relative flex-1 overflow-visible">
        {/* Ambient decorative backdrop — stays behind content, no pointer events. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/5 via-transparent to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-[-6rem] size-72 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-40 left-[-4rem] size-64 rounded-full bg-sky-500/5 blur-3xl"
        />

        <div className="relative flex w-full flex-col px-3 py-4 md:px-4 md:py-5">
          {content}
        </div>
      </main>

      <SiteFooter />
    </SidebarInset>
  );

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3rem",
          "--header-height": "calc(var(--spacing) * 14)",
        } as React.CSSProperties
      }
      className={cn(
        config.collapsible === "none" ? "sidebar-none-mode" : "",
      )}
    >
      {config.side === "left" ? (
        <>
          {sidebar}
          {inset}
        </>
      ) : (
        <>
          {inset}
          {sidebar}
        </>
      )}
    </SidebarProvider>
  );
}
