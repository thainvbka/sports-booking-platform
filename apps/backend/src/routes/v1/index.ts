import { Router } from "express";
import authRouter from "./auth.routes";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "API v1 is running" });
});

router.use("/auth", authRouter);

export default router;
