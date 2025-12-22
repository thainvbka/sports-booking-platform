import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  Users,
  Trophy,
  Building2,
  UsersRound,
  Calendar,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { teamPlaySport } from "@/assets";

export function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Về T-Sport
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed font-light">
            Sứ mệnh của chúng tôi là kết nối cộng đồng thể thao và đơn giản hóa
            việc đặt sân, giúp mọi người dễ dàng tiếp cận với lối sống năng
            động.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
                Câu chuyện của chúng tôi
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
                Kết nối đam mê, <br />
                <span className="text-blue-600">Đơn giản hóa trải nghiệm</span>
              </h2>
              <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
                <p>
                  T-Sport được thành lập vào năm 2025 với một mục tiêu đơn giản:
                  <strong className="text-gray-900">
                    {" "}
                    giải quyết nỗi đau đầu của việc tìm và đặt sân thể thao
                  </strong>
                  .
                </p>
                <p>
                  Chúng tôi nhận thấy rằng trong khi nhu cầu chơi thể thao ngày
                  càng tăng, quy trình đặt sân vẫn còn thủ công, tốn thời gian
                  và thiếu minh bạch. Các chủ sân gặp khó khăn trong việc quản
                  lý lịch, còn người chơi thì mệt mỏi với việc gọi điện từng nơi
                  để check sân trống.
                </p>
                <p>
                  Vì vậy, chúng tôi đã xây dựng{" "}
                  <strong className="text-blue-600">T-Sport</strong> - một nền
                  tảng toàn diện kết nối chủ sân và người chơi. Chúng tôi không
                  chỉ cung cấp công cụ đặt sân, mà còn xây dựng một hệ sinh thái
                  giúp phát triển phong trào thể thao cộng đồng.
                </p>
              </div>
            </div>
            <div className="order-1 md:order-2 relative">
              <div className="relative h-[450px] md:h-[550px] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={teamPlaySport}
                  alt="Team playing sports"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-blue-900/40 to-transparent"></div>
              </div>
              {/* Decorative element */}
              <div className="hidden md:block absolute -bottom-6 -right-6 w-32 h-32 bg-blue-100 rounded-3xl -z-10"></div>
              <div className="hidden md:block absolute -top-6 -left-6 w-24 h-24 bg-blue-50 rounded-full -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-linear-to-br from-blue-50 via-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Con số ấn tượng
            </h2>
            <p className="text-gray-600 text-lg">
              Sự tăng trưởng vượt bậc của cộng đồng T-Sport
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard
              icon={<Building2 className="w-8 h-8" />}
              value="500+"
              label="Sân thể thao"
              color="blue"
            />
            <StatCard
              icon={<UsersRound className="w-8 h-8" />}
              value="50k+"
              label="Người dùng"
              color="green"
            />
            <StatCard
              icon={<Calendar className="w-8 h-8" />}
              value="100k+"
              label="Lượt đặt sân"
              color="purple"
            />
            <StatCard
              icon={<Star className="w-8 h-8" />}
              value="4.8/5"
              label="Đánh giá"
              color="yellow"
            />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
              Giá trị cốt lõi
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Những nguyên tắc định hướng
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Chúng tôi tin rằng thành công đến từ việc giữ vững những giá trị
              cốt lõi
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <ValueCard
              icon={<Users className="w-8 h-8" />}
              title="Cộng đồng là trên hết"
              description="Chúng tôi xây dựng sản phẩm với trọng tâm là lợi ích của cộng đồng người chơi và chủ sân."
              accentColor="blue"
            />
            <ValueCard
              icon={<CheckCircle2 className="w-8 h-8" />}
              title="Minh bạch & Tin cậy"
              description="Thông tin rõ ràng, giá cả minh bạch và đánh giá trung thực là cam kết của chúng tôi."
              accentColor="green"
            />
            <ValueCard
              icon={<Trophy className="w-8 h-8" />}
              title="Không ngừng đổi mới"
              description="Chúng tôi liên tục cải tiến công nghệ để mang lại trải nghiệm tốt nhất cho người dùng."
              accentColor="purple"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-linear-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Tham gia cùng chúng tôi
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Dù bạn là người chơi đam mê hay chủ sân tâm huyết, T-Sport luôn có
            giải pháp dành cho bạn.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/search">
              <Button
                size="lg"
                variant="secondary"
                className="font-semibold text-lg px-8 py-6 h-auto w-full sm:w-auto shadow-xl hover:shadow-2xl transition-all"
              >
                Tìm sân ngay
              </Button>
            </Link>
            <Link to="/auth/register?role=OWNER">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-700 font-semibold text-lg px-8 py-6 h-auto w-full sm:w-auto transition-all"
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

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: "blue" | "green" | "purple" | "yellow";
}) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    yellow: "bg-yellow-100 text-yellow-600",
  };

  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-white">
      <CardContent className="p-8 text-center">
        <div
          className={`w-16 h-16 ${colorClasses[color]} rounded-2xl flex items-center justify-center mx-auto mb-4`}
        >
          {icon}
        </div>
        <div className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
          {value}
        </div>
        <div className="text-gray-600 font-medium">{label}</div>
      </CardContent>
    </Card>
  );
}

function ValueCard({
  icon,
  title,
  description,
  accentColor,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor: "blue" | "green" | "purple";
}) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
    green:
      "bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white",
    purple:
      "bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
  };

  return (
    <Card className="group border-2 hover:border-blue-300 hover:shadow-2xl transition-all hover:-translate-y-2 bg-linear-to-br from-white to-gray-50">
      <CardContent className="p-8">
        <div
          className={`w-16 h-16 ${colorClasses[accentColor]} rounded-2xl flex items-center justify-center mb-6 transition-all duration-300`}
        >
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
