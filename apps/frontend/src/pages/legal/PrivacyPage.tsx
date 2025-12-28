import { Separator } from "@/components/ui/separator";
import { Eye, Lock, Server, Bell, UserCheck } from "lucide-react";

export const PrivacyPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Chính sách bảo mật
          </h1>
          <p className="text-muted-foreground text-lg">
            Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn và tôn trọng
            quyền riêng tư của bạn.
          </p>
        </div>

        <div className="grid gap-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                1. Thu thập thông tin
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Chúng tôi thu thập thông tin khi bạn đăng ký tài khoản, đặt sân,
              hoặc liên hệ với chúng tôi. Thông tin bao gồm:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Họ tên, địa chỉ email, số điện thoại.</li>
              <li>Thông tin lịch sử đặt sân và thanh toán.</li>
            </ul>
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                2. Sử dụng thông tin
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Chúng tôi sử dụng thông tin của bạn để:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Cung cấp và quản lý dịch vụ đặt sân.</li>
              <li>
                Gửi thông báo về trạng thái đặt sân và các cập nhật quan trọng.
              </li>
              <li>Cải thiện trải nghiệm người dùng và chất lượng dịch vụ.</li>
              <li>Hỗ trợ giải quyết các khiếu nại và tranh chấp.</li>
            </ul>
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                3. Bảo mật thông tin
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Chúng tôi áp dụng các biện pháp an ninh kỹ thuật và tổ chức phù
              hợp để bảo vệ thông tin cá nhân của bạn khỏi bị truy cập trái
              phép, sử dụng sai mục đích, hoặc tiết lộ. Dữ liệu của bạn được mã
              hóa và lưu trữ an toàn.
            </p>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              4. Chia sẻ thông tin
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Chúng tôi không bán hoặc cho thuê thông tin cá nhân của bạn. Chúng
              tôi chỉ chia sẻ thông tin trong các trường hợp sau:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                Chia sẻ thông tin đặt sân cần thiết với chủ sân (tên, sđt) để
                xác nhận đặt chỗ.
              </li>
              <li>
                Tuân thủ yêu cầu pháp lý từ cơ quan nhà nước có thẩm quyền.
              </li>
            </ul>
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                5. Quyền lợi người dùng
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Bạn có quyền:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Truy cập, chỉnh sửa hoặc xóa thông tin cá nhân của mình.</li>
              <li>Khiếu nại nếu phát hiện vi phạm bảo mật thông tin.</li>
            </ul>
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                6. Liên hệ
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật, vui lòng liên
              hệ với chúng tôi qua email:
              <span className="font-medium text-foreground">
                {" "}
                nvthai2904@gmail.com
              </span>{" "}
              hoặc hotline:
              <span className="font-medium text-foreground"> 0862821861</span>.
            </p>
          </section>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Lần cập nhật cuối: {new Date().toLocaleDateString("vi-VN")}</p>
        </div>
      </div>
    </div>
  );
};
