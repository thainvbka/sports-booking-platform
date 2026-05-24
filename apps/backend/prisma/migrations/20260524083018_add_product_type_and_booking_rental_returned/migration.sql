-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('SALE', 'RENTAL');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "rental_returned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "type" "ProductType" NOT NULL DEFAULT 'SALE';
