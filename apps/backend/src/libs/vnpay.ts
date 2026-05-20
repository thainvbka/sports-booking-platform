import { VNPay } from "vnpay";
import { config } from "../configs";

const vnpay = new VNPay({
  tmnCode: config.VNPAY_TMN_CODE as string,
  secureSecret: config.VNPAY_SECURE_SECRET as string,
  vnpayHost: config.VNPAY_HOST as string,
  testMode: true, // Default to true for sandbox environment
});

export default vnpay;
