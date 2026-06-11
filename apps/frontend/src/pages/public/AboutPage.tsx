import { aboutBg, teamPlaySport } from "@/assets";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  Building2,
  CalendarCheck,
  Compass,
  FileText,
  Flag,
  Handshake,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  UsersRound,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

const STATS = [
  { value: "500+", label: "Sân đối tác", icon: Building2 },
  { value: "50k+", label: "Người chơi", icon: UsersRound },
  { value: "100k+", label: "Lượt đặt sân", icon: CalendarCheck },
  { value: "4.8/5", label: "Đánh giá trung bình", icon: Star },
];

const VALUES = [
  {
    code: "01",
    title: "Cộng đồng là sân chính",
    description:
      "Mỗi tính năng chúng tôi xây đều trả lời một câu hỏi: điều này có làm người chơi và chủ sân hài lòng không?",
    icon: UsersRound,
    tone: "primary" as const,
  },
  {
    code: "02",
    title: "Minh bạch không thương lượng",
    description:
      "Giá rõ ràng, tình trạng sân cập nhật liên tục, đánh giá không chỉnh sửa. Tin tưởng được xây bằng dữ liệu thật.",
    icon: ShieldCheck,
    tone: "sport" as const,
  },
  {
    code: "03",
    title: "Luôn ở thế tấn công",
    description:
      "Công nghệ, UX, vận hành — chúng tôi liên tục retest và tune từng chi tiết nhỏ để trận đặt sân nào cũng ngọt.",
    icon: Zap,
    tone: "amber" as const,
  },
];

const MILESTONES = [
  {
    year: "2025 · Q4",
    title: "Prototype khởi động",
    detail:
      "Nhóm sáng lập dựng bản demo đầu tiên sau 3 tuần ròng rã chạy thử ở các cụm sân khu vực Hai Bà Trưng.",
  },
  {
    year: "2026 · Q1",
    title: "Ra mắt thị trường",
    detail:
      "Mở cổng cho người chơi và chủ sân, tích hợp thanh toán điện tử, triển khai lịch đặt sân theo thời gian thực.",
  },
  {
    year: "2026 · Q2",
    title: "Hệ sinh thái kèo & giải đấu",
    detail:
      "Kết nối trận đấu mở, hỗ trợ tạo giải bán chuyên, giới thiệu gói đặt sân định kỳ cho đội nhóm.",
  },
];

