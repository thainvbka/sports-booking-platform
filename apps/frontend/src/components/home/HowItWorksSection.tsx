import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CalendarCheck, CheckCircle2, Search as SearchIcon } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

interface HowItWorksStep {
  step: string;
  title: string;
  description: string;
  icon: ReactNode;
}

const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    step: "01",
    icon: <SearchIcon className="h-5 w-5" />,
    title: "Tìm kiếm",
    description: "Tìm sân theo môn thể thao, khu vực và khung giờ phù hợp.",
  },
  {
    step: "02",
    icon: <CalendarCheck className="h-5 w-5" />,
    title: "Chọn lịch",
    description: "Xem lịch trống realtime và giữ chỗ chỉ trong vài giây.",
  },
  {
    step: "03",
    icon: <CheckCircle2 className="h-5 w-5" />,
    title: "Xác nhận",
    description: "Thanh toán nhanh, nhận thông tin booking và ra sân thi đấu.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="relative bg-background py-20">
      <div className="page-shell">
        <SectionHeader
          title={
            <>
              Ba bước,
              <br className="hidden sm:block" /> ra sân trong ngày.
            </>
          }
          description="Từ lúc mở app đến lúc đứng trên sân chỉ còn một vài cú chạm."
        />

        <div className="relative mt-14 grid gap-10 md:grid-cols-3">
          <div
            className="pointer-events-none absolute inset-x-0 top-6 hidden h-px md:block"
            aria-hidden="true"
          >
            <div className="mx-auto h-full max-w-3xl border-t border-dashed border-border-strong/80" />
          </div>

          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <Fragment key={step.step}>
              <article className="relative flex flex-col">
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "relative flex size-12 shrink-0 items-center justify-center rounded-full",
                      "bg-foreground text-background shadow-sm",
                    )}
                  >
                    {step.icon}
                    <span
                      className="absolute -right-1 -top-1 inline-flex h-5 items-center justify-center rounded-full bg-accent-sport px-1.5 font-display text-[10px] font-black text-white"
                      aria-hidden="true"
                    >
                      {step.step}
                    </span>
                  </span>
                  <div
                    className="h-px flex-1 border-t border-dashed border-border md:hidden"
                    aria-hidden="true"
                  />
                </div>

                <h3 className="mt-6 font-display text-2xl font-bold leading-tight">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  {step.description}
                </p>

                {index < HOW_IT_WORKS_STEPS.length - 1 ? (
                  <div
                    className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground md:hidden"
                    aria-hidden="true"
                  >
                    <span className="h-px w-6 bg-border-strong" />
                    Tiếp theo
                  </div>
                ) : null}
              </article>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
