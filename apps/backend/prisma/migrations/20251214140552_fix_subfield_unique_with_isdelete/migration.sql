/*
  Warnings:

  - A unique constraint covering the columns `[complex_id,sub_field_name,isDelete]` on the table `SubField` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."SubField_complex_id_sub_field_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "SubField_complex_id_sub_field_name_key" ON "SubField"("complex_id", "sub_field_name", "isDelete");
