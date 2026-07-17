import "../configs/dotenv";
import { findSimilarSubfields } from "../helpers/recommendation";
import { prisma } from "../libs/prisma";
import { closeRedis, initRedis } from "../libs/redis";

async function runEvaluation() {
  console.log("==================================================");
  console.log("  RECOMMENDATION SYSTEM ACCURACY EVALUATION TEST  ");
  console.log("==================================================\n");

  await initRedis();

  // Find all players with bookings
  const players = await prisma.player.findMany({
    where: { status: "ACTIVE" },
    include: {
      bookings: {
        where: { status: "CONFIRMED" },
        orderBy: { start_time: "asc" }
      }
    }
  });

  const evaluablePlayers = players.filter(p => p.bookings.length >= 5);

  if (evaluablePlayers.length === 0) {
    console.log("⚠️ No active players found with >= 5 confirmed bookings.");
    console.log("Running SIMULATION-BASED RULE COMPLIANCE EVALUATION...\n");
    await runSimulationEvaluation();
  } else {
    console.log(`Found ${evaluablePlayers.length} players with sufficient booking history for backtesting.`);
    await runBacktesting(evaluablePlayers);
  }
}

/**
 * 1. BACKTESTING EVALUATION METHOD (Offline Backtesting)
 * Splits user booking history: 80% Train (to build vector), 20% Test (Ground Truth)
 * Measures Hit Rate@K and Mean Reciprocal Rank (MRR)
 */
async function runBacktesting(evaluablePlayers: any[]) {
  let hitCountAt5 = 0;
  let hitCountAt10 = 0;
  let sumReciprocalRank = 0;
  let totalEvaluations = 0;

  for (const player of evaluablePlayers) {
    const totalBookings = player.bookings.length;
    const trainCount = Math.floor(totalBookings * 0.8);
    const trainBookings = player.bookings.slice(0, trainCount);
    const testBookings = player.bookings.slice(trainCount);

    if (testBookings.length === 0) continue;

    // Simulate building user vector only using trainBookings
    const { vector } = await buildUserVectorFromSubset(player.id, trainBookings);
    
    // Get top 10 recommended subfields
    const recommendations = await findSimilarSubfields(vector, 10);
    const recommendedIds = recommendations.map(rec => rec.id);

    // Target subfields actually booked in the test set (ground truth)
    const groundTruthIds = Array.from(new Set(testBookings.map((b: any) => b.sub_field_id)));

    // Measure metrics
    let playerHitAt5 = false;
    let playerHitAt10 = false;
    let reciprocalRank = 0;

    for (const truthId of groundTruthIds) {
      const rankIndex = recommendedIds.indexOf(String(truthId));
      if (rankIndex !== -1) {
        if (rankIndex < 5) playerHitAt5 = true;
        if (rankIndex < 10) playerHitAt10 = true;
        
        const rank = rankIndex + 1;
        const rr = 1 / rank;
        if (rr > reciprocalRank) {
          reciprocalRank = rr;
        }
      }
    }

    if (playerHitAt5) hitCountAt5++;
    if (playerHitAt10) hitCountAt10++;
    sumReciprocalRank += reciprocalRank;
    totalEvaluations++;

    console.log(`Player ${player.id.substring(0, 8)}...: Train Bookings: ${trainCount}, Test Bookings: ${testBookings.length}`);
    console.log(`  - Target Subfields: [${groundTruthIds.map((id: any) => id.substring(0, 8)).join(", ")}]`);
    console.log(`  - Top 5 Recs:       [${recommendedIds.slice(0, 5).map(id => id.substring(0, 8)).join(", ")}]`);
    console.log(`  - Result: Hit@5: ${playerHitAt5 ? "✅" : "❌"}, Hit@10: ${playerHitAt10 ? "✅" : "❌"}, Reciprocal Rank: ${reciprocalRank.toFixed(3)}`);
  }

  const hitRateAt5 = (hitCountAt5 / totalEvaluations) * 100;
  const hitRateAt10 = (hitCountAt10 / totalEvaluations) * 100;
  const mrr = sumReciprocalRank / totalEvaluations;

  console.log("\n=================== EVALUATION RESULTS ===================");
  console.log(`Total Players Evaluated:           ${totalEvaluations}`);
  console.log(`Hit Rate @ 5 (HR@5):               ${hitRateAt5.toFixed(2)}%`);
  console.log(`Hit Rate @ 10 (HR@10):             ${hitRateAt10.toFixed(2)}%`);
  console.log(`Mean Reciprocal Rank (MRR):        ${mrr.toFixed(3)}`);
  console.log("==========================================================");
  console.log("💡 Hit Rate@K: Tỉ lệ người chơi được gợi ý đúng ít nhất 1 sân họ thực sự đặt trong tập kiểm thử.");
  console.log("💡 MRR: Đánh giá xem sân phù hợp có được xếp hạng ở các vị trí đầu tiên hay không (càng gần 1.0 càng tốt).");
}

/**
 * Helper to build user vector from a specific subset of bookings (for training evaluation)
 */
