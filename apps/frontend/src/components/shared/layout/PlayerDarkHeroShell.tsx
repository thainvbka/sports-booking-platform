import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { ReactNode } from "react";
import React from "react";
import { Link } from "react-router-dom";

export interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface PlayerDarkHeroShellProps {
  breadcrumbs: BreadcrumbItemType[];
  title: ReactNode;
  description: ReactNode;
  leftExtra?: ReactNode;
  rightExtra?: ReactNode;
}

export function PlayerDarkHeroShell({
  breadcrumbs,
  title,
  description,
  leftExtra,
  rightExtra,
}: PlayerDarkHeroShellProps) {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950 text-white">
      {/* Background gradients */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-slate-950 via-slate-900 to-blue-950/80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,hsl(142_76%_36%/0.35),transparent_55%),radial-gradient(circle_at_85%_30%,hsl(217_91%_60%/0.35),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 sports-field-pattern opacity-[0.1]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-24 size-72 rounded-full bg-accent-sport/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-12 size-80 rounded-full bg-primary/25 blur-3xl"
      />

      {/* Content Container */}
      <div className="page-shell relative z-10 flex min-h-85 flex-col gap-6 lg:gap-8 pt-10 sm:pt-12 lg:pt-14 pb-12 sm:pb-16 lg:pb-20">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList className="text-white/60">
            {breadcrumbs.map((item, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={idx}>
                  <BreadcrumbItem>
                    {isLast || !item.href ? (
                      <BreadcrumbPage className="text-white">{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild className="hover:text-white">
                        <Link to={item.href}>{item.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator className="text-white/30" />}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Hero Header */}
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3">
            {title}
            {description}
            {leftExtra}
          </div>
          {rightExtra}
        </header>
      </div>

      {/* Bottom fade */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-background"
      />
    </section>
  );
}
