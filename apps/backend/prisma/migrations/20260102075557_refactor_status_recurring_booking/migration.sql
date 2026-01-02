/*
  Warnings:

  - The values [ACTIVE] on the enum `RecurringStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RecurringStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELED', 'COMPLETED');
ALTER TABLE "RecurringBooking" ALTER COLUMN "status" TYPE "RecurringStatus_new" USING ("status"::text::"RecurringStatus_new");
ALTER TYPE "RecurringStatus" RENAME TO "RecurringStatus_old";
ALTER TYPE "RecurringStatus_new" RENAME TO "RecurringStatus";
DROP TYPE "public"."RecurringStatus_old";
COMMIT;
