import Stripe from "stripe";
import { config } from "../configs";

const stripe = new Stripe(config.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
  typescript: true,
});

export default stripe;
