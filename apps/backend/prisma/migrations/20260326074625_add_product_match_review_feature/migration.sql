-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('OPEN', 'FULL', 'CANCELED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentProvider" ADD VALUE 'MOMO';
ALTER TYPE "PaymentProvider" ADD VALUE 'VNPAY';

-- AlterTable
ALTER TABLE "Complex" ADD COLUMN     "avg_rating" DECIMAL(3,2),
ADD COLUMN     "total_reviews" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "complex_id" UUID NOT NULL,
    "sport_type" "SportType",
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingAddon" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "BookingAddon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "creator_id" UUID NOT NULL,
    "sport_type" "SportType" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "slots_needed" SMALLINT NOT NULL,
    "slots_filled" SMALLINT NOT NULL DEFAULT 0,
    "status" "MatchStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchParticipant" (
    "id" UUID NOT NULL,
    "match_id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "status" "ParticipantStatus" NOT NULL DEFAULT 'PENDING',
    "introduction" TEXT,
    "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "MatchParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "subfield_id" UUID NOT NULL,
    "rating" SMALLINT NOT NULL,
    "comment" VARCHAR(500),
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Product_complex_id_idx" ON "Product"("complex_id");

-- CreateIndex
CREATE INDEX "Product_complex_id_sport_type_idx" ON "Product"("complex_id", "sport_type");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");

-- CreateIndex
CREATE INDEX "BookingAddon_booking_id_idx" ON "BookingAddon"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "BookingAddon_booking_id_product_id_key" ON "BookingAddon"("booking_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "Match_booking_id_key" ON "Match"("booking_id");

-- CreateIndex
CREATE INDEX "Match_sport_type_status_idx" ON "Match"("sport_type", "status");

-- CreateIndex
CREATE INDEX "Match_status_created_at_idx" ON "Match"("status", "created_at");

-- CreateIndex
CREATE INDEX "Match_creator_id_idx" ON "Match"("creator_id");

-- CreateIndex
CREATE INDEX "MatchParticipant_match_id_status_idx" ON "MatchParticipant"("match_id", "status");

-- CreateIndex
CREATE INDEX "MatchParticipant_player_id_idx" ON "MatchParticipant"("player_id");

-- CreateIndex
CREATE UNIQUE INDEX "MatchParticipant_match_id_player_id_key" ON "MatchParticipant"("match_id", "player_id");

-- CreateIndex
CREATE UNIQUE INDEX "Review_booking_id_key" ON "Review"("booking_id");

-- CreateIndex
CREATE INDEX "Review_subfield_id_idx" ON "Review"("subfield_id");

-- CreateIndex
CREATE INDEX "Review_subfield_id_rating_idx" ON "Review"("subfield_id", "rating");

-- CreateIndex
CREATE INDEX "Review_player_id_idx" ON "Review"("player_id");

-- CreateIndex
CREATE INDEX "Complex_avg_rating_idx" ON "Complex"("avg_rating");

-- CreateIndex
CREATE INDEX "Notification_account_id_is_read_idx" ON "Notification"("account_id", "is_read");

-- CreateIndex
CREATE INDEX "Notification_account_id_created_at_idx" ON "Notification"("account_id", "created_at");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_complex_id_fkey" FOREIGN KEY ("complex_id") REFERENCES "Complex"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingAddon" ADD CONSTRAINT "BookingAddon_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingAddon" ADD CONSTRAINT "BookingAddon_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchParticipant" ADD CONSTRAINT "MatchParticipant_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchParticipant" ADD CONSTRAINT "MatchParticipant_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_subfield_id_fkey" FOREIGN KEY ("subfield_id") REFERENCES "SubField"("id") ON DELETE CASCADE ON UPDATE CASCADE;
