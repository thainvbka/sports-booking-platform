-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_payment_id_fkey";

-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "payment_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
