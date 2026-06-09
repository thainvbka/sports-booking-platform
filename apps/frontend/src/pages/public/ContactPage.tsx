import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  Clock3,
  FileText,
  Headphones,
  LifeBuoy,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { ComponentType, FormEvent, SVGProps } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const CONTACT_CHANNELS: Array<{
  label: string;
  value: string;
  sub?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone: "primary" | "sport" | "amber";
}> = [
  {
    label: "Email phòng vận hành",
    value: "nvthai2904@gmail.com",
    sub: "thai.nv225394@sis.hust.edu.vn",
    icon: Mail,
    tone: "primary",
  },
  {
    label: "Hotline 8:00 – 22:00",
    value: "0862 821 861",
    sub: "Phản hồi trong dưới 10 phút giờ cao điểm",
    icon: Phone,
    tone: "sport",
  },
  {
    label: "Trụ sở Hà Nội",
    value: "Số 1, đường Đại Cồ Việt",
    sub: "Quận Hai Bà Trưng, Hà Nội",
    icon: MapPin,
    tone: "amber",
  },
];

const TONE_MAP: Record<
  "primary" | "sport" | "amber",
  { pill: string; dot: string }
> = {
  primary: {
    pill: "bg-primary/10 text-primary",
    dot: "bg-primary",
  },
  sport: {
    pill: "bg-accent-sport/15 text-accent-sport",
    dot: "bg-accent-sport",
  },
  amber: {
    pill: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
};

const FAQ_ITEMS = [
  {
    question: "Làm sao để đổi lịch khi đã đặt sân?",
    answer:
      "Bạn vào Lịch sử đặt sân, chọn booking cần đổi và gửi yêu cầu trước giờ bắt đầu ít nhất 2 giờ.",
  },
  {
    question: "Tôi có thể hủy booking và hoàn tiền không?",
    answer:
      "Hệ thống hỗ trợ hủy theo chính sách của từng sân. Mức hoàn tiền sẽ hiển thị rõ trước khi bạn xác nhận hủy.",
  },
  {
    question: "Tài khoản chủ sân cần những bước xác thực nào?",
    answer:
      "Sau khi đăng ký vai trò chủ sân, bạn tải giấy tờ xác minh và chờ đội vận hành duyệt trong vòng 24 giờ làm việc.",
  },
  {
    question: "Khi gặp lỗi thanh toán thì xử lý thế nào?",
    answer:
      "Bạn gửi mã booking và thời gian giao dịch qua form hoặc hotline để đội hỗ trợ kiểm tra ngay trong ngày.",
  },
];

const LEGAL_LINKS = [
  {
    to: "/terms",
    eyebrow: "Điều khoản",
    title: "Luật sử dụng T-Sport",
    icon: FileText,
  },
  {
    to: "/privacy",
    eyebrow: "Bảo mật",
    title: "Chính sách dữ liệu",
    icon: ShieldCheck,
  },
];

export function ContactPage() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.success(
      "Đã nhận thông tin liên hệ. Đội ngũ hỗ trợ sẽ phản hồi sớm nhất.",
    );
  };

  return (
    <div className="min-h-screen bg-background">
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
          className="pointer-events-none absolute -top-32 right-[5%] size-[26rem] rounded-full bg-primary/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 left-[8%] size-80 rounded-full bg-accent-sport/22 blur-3xl"
        />

        <div className="page-shell relative z-10 flex min-h-[340px] flex-col gap-6 lg:gap-8 pt-10 sm:pt-12 lg:pt-14 pb-12 sm:pb-16 lg:pb-20">
          <Breadcrumb>
            <BreadcrumbList className="text-white/60">
              <BreadcrumbItem>
                <BreadcrumbLink asChild className="hover:text-white">
                  <Link to="/">Trang chủ</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/30" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Liên hệ</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <header className="flex flex-col gap-5">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="flex max-w-3xl flex-col gap-3">
                <h1 className="font-display text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Cần một tay?{" "}
                  <span className="bg-gradient-to-br from-primary via-primary to-accent-sport bg-clip-text italic text-transparent">
                    Gọi chúng tôi vào sân.
                  </span>
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
                  Đội hỗ trợ T-Sport trực 7 ngày trong tuần, từ 8h sáng tới 10h đêm.
                  Có thắc mắc về booking, thanh toán hay hợp tác — hãy để lại tin,
                  chúng tôi sẽ phản hồi sớm nhất có thể.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="gap-1.5 rounded-full border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85 backdrop-blur-sm"
                >
                  <Sparkles data-icon="inline-start" />
                  Trả lời &lt; 10 phút
                </Badge>
                <Badge
                  variant="outline"
                  className="gap-1.5 rounded-full border-accent-sport/40 bg-accent-sport/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-sport"
                >
                  <LifeBuoy data-icon="inline-start" />
                  Trực 7/7
                </Badge>
              </div>
            </div>
          </header>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-background"
        />
      </section>

      <div className="page-shell py-10">
        {/* ── Main grid: channels + form ─────────────────────────── */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] motion-safe-stagger">
          {/* LEFT column: channels + hours + FAQ */}
          <div className="flex flex-col gap-5">
            {/* Channels */}
            <Card className="relative overflow-hidden border-border/70 shadow-sm">
              <div
                aria-hidden
                className="absolute -right-16 -top-16 size-48 rounded-full bg-primary/10 blur-2xl"
              />
              <CardHeader className="relative">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <Headphones className="size-4" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[10.5px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                      Channel
                    </span>
                    <CardTitle className="font-display text-xl font-black italic tracking-tight">
                      Ba đường dây trực tiếp
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative flex flex-col gap-3">
                {CONTACT_CHANNELS.map((channel, idx) => {
                  const tone = TONE_MAP[channel.tone];
                  const Icon = channel.icon;
                  return (
                    <div
                      key={channel.label}
                      className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card/70 p-3.5 transition-colors hover:border-primary/35 hover:bg-card"
                    >
                      <span
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-xl",
                          tone.pill,
                        )}
                      >
                        <Icon className="size-5" />
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            {channel.label}
                          </span>
                          <span
                            className={cn(
                              "inline-block size-1.5 rounded-full",
                              tone.dot,
                            )}
                            aria-hidden
                          />
                          <span className="font-display text-[10px] font-black italic tabular-nums text-muted-foreground/70">
                            0{idx + 1}
                          </span>
                        </div>
                        <p className="truncate font-display text-[15px] font-bold italic text-foreground">
                          {channel.value}
                        </p>
                        {channel.sub && (
                          <p className="truncate text-xs text-muted-foreground">
                            {channel.sub}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="mt-1 flex items-center justify-between rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Clock3 className="size-4 text-primary" />
                    <div className="flex flex-col leading-tight">
                      <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-primary">
                        Giờ vàng
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        Thứ 2 — Chủ nhật · 8:00 – 22:00
                      </span>
                    </div>
                  </div>
                  
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-accent-sport/15 text-accent-sport">
                    <MessageSquareText className="size-4" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[10.5px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                      FAQ · 04 câu hỏi hay gặp
                    </span>
                    <CardTitle className="font-display text-xl font-black italic tracking-tight">
                      Có thể bạn đang tìm câu trả lời…
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col">
                <div className="flex flex-col divide-y divide-border/70">
                  {FAQ_ITEMS.map((item, idx) => (
                    <FaqItem key={item.question} item={item} index={idx} />
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between rounded-2xl border border-dashed border-border/70 bg-surface-2/60 px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    Chưa thấy câu trả lời? Gửi tin nhắn qua form bên cạnh.
                  </p>
                  <span className="hidden items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-primary sm:inline-flex">
                    <Headphones className="size-3" />
                    Live support
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT column: form */}
          <Card className="relative overflow-hidden border-border/70 shadow-sm lg:sticky lg:top-24 lg:self-start">
            {/* ticket notches */}
            <span
              aria-hidden
              className="pointer-events-none absolute -left-3 top-24 size-6 rounded-full border border-border/70 bg-background"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -right-3 top-24 size-6 rounded-full border border-border/70 bg-background"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent-sport to-primary"
            />

            <CardHeader className="relative pb-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                 
                  <CardTitle className="mt-1 font-display text-2xl font-black italic tracking-tight">
                    Viết cho chúng tôi
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Điền đủ thông tin để phản hồi nhanh và chính xác hơn.
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="hidden shrink-0 gap-1.5 rounded-full border-primary/25 bg-primary/5 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-primary md:inline-flex"
                >
                  <Send data-icon="inline-start" />
                  Ưu tiên
                </Badge>
              </div>
              <Separator className="mt-4" />
            </CardHeader>

            <CardContent>
              <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="firstName">Họ</Label>
                    <Input id="firstName" placeholder="Nguyễn" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="lastName">Tên</Label>
                    <Input id="lastName" placeholder="Văn A" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="subject">Chủ đề</Label>
                  <Input id="subject" placeholder="Bạn cần hỗ trợ gì?" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="message">Nội dung</Label>
                  <Textarea
                    id="message"
                    placeholder="Mô tả cụ thể tình huống, mã booking (nếu có)..."
                    className="min-h-36"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="h-11 w-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:bg-primary/92"
                >
                  <Send data-icon="inline-start" />
                  Gửi tin nhắn
                </Button>

                <p className="text-center text-[11px] text-muted-foreground">
                  Bằng việc gửi, bạn đồng ý với{" "}
                  <Link
                    to="/terms"
                    className="font-semibold text-primary underline-offset-2 hover:underline"
                  >
                    Điều khoản
                  </Link>{" "}
                  và{" "}
                  <Link
                    to="/privacy"
                    className="font-semibold text-primary underline-offset-2 hover:underline"
                  >
                    Chính sách bảo mật
                  </Link>{" "}
                  của T-Sport.
                </p>
              </form>
            </CardContent>
          </Card>
        </section>

        {/* ── Legal ribbon ─────────────────────────────────────────── */}
        <section className="mt-10 rounded-3xl border border-border/70 bg-surface-2/60 p-5 sm:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <ShieldCheck className="size-5" />
              </span>
              <div className="flex flex-col">
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                  Phần in nhỏ
                </span>
                <p className="font-display text-lg font-black italic tracking-tight text-foreground">
                  Đọc kỹ trước khi đá trận đầu tiên
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 motion-safe-stagger">
              {LEGAL_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Button
                    key={link.to}
                    asChild
                    variant="outline"
                    className="h-auto flex-1 justify-start gap-3 border-border/70 bg-background px-4 py-3 text-left hover:border-primary/40 hover:bg-primary/5 md:flex-initial"
                  >
                    <Link to={link.to}>
                      <Icon data-icon="inline-start" className="text-primary" />
                      <span className="flex flex-col leading-tight">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                          {link.eyebrow}
                        </span>
                        <span className="font-display text-sm font-bold italic text-foreground">
                          {link.title}
                        </span>
                      </span>
                      <ArrowUpRight
                        data-icon="inline-end"
                        className="text-muted-foreground"
                      />
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/* FAQ item                                                         */
/* ──────────────────────────────────────────────────────────────── */
function FaqItem({
  item,
  index,
}: {
  item: { question: string; answer: string };
  index: number;
}) {
  return (
    <Collapsible className="group/faq py-3">
      <CollapsibleTrigger className="flex w-full items-start justify-between gap-3 rounded-xl text-left transition-colors hover:text-primary">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 font-display text-[11px] font-black italic tabular-nums text-primary/80">
            0{index + 1}
          </span>
          <span className="text-sm font-semibold leading-snug text-foreground">
            {item.question}
          </span>
        </div>
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground transition-all group-data-[state=open]/faq:rotate-45 group-data-[state=open]/faq:border-primary/40 group-data-[state=open]/faq:bg-primary/5 group-data-[state=open]/faq:text-primary">
          <Plus className="size-3.5" />
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:animate-in data-[state=open]:fade-in">
        <p className="mt-2 pl-7 pr-10 text-sm leading-relaxed text-muted-foreground">
          {item.answer}
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}
