import { prisma } from "../libs/prisma";
import { getRedis } from "../libs/redis";

// Default expiration time (1 hour)
const DEFAULT_EXPIRATION = 3600;

/**
 * Cache key constants for organized key management
 */
export const CACHE_KEYS = {
  // Individual resources (High TTL: 2 hours)
  COMPLEX: (id: string) => `complex:${id}`,
  SUBFIELD: (id: string) => `subfield:${id}`,

  // List endpoints (High TTL: 2 hours)
  COMPLEXES_LIST: (page: number, limit: number) => `complexes:list:${page}:${limit}`,
  SUBFIELDS_LIST: (page: number, limit: number) => `subfields:list:${page}:${limit}`,

  // Reviews (Medium TTL: 30 minutes)
  SUBFIELD_REVIEWS: (id: string) => `subfield:${id}:reviews`,

  // Pricing Rules (Medium TTL: 30 minutes) - OWNER only
  PRICING_RULES: (subfieldId: string, dayOfWeek: number) => `pricing:${subfieldId}:${dayOfWeek}`,

  // Matches (Short TTL: 5 minutes) - PUBLIC
  MATCH: (id: string) => `match:${id}`,
  MATCHES_LIST: (page: number, limit: number) => `matches:list:${page}:${limit}`,
  MATCH_PARTICIPANTS: (matchId: string, page: number, limit: number) => `match:${matchId}:participants:${page}:${limit}`,

  // Pattern wildcards for invalidation
  PATTERNS: {
    ALL_COMPLEXES: "complex:*",
    ALL_SUBFIELDS: "subfield:*",
    COMPLEXES_LIST: "complexes:list:*",
    SUBFIELDS_LIST: "subfields:list:*",
    SUBFIELD_REVIEWS: "subfield:*:reviews:*",
    PRICING_RULES: "pricing:*",
    ALL_MATCHES: "match:*",
    MATCHES_LIST: "matches:list:*",
    MATCH_PARTICIPANTS: "match:*:participants:*",
  },
};

// TTL configurations (in seconds)
export const CACHE_TTL = {
  RESOURCE: 7200, // 2 hours for individual resources (complex, subfield)
  LIST: 3600, // 1 hour for list endpoints
  REVIEWS: 1800, // 30 minutes for reviews
  MATCHES: 300, // 5 minutes for matches (volatile - status changes frequently)
  PRICING: 1800, // 30 minutes for pricing rules
  AVAILABILITY: 300, // 5 minutes for availability (if cached)
};

/**
 * Build cache key for complex list with filters
 * NOTE: Search is NOT cached due to infinite combinations
 * Only cache stable filters (types, price ranges)
 */
export const buildComplexListCacheKey = (params: {
  page?: number;
  limit?: number;
  sport_types?: string[];
  minPrice?: number;
  maxPrice?: number;
}): string => {
  const { page = 1, limit = 8, sport_types, minPrice, maxPrice } = params;
  
  let key = `complexes:list:${page}:${limit}`;
  
  if (sport_types?.length) key += `:types=${sport_types.join(",")}`;
  if (minPrice !== undefined) key += `:minPrice=${minPrice}`;
  if (maxPrice !== undefined) key += `:maxPrice=${maxPrice}`;
  
  return key;
};

/**
 * Build cache key for subfield list with filters
 * NOTE: Search is NOT cached due to infinite combinations
 * Only cache stable filters (types, capacity, price ranges)
 */
export const buildSubfieldListCacheKey = (params: {
  page?: number;
  limit?: number;
  sport_types?: string[];
  minCapacity?: number;
  maxCapacity?: number;
  minPrice?: number;
  maxPrice?: number;
}): string => {
  const { page = 1, limit = 8, sport_types, minCapacity, maxCapacity, minPrice, maxPrice } = params;
  
  let key = `subfields:list:${page}:${limit}`;
  
  if (sport_types?.length) key += `:types=${sport_types.join(",")}`;
  if (minCapacity !== undefined) key += `:minCap=${minCapacity}`;
  if (maxCapacity !== undefined) key += `:maxCap=${maxCapacity}`;
  if (minPrice !== undefined) key += `:minPrice=${minPrice}`;
  if (maxPrice !== undefined) key += `:maxPrice=${maxPrice}`;
  
  return key;
};

