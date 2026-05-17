import { SportType } from "@prisma/client";
import { prisma } from "../../libs/prisma";
import { NotFoundError } from "../../utils/error.response";
import { getRecommendationStats } from "./index";
import {
  normalizeDistrict,
  normalizeFrequency,
  normalizeHour,
  normalizePrice,
  normalizeRating,
  normalizeRecency,
  normalizeSport,
  normalizeWeekday,
} from "./normalizer";

export const buildUserVector = async (
  playerId: string,
): Promise<{ vector: number[]; sampleSize: number }> => {
  const bookings = await prisma.booking.findMany({
    where: {
      player_id: playerId,
      status: "CONFIRMED",
      end_time: {
        lt: new Date(),
      },
    },
    orderBy: {
      end_time: "desc",
    },
    take: 30,
    include: {
      sub_field: {
        select: {
          sport_type: true,
          complex: {
            select: { complex_address: true },
          },
        },
      },
      review: {
        select: { rating: true },
      },
    },
  });

  const sampleSize = bookings.length;
  if (sampleSize === 0) {
    return { vector: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], sampleSize: 0 };
  }

  // Calculate features
  const sportsCount: Record<string, number> = {};
  let totalHour = 0;
  let weekendCount = 0;
  let totalPrice = 0;
  const districtCount: Record<string, number> = {};
  let totalRating = 0;
  let ratingCount = 0;
  let mostRecentDate = new Date(0);

  for (const b of bookings) {
    // Sport
    sportsCount[b.sub_field.sport_type] =
      (sportsCount[b.sub_field.sport_type] || 0) + 1;

    // Hour
    totalHour += b.start_time.getHours();

    // Weekday
    const day = b.start_time.getDay();
    if (day === 0 || day === 6) {
      weekendCount++;
    }

    // Price
    totalPrice += Number(b.total_price);

    // District
    const address = b.sub_field.complex.complex_address;
    districtCount[address] = (districtCount[address] || 0) + 1;

    // Rating
    if (b.review) {
      totalRating += b.review.rating;
      ratingCount++;
    }

    // Recency
    if (b.end_time > mostRecentDate) {
      mostRecentDate = b.end_time;
    }
  }

  const { minPrice, maxPrice } = await getRecommendationStats();

  // Aggregate
  const mostFrequentSport = Object.keys(sportsCount).reduce((a, b) =>
    sportsCount[a] > sportsCount[b] ? a : b,
  ) as SportType;
  const avgHour = totalHour / sampleSize;
  const weekendRatio = weekendCount / sampleSize;
  const avgPrice = totalPrice / sampleSize;
  const mostFrequentDistrictAddress = Object.keys(districtCount).reduce(
    (a, b) => (districtCount[a] > districtCount[b] ? a : b),
  );
  const avgRating = ratingCount > 0 ? totalRating / ratingCount : null;
  const daysSinceLastBooking = Math.max(
    0,
    (new Date().getTime() - mostRecentDate.getTime()) / (1000 * 3600 * 24),
  );

  const vector = [
    normalizeSport(mostFrequentSport),
    normalizeHour(avgHour),
    normalizeWeekday(weekendRatio),
    normalizePrice(avgPrice, minPrice, maxPrice),
    normalizeDistrict(mostFrequentDistrictAddress),
    normalizeRating(avgRating), // fallback inside normalizer if null
    normalizeFrequency(sampleSize),
    normalizeRecency(daysSinceLastBooking),
  ];

  return { vector, sampleSize };
};

export const buildSubfieldVector = async (
  subfieldId: string,
): Promise<number[]> => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000);

  const [subfield, bookingsInLast30Days] = await Promise.all([
    prisma.subField.findUnique({
      where: { id: subfieldId },
      select: {
        sport_type: true,
        avg_rating: true,
        complex: {
          select: { complex_address: true },
        },
        pricing_rules: {
          select: {
            start_time: true,
            end_time: true,
            day_of_week: true,
            base_price: true,
          },
        },
      },
    }),
    prisma.booking.count({
      where: {
        sub_field_id: subfieldId,
        start_time: { gte: thirtyDaysAgo },
      },
    }),
  ]);

  if (!subfield) {
    throw new NotFoundError("Subfield not found");
  }

  const { minPrice, maxPrice, maxSubfieldFrequency } = await getRecommendationStats();

  // Pricing rules hour dominance
  let avgHour = 12; // default if no rules
  let weekendRulesCount = 0;
  let avgBasePrice = 0;

  if (subfield.pricing_rules.length > 0) {
    let totalRuleHours = 0;
    let totalBasePrice = 0;

    for (const rule of subfield.pricing_rules) {
      // approximate the middle hour of the ruling
      const start = rule.start_time.getHours();
      const end = rule.end_time.getHours();
      totalRuleHours += (start + end) / 2;

      if (rule.day_of_week === 0 || rule.day_of_week === 6) {
        weekendRulesCount++;
      }

      totalBasePrice += Number(rule.base_price);
    }

    avgHour = totalRuleHours / subfield.pricing_rules.length;
    avgBasePrice = totalBasePrice / subfield.pricing_rules.length;
  }

  const weekendRatio =
    subfield.pricing_rules.length > 0
      ? weekendRulesCount / subfield.pricing_rules.length
      : 0;

  const vector = [
    normalizeSport(subfield.sport_type),
    normalizeHour(avgHour),
    normalizeWeekday(weekendRatio),
    normalizePrice(avgBasePrice, minPrice, maxPrice),
    normalizeDistrict(subfield.complex.complex_address),
    normalizeRating(subfield.avg_rating ? Number(subfield.avg_rating) : null),
    normalizeFrequency(bookingsInLast30Days, maxSubfieldFrequency),
    1.0, // Subfield recency is always 1.0
  ];

  return vector;
};
