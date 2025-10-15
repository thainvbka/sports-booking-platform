-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PLAYER', 'OWNER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Level" AS ENUM ('BEGINNER', 'AMATEUR', 'INTERMEDIATE', 'ADVANCED', 'PRO');

-- CreateEnum
CREATE TYPE "SportType" AS ENUM ('FOOTBALL', 'BASKETBALL', 'TENNIS', 'BADMINTON', 'VOLLEYBALL', 'TABLE_TENNIS');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('MOMO', 'VNPAY');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('SUCCESS', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "level" "Level",
    "avatar_url" TEXT,
    "company_name" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialAccount" (
    "id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complex" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "sport_type" "SportType" NOT NULL,
    "owner_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Complex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubField" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" SMALLINT NOT NULL,
    "complex_id" UUID NOT NULL,

    CONSTRAINT "SubField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingRule" (
    "id" UUID NOT NULL,
    "day_of_week" SMALLINT NOT NULL,
    "start_time" TIME(0) NOT NULL,
    "end_time" TIME(0) NOT NULL,
    "base_price" DECIMAL(10,2) NOT NULL,
    "sub_field_id" UUID NOT NULL,
    "is_dynamic" BOOLEAN NOT NULL DEFAULT false,
    "dynamic_config" JSONB,

    CONSTRAINT "PricingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" UUID NOT NULL,
    "start_time" TIMESTAMPTZ(0) NOT NULL,
    "end_time" TIMESTAMPTZ(0) NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "status" "BookingStatus" NOT NULL,
    "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pair_at" TIMESTAMPTZ(0),
    "user_id" UUID NOT NULL,
    "sub_field_id" UUID NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "booking_id" UUID NOT NULL,
    "transaction_code" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_number_key" ON "User"("phone_number");

-- CreateIndex
CREATE INDEX "SocialAccount_user_id_idx" ON "SocialAccount"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_provider_provider_id_key" ON "SocialAccount"("provider", "provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_user_id_provider_key" ON "SocialAccount"("user_id", "provider");

-- CreateIndex
CREATE INDEX "Complex_owner_id_idx" ON "Complex"("owner_id");

-- CreateIndex
CREATE INDEX "SubField_complex_id_idx" ON "SubField"("complex_id");

-- CreateIndex
CREATE UNIQUE INDEX "SubField_complex_id_name_key" ON "SubField"("complex_id", "name");

-- CreateIndex
CREATE INDEX "PricingRule_sub_field_id_day_of_week_start_time_idx" ON "PricingRule"("sub_field_id", "day_of_week", "start_time");

-- CreateIndex
CREATE UNIQUE INDEX "PricingRule_sub_field_id_day_of_week_start_time_end_time_key" ON "PricingRule"("sub_field_id", "day_of_week", "start_time", "end_time");

-- CreateIndex
CREATE INDEX "Booking_sub_field_id_start_time_idx" ON "Booking"("sub_field_id", "start_time");

-- CreateIndex
CREATE INDEX "Booking_user_id_start_time_idx" ON "Booking"("user_id", "start_time");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_booking_id_key" ON "Payment"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transaction_code_key" ON "Payment"("transaction_code");

-- AddForeignKey
ALTER TABLE "SocialAccount" ADD CONSTRAINT "SocialAccount_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complex" ADD CONSTRAINT "Complex_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubField" ADD CONSTRAINT "SubField_complex_id_fkey" FOREIGN KEY ("complex_id") REFERENCES "Complex"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingRule" ADD CONSTRAINT "PricingRule_sub_field_id_fkey" FOREIGN KEY ("sub_field_id") REFERENCES "SubField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_sub_field_id_fkey" FOREIGN KEY ("sub_field_id") REFERENCES "SubField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
