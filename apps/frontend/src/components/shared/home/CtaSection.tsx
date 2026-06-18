import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function CtaSection() {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950 py-24 text-white">
      <div
        className="absolute inset-0 bg-linear-to-br from-primary via-blue-700 to-slate-950 opacity-95"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-grid-dark opacity-50" aria-hidden="true" />
      <div
        className="absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-accent-sport/30 blur-3xl"
        aria-hidden="true"
      />

      <div className="page-shell relative">
        <div className="grid items-end gap-10 md:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
              <span className="h-px w-8 bg-white/40" aria-hidden="true" />
              Bắt đầu ngay hôm nay
            </div>
            <h2 className="mt-4 font-display text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
              Kèo ngon chốt vội
              <br />
              <span className="italic text-accent-sport">
                Ra trận cùng đồng đội.
              </span>
            </h2>
            <p className="mt-5 max-w-xl text-base text-white/75">
              Chọn sân, chốt lịch, mời đồng đội — và để phần còn lại cho
              T-Sport. Không phí đặt chỗ, không phí ẩn.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row md:flex-col md:items-stretch">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-white px-6 text-primary shadow-cta hover:bg-white/90 sports-glow-primary"
            >
              <Link to="/search">
                Đặt sân ngay
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/matches">Tìm kèo đấu</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
