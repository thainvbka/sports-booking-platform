-- AlterTable
ALTER TABLE "Complex" ADD COLUMN     "max_price" INTEGER,
ADD COLUMN     "min_price" INTEGER,
ADD COLUMN     "sport_types" VARCHAR(50)[] DEFAULT ARRAY[]::VARCHAR(50)[],
ADD COLUMN     "total_subfields" SMALLINT NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Complex_min_price_idx" ON "Complex"("min_price");

-- CreateIndex
CREATE INDEX "Complex_status_idx" ON "Complex"("status");
