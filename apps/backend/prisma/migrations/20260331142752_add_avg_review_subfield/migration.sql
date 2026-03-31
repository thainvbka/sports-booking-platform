-- AlterTable
ALTER TABLE "SubField" ADD COLUMN     "avg_rating" DECIMAL(3,2),
ADD COLUMN     "total_reviews" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "SubField_avg_rating_idx" ON "SubField"("avg_rating");
