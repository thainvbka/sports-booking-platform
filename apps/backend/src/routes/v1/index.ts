import { Router } from "express";
import authRouter from "./auth.routes";
import accountRouter from "./account.routes";
import complexRouter from "./complex.routes";
import subfieldRouter from "./subfield.routes";
import pricingRuleRouter from "./pricing_rule.routes";
import publicRouter from "./public.routes";
import bookingRouter from "./booking.routes";
import paymentRouter from "./payment.routes";
import { authLimiter, apiLimiter } from "../../libs/rate_limit";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "API v1 is running" });
});

router.use("/public", apiLimiter, publicRouter);
router.use("/auth", authLimiter, authRouter);
router.use("/account", apiLimiter, accountRouter);
router.use("/complexes", apiLimiter, complexRouter);
router.use("/sub-fields", apiLimiter, subfieldRouter);
router.use("/pricing-rules", apiLimiter, pricingRuleRouter);
router.use("/bookings", apiLimiter, bookingRouter);
router.use("/payments", apiLimiter, paymentRouter);

export default router;
