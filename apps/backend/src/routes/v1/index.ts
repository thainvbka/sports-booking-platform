import { Router } from "express";
import authRouter from "./auth.routes";
import accountRouter from "./account.routes";
import complexRouter from "./complex.routes";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "API v1 is running" });
});

router.use("/auth", authRouter);
router.use("/account", accountRouter);
router.use("/complex", complexRouter);

export default router;
