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

  let striperAccountId = owner.stripe_account_id;

  //check owner đã connect stripe account chưa
  if (!striperAccountId) {
    // nếu chưa thì tạo mới
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

    striperAccountId = account.id;
  }

  //tạo link onboarding
  const accountLink = await stripe.accountLinks.create({
    account: striperAccountId,
    refresh_url: `${config.CORS_ORIGIN}/owner/stripe/refresh`, //check neu hoan thanh thi redirect ve trang kiem tra hoac chua thi tao lai
    return_url: `${config.CORS_ORIGIN}/owner/stripe/return`, //goi Api de update onboarding complete
    type: "account_onboarding",
  });

  return { url: accountLink.url };
};

//check trạng thái stripe account
export const checkStripeAccountStatus = async (ownerId: string) => {
  //check owner
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId, status: "ACTIVE" },
    select: {
      stripe_account_id: true,
      stripe_onboarding_complete: true,
    },
  });

  if (!owner || !owner.stripe_account_id) {
    return { isComplete: false };
  }

  //lấy thông tin account từ stripe
  const account = await stripe.accounts.retrieve(owner.stripe_account_id);

  //check owner đã hoàn thành onboarding và account đã được kích hoạt charges chưa
  // const isComplete =
  //   account.details_submitted && account.charges_enabled ? true : false;
  const isComplete = account.details_submitted ? true : false; //cái trên chặt quá =)) cái thứ 2 là nhận tiền rồi chứ ko phải hoàn thành onboarding
  //luôn cập nhật trạng thái mới nhất vào db
  if (owner.stripe_onboarding_complete !== isComplete) {
    //cập nhật lại trạng thái hoàn thành onboarding
    await prisma.owner.update({
      where: { id: ownerId },
      data: {
        stripe_onboarding_complete: isComplete,
      },
    });
  }

  return { isComplete };
};
