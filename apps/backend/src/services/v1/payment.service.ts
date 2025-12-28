import { prisma } from "@sports-booking-platform/db";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/error.response";
import stripe from "../../libs/stripe";
import { config } from "../../configs";

// Tạo Stripe Connect Account cho Owner
export const createConnectAccount = async (ownerId: string) => {
  let owner = await prisma.owner.findUnique({
    where: { id: ownerId, status: "ACTIVE" },
    select: {
      stripe_account_id: true,
      stripe_onboarding_complete: true,
      account: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!owner) {
    throw new NotFoundError("Owner not found or inactive");
  }

  //check owner đã connect stripe account chưa
  if (owner.stripe_account_id) {
    return { message: "Owner already has a Stripe account." };
  }

  // Tạo Stripe Connect Account
  const account = await stripe.accounts.create({
    type: "express",
    country: "US",
    email: owner.account.email,
    // business_type: "individual", //la ca nhan
    // capabilities: {
    //   card_payments: { requested: true },
    //   transfers: { requested: true },
    // },
  });

  await prisma.owner.update({
    where: { id: ownerId },
    data: {
      stripe_account_id: account.id,
    },
  });

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${config.CORS_ORIGIN}/owner`,
    return_url: `${config.CORS_ORIGIN}/owner/payment-setup-success`, //goi Api de update onboarding complete
    type: "account_onboarding",
  });

  return { url: accountLink.url };
};

//khi owner hoàn thành onboarding, stripe sẽ redirect về return_url
export const paymentSetupSuccess = async (ownerId: string) => {
  await prisma.owner.update({
    where: { id: ownerId },
    data: { stripe_onboarding_complete: true },
  });

  return { message: "Payment setup completed successfully." };
};
