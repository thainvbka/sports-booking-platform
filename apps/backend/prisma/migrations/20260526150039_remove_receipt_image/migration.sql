/*
  Warnings:

  - You are about to drop the column `receipt_image` on the `PayoutBatch` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PayoutBatch" DROP COLUMN "receipt_image";
