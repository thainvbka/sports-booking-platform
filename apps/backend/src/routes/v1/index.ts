import { Router } from "express";
import { apiLimiter, authLimiter } from "../../libs/rate_limit";
import { SuccessResponse } from "../../utils/success.response";
import accountRouter from "./account.routes";
import adminRouter from "./admin.routes";
import authRouter from "./auth.routes";
import bookingRouter from "./booking.routes";
import complexRouter from "./complex.routes";
import ownerDashboardRouter from "./owner_dashboard.routes";
import paymentRouter from "./payment.routes";
import pricingRuleRouter from "./pricing_rule.routes";
import publicRouter from "./public.routes";
import subfieldRouter from "./subfield.routes";

const router = Router();

router.get("/", (_req, res) => {
  return new SuccessResponse({
    message: "API v1 is running",
    data: {},
  }).send(res);
});

router.use("/public", apiLimiter, publicRouter);
router.use("/auth", authLimiter, authRouter);
router.use("/account", apiLimiter, accountRouter);
router.use("/admin", apiLimiter, adminRouter);
router.use("/complexes", apiLimiter, complexRouter);
router.use("/sub-fields", apiLimiter, subfieldRouter);
router.use("/pricing-rules", apiLimiter, pricingRuleRouter);
router.use("/bookings", apiLimiter, bookingRouter);
router.use("/payments", apiLimiter, paymentRouter);
router.use("/owner-dashboard", apiLimiter, ownerDashboardRouter);

export default router;
