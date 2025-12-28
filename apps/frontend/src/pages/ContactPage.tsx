import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

export function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Liên hệ với chúng tôi</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy gửi tin nhắn
            hoặc liên hệ trực tiếp qua các kênh dưới đây.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-stretch">
          {/* Contact Info */}
          <div className="space-y-8 h-full flex flex-col">
            <Card className="bg-blue-50 border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-blue-900">
                  Thông tin liên hệ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-gray-600">nvthai2904@gmail.com</p>
                    <p className="text-gray-600">
                      thai.nv225394@sis.hust.edu.vn
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Hotline</p>
                    <p className="text-gray-600">0862821861 (8:00 - 22:00)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Văn phòng</p>
                    <p className="text-gray-600">
                      Số 1, đường Đại Cồ Việt
                      <br />
                      Quận Hai Bà Trưng, Hà Nội
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 border-none shadow-sm flex-1 flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  Câu hỏi thường gặp
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Bạn có thắc mắc về quy trình đặt sân, thanh toán hoặc chính
                  sách hủy?
                </p>
                <Button variant="outline" className="w-full">
                  Xem trung tâm trợ giúp
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="shadow-lg h-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Gửi tin nhắn</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium">
                      Họ
                    </label>
                    <Input id="firstName" placeholder="Nguyễn" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium">
                      Tên
                    </label>
                    <Input id="lastName" placeholder="Văn A" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Chủ đề
                  </label>
                  <Input id="subject" placeholder="Bạn cần hỗ trợ gì?" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Nội dung
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Chi tiết vấn đề của bạn..."
                    className="min-h-[150px]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Gửi tin nhắn
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
