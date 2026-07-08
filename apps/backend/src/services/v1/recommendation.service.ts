import crypto from "crypto";
import config from "../../configs/dotenv";
import { CACHE_KEYS, cacheHelper } from "../../helpers/cache";
import {
  buildSubfieldVector,
  buildUserVector,
  findSimilarSubfields,
  RerankCandidate,
  rerankWithGemini,
  SPORT_NAME_MAP,
  translatePreferredDays,
  translatePreferredTime,
  updateSubfieldEmbedding,
  UserProfileSummary,
} from "../../helpers/recommendation";
import { prisma } from "../../libs/prisma";
import { acquireLock, releaseLock } from "../../libs/redis";
import { ForbiddenError } from "../../utils/error.response";

interface RecommendationItem {
  sub_field_id: string;
  score: number;
  reason: string | null;
  sub_field?: Record<string, unknown>;
}

interface RecommendationResponse {
  type: "PERSONALIZED" | "POPULAR";
  items: RecommendationItem[];
  generated_at: string;
}

export const getPopularFallback = async (): Promise<RecommendationResponse> => {
  const cacheKey = CACHE_KEYS.RECOMMENDATION_POPULAR;
  const cached = await cacheHelper.get<RecommendationResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  const popularSubfields = await prisma.subField.findMany({
    where: { isDelete: false },
    orderBy: [{ avg_rating: "desc" }, { total_reviews: "desc" }],
    take: 10,
    include: {
      complex: {
        select: {
          id: true,
          complex_name: true,
          complex_address: true,
        },
      },
      pricing_rules: {
        select: {
          base_price: true,
        },
        orderBy: { base_price: "asc" },
        take: 1,
      },
    },
  });

  const response: RecommendationResponse = {
    type: "POPULAR",
    generated_at: new Date().toISOString(),
    items: popularSubfields.map((subfield) => ({
      sub_field_id: subfield.id,
      score: 1.0,
      reason: "Sân được nhiều người yêu thích",
      sub_field: {
        id: subfield.id,
        sub_field_name: subfield.sub_field_name,
        sport_type: subfield.sport_type,
        avg_rating: subfield.avg_rating,
        sub_field_image: subfield.sub_field_image,
        complex: subfield.complex,
        price_min:
          subfield.pricing_rules.length > 0
            ? subfield.pricing_rules[0].base_price
            : null,
      },
    })),
  };

  // Lưu kết quả vào bộ đệm trong 1 giờ
  await cacheHelper.set(cacheKey, response, 3600);
  return response;
};

