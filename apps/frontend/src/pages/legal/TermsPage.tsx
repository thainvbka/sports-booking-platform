import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

type TermsSection = {
  id: string;
  title: string;
  intro: string;
  points: string[];
};

const TERMS_SECTIONS: TermsSection[] = [
  {
    id: "pham-vi-ap-dung",
    title: "Phạm vi áp dụng",
    intro:
      "Điều khoản này áp dụng cho toàn bộ hoạt động truy cập, đặt sân, thanh toán và tương tác trên nền tảng T-Sport.",
    points: [
      "Khi tạo tài khoản hoặc tiếp tục sử dụng dịch vụ, bạn mặc định đồng ý với các quy định hiện hành.",
      "Nếu bạn không đồng ý với bất kỳ nội dung nào, vui lòng dừng sử dụng nền tảng ngay lập tức.",
      "Các quy định riêng của từng chủ sân vẫn có hiệu lực, miễn không trái với pháp luật hiện hành.",
    ],
  },
  {
    id: "tai-khoan",
    title: "Tài khoản và xác thực",
    intro:
      "Người dùng có trách nhiệm bảo vệ thông tin tài khoản và cung cấp dữ liệu chính xác trong suốt quá trình sử dụng.",
    points: [
      "Không chia sẻ tài khoản cho bên thứ ba hoặc sử dụng tài khoản của người khác khi chưa được cho phép.",
      "T-Sport có quyền tạm khóa tài khoản nếu phát hiện dấu hiệu gian lận, giả mạo hoặc lạm dụng hệ thống.",
      "Bạn cần cập nhật thông tin liên hệ để đảm bảo nhận được thông báo về lịch đặt và thanh toán.",
    ],
  },
  {
    id: "dat-san-va-thanh-toan",
    title: "Đặt sân và thanh toán",
    intro:
      "Mọi giao dịch đặt sân được xác nhận theo thời gian thực và gắn với khung giờ cụ thể tại sân bạn chọn.",
    points: [
      "Người đặt sân cần có mặt đúng giờ; việc đến muộn có thể ảnh hưởng quyền sử dụng sân theo quy định của chủ sân.",
      "Phí dịch vụ, khuyến mãi và tổng thanh toán sẽ được hiển thị trước khi bạn xác nhận giao dịch.",
      "Các phương thức thanh toán trực tuyến được cung cấp qua đối tác trung gian đã tích hợp trên nền tảng.",
    ],
  },
  {
    id: "huy-lich-va-hoan-tien",
    title: "Hủy lịch, hoàn tiền và khiếu nại",
    intro:
      "T-Sport hỗ trợ luồng hủy lịch minh bạch, tuy nhiên mức hoàn tiền phụ thuộc thời điểm hủy và chính sách từng sân.",
    points: [
      "Điều kiện hoàn tiền được hiển thị ngay trước khi xác nhận thao tác hủy để bạn kiểm tra lần cuối.",
      "Với lỗi phát sinh từ hệ thống của T-Sport, chúng tôi sẽ phối hợp hoàn tiền toàn phần theo đúng giao dịch.",
      "Khi có tranh chấp, người dùng cần cung cấp mã đặt sân và thông tin thanh toán để xử lý nhanh hơn.",
    ],
  },
  {
    id: "ung-xu-va-trach-nhiem",
    title: "Ứng xử tại sân và giới hạn trách nhiệm",
    intro:
      "T-Sport hướng đến một cộng đồng thể thao văn minh, an toàn và tôn trọng cơ sở vật chất của đối tác sân.",
    points: [
      "Nghiêm cấm gây rối, phá hoại tài sản, sử dụng thông tin sai mục đích hoặc quấy rối người dùng khác.",
      "T-Sport đóng vai trò nền tảng kết nối, không chịu trách nhiệm cho thiệt hại gián tiếp ngoài phạm vi kiểm soát hợp lý.",
      "Chúng tôi có thể cập nhật điều khoản để phù hợp pháp luật và vận hành; phiên bản mới có hiệu lực khi được công bố.",
    ],
  },
];

