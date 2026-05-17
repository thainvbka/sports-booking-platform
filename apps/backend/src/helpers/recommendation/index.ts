import { Prisma } from "@prisma/client";
import { prisma } from "../../libs/prisma";
import { getRedis } from "../../libs/redis";

export {
  normalizeDistrict,
  normalizeFrequency,
  normalizeHour,
  normalizePrice,
  normalizeRating,
  normalizeRecency,
  normalizeSport,
  normalizeWeekday,
} from "./normalizer";

export {
  buildRerankPrompt,
  rerankWithGemini,
  UserProfileSummary,
  RerankCandidate,
} from "./promptBuilder";
export { buildSubfieldVector, buildUserVector } from "./vectorBuilder";

export interface SimilarSubfield {
  id: string;
  sub_field_name: string;
  complex_id: string;
  sport_type: string;
  avg_rating: number | null;
  similarity_score: number;
}

export const getRecommendationStats = async (): Promise<{
  minPrice: number;
  maxPrice: number;
  maxSubfieldFrequency: number;
}> => {
  const CACHE_KEY = "rec:stats";
  const redisClient = getRedis();
  const cached = await redisClient.get(CACHE_KEY);
  if (cached) {
    return JSON.parse(cached);
  }

  const priceResult = await prisma.pricingRule.aggregate({
    _min: { base_price: true },
    _max: { base_price: true },
  });

  const minPrice = priceResult._min.base_price ? Number(priceResult._min.base_price) : 0;
  const maxPrice = priceResult._max.base_price ? Number(priceResult._max.base_price) : 0;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const freqResult = await prisma.booking.groupBy({
    by: ["sub_field_id"],
    where: { start_time: { gte: thirtyDaysAgo } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 1,
  });

  const maxSubfieldFrequency =
    freqResult.length > 0 && freqResult[0]._count.id > 0
      ? freqResult[0]._count.id
      : 30; // fallback

  const stats = { minPrice, maxPrice, maxSubfieldFrequency };
  await redisClient.set(CACHE_KEY, JSON.stringify(stats), { EX: 24 * 60 * 60 });

  return stats;
};

export const updateSubfieldEmbedding = async (
  id: string,
  vector8: number[],
): Promise<void> => {
  const vectorStr = `[${vector8.join(",")}]`;
  await prisma.$executeRaw`
    UPDATE "SubField"
    SET 
      "embedding" = ${vectorStr}::vector,
      "embedding_updated_at" = NOW()
    WHERE "id" = ${id}::uuid
  `;
};

export const findSimilarSubfields = async (
  userVector: number[],
  limit: number = 20,
  excludeIds: string[] = [],
): Promise<SimilarSubfield[]> => {
  const vectorStr = `[${userVector.join(",")}]`;

  if (excludeIds.length > 0) {
    return prisma.$queryRaw<SimilarSubfield[]>`
      SELECT 
        id,
        sub_field_name,
        complex_id,
        sport_type,
        avg_rating,
        1 - ("embedding" <=> ${vectorStr}::vector) as similarity_score
      FROM "SubField"
      WHERE "isDelete" = false 
        AND "embedding" IS NOT NULL
        AND id NOT IN (${Prisma.join(excludeIds.map((id) => Prisma.sql`${id}::uuid`))})
      ORDER BY "embedding" <=> ${vectorStr}::vector
      LIMIT ${limit}
    `;
  }

  return prisma.$queryRaw<SimilarSubfield[]>`
    SELECT 
      id,
      sub_field_name,
      complex_id,
      sport_type,
      avg_rating,
      1 - ("embedding" <=> ${vectorStr}::vector) as similarity_score
    FROM "SubField"
    WHERE "isDelete" = false 
      AND "embedding" IS NOT NULL
    ORDER BY "embedding" <=> ${vectorStr}::vector
    LIMIT ${limit}
  `;
};
