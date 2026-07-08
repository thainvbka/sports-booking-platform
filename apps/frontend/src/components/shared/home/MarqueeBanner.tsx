import { useEffect, useState } from "react";
import { publicService } from "@/services/public.service";
import { matchService } from "@/services/match.service";
import { SPORT_CATEGORIES } from "@/constants";

export function MarqueeBanner() {
  const [announcements, setAnnouncements] = useState<string[]>([
    "🏆 T-Sport - Chốt sân nhanh gọn, Ra trận an tâm!"
  ]);

  useEffect(() => {
    let active = true;
    const fetchAnnouncements = async () => {
      try {
        const [complexesRes, matchesRes] = await Promise.all([
          publicService.getComplexes({ page: 1, limit: 3 }),
          matchService.getPublicMatches({ page: 1, limit: 3, status: "OPEN" }).catch(() => null),
        ]);

        if (!active) return;

        const list: string[] = [];

        // 1. Complexes
        const complexes = complexesRes?.data?.complexes || [];
        complexes.forEach((c) => {
          list.push(`🔥 Khám phá cụm sân "${c.complex_name}" tại ${c.complex_address}!`);
        });

        // 2. Matches
        const matches = matchesRes?.data?.items || [];
        matches.forEach((m) => {
          const emoji = SPORT_CATEGORIES.find((cat) => cat.type === m.sport_type)?.emoji || "🔥";
          const slotsLeft = Math.max(m.slots_needed - m.slots_filled, 0);
          if (slotsLeft > 0) {
            list.push(`${emoji} Kèo đấu: "${m.title}" đang tuyển ${slotsLeft} thành viên, tham gia ngay!`);
          }
        });

        // 3. Fallback/defaults if list is empty
        if (list.length === 0) {
          list.push(
            "🔥 Sân Pickleball Hàng Đẫy giảm giá 20% khung giờ sáng!",
            "⚽ Giải vô địch các Câu lạc bộ Bóng đá phủi Hà Nội sắp khai mạc!",
            "🏸 Đã có hơn 1.200 lượt đặt sân thành công trong 24 giờ qua!",
            "🏓 Đăng ký ngay để tham gia kèo đấu Pickleball giao lưu hấp dẫn tối nay!"
          );
        }

        // Always append general branding
        list.push("🏆 T-Sport - Chốt sân nhanh gọn, Ra trận an tâm!");

        setAnnouncements(list);
      } catch {
        if (!active) return;
        setAnnouncements([
          "🔥 Sân Pickleball Hàng Đẫy giảm giá 20% khung giờ sáng!",
          "⚽ Giải vô địch các Câu lạc bộ Bóng đá phủi Hà Nội sắp khai mạc!",
          "🏸 Đã có hơn 1.200 lượt đặt sân thành công trong 24 giờ qua!",
          "🏓 Đăng ký ngay để tham gia kèo đấu Pickleball giao lưu hấp dẫn tối nay!",
          "🏆 T-Sport - Chốt sân nhanh gọn, Ra trận an tâm!"
        ]);
      }
    };

    fetchAnnouncements();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-primary/10 border-b border-primary/20 py-2.5 text-xs text-primary font-medium tracking-wide">
      <div className="flex w-max animate-marquee gap-8 whitespace-nowrap">
        {[...announcements, ...announcements].map((text, idx) => (
          <span key={idx} className="flex items-center gap-2">
            <span className="inline-block size-1.5 rounded-full bg-accent-sport animate-pulse" />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