/**
 * Build cache key for subfield reviews with filters
 * Includes pagination, rating filter, image filter, and sort order
 */
export const buildReviewsCacheKey = (params: {
  subfield_id: string;
  page?: number;
  limit?: number;
  rating?: number;
  has_images?: boolean;
  sort_by?: "newest" | "oldest" | "rating_desc" | "rating_asc";
}): string => {
  const { subfield_id, page = 1, limit = 10, rating, has_images, sort_by = "newest" } = params;
  
  let key = `subfield:${subfield_id}:reviews:${page}:${limit}:${sort_by}`;
  
  if (rating !== undefined) key += `:rating=${rating}`;
  if (has_images) key += `:has_images=true`;
  
  return key;
};

/**
 * Build cache key for pricing rules by day
 * Owner-only, tied to specific subfield and day
 */
export const buildPricingRulesCacheKey = (params: {
  subfield_id: string;
  day_of_week: number;
}): string => {
  const { subfield_id, day_of_week } = params;
  return `pricing:${subfield_id}:${day_of_week}`;
};

/**
 * Build cache key for public matches list
 * NOTE: Search, time filters NOT cached - exclude to prevent bloat & ensure freshness
 * Only cache stable filters (sport_type, skill_level, status, sort)
 */
export const buildPublicMatchesCacheKey = (params: {
  page?: number;
  limit?: number;
  sport_type?: string;
  skill_level?: string;
  status?: string;
  sort?: string;
}): string => {
  const { page = 1, limit = 20, sport_type, skill_level, status, sort = "created_at:desc" } = params;
  
  let key = `matches:list:${page}:${limit}:${sort}`;
  
  if (sport_type) key += `:sport=${sport_type}`;
  if (skill_level) key += `:skill=${skill_level}`;
  if (status) key += `:status=${status}`;
  
  return key;
};

/**
 * Build cache key for match detail
 * Short TTL because status changes frequently (OPEN → FULL → CLOSED, etc)
 */
export const buildMatchDetailCacheKey = (matchId: string): string => {
  return `match:${matchId}`;
};

/**
 * Build cache key for match participants
 * Creator-only view, stable data (participants list doesn't change often)
 */
export const buildMatchParticipantsCacheKey = (params: {
  match_id: string;
  page?: number;
  limit?: number;
  status?: string;
}): string => {
  const { match_id, page = 1, limit = 10, status = "ALL" } = params;
  
  let key = `match:${match_id}:participants:${page}:${limit}:${status}`;
  
  return key;
};

export const cacheHelper = {
  /**
   * Set data to Redis cache
   */
  set: async (key: string, value: any, expiration: number = DEFAULT_EXPIRATION) => {
    try {
      const redis = getRedis();
      await redis.set(key, JSON.stringify(value), {
        EX: expiration,
      });
    } catch (error) {
      console.error("Redis Set Error:", error);
    }
  },

  /**
   * Get data from Redis cache
   */
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const redis = getRedis();
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
      const redis = getRedis();
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
      const redis = getRedis();
      const pipeline = redis.multi();
      let hasAnyKey = false;

      // Use SCAN instead of KEYS to avoid blocking Redis on large keyspaces.
      for await (const key of redis.scanIterator({ MATCH: pattern, COUNT: 100 })) {
        const keys = Array.isArray(key) ? key : [key];
        for (const item of keys) {
          pipeline.del(item);
          hasAnyKey = true;
        }
      }

      if (hasAnyKey) {
        await pipeline.exec();
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