async function buildUserVectorFromSubset(playerId: string, bookingsSubset: any[]): Promise<{ vector: number[] }> {
  if (bookingsSubset.length === 0) {
    return { vector: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5] };
  }

  // Same feature aggregations as vectorBuilder.ts but on subset
  const sportsCount: Record<string, number> = {};
  let totalHour = 0;
  let weekendCount = 0;
  let totalPrice = 0;
  const districtCount: Record<string, number> = {};
  let totalRating = 0;
  let ratingCount = 0;

  // Need to hydrate booking info manually
  const hydratedBookings = await prisma.booking.findMany({
    where: { id: { in: bookingsSubset.map(b => b.id) } },
    include: {
      sub_field: {
        select: {
          sport_type: true,
          complex: { select: { complex_address: true } }
        }
      },
      review: { select: { rating: true } }
    }
  });

  for (const b of hydratedBookings) {
    sportsCount[b.sub_field.sport_type] = (sportsCount[b.sub_field.sport_type] || 0) + 1;
    totalHour += b.start_time.getHours();
    const day = b.start_time.getDay();
    if (day === 0 || day === 6) weekendCount++;
    totalPrice += Number(b.total_price);
    
    const address = b.sub_field.complex.complex_address;
    const parts = address.split(",").map(p => p.trim());
    if (parts.length >= 2) {
      const cleanD = parts[parts.length - 2].toLowerCase().trim();
      districtCount[cleanD] = (districtCount[cleanD] || 0) + 1;
    }
    if (b.review) {
      totalRating += b.review.rating;
      ratingCount++;
    }
  }

  const { normalizeSport, normalizeHour, normalizeWeekday, normalizePrice, normalizeDistrict, normalizeRating, normalizeFrequency, normalizeRecency } = require("../helpers/recommendation/normalizer");
  const { getRecommendationStats } = require("../helpers/recommendation");
  const { minPrice, maxPrice } = await getRecommendationStats();

  const mostFrequentSport = Object.keys(sportsCount).reduce((a, b) => sportsCount[a] > sportsCount[b] ? a : b) as any;
  const avgHour = totalHour / hydratedBookings.length;
  const weekendRatio = weekendCount / hydratedBookings.length;
  const avgPrice = totalPrice / hydratedBookings.length;
  const mostFrequentDistrict = Object.keys(districtCount).reduce((a, b) => districtCount[a] > districtCount[b] ? a : b, "");
  const avgRating = ratingCount > 0 ? totalRating / ratingCount : null;

  const vector = [
    normalizeSport(mostFrequentSport),
    normalizeHour(avgHour),
    normalizeWeekday(weekendRatio),
    normalizePrice(avgPrice, minPrice, maxPrice),
    normalizeDistrict(mostFrequentDistrict),
    normalizeRating(avgRating),
    normalizeFrequency(hydratedBookings.length),
    normalizeRecency(1) // mock recency as 1 day ago
  ];

  return { vector };
}

/**
 * 2. SIMULATION EVALUATION METHOD (Rule Compliance Evaluation)
 * Simulates standard profiles and checks if vector matches the target subfields.
 */
async function runSimulationEvaluation() {
  console.log("Simulating 3 specific target player profiles:\n");

  // Fetch some subfields to test matching
  const subfields = await prisma.subField.findMany({
    take: 10,
    include: { complex: true }
  });

  if (subfields.length === 0) {
    console.log("❌ Error: No subfields found in database to evaluate.");
    return;
  }

  // Profile 1: Loves Football, low budget, plays mostly in Hanoi
  const profileFootball = [
    1.0,  // Football
    0.7,  // Afternoon/Evening (approx 17:00)
    0.3,  // Mostly weekdays
    0.1,  // Low price
    0.9,  // North coordinate projection (Hanoi area)
    0.8,  // High rating preference
    0.5,  // Medium frequency
    0.9   // Active recently
  ];

  // Profile 2: Loves Badminton, plays mostly in TP.HCM
  const profileBadminton = [
    0.2,  // Badminton
    0.8,  // Night (approx 19:00)
    0.8,  // Mostly weekends
    0.4,  // Medium price
    0.1,  // South coordinate projection (TP.HCM area)
    0.8,  // High rating preference
    0.5,
    0.9
  ];

  const profiles = [
    { name: "Football Fan (Hanoi)", vector: profileFootball, targetSport: "FOOTBALL" },
    { name: "Badminton Weekend (TP.HCM)", vector: profileBadminton, targetSport: "BADMINTON" }
  ];

  for (const p of profiles) {
    console.log(`Evaluating profile: "${p.name}"`);
    const recommendations = await findSimilarSubfields(p.vector, 5);
    
    let matchSportCount = 0;
    
    recommendations.forEach((rec, idx) => {
      const isSportMatch = rec.sport_type === p.targetSport;
      if (isSportMatch) matchSportCount++;
      console.log(`  [Rank ${idx + 1}] Field: ${rec.sub_field_name} | Sport: ${rec.sport_type} | Similarity Score: ${(rec.similarity_score * 100).toFixed(1)}% | Match Sport: ${isSportMatch ? "✅" : "❌"}`);
    });

    const accuracyRate = (matchSportCount / recommendations.length) * 100;
    console.log(`➡️  Sport Type matching accuracy for Top 5: ${accuracyRate.toFixed(1)}%\n`);
  }
}

runEvaluation()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await closeRedis();
    process.exit(0);
  });