const LEGAL_LINKS = [
  {
    to: "/terms",
    eyebrow: "Điều khoản",
    title: "Luật chơi của T-Sport",
    description:
      "Quyền và trách nhiệm của bạn khi đặt sân, hủy lịch, thanh toán và giải quyết tranh chấp.",
    icon: FileText,
  },
  {
    to: "/privacy",
    eyebrow: "Bảo mật",
    title: "Cam kết với dữ liệu của bạn",
    description:
      "Cách chúng tôi thu thập, xử lý và bảo vệ thông tin cá nhân — đúng luật, đúng mong đợi, không ngoại lệ.",
    icon: ShieldCheck,
  },
];

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden border-b border-border/60 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        {/* atmospheric backdrop */}
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url(${aboutBg})` }}
        />
        <div
          aria-hidden
          className="absolute inset-0 sports-field-pattern opacity-20"
        />
        <div
          aria-hidden
          className="absolute -top-40 -right-32 size-[28rem] rounded-full bg-primary/35 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-48 -left-28 size-[26rem] rounded-full bg-accent-sport/30 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
        />

        <div className="page-shell relative z-10 flex min-h-[340px] flex-col pt-10 sm:pt-12 lg:pt-14 pb-12 sm:pb-16 lg:pb-20">
          <Breadcrumb>
            <BreadcrumbList className="text-white/70">
              <BreadcrumbItem>
                <BreadcrumbLink asChild className="text-white/70 hover:text-white">
                  <Link to="/">Trang chủ</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/40" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Về T-Sport</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mt-6 grid items-center gap-10 lg:mt-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div className="flex flex-col gap-6">
              

              <h1 className="font-display text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
                Chơi thể thao là quyền{" "}
                <span className="bg-gradient-to-br from-primary via-blue-500 to-accent-sport bg-clip-text italic text-transparent">
                  cơ bản.
                </span>
                <br />
                Tìm sân không phải là{" "}
                <span className="bg-gradient-to-br from-accent-sport via-emerald-300 to-cyan-300 bg-clip-text italic text-transparent">
                  rào cản.
                </span>
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
                T-Sport tin rằng việc tìm sân thể thao với bạn
                thì không nên phức tạp hơn một cú vuốt điện thoại. Chúng tôi
                dựng nên cây cầu giữa chủ sân và người chơi — rõ ràng, nhanh chóng,
                và công bằng.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                  asChild
                  size="lg"
                  className="h-11 bg-accent-sport text-slate-950 shadow-lg shadow-accent-sport/25 hover:bg-accent-sport/90"
                >
                  <Link to="/search">
                    <Compass data-icon="inline-start" />
                    Khám phá sân
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-11 border-white/30 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10 hover:text-white"
                >
                  <Link to="/auth/register?role=OWNER">
                    <Handshake data-icon="inline-start" />
                    Trở thành đối tác
                  </Link>
                </Button>
              </div>

              {/* Meta chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 backdrop-blur-sm">
                  <Sparkles data-icon="inline-start" />
                  Độc lập · Người Việt vận hành
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 backdrop-blur-sm">
                  <Flag data-icon="inline-start" />
                  Trụ sở Hà Nội
                </span>
              </div>
            </div>

            {/* Magazine cover image */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/15 shadow-2xl shadow-black/40">
                <img
                  src={teamPlaySport}
                  alt="Cộng đồng T-Sport"
                  className="size-full object-cover"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent"
                />
                {/* Cover tag */}
                <div className="absolute left-4 top-4 flex flex-col gap-1">
                  <span className="inline-flex w-fit items-center rounded-full border border-white/30 bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/90 backdrop-blur">
                    Issue 01
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">
                    Spring 2025
                  </span>
                </div>
                {/* Cover caption */}
                <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
                  <div className="rounded-2xl bg-black/35 px-3 py-2 backdrop-blur-md">
                    <p className="font-display text-sm font-bold italic text-white">
                      “Chơi thể thao là quyền cơ bản.
                      <br />
                      Tìm sân không phải là rào cản.”
                    </p>
                  </div>
                </div>
              </div>
              {/* Ticket-stub notches */}
              <span
                aria-hidden
                className="absolute -left-3 top-1/2 hidden size-6 -translate-y-1/2 rounded-full border border-white/15 bg-background lg:block"
              />
              <span
                aria-hidden
                className="absolute -right-3 top-1/2 hidden size-6 -translate-y-1/2 rounded-full border border-white/15 bg-background lg:block"
              />
            </div>
          </div>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-background"
        />
      </section>

      {/* ── STATS RIBBON ─────────────────────────────────────────────── */}
      <section className="border-b border-border/60 bg-surface-2/60">
        <div className="page-shell py-8 md:py-10">
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-6 lg:grid-cols-4 motion-safe-stagger">
            {STATS.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={cn(
                    "relative flex flex-col gap-1.5 px-2 sm:px-4",
                    idx > 0 && "lg:border-l lg:border-dashed lg:border-border/70",
                    idx > 0 && idx % 2 !== 0 && "border-l border-dashed border-border/70",
                  )}
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="size-4 text-primary/80" />
                    <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em]">
                      {stat.label}
                    </span>
                  </div>
                  <span className="font-display text-4xl font-black italic leading-none tracking-tight tabular-nums text-foreground sm:text-5xl">
                    {stat.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── STORY ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 md:py-24">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
        />
        <div
          aria-hidden
          className="absolute -top-24 right-[10%] size-80 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="page-shell relative motion-safe-fade-up">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16">
            {/* Image with ticket-stub corners */}
            <div className="relative order-1 lg:order-2">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-border/70 shadow-xl">
                <img
                  src={teamPlaySport}
                  alt="T-Sport team"
                  className="size-full object-cover"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-transparent to-transparent"
                />
              </div>

              {/* Floating quote card */}
              <div className="absolute -bottom-6 left-4 max-w-[280px] rounded-2xl border border-border/70 bg-card p-4 shadow-xl sm:-left-6">
                <Quote className="size-5 text-primary" />
                <p className="mt-2 font-display text-sm font-bold italic leading-snug text-foreground">
                  Chúng tôi không bán app — chúng tôi bán thêm mười phút trên
                  sân cho bạn.
                </p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  — Founder&apos;s note
                </p>
              </div>
            </div>

            {/* Copy */}
            <div className="order-2 flex flex-col gap-5 lg:order-1">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-primary" />
                Chương 01 · Khởi nguyên
              </span>

              <h2 className="leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-5xl text-title">
                Câu chuyện bắt đầu bằng{" "}
                <span className="bg-gradient-to-br from-primary via-primary to-accent-sport bg-clip-text italic text-transparent">
                  một cú điện thoại thứ mười
                </span>{" "}
                trong buổi tối thứ Bảy.
              </h2>

              <div className="flex flex-col gap-4 text-[15px] leading-relaxed text-muted-foreground">
                <p>
                  Năm 2025, sau lần thứ n gọi điện cho ba cụm sân liên tiếp để
                  chốt một khung giờ đá chiều, đội sáng lập T-Sport nhận ra:{" "}
                  <strong className="text-foreground">
                    vấn đề không phải thiếu sân — mà thiếu một cách công bằng để
                    đặt sân.
                  </strong>
                </p>
                <p>
                  Chủ sân thì vất vả chép lịch ra sổ, điện thoại réo liên tục.
                  Người chơi thì không biết chỗ nào còn trống, giá bao nhiêu,
                  đường đi thế nào. Ở giữa là đủ loại hiểu lầm và huỷ kèo phút
                  chót.
                </p>
                <p>
                  T-Sport sinh ra để ngồi đúng vị trí đó: một cổng minh bạch,
                  tức thì, nơi mọi slot trống đều thấy được, mọi giao dịch đều
                  được xác nhận, và mọi trận đấu đều có thể bắt đầu đúng giờ.
                </p>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Phản hồi trung bình", value: "< 10 phút" },
                  { label: "Tỷ lệ booking thành công", value: "98.4%" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-border/70 bg-card p-4"
                  >
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-1 font-display text-2xl font-black italic tabular-nums text-foreground">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-y border-border/60 bg-surface-2/50 py-20 md:py-24">
        <div
          aria-hidden
          className="absolute inset-0 sports-field-pattern opacity-[0.07]"
        />

        <div className="page-shell relative">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              <Trophy className="size-3 text-primary" />
              Ba quy tắc định hình mọi quyết định
            </span>
            <h2 className="leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl text-title">
              Luật chơi nội bộ,{" "}
              <span className="italic text-primary">dán trên tường đội</span>.
            </h2>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              Khi có điều gì khó quyết, chúng tôi quay lại ba dòng này. Nếu lựa
              chọn nào không hợp — chúng tôi dừng lại và tìm cách khác.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3 motion-safe-stagger">
            {VALUES.map((value) => (
              <ValueCard key={value.code} value={value} />
            ))}
          </div>
        </div>
      </section>

      {/* ── MILESTONES TIMELINE ────────────────────────────────────── */}
      <section className="py-20 md:py-24">
        <div className="page-shell">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
              <CalendarCheck className="size-3 text-primary" />
              Dòng thời gian
            </span>
            <h2 className="mt-4 leading-tight tracking-tight text-foreground sm:text-4xl text-title">
              Đường chạy{" "}
              <span className="italic text-primary">từ ý tưởng tới sân đấu</span>.
            </h2>
          </div>

          <div className="relative mx-auto mt-12 max-w-4xl">
            <div
              aria-hidden
              className="absolute left-[22px] top-2 bottom-2 w-px bg-gradient-to-b from-primary via-border to-transparent sm:left-1/2 sm:-translate-x-1/2"
            />
            <ol className="flex flex-col gap-8 motion-safe-stagger">
              {MILESTONES.map((m, idx) => (
                <li
                  key={m.year}
                  className={cn(
                    "relative grid gap-4 pl-12 sm:grid-cols-2 sm:gap-8 sm:pl-0",
                    idx % 2 === 1 && "sm:[&>.milestone-content]:order-2",
                  )}
                >
                  <span
                    aria-hidden
                    className="absolute left-4 top-2 flex size-4 items-center justify-center rounded-full border-2 border-primary bg-background sm:left-1/2 sm:-translate-x-1/2"
                  >
                    <span className="size-1.5 rounded-full bg-primary" />
                  </span>

                  <div
                    className={cn(
                      "milestone-content rounded-2xl border border-border/70 bg-card p-5 shadow-sm",
                      idx % 2 === 0
                        ? "sm:col-start-1 sm:pr-8 sm:text-right"
                        : "sm:col-start-2 sm:pl-8",
                    )}
                  >
                    <p className="font-display text-[11px] font-bold italic uppercase tracking-[0.22em] text-primary">
                      {m.year}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-black tracking-tight text-foreground">
                      {m.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {m.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── LEGAL RIBBON ──────────────────────────────────────────── */}
      <section className="border-t border-border/60 bg-gradient-to-b from-surface-2/60 to-background py-20 md:py-24">
        <div className="page-shell">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="flex flex-col gap-3">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                <ShieldCheck className="size-3 text-primary" />
                Lưu ý quan trọng
              </span>
              <h2 className="leading-tight tracking-tight text-foreground sm:text-4xl text-title">
                Trước khi vào sân,{" "}
                <span className="italic text-primary">đọc kỹ luật</span>.
              </h2>
              <p className="text-sm text-muted-foreground sm:text-base">
                Mọi thoả thuận giữa bạn, chủ sân và T-Sport đều viết rõ ở hai
                trang dưới, vui lòng đọc kỹ để hiểu đầy đủ các điều khoản.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 motion-safe-stagger">
              {LEGAL_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="size-5" />
                      </span>
                      <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[10.5px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                        {link.eyebrow}
                      </p>
                      <h3 className="font-display text-lg font-black tracking-tight text-foreground">
                        {link.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {link.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden border-t border-border/60 bg-gradient-to-br from-primary via-primary to-slate-900 text-white">
        <div aria-hidden className="absolute inset-0 sports-field-pattern opacity-10" />
        <div
          aria-hidden
          className="absolute -right-20 -top-24 size-80 rounded-full bg-accent-sport/30 blur-3xl"
        />

        <div className="page-shell relative z-10 py-16 md:py-20">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="flex flex-col gap-4">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.28em] text-white/85 backdrop-blur-sm">
                <span className="relative inline-flex size-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-accent-sport/80" />
                  <span className="relative inline-block size-1.5 rounded-full bg-accent-sport" />
                </span>
                Kickoff
              </span>
              <h2 className="leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.75rem] text-title">
                Sẵn sàng bước vào{" "}
                <span className="italic text-accent-sport">trận đầu tiên</span>{" "}
                với T-Sport?
              </h2>
              <p className="max-w-xl text-sm text-white/75 sm:text-base">
                Dù bạn là người chơi muốn tìm sân ngọt nhất quận, hay chủ sân
                muốn tối ưu lịch và doanh thu — hệ thống đều đã sẵn. Bấm vào,
                ba phút là xong.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end lg:flex-col lg:items-stretch">
              <Button
                asChild
                size="lg"
                className="h-12 bg-accent-sport text-slate-950 shadow-xl shadow-accent-sport/25 hover:bg-accent-sport/90"
              >
                <Link to="/search">
                  <Compass data-icon="inline-start" />
                  Tìm sân ngay
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
              >
                <Link to="/auth/register?role=OWNER">
                  <Handshake data-icon="inline-start" />
                  Trở thành đối tác
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/* Subcomponents                                                      */
/* ────────────────────────────────────────────────────────────────── */

type ValueTone = "primary" | "sport" | "amber";

const VALUE_TONE: Record<ValueTone, { pill: string; glow: string; ring: string }> = {
  primary: {
    pill: "bg-primary/12 text-primary",
    glow: "from-primary/20 via-primary/5 to-transparent",
    ring: "group-hover:border-primary/40",
  },
  sport: {
    pill: "bg-accent-sport/15 text-accent-sport",
    glow: "from-accent-sport/20 via-accent-sport/5 to-transparent",
    ring: "group-hover:border-accent-sport/40",
  },
  amber: {
    pill: "bg-amber-100 text-amber-700",
    glow: "from-amber-200/40 via-amber-100/10 to-transparent",
    ring: "group-hover:border-amber-400/50",
  },
};

function ValueCard({
  value,
}: {
  value: {
    code: string;
    title: string;
    description: string;
    icon: typeof Trophy;
    tone: ValueTone;
  };
}) {
  const tone = VALUE_TONE[value.tone];
  const Icon = value.icon;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border border-border/70 bg-card transition-all hover:-translate-y-1 hover:shadow-lg",
        tone.ring,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "absolute -top-16 -right-16 size-48 rounded-full bg-gradient-to-br blur-2xl",
          tone.glow,
        )}
      />
      <CardContent className="relative flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "inline-flex size-11 items-center justify-center rounded-xl",
              tone.pill,
            )}
          >
            <Icon className="size-5" />
          </span>
          <span className="font-display text-4xl font-black italic tabular-nums text-border">
            {value.code}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-display text-xl font-black tracking-tight text-foreground">
            {value.title}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {value.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
