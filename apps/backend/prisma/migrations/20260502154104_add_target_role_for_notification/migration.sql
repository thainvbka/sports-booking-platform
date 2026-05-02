/*
  Warnings:

  - Added the required column `target_role` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationTargetRole" AS ENUM ('PLAYER', 'OWNER', 'ADMIN');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "target_role" "NotificationTargetRole" NOT NULL;

-- CreateIndex
CREATE INDEX "Notification_account_id_target_role_created_at_idx" ON "Notification"("account_id", "target_role", "created_at");

-- CreateIndex
CREATE INDEX "Notification_account_id_target_role_is_read_idx" ON "Notification"("account_id", "target_role", "is_read");
