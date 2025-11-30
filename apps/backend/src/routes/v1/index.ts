import { Router } from "express";
import authRouter from "./auth.routes";
import accountRouter from "./account.routes";
import complexRouter from "./complex.routes";
import subfieldRouter from "./subfield.routes";
import pricingRuleRouter from "./pricing_rule.routes";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "API v1 is running" });
});

router.use("/auth", authRouter);
router.use("/account", accountRouter);
router.use("/complexes", complexRouter);
router.use("/sub-fields", subfieldRouter);
router.use("/pricing-rules", pricingRuleRouter);

export default router;
