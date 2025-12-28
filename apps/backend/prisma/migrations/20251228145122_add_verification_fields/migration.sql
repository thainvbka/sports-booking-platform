/*
  Warnings:

  - A unique constraint covering the columns `[verification_token]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "verification_expires_at" TIMESTAMPTZ(0),
ADD COLUMN     "verification_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Account_verification_token_key" ON "Account"("verification_token");
