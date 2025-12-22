import { Link } from "react-router-dom";
import { SearchBar } from "@/components/shared/SearchBar";
import { ComplexCard } from "@/components/shared/ComplexCard";
import { SubFieldCard } from "@/components/shared/SubFieldCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { heroBg } from "@/assets";
import { useEffect, useState } from "react";
import { publicService } from "@/services/public.service";
import type { Complex, SubField } from "@/types";

export function HomePage() {
  const [featuredComplexes, setFeaturedComplexes] = useState<Complex[]>([]);
  const [featuredSubFields, setFeaturedSubFields] = useState<
    (SubField & { complex_name?: string; complex_address?: string })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [complexesRes, subfieldsRes] = await Promise.all([
          publicService.getComplexes({ page: 1, limit: 4 }),
          publicService.getSubfields({ page: 1, limit: 6 }),
        ]);
        console.log("Complexes response:", complexesRes);
        console.log("Subfields response:", subfieldsRes);

        // Ensure we always set arrays
        setFeaturedComplexes(complexesRes.data?.complexes || []);
        setFeaturedSubFields(subfieldsRes.data?.subfields || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Reset to empty arrays on error
        setFeaturedComplexes([]);
        setFeaturedSubFields([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${heroBg})` }}
        ></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
              Nền tảng đặt sân thể thao <br />
              <span className="text-blue-400">số 1 Đại Cồ Việt</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-blue-100 font-light">
              Kết nối đam mê, đặt sân dễ dàng. Tìm kiếm và đặt lịch ngay cho
              trận đấu tiếp theo của bạn.
            </p>
          </div>
          <div className="max-w-4xl mx-auto shadow-2xl rounded-lg overflow-hidden relative z-20">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Sports Types Section - Quick Access */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Khám phá theo môn thể thao
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Lựa chọn bộ môn yêu thích của bạn và tìm sân phù hợp nhất
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <SportCard name="Cầu lông" emoji="🏸" type="BADMINTON" />
            <SportCard name="Bóng rổ" emoji="🏀" type="BASKETBALL" />
            <SportCard name="Bóng đá" emoji="⚽" type="FOOTBALL" />
            <SportCard name="Tennis" emoji="🎾" type="TENNIS" />
            <SportCard name="Pickleball" emoji="🏓" type="PICKLEBALL" />
          </div>
        </div>
      </section>

      {/* Available Sub-fields Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Sân đang trống
              </h2>
              <p className="text-muted-foreground mt-2 text-lg">
                Đặt ngay các sân sẵn sàng phục vụ trong khung giờ tới
              </p>
            </div>
            <Link to="/search?tab=subfields">
              <Button variant="outline" className="hidden sm:flex">
                Xem tất cả
              </Button>
            </Link>
          </div>
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-96 bg-gray-200 animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredSubFields.map((subField) => (
                <div key={subField.id} className="h-full">
                  <SubFieldCard
                    subField={subField}
                    showComplexInfo
                    mode="player"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="mt-8 text-center sm:hidden">
            <Link to="/search?tab=subfields">
              <Button variant="outline" className="w-full">
                Xem tất cả
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Complexes Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Khu phức hợp nổi bật
              </h2>
              <p className="text-muted-foreground mt-2 text-lg">
                Các địa điểm thể thao được đánh giá cao nhất
              </p>
            </div>
            <Link to="/search?tab=complexes">
              <Button variant="outline" className="hidden sm:flex">
                Xem tất cả
              </Button>
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-200 animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {featuredComplexes.map((complex) => (
                <ComplexCard key={complex.id} complex={complex} />
              ))}
            </div>
          )}
          <div className="mt-8 text-center sm:hidden">
            <Link to="/search?tab=complexes">
              <Button variant="outline" className="w-full">
                Xem tất cả
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Quy trình đặt sân đơn giản
            </h2>
            <p className="text-gray-600 text-lg">
              Trải nghiệm đặt sân nhanh chóng chỉ với 3 bước
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-blue-200 -z-10"></div>

            <StepCard
              number="1"
              title="Tìm kiếm"
              description="Tìm sân theo môn thể thao, vị trí hoặc tên sân gần bạn nhất"
            />
            <StepCard
              number="2"
              title="Chọn lịch"
              description="Xem tình trạng sân trống và chọn khung giờ phù hợp với bạn"
            />
            <StepCard
              number="3"
              title="Đặt & Chơi"
              description="Thanh toán an toàn và nhận mã QR check-in ngay lập tức"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556912172-45b7abe8d7e1?q=80&w=2070')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6">Sẵn sàng ra sân?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Tham gia cộng đồng thể thao lớn nhất ngay hôm nay. Đặt sân dễ dàng,
            thi đấu hết mình.
          </p>
          <Link to="/search">
            <Button
              size="lg"
              className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-8 py-6 text-lg h-auto"
            >
              Đặt sân ngay
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <Card className="relative z-10 border-none shadow-none bg-transparent">
      <CardContent className="text-center pt-6">
        <div className="w-16 h-16 bg-white text-blue-600 border-2 border-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg text-2xl font-bold">
          {number}
        </div>
        <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function SportCard({
  name,
  emoji,
  type,
}: {
  name: string;
  emoji: string;
  type: string;
}) {
  return (
    <Link to={`/search?sport_type=${type}`} className="block h-full">
      <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-gray-100 hover:border-blue-100 group">
        <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
          <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
            {emoji}
          </div>
          <p className="text-gray-800 font-semibold group-hover:text-blue-600 transition-colors">
            {name}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
