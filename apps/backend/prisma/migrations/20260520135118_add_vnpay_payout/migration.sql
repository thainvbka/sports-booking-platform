-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'REQUESTED', 'PROCESSING', 'PAID', 'CANCELLED');

-- AlterTable
ALTER TABLE "Owner" ADD COLUMN     "bank_account_name" VARCHAR(100),
ADD COLUMN     "bank_account_number" VARCHAR(50),
ADD COLUMN     "bank_branch" VARCHAR(150),
ADD COLUMN     "bank_name" VARCHAR(100);

-- CreateTable
CREATE TABLE "OwnerPayout" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "payment_id" UUID NOT NULL,
    "batch_id" UUID,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "platform_fee" DECIMAL(10,2) NOT NULL,
    "payout_amount" DECIMAL(10,2) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMPTZ(0),

    CONSTRAINT "OwnerPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutBatch" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "total_payout" DECIMAL(10,2) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "payout_period" VARCHAR(50) NOT NULL,
    "transaction_ref" VARCHAR(100),
    "receipt_image" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMPTZ(0),

    CONSTRAINT "PayoutBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OwnerPayout_payment_id_key" ON "OwnerPayout"("payment_id");

-- CreateIndex
CREATE INDEX "OwnerPayout_owner_id_status_idx" ON "OwnerPayout"("owner_id", "status");

-- CreateIndex
CREATE INDEX "OwnerPayout_batch_id_idx" ON "OwnerPayout"("batch_id");

-- CreateIndex
CREATE INDEX "PayoutBatch_owner_id_status_idx" ON "PayoutBatch"("owner_id", "status");

-- AddForeignKey
ALTER TABLE "OwnerPayout" ADD CONSTRAINT "OwnerPayout_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnerPayout" ADD CONSTRAINT "OwnerPayout_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnerPayout" ADD CONSTRAINT "OwnerPayout_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "PayoutBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutBatch" ADD CONSTRAINT "PayoutBatch_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
