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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowRight,
  Database,
  Eye,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

type PrivacySection = {
  id: string;
  title: string;
  intro: string;
  points: string[];
};

type DataMatrixRow = {
  dataType: string;
  purpose: string;
  retention: string;
};

const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    id: "du-lieu-thu-thap",
    title: "Dữ liệu được thu thập",
    intro:
      "Chúng tôi thu thập dữ liệu tối thiểu cần thiết để cung cấp dịch vụ đặt sân ổn định và an toàn.",
    points: [
      "Thông tin nhận diện cơ bản: họ tên, email, số điện thoại, vai trò tài khoản.",
      "Thông tin giao dịch: lịch sử đặt sân, trạng thái thanh toán, mã giao dịch.",
      "Thông tin kỹ thuật: nhật ký truy cập, thiết bị và hành vi sử dụng để phòng chống gian lận.",
    ],
  },
  {
    id: "muc-dich-su-dung",
    title: "Mục đích sử dụng dữ liệu",
    intro:
      "Mọi dữ liệu cá nhân được xử lý theo mục đích rõ ràng, có giới hạn và không sử dụng ngoài phạm vi đã công bố.",
    points: [
      "Xác nhận booking, điều phối lịch sân và gửi thông báo giao dịch cho người dùng.",
      "Hỗ trợ khách hàng khi có thay đổi lịch, lỗi thanh toán hoặc phát sinh tranh chấp.",
      "Nâng cao chất lượng sản phẩm thông qua phân tích hành vi đã được ẩn danh hóa khi phù hợp.",
    ],
  },
  {
    id: "chia-se-du-lieu",
    title: "Chia sẻ dữ liệu với bên liên quan",
    intro:
      "T-Sport không bán dữ liệu cá nhân. Việc chia sẻ chỉ diễn ra khi cần thiết cho dịch vụ hoặc theo yêu cầu pháp lý.",
    points: [
      "Chủ sân nhận thông tin cần thiết để xác nhận và phục vụ booking của bạn.",
      "Đối tác thanh toán chỉ nhận dữ liệu giao dịch cần thiết để xử lý và đối soát.",
      "Cơ quan có thẩm quyền có thể được cung cấp dữ liệu theo quy định pháp luật hiện hành.",
    ],
  },
  {
    id: "bao-mat-luu-tru",
    title: "Bảo mật và lưu trữ",
    intro:
      "Chúng tôi áp dụng lớp bảo vệ kỹ thuật và quy trình nội bộ để giảm rủi ro truy cập trái phép hoặc rò rỉ dữ liệu.",
    points: [
      "Dữ liệu nhạy cảm được kiểm soát truy cập theo vai trò và ghi nhận nhật ký hệ thống.",
      "Thông tin thanh toán được xử lý qua đối tác trung gian đạt chuẩn bảo mật ngành.",
      "Thời gian lưu trữ được giới hạn theo mục đích sử dụng và yêu cầu pháp lý bắt buộc.",
    ],
  },
  {
    id: "quyen-cua-ban",
    title: "Quyền của người dùng",
    intro:
      "Bạn có quyền kiểm soát dữ liệu cá nhân của mình và yêu cầu hỗ trợ bất cứ khi nào cần thiết.",
    points: [
      "Yêu cầu truy cập, chỉnh sửa hoặc cập nhật dữ liệu cá nhân không chính xác.",
      "Yêu cầu xóa dữ liệu trong phạm vi pháp luật cho phép và nghĩa vụ lưu trữ đã hoàn thành.",
      "Khiếu nại hoặc yêu cầu giải trình khi nghi ngờ dữ liệu bị sử dụng sai mục đích.",
    ],
  },
  {
    id: "cap-nhat-chinh-sach",
    title: "Cập nhật chính sách",
    intro:
      "Chính sách bảo mật có thể được cập nhật để phản ánh thay đổi pháp lý hoặc nâng cấp vận hành.",
    points: [
      "Phiên bản mới sẽ được công bố trực tiếp trên website hoặc trong ứng dụng.",
      "Các thay đổi quan trọng ảnh hưởng trực tiếp đến người dùng sẽ đi kèm thông báo rõ ràng.",
      "Việc bạn tiếp tục sử dụng dịch vụ sau thời điểm công bố đồng nghĩa chấp nhận bản cập nhật.",
    ],
  },
];

const DATA_MATRIX: DataMatrixRow[] = [
  {
    dataType: "Thông tin tài khoản",
    purpose: "Đăng nhập, xác thực, cá nhân hóa trải nghiệm",
    retention: "Trong thời gian tài khoản hoạt động",
  },
  {
    dataType: "Lịch sử booking",
    purpose: "Quản lý lịch sân, hỗ trợ hoàn tiền và tranh chấp",
    retention: "Theo chu kỳ đối soát và nghĩa vụ pháp lý",
  },
  {
    dataType: "Thông tin giao dịch",
    purpose: "Thanh toán, đối soát và chống gian lận",
    retention: "Theo quy định kế toán và thanh toán",
  },
];

