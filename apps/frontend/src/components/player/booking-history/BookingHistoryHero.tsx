import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";

export function BookingHistoryHero() {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-slate-950 via-slate-900 to-blue-950/80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 sports-field-pattern opacity-[0.1]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-24 size-72 rounded-full bg-primary/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-8 size-80 rounded-full bg-accent-sport/25 blur-3xl"
      />

      <div className="page-shell relative z-10 flex min-h-85 flex-col gap-6 lg:gap-8 pt-10 sm:pt-12 lg:pt-14 pb-12 sm:pb-16 lg:pb-20">
        <Breadcrumb>
          <BreadcrumbList className="text-white/60">
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="hover:text-white">
                <Link to="/">Trang chủ</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/30" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-white">Lịch sử đặt sân</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="flex flex-col gap-2">
          <div className="flex max-w-2xl flex-col gap-2">
            <h1 className="font-display text-4xl font-black italic leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Hành trình đặt{" "}
              <span className="bg-linear-to-br from-primary via-primary to-accent-sport bg-clip-text text-transparent">
                sân
              </span>
              <br className="hidden sm:block" />
              in dấu bước chân
            </h1>
            <p className="text-base text-white/70 sm:text-lg">
              Mỗi lịch đặt là một trận sắp đá, một hóa đơn cần chốt hoặc một kỉ niệm đã
              khép. Theo dõi, thanh toán, hủy lịch và đánh giá sân ở cùng một nơi.
            </p>
          </div>
        </header>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-b from-transparent to-background"
      />
    </section>
  );
}
