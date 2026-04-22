import { authBg } from "@/assets/index";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CalendarCheck,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Link, Outlet } from "react-router-dom";

const HIGHLIGHTS = [
  { icon: CalendarCheck, label: "Đặt sân 60 giây" },
  { icon: ShieldCheck, label: "Thanh toán an toàn" },
  { icon: Trophy, label: "Kèo & giải đấu mở" },
];

export function AuthLayout() {
  return (
    <div className="relative min-h-screen lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* ── LEFT · Cinematic "Matchday" panel ───────────────────────── */}
      <aside
        className="relative isolate hidden overflow-hidden bg-slate-950 text-white lg:flex lg:flex-col"
      >
        {/* Background layers */}
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${authBg})` }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-950/70 to-slate-900/85"
        />
        <div
          aria-hidden
          className="absolute inset-0 sports-field-pattern opacity-[0.18]"
        />
        <div
          aria-hidden
          className="absolute -top-40 -left-32 size-[28rem] rounded-full bg-primary/35 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-44 -right-28 size-[26rem] rounded-full bg-accent-sport/30 blur-3xl"
        />
        {/* perforated column on right edge — ticket stub */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-12 right-0 hidden w-px bg-[radial-gradient(circle,rgba(255,255,255,0.35)_1px,transparent_1px)] bg-[length:1px_12px] xl:block"
        />

        <div className="relative z-10 flex h-full flex-col justify-between px-10 py-10 xl:px-14 xl:py-12">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="group flex items-center gap-2.5 text-white/90 transition-colors hover:text-white"
            >
              <span className="flex size-10 items-center justify-center rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm">
                <span className="font-display text-base font-black italic tracking-tighter">
                  T·
                </span>
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">
                  T-Sport
                </span>
                <span className="font-display text-sm font-bold italic">
                  Matchday Access
                </span>
              </span>
            </Link>

            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur-sm hover:bg-white/10 hover:text-white"
            >
              <Link to="/">
                <ArrowLeft data-icon="inline-start" />
                Trang chủ
              </Link>
            </Button>
          </div>

          {/* Editorial center */}
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.3em] text-white/80 backdrop-blur-sm">
              <span className="relative inline-flex size-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-accent-sport/70" />
                <span className="relative inline-block size-1.5 rounded-full bg-accent-sport" />
              </span>
              Kickoff đang mở
            </span>

            <h2 className="max-w-lg font-display text-4xl font-black leading-[1.05] tracking-tight text-white xl:text-5xl">
              Sân đã quét vôi.{" "}
              <span className="bg-gradient-to-br from-accent-sport via-emerald-300 to-white bg-clip-text italic text-transparent">
                Chờ mỗi mình bạn.
              </span>
            </h2>

            <p className="max-w-md text-sm leading-relaxed text-white/70 xl:text-base">
              Đăng nhập để đặt sân yêu thích, quản lý kèo đang mở và tracking
              booking mà không phải gọi điện vòng vo.
            </p>

            {/* Feature chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {HIGHLIGHTS.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85 backdrop-blur-sm"
                >
                  <Icon className="size-3.5 text-accent-sport" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom strip — scoreboard stats */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-4 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
              {[
                { value: "500+", label: "Sân" },
                { value: "50k+", label: "Người chơi" },
                { value: "4.8", label: "Điểm" },
              ].map((stat, idx) => (
                <div
                  key={stat.label}
                  className={
                    idx > 0
                      ? "flex flex-col gap-0.5 border-l border-white/10 pl-4"
                      : "flex flex-col gap-0.5"
                  }
                >
                  <span className="font-display text-2xl font-black italic tabular-nums text-white xl:text-3xl">
                    {stat.value}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
              © {new Date().getFullYear()} T-Sport · Hà Nội
            </p>
          </div>
        </div>
      </aside>

      {/* ── RIGHT · Form canvas ─────────────────────────────────────── */}
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 sm:px-6 lg:min-h-0">
        {/* subtle backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/5 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-72 sports-field-pattern opacity-[0.05]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 right-[-10%] size-96 rounded-full bg-primary/10 blur-3xl lg:hidden"
        />

        {/* Mobile brand */}
        <Link
          to="/"
          className="absolute left-4 top-4 flex items-center gap-2 text-foreground/80 transition-colors hover:text-primary lg:hidden"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <span className="font-display text-sm font-black italic tracking-tight">
            T-Sport
          </span>
        </Link>

        <div className="relative mx-auto w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
