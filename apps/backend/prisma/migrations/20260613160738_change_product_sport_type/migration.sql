/*
  Warnings:

  - You are about to drop the column `sport_type` on the `Product` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX IF EXISTS "Product_complex_id_sport_type_idx";

-- AlterTable (Add column if not exists)
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sport_types" "SportType"[] NOT NULL DEFAULT '{}';

-- Migrate existing data
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='Product' AND column_name='sport_type'
    ) THEN
        UPDATE "Product" 
        SET "sport_types" = ARRAY["sport_type"]::"SportType"[]
        WHERE "sport_type" IS NOT NULL;
    END IF;
END $$;

-- AlterTable (Drop column if exists)
ALTER TABLE "Product" DROP COLUMN IF EXISTS "sport_type";
