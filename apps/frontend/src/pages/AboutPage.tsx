import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Users, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

export function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Về T-Sport</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Sứ mệnh của chúng tôi là kết nối cộng đồng thể thao và đơn giản hóa
            việc đặt sân, giúp mọi người dễ dàng tiếp cận với lối sống năng
            động.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Sân thể thao</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50k+</div>
              <div className="text-gray-600">Người dùng</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">100k+</div>
              <div className="text-gray-600">Lượt đặt sân</div>
            </div>
            {/* <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">4.8/5</div>
              <div className="text-gray-600">Đánh giá trung bình</div>
            </div> */}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Câu chuyện của chúng tôi
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  T-Sport được thành lập vào năm 2025 với một mục tiêu đơn giản:
                  giải quyết nỗi đau đầu của việc tìm và đặt sân thể thao.
                </p>
                <p>
                  Chúng tôi nhận thấy rằng trong khi nhu cầu chơi thể thao ngày
                  càng tăng, quy trình đặt sân vẫn còn thủ công, tốn thời gian
                  và thiếu minh bạch. Các chủ sân gặp khó khăn trong việc quản
                  lý lịch, còn người chơi thì mệt mỏi với việc gọi điện từng nơi
                  để check sân trống.
                </p>
                <p>
                  Vì vậy, chúng tôi đã xây dựng T-Sport - một nền tảng toàn diện
                  kết nối chủ sân và người chơi. Chúng tôi không chỉ cung cấp
                  công cụ đặt sân, mà còn xây dựng một hệ sinh thái giúp phát
                  triển phong trào thể thao cộng đồng.
                </p>
              </div>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=2070"
                alt="Team playing sports"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Giá trị cốt lõi</h2>
            <p className="text-gray-600">
              Những nguyên tắc định hướng mọi hành động của chúng tôi
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard
              icon={<Users className="w-8 h-8" />}
              title="Cộng đồng là trên hết"
              description="Chúng tôi xây dựng sản phẩm với trọng tâm là lợi ích của cộng đồng người chơi và chủ sân."
            />
            <ValueCard
              icon={<CheckCircle2 className="w-8 h-8" />}
              title="Minh bạch & Tin cậy"
              description="Thông tin rõ ràng, giá cả minh bạch và đánh giá trung thực là cam kết của chúng tôi."
            />
            <ValueCard
              icon={<Trophy className="w-8 h-8" />}
              title="Không ngừng đổi mới"
              description="Chúng tôi liên tục cải tiến công nghệ để mang lại trải nghiệm tốt nhất cho người dùng."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">Tham gia cùng chúng tôi</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Dù bạn là người chơi đam mê hay chủ sân tâm huyết, T-Sport luôn có
            giải pháp dành cho bạn.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/search">
              <Button size="lg" variant="secondary" className="font-semibold">
                Tìm sân ngay
              </Button>
            </Link>
            <Link to="/auth/register?role=OWNER">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white/10"
              >
                Trở thành đối tác
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="bg-gray-50 border hover:shadow-lg transition-shadow">
      <CardContent className="p-8">
        <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
