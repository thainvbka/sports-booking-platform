import { Separator } from "@/components/ui/separator";
import { Shield, Lock, FileText, Scale } from "lucide-react";

export const TermsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Terms of Use
          </h1>
          <p className="text-muted-foreground text-lg">
            Vui lòng đọc kỹ các điều khoản sử dụng trước khi sử dụng dịch vụ của
            T-Sport
          </p>
        </div>

        <div className="grid gap-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                1. Giới thiệu
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Chào mừng bạn đến với T-Sport. Bằng cách truy cập và sử dụng
              website của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều
              kiện dưới đây. Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui
              lòng ngưng sử dụng dịch vụ.
            </p>
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                2. Tài khoản người dùng
              </h2>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                Bạn chịu trách nhiệm bảo mật thông tin tài khoản và mật khẩu của
                mình.
              </li>
              <li>
                Bạn phải cung cấp thông tin chính xác, đầy đủ và cập nhật khi
                đăng ký.
              </li>
              <li>
                Bạn không được chia sẻ tài khoản của mình cho người khác sử
                dụng.
              </li>
              <li>Chúng tôi có quyền khóa tài khoản nếu phát hiện vi phạm.</li>
            </ul>
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                3. Quy định đặt sân
              </h2>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Người dùng phải có mặt đúng giờ đã đặt.</li>

              <li>
                Việc hủy đặt sân phải tuân thủ chính sách hủy của từng chủ sân.
              </li>
              <li>Nghiêm cấm các hành vi gây rối, phá hoại tài sản tại sân.</li>
            </ul>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              4. Thanh toán và Hoàn tiền
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                Chúng tôi hỗ trợ các phương thức thanh toán trực tuyến an toàn.
              </li>
              <li>
                Chính sách hoàn tiền sẽ phụ thuộc vào quy định của từng sân và
                thời điểm hủy đặt sân.
              </li>
              <li>
                Trong trường hợp lỗi hệ thống, chúng tôi sẽ hoàn tiền 100% cho
                người dùng.
              </li>
            </ul>
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                5. Giới hạn trách nhiệm
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              T-Sport không chịu trách nhiệm về bất kỳ thiệt hại gián tiếp, ngẫu
              nhiên hoặc đặc biệt nào phát sinh từ việc sử dụng hoặc không thể
              sử dụng dịch vụ của chúng tôi. Chúng tôi chỉ đóng vai trò trung
              gian kết nối giữa người chơi và chủ sân.
            </p>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              6. Thay đổi điều khoản
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Chúng tôi có quyền thay đổi các điều khoản này bất cứ lúc nào. Các
              thay đổi sẽ có hiệu lực ngay khi được đăng tải trên website. Việc
              bạn tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa với
              việc bạn chấp nhận các thay đổi đó.
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
