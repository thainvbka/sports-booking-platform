/*
  Warnings:

  - A unique constraint covering the columns `[reset_password_token]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "reset_password_expires_at" TIMESTAMPTZ(0),
ADD COLUMN     "reset_password_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Account_reset_password_token_key" ON "Account"("reset_password_token");
