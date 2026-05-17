import { prisma } from "../libs/prisma";
import { initRedis, closeRedis } from "../libs/redis";
import { recomputeSubfieldEmbedding } from "../services/v1/recommendation.service";

async function main() {
  console.log("Starting sub-field embeddings population...");
  await initRedis();

  // Find all sub-fields
  const subfields = await prisma.subField.findMany({
    where: {
      isDelete: false,
    },
    include: {
      complex: true,
    },
  });

  console.log(`Found ${subfields.length} sub-fields to process.`);

  let successCount = 0;
  let errorCount = 0;

  for (const sf of subfields) {
    try {
      console.log(`Processing subfield ${sf.id} (${sf.sub_field_name})...`);
      await recomputeSubfieldEmbedding(String(sf.id));
      successCount++;
      console.log(`Successfully generated embedding for ${sf.id}`);
    } catch (err) {
      errorCount++;
      console.error(`Error processing subfield ${sf.id}:`, err);
    }
  }

  console.log(`\nPopulation Complete!`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${errorCount}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await closeRedis();
    process.exit(0);
  });
