-- CreateEnum
CREATE TYPE "MatchSkillLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MatchStatus" ADD VALUE 'CLOSED';
ALTER TYPE "MatchStatus" ADD VALUE 'EXPIRED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ParticipantStatus" ADD VALUE 'WITHDRAWN';
ALTER TYPE "ParticipantStatus" ADD VALUE 'REMOVED';

-- DropIndex
DROP INDEX "MatchParticipant_match_id_status_idx";

-- DropIndex
DROP INDEX "MatchParticipant_player_id_idx";

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "closed_reason" VARCHAR(200),
ADD COLUMN     "join_deadline" TIMESTAMPTZ(0),
ADD COLUMN     "skill_level" "MatchSkillLevel" NOT NULL DEFAULT 'INTERMEDIATE',
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "MatchParticipant" ADD COLUMN     "left_at" TIMESTAMPTZ(0),
ADD COLUMN     "responded_at" TIMESTAMPTZ(0);

-- CreateIndex
CREATE INDEX "Match_join_deadline_status_idx" ON "Match"("join_deadline", "status");

-- CreateIndex
CREATE INDEX "MatchParticipant_match_id_status_created_at_idx" ON "MatchParticipant"("match_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "MatchParticipant_player_id_status_created_at_idx" ON "MatchParticipant"("player_id", "status", "created_at");