export const getRecommendationsForPlayer = async (
  playerId: string,
): Promise<RecommendationResponse> => {
  const player = await prisma.player.findUnique({
    where: { id: playerId, status: "ACTIVE" },
  });
  if (!player) {
    throw new ForbiddenError(
      "You are not allowed to use recommendations because your account is inactive or not found",
    );
  }

  const cacheKey = CACHE_KEYS.RECOMMENDATION(playerId);

  const cached = await cacheHelper.get<RecommendationResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  // tạo lock tránh race condition
  const lockKey = CACHE_KEYS.RECOMMENDATION_LOCK(playerId);
  const lockValue = crypto.randomUUID();
  let locked = false;
  let retries = 0;

  while (!locked && retries < 3) {
    locked = await acquireLock(
      lockKey,
      lockValue,
      config.RECOMMENDATION_LOCK_TTL,
    );
    if (!locked) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const concurrentCached = await cacheHelper.get<RecommendationResponse>(cacheKey);
      if (concurrentCached) return concurrentCached;
      retries++;
    }
  }

  try {
    // 3. Đếm số đơn đặt sân để kiểm tra điều kiện khởi đầu lạnh
    const { vector, sampleSize, rawPreferences } = await buildUserVector(playerId);

    if (sampleSize < 3) {
      const response = await getPopularFallback();
      if (locked) {
        // Lưu kết quả phổ biến riêng cho người chơi này với thời gian sống ngắn (1 giờ)
        await cacheHelper.set(cacheKey, response, 3600);
      }
      return response;
    }

    // 4. Lấy danh sách ID sân con đã đặt trong vòng 14 ngày để loại trừ khỏi gợi ý
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const recentBookings = await prisma.booking.findMany({
      where: {
        player_id: playerId,
        start_time: { gte: fourteenDaysAgo },
      },
      select: { sub_field_id: true },
    });
    const excludeIds = recentBookings.map((b) => b.sub_field_id);

    // 5. Tìm kiếm các sân tương đồng bằng pgvector
    const similarSubfields = await findSimilarSubfields(vector, 20, excludeIds);

    if (similarSubfields.length === 0) {
      return getPopularFallback();
    }

    // Chuẩn bị danh sách sân ứng viên cho mô hình Gemini
    const sortedIds = similarSubfields.map((sf) => sf.id);
    const hydratedSubfields = await prisma.subField.findMany({
      where: { id: { in: sortedIds } },
      include: {
        complex: {
          select: { id: true, complex_name: true, complex_address: true },
        },
        pricing_rules: {
          select: { base_price: true },
          orderBy: { base_price: "asc" },
          take: 1,
        },
      },
    });

    // Ánh xạ thông tin chi tiết đã điền về lại theo đúng thứ tự tương đồng ban đầu
    const candidates: RerankCandidate[] = similarSubfields.map((simSf) => {
      const hydrated = hydratedSubfields.find((h) => h.id === simSf.id);
      return {
        id: simSf.id,
        name: hydrated?.sub_field_name || "",
        complex_name: hydrated?.complex?.complex_name || "",
        district: hydrated?.complex?.complex_address || "",
        sport_type: hydrated?.sport_type || "",
        avg_rating: hydrated?.avg_rating ?? null,
        price_min: hydrated?.pricing_rules?.[0]?.base_price || 0,
        similarity_score: simSf.similarity_score,
      };
    });

    // Chuyển đổi hồ sơ người dùng thô sang dạng ngôn ngữ tự nhiên
    const favoriteSport = rawPreferences
      ? (SPORT_NAME_MAP[rawPreferences.favoriteSport] || rawPreferences.favoriteSport)
      : "Không xác định";

    const preferredTime = rawPreferences
      ? translatePreferredTime(rawPreferences.avgHour)
      : "Không xác định";

    const preferredDays = rawPreferences
      ? translatePreferredDays(rawPreferences.weekendRatio)
      : "Không xác định";

    const averagePrice = rawPreferences
      ? `${Math.round(rawPreferences.avgPrice).toLocaleString("vi-VN")} đ/giờ`
      : "Không xác định";

    const preferredDistrict = rawPreferences
      ? rawPreferences.preferredDistrict
      : "Không xác định";

    const averageRating = rawPreferences && rawPreferences.avgRating
      ? `${Math.round(Number(rawPreferences.avgRating) * 10) / 10}`
      : "Không xác định";

    // Lấy context thời gian thực tại Việt Nam
    const now = new Date();
    const currentTimeStr = now.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Ho_Chi_Minh",
    });

    const weekdaysVi = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
  
    const vnDate = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const currentDayOfWeek = weekdaysVi[vnDate.getUTCDay()];
    const isWeekend = vnDate.getUTCDay() === 0 || vnDate.getUTCDay() === 6;

    const userProfileSummary: UserProfileSummary = {
      player_id: playerId,
      recent_bookings_count: sampleSize,
      favorite_sport: favoriteSport,
      preferred_time: preferredTime,
      preferred_days: preferredDays,
      average_price: averagePrice,
      preferred_district: preferredDistrict,
      average_rating: averageRating,
      current_context: {
        time: currentTimeStr,
        day_of_week: currentDayOfWeek,
        is_weekend: isWeekend,
      },
    };

    let rerankedItems: { sub_field_id: string; score: number; reason: string | null }[] = [];
    try {
      // 6. Gọi Gemini xếp hạng lại danh sách sân
      rerankedItems = await rerankWithGemini(userProfileSummary, candidates);
    } catch (error) {
      console.warn(
        "Gọi Gemini để xếp hạng lại thất bại, chuyển sang lấy top 10 kết quả tương đồng véc-tơ:",
        error,
      );
      // Phương án dự phòng: Lấy top 10 từ kết quả tìm kiếm tương đồng véc-tơ
      rerankedItems = similarSubfields.slice(0, 10).map((sf) => ({
        sub_field_id: sf.id,
        score: sf.similarity_score,
        reason: null,
      }));
    }

    // 7. Chuẩn bị dữ liệu phản hồi cuối cùng
    const finalIds = rerankedItems.map((item) => item.sub_field_id);
    const finalHydrated = hydratedSubfields.filter((sf) =>
      finalIds.includes(sf.id),
    );

    const items: RecommendationItem[] = rerankedItems.map((item) => {
      const hydrated = finalHydrated.find((sf) => sf.id === item.sub_field_id);
      return {
        sub_field_id: item.sub_field_id,
        score: item.score,
        reason: item.reason,
        sub_field: hydrated
          ? {
              id: hydrated.id,
              sub_field_name: hydrated.sub_field_name,
              sport_type: hydrated.sport_type,
              avg_rating: hydrated.avg_rating,
              sub_field_image: hydrated.sub_field_image,
              complex: hydrated.complex,
              price_min:
                hydrated.pricing_rules.length > 0
                  ? hydrated.pricing_rules[0].base_price
                  : null,
            }
          : undefined,
      };
    });

    const response: RecommendationResponse = {
      type: "PERSONALIZED",
      generated_at: new Date().toISOString(),
      items,
    };

    // 9. Lưu kết quả gợi ý mới vào bộ nhớ đệm
    if (locked) {
      await cacheHelper.set(
        cacheKey,
        response,
        config.RECOMMENDATION_CACHE_TTL,
      );
    }

    return response;
  } finally {
    if (locked) {
      await releaseLock(lockKey, lockValue);
    }
  }
};

export const invalidatePlayerRecommendation = async (playerId: string) => {
  await cacheHelper.del(CACHE_KEYS.RECOMMENDATION(playerId));
};

export const recomputeSubfieldEmbedding = async (subfieldId: string) => {
  try {
    const vector = await buildSubfieldVector(subfieldId);
    await updateSubfieldEmbedding(subfieldId, vector);
  } catch (error) {
    console.error(
      `[Background Hook] Failed to recompute subfield embedding for ${subfieldId}`,
      error,
    );
    // Fire-and-forget: Không throw lỗi ở đây để tránh làm gián đoạn luồng tạo/sửa sân hoặc tạo nhận xét
  }
};
