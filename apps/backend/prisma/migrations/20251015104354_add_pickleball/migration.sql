/*
  Warnings:

  - The values [TABLE_TENNIS] on the enum `SportType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SportType_new" AS ENUM ('FOOTBALL', 'BASKETBALL', 'TENNIS', 'BADMINTON', 'VOLLEYBALL', 'PICKLEBALL');
ALTER TABLE "Complex" ALTER COLUMN "sport_type" TYPE "SportType_new" USING ("sport_type"::text::"SportType_new");
ALTER TYPE "SportType" RENAME TO "SportType_old";
ALTER TYPE "SportType_new" RENAME TO "SportType";
DROP TYPE "public"."SportType_old";
COMMIT;
