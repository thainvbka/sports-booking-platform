export const BOOKING_TIMEOUT = {
  INITIAL: 5 * 60 * 1000, // 5 minutes for initial booking
  RECURRING: 5 * 60 * 1000, // 5 minutes for recurring
  PAYMENT: 30 * 60 * 1000, // 30 minutes for payment session (Stripe/VNPay requirement)
  MIN_GRACE_PERIOD: 1 * 60 * 1000, // 1 minute minimum grace period after payment failure
} as const;
