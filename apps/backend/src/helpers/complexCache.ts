import { prisma } from "@sports-booking-platform/db";

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
    console.log(`Updated cache for complex ${complex.id}`);
  }

  console.log("All complex caches updated!");
};
