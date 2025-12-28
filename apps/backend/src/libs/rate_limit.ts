import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  limit: 10, //10 requests per windowMs
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error:
      "You have made too many verification requests. Please try again in 15 minutes.",
  },
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 50, // 50 requests per windowMs
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error:
      "You have sent too many requests in a short period of time. Please wait a moment before trying again.",
  },
});
