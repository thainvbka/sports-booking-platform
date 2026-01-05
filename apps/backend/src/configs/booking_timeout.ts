export const BOOKING_TIMEOUT = {
  INITIAL: 5 * 60 * 1000, // 5 minutes for initial booking
  PAYMENT_STARTED: 15 * 60 * 1000, // 15 minutes for Stripe flow
  RECURRING: 5 * 60 * 1000, // 5 minutes for recurring
} as const;
export const STRIPE_SESSION_TIMEOUT = 15 * 60; // 15 minutes for Stripe session
