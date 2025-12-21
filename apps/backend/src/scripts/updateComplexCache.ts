import { updateAllComplexCache } from "../helpers/complexCache";

/**
 * Script to update all complex caches after adding new fields
 * Run this once after migration
 */
async function main() {
  try {
    console.log("Starting cache update for all complexes...");
    await updateAllComplexCache();
    console.log("Cache update completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error updating complex cache:", error);
    process.exit(1);
  }
}

main();
