/*
  Warnings:

  - You are about to drop the column `booking_id` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `payment_id` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_booking_id_fkey";

-- DropIndex
DROP INDEX "public"."Payment_booking_id_key";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "payment_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "booking_id";

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
