import { prisma } from "../libs/prisma";
import redis from "../libs/redis";

// Default expiration time (1 hour)
const DEFAULT_EXPIRATION = 3600;

export const cacheHelper = {
  /**
   * Set data to Redis cache
   */
  set: async (key: string, value: any, expiration = DEFAULT_EXPIRATION) => {
    try {
      await redis.set(key, JSON.stringify(value), "EX", expiration);
    } catch (error) {
      console.error("Redis Set Error:", error);
    }
  },

  /**
   * Get data from Redis cache
   */
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Redis Get Error:", error);
      return null;
    }
  },

  /**
   * Delete data from Redis cache
   */
  del: async (key: string) => {
    try {
      await redis.del(key);
    } catch (error) {
      console.error("Redis Del Error:", error);
    }
  },

  /**
   * Delete keys by pattern
   */
  delByPattern: async (pattern: string) => {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error("Redis DelByPattern Error:", error);
    }
  },
};

/**
 * Update cached statistics for a complex
 * This should be called whenever subfields or pricing rules change
 */
export const updateComplexCache = async (complexId: string) => {
  // Get all active subfields with their pricing rules
  const subfields = await prisma.subField.findMany({
    where: {
      complex_id: complexId,
      isDelete: false,
    },
    include: {
      pricing_rules: {
        select: {
          base_price: true,
        },
      },
    },
  });

  // Calculate statistics
  const allPrices = subfields
    .flatMap((sf) => sf.pricing_rules.map((pr) => Number(pr.base_price)))
    .filter((price) => price > 0);

  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : null;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : null;
  const totalSubfields = subfields.length;
  const sportTypes = [...new Set(subfields.map((sf) => sf.sport_type))];

  // Update complex with cached data
  await prisma.complex.update({
    where: { id: complexId },
    data: {
      min_price: minPrice,
      max_price: maxPrice,
      total_subfields: totalSubfields,
      sport_types: sportTypes,
    },
  });
};

/**
 * Update cached rating for a specific subfield
 */
export const updateSubfieldRatingCache = async (subfieldId: string) => {
  const aggregate = await prisma.review.aggregate({
    where: { subfield_id: subfieldId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.subField.update({
    where: { id: subfieldId },
    data: {
      avg_rating: aggregate._avg.rating,
      total_reviews: aggregate._count.rating,
    },
  });
};

/**
 * Update cached rating for a specific complex
 */
export const updateComplexRatingCache = async (complexId: string) => {
  const aggregate = await prisma.review.aggregate({
    where: {
      subfield: {
        complex_id: complexId,
      },
    },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.complex.update({
    where: { id: complexId },
    data: {
      avg_rating: aggregate._avg.rating,
      total_reviews: aggregate._count.rating,
    },
  });
};

/**
 * Batch update cache for multiple complexes
 */
export const batchUpdateComplexCache = async (complexIds: string[]) => {
  await Promise.all(complexIds.map((id) => updateComplexCache(id)));
};

/**
 * Update cache for all complexes (useful for initial migration)
 */
export const updateAllComplexCache = async () => {
  const complexes = await prisma.complex.findMany({
    select: { id: true },
  });

  console.log(`Updating cache for ${complexes.length} complexes...`);

  for (const complex of complexes) {
    await updateComplexCache(complex.id);
    await updateComplexRatingCache(complex.id);
    console.log(`Updated cache for complex ${complex.id}`);
  }

  console.log("All complex caches updated!");
};
