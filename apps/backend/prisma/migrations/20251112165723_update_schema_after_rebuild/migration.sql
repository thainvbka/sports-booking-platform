/*
  Warnings:

  - The values [MOMO,VNPAY] on the enum `PaymentProvider` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `user_id` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Complex` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `Complex` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Complex` table. All the data in the column will be lost.
  - You are about to drop the column `sport_type` on the `Complex` table. All the data in the column will be lost.
  - You are about to drop the column `dynamic_config` on the `PricingRule` table. All the data in the column will be lost.
  - You are about to drop the column `is_dynamic` on the `PricingRule` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `SocialAccount` table. All the data in the column will be lost.
  - You are about to alter the column `provider` on the `SocialAccount` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `provider_id` on the `SocialAccount` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to drop the column `name` on the `SubField` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[account_id,provider]` on the table `SocialAccount` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[complex_id,sub_field_name]` on the table `SubField` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expires_at` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `player_id` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `complex_address` to the `Complex` table without a default value. This is not possible if the table is not empty.
  - Added the required column `complex_name` to the `Complex` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Complex` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verification_docs` to the `Complex` table without a default value. This is not possible if the table is not empty.
  - Added the required column `account_id` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `account_id` to the `SocialAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sport_type` to the `SubField` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sub_field_name` to the `SubField` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AdminStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PlayerStatus" AS ENUM ('ACTIVE', 'BANNED');

-- CreateEnum
CREATE TYPE "OwnerStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "RecurrenceType" AS ENUM ('WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "RecurringStatus" AS ENUM ('ACTIVE', 'CANCELED');

-- CreateEnum
CREATE TYPE "ComplexStatus" AS ENUM ('DRAFT', 'PENDING', 'ACTIVE', 'REJECTED', 'INACTIVE');

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentProvider_new" AS ENUM ('STRIPE');
ALTER TABLE "Payment" ALTER COLUMN "provider" TYPE "PaymentProvider_new" USING ("provider"::text::"PaymentProvider_new");
ALTER TYPE "PaymentProvider" RENAME TO "PaymentProvider_old";
ALTER TYPE "PaymentProvider_new" RENAME TO "PaymentProvider";
DROP TYPE "public"."PaymentProvider_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Complex" DROP CONSTRAINT "Complex_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."RefreshToken" DROP CONSTRAINT "RefreshToken_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."SocialAccount" DROP CONSTRAINT "SocialAccount_user_id_fkey";

-- DropIndex
DROP INDEX "public"."Booking_user_id_start_time_idx";

-- DropIndex
DROP INDEX "public"."RefreshToken_user_id_idx";

-- DropIndex
DROP INDEX "public"."SocialAccount_user_id_idx";

-- DropIndex
DROP INDEX "public"."SocialAccount_user_id_provider_key";

-- DropIndex
DROP INDEX "public"."SubField_complex_id_name_key";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "user_id",
ADD COLUMN     "expires_at" TIMESTAMPTZ(0) NOT NULL,
ADD COLUMN     "player_id" UUID NOT NULL,
ADD COLUMN     "recurring_booking_id" UUID;

-- AlterTable
ALTER TABLE "Complex" DROP COLUMN "address",
DROP COLUMN "is_active",
DROP COLUMN "name",
DROP COLUMN "sport_type",
ADD COLUMN     "complex_address" TEXT NOT NULL,
ADD COLUMN     "complex_name" VARCHAR(100) NOT NULL,
ADD COLUMN     "status" "ComplexStatus" NOT NULL,
ADD COLUMN     "verification_docs" JSON NOT NULL;

-- AlterTable
ALTER TABLE "PricingRule" DROP COLUMN "dynamic_config",
DROP COLUMN "is_dynamic";

-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "user_id",
ADD COLUMN     "account_id" UUID NOT NULL,
ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMPTZ(0),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(0);

-- AlterTable
ALTER TABLE "SocialAccount" DROP COLUMN "user_id",
ADD COLUMN     "account_id" UUID NOT NULL,
ALTER COLUMN "provider" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "provider_id" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "SubField" DROP COLUMN "name",
ADD COLUMN     "sport_type" "SportType" NOT NULL,
ADD COLUMN     "sub_field_name" VARCHAR(100) NOT NULL;

-- DropTable
DROP TABLE "public"."User";

-- DropEnum
DROP TYPE "public"."Level";

-- DropEnum
DROP TYPE "public"."Role";

-- CreateTable
CREATE TABLE "Account" (
    "id" UUID NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(15) NOT NULL,
    "avatar" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "status" "AdminStatus" NOT NULL,
    "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Owner" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "company_name" VARCHAR(100) NOT NULL,
    "stripe_account_id" VARCHAR(100),
    "stripe_onboarding_complete" BOOLEAN NOT NULL DEFAULT false,
    "status" "OwnerStatus" NOT NULL,

    CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "status" "PlayerStatus" NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringBooking" (
    "id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "sub_field_id" UUID NOT NULL,
    "recurrence_type" "RecurrenceType" NOT NULL,
    "recurrence_detail" JSON NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "RecurringStatus" NOT NULL,
    "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecurringBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL,
    "link_to" TEXT,
    "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_phone_number_key" ON "Account"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_account_id_key" ON "Admin"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "Owner_account_id_key" ON "Owner"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "Player_account_id_key" ON "Player"("account_id");

-- CreateIndex
CREATE INDEX "RecurringBooking_player_id_idx" ON "RecurringBooking"("player_id");

-- CreateIndex
CREATE INDEX "RecurringBooking_sub_field_id_idx" ON "RecurringBooking"("sub_field_id");

-- CreateIndex
CREATE INDEX "Booking_player_id_start_time_idx" ON "Booking"("player_id", "start_time");

-- CreateIndex
CREATE INDEX "RefreshToken_account_id_idx" ON "RefreshToken"("account_id");

-- CreateIndex
CREATE INDEX "SocialAccount_account_id_idx" ON "SocialAccount"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_account_id_provider_key" ON "SocialAccount"("account_id", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "SubField_complex_id_sub_field_name_key" ON "SubField"("complex_id", "sub_field_name");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Owner" ADD CONSTRAINT "Owner_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAccount" ADD CONSTRAINT "SocialAccount_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complex" ADD CONSTRAINT "Complex_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringBooking" ADD CONSTRAINT "RecurringBooking_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringBooking" ADD CONSTRAINT "RecurringBooking_sub_field_id_fkey" FOREIGN KEY ("sub_field_id") REFERENCES "SubField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_recurring_booking_id_fkey" FOREIGN KEY ("recurring_booking_id") REFERENCES "RecurringBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
