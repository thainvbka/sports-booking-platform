import { prisma } from "@sports-booking-platform/db";
import { updateComplexCache } from "../helpers/complexCache";

/**
 * Script to populate cache for all existing complexes
 * Run this once to update min_price, max_price, total_subfields, sport_types for existing data
 */
async function populateAllComplexCache() {
  try {
    console.log("Starting to populate complex cache...");

    // Get all complexes
    const complexes = await prisma.complex.findMany({
      select: {
        id: true,
        complex_name: true,
      },
    });

    console.log(`Found ${complexes.length} complexes to update`);

    // Update cache for each complex
    let successCount = 0;
    let errorCount = 0;

    for (const complex of complexes) {
      try {
        await updateComplexCache(complex.id);
        successCount++;
        console.log(`Updated cache for: ${complex.complex_name}`);
      } catch (error) {
        errorCount++;
        console.error(
          `Failed to update cache for: ${complex.complex_name}`,
          error
        );
      }
    }

    console.log("\nSummary:");
    console.log(`Successfully updated: ${successCount}`);
    console.log(`Failed: ${errorCount}`);
    console.log("Cache population completed!");

    process.exit(0);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

// Run the script
populateAllComplexCache();