const TERMS_COMMITMENTS = [
  "Minh bạch toàn bộ phí và trạng thái đặt sân trước khi bạn thanh toán.",
  "Bảo vệ quyền lợi người dùng bằng quy trình hỗ trợ và xử lý khiếu nại rõ ràng.",
  "Cập nhật điều khoản có thông báo, không thay đổi âm thầm gây bất lợi cho người dùng.",
];

export const TermsPage = () => {
  const lastUpdated = new Date().toLocaleDateString("vi-VN");

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-105 bg-linear-to-b from-primary/10 via-primary/4 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-105 sports-field-pattern opacity-8"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[8%] size-72 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="page-shell relative z-10 flex flex-col gap-8 pb-16 pt-8 md:pb-20 md:pt-10">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Trang chủ</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Điều khoản sử dụng</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1">
              <FileText />
              T-Sport Legal
            </Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Áp dụng cho toàn bộ người dùng
            </Badge>
          </div>

          <div className="flex max-w-3xl flex-col gap-3">
            <h1 className="font-display text-4xl font-black leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[3.35rem]">
              Điều khoản sử dụng
            </h1>
            <p className="text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              Văn bản này mô tả quyền, nghĩa vụ và giới hạn trách nhiệm giữa bạn
              và T-Sport trong suốt quá trình sử dụng dịch vụ đặt sân.
            </p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
          <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
            <Card className="border-border/70 shadow-card">
              <CardHeader className="border-b border-border/60">
                <CardTitle className="font-display text-xl font-black tracking-tight">
                  Mục lục nhanh
                </CardTitle>
                <CardDescription>
                  Chọn mục để chuyển nhanh đến nội dung bạn cần xem.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 pt-6">
                {TERMS_SECTIONS.map((section, index) => (
                  <Button
                    key={section.id}
                    asChild
                    variant="ghost"
                    className="h-auto justify-start rounded-lg px-3 py-2"
                  >
                    <a href={`#${section.id}`}>
                      <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                        {index + 1}
                      </span>
                      <span className="ml-2 truncate text-left text-sm font-medium">
                        {section.title}
                      </span>
                    </a>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Alert className="border-border/70 bg-card/80">
              <ShieldCheck className="text-primary" />
              <AlertTitle>Cam kết minh bạch</AlertTitle>
              <AlertDescription>
                Nếu điều khoản thay đổi làm ảnh hưởng quyền lợi trực tiếp, T-Sport
                sẽ thông báo trên nền tảng trước khi áp dụng rộng rãi.
              </AlertDescription>
            </Alert>
          </aside>

          <Card className="border-border/70 shadow-card">
            <CardHeader className="border-b border-border/60">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <CardTitle className="font-display text-2xl font-black tracking-tight">
                    Nội dung điều khoản
                  </CardTitle>
                  <CardDescription>
                    Phiên bản đang hiển thị có hiệu lực tại thời điểm bạn truy
                    cập nền tảng.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="rounded-full px-3 py-1">
                  Cập nhật: {lastUpdated}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <ScrollArea className="h-[min(72vh,760px)] pr-4">
                <div className="flex flex-col gap-6">
                  {TERMS_SECTIONS.map((section, index) => (
                    <div key={section.id} className="flex flex-col gap-6">
                      <article
                        id={section.id}
                        className="scroll-mt-24 rounded-xl border border-border/70 bg-background/70 p-5"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">Điều {index + 1}</Badge>
                          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                            {section.title}
                          </h2>
                        </div>

                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                          {section.intro}
                        </p>

                        <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                          {section.points.map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                      </article>

                      {index < TERMS_SECTIONS.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {TERMS_COMMITMENTS.map((commitment) => (
            <Card key={commitment} className="border-border/70 bg-card/70 shadow-card">
              <CardContent className="flex items-start gap-3 pt-6">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {commitment}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="border-border/70 bg-surface-2/60 shadow-card">
          <CardContent className="flex flex-col items-start justify-between gap-4 py-6 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-1">
              <p className="font-display text-lg font-bold tracking-tight text-foreground">
                Cần thêm thông tin về dữ liệu cá nhân?
              </p>
              <p className="text-sm text-muted-foreground">
                Xem chi tiết cách T-Sport thu thập và xử lý dữ liệu trong chính
                sách bảo mật.
              </p>
            </div>
            <Button asChild>
              <Link to="/privacy">
                <Scale data-icon="inline-start" />
                Xem chính sách bảo mật
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
