import Stripe from "stripe";
import { config } from "../configs";

const stripe = new Stripe(config.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-12-15.clover",
  typescript: true,
});

export default stripe;
