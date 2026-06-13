import { prisma } from "../libs/prisma";

async function main() {
  console.log("Starting production pricing rules timezone migration...");
  
  // Find all pricing rules
  const rules = await prisma.pricingRule.findMany();
  console.log(`Found ${rules.length} pricing rules to inspect.`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const rule of rules) {
    const start = new Date(rule.start_time);
    const end = new Date(rule.end_time);

    // If the timezone offset was already corrected (e.g. they are already aligned to UTC face value),
    // we can skip them. We can determine this by checking if the hour is already face-value (e.g. starts on an even hour).
    // The seeded times are 6, 8, 10, 14, 16, 18, 20.
    // If the UTC hour is odd (like 23, 1, 3, 7, 9, 11, 13) it means it was shifted by -7 hours.
    // So we only shift if it matches the shifted hour pattern.
    const startUtcHour = start.getUTCHours();
    
    // Shifted hours for [6, 8, 10, 12, 14, 16, 18, 20, 22] in UTC+7 are [23, 1, 3, 5, 7, 9, 11, 13, 15] in UTC
    const isShifted = [23, 1, 3, 5, 7, 9, 11, 13, 15].includes(startUtcHour);

    if (isShifted) {
      const newStart = new Date(start.getTime() + 7 * 60 * 60 * 1000);
      const newEnd = new Date(end.getTime() + 7 * 60 * 60 * 1000);

      await prisma.pricingRule.update({
        where: { id: rule.id },
        data: {
          start_time: newStart,
          end_time: newEnd,
        },
      });
      updatedCount++;
    } else {
      skippedCount++;
    }
  }

  console.log(`Migration completed successfully!`);
  console.log(`- Updated: ${updatedCount} rules`);
  console.log(`- Skipped (already correct): ${skippedCount} rules`);
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