const PRIVACY_PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "Minh bạch",
    description: "Công khai mục đích thu thập và phạm vi sử dụng dữ liệu.",
  },
  {
    icon: LockKeyhole,
    title: "Bảo vệ",
    description: "Kiểm soát truy cập chặt chẽ và theo dõi hoạt động bất thường.",
  },
  {
    icon: Eye,
    title: "Kiểm soát",
    description: "Người dùng có quyền xem, sửa và yêu cầu xử lý dữ liệu cá nhân.",
  },
];

export const PrivacyPage = () => {
  const lastUpdated = new Date().toLocaleDateString("vi-VN");

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-105 bg-linear-to-b from-accent-sport/12 via-accent-sport/4 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-105 sports-field-pattern opacity-8"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-[8%] size-72 rounded-full bg-accent-sport/15 blur-3xl"
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
              <BreadcrumbPage>Chính sách bảo mật</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1">
              <Database />
              Data Protection
            </Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Chuẩn minh bạch dữ liệu T-Sport
            </Badge>
          </div>

          <div className="flex max-w-3xl flex-col gap-3">
            <h1 className="font-display text-4xl font-black leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[3.35rem]">
              Chính sách bảo mật
            </h1>
            <p className="text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              T-Sport cam kết xử lý dữ liệu cá nhân của bạn đúng mục đích, đúng
              phạm vi và đúng trách nhiệm giải trình.
            </p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
          <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
            <Card className="border-border/70 shadow-card">
              <CardHeader className="border-b border-border/60">
                <CardTitle className="font-display text-xl font-black tracking-tight">
                  3 nguyên tắc cốt lõi
                </CardTitle>
                <CardDescription>
                  Khung vận hành bảo mật được áp dụng xuyên suốt toàn nền tảng.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-6">
                {PRIVACY_PRINCIPLES.map((principle) => {
                  const Icon = principle.icon;
                  return (
                    <div
                      key={principle.title}
                      className="rounded-xl border border-border/70 bg-card/70 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="inline-flex size-7 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                          <Icon className="size-4" />
                        </span>
                        <p className="font-display text-base font-bold tracking-tight text-foreground">
                          {principle.title}
                        </p>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {principle.description}
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Alert className="border-border/70 bg-card/80">
              <Mail className="text-primary" />
              <AlertTitle>Kênh tiếp nhận yêu cầu dữ liệu</AlertTitle>
              <AlertDescription>
                Gửi yêu cầu qua email nvthai2904@gmail.com hoặc hotline 0862 821
                861 để được hỗ trợ trong giờ vận hành.
              </AlertDescription>
            </Alert>
          </aside>

          <Card className="border-border/70 shadow-card">
            <CardHeader className="border-b border-border/60">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <CardTitle className="font-display text-2xl font-black tracking-tight">
                    Nội dung chính sách
                  </CardTitle>
                  <CardDescription>
                    Tài liệu được trình bày theo từng nhóm nghĩa vụ để bạn theo
                    dõi nhanh hơn.
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
                  {PRIVACY_SECTIONS.map((section, index) => (
                    <div key={section.id} className="flex flex-col gap-6">
                      <article
                        id={section.id}
                        className="scroll-mt-24 rounded-xl border border-border/70 bg-background/70 p-5"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">Mục {index + 1}</Badge>
                          <h2 className="tracking-tight text-foreground text-heading">
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

                      {index < PRIVACY_SECTIONS.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </section>

        <Card className="border-border/70 shadow-card">
          <CardHeader className="border-b border-border/60">
            <CardTitle className="font-display text-xl font-black tracking-tight">
              Ma trận lưu trữ dữ liệu
            </CardTitle>
            <CardDescription>
              Bảng tóm tắt các nhóm dữ liệu chính và thời gian lưu giữ tương
              ứng.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loại dữ liệu</TableHead>
                  <TableHead>Mục đích xử lý</TableHead>
                  <TableHead>Thời gian lưu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DATA_MATRIX.map((row) => (
                  <TableRow key={row.dataType}>
                    <TableCell className="font-medium text-foreground">
                      {row.dataType}
                    </TableCell>
                    <TableCell className="whitespace-normal text-muted-foreground">
                      {row.purpose}
                    </TableCell>
                    <TableCell className="whitespace-normal text-muted-foreground">
                      {row.retention}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-surface-2/60 shadow-card">
          <CardContent className="flex flex-col items-start justify-between gap-4 py-6 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-1">
              <p className="font-display text-lg font-bold tracking-tight text-foreground">
                Muốn xem thêm điều khoản sử dụng nền tảng?
              </p>
              <p className="text-sm text-muted-foreground">
                Điều khoản giúp bạn nắm rõ trách nhiệm khi đặt sân, thanh toán và
                xử lý khiếu nại.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline">
                <a href="tel:0862821861">
                  <Phone data-icon="inline-start" />
                  Gọi hotline
                </a>
              </Button>
              <Button asChild>
                <Link to="/terms">
                  <ShieldCheck data-icon="inline-start" />
                  Xem điều khoản
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
