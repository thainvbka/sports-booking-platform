import { PlayerDarkHeroShell } from "@/components/shared/layout/PlayerDarkHeroShell";

export function BookingHistoryHero() {
  return (
    <PlayerDarkHeroShell
      breadcrumbs={[
        { label: "Trang chủ", href: "/" },
        { label: "Lịch sử đặt sân" },
      ]}
      title={
        <h1 className="font-display text-4xl font-black italic leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
          Hành trình đặt{" "}
          <span className="bg-linear-to-br from-primary via-primary to-accent-sport bg-clip-text text-transparent">
            sân
          </span>
          <br className="hidden sm:block" />
          in dấu bước chân
        </h1>
      }
      description={
        <p className="text-base text-white/70 sm:text-lg">
          Mỗi lịch đặt là một trận sắp đá, một hóa đơn cần chốt hoặc một kỉ niệm đã
          khép. Theo dõi, thanh toán, hủy lịch và đánh giá sân ở cùng một nơi.
        </p>
      }
    />
  );
}

