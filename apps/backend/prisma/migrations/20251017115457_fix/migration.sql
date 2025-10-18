/*
  Warnings:

  - You are about to drop the column `pair_at` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `avatar_url` on the `User` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `Complex` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `SubField` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_booking_id_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "pair_at",
ADD COLUMN     "paid_at" TIMESTAMPTZ(0);

-- AlterTable
ALTER TABLE "Complex" ADD COLUMN     "complex_image" TEXT,
ADD COLUMN     "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ(0) NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "SubField" ADD COLUMN     "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "sub_field_image" TEXT,
ADD COLUMN     "updated_at" TIMESTAMPTZ(0) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatar_url",
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_at" TIMESTAMPTZ(0) NOT NULL;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
