-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "sport_types" DROP DEFAULT;
