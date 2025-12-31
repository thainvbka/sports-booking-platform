import dotenv from "dotenv";
import ms from "ms";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

const config = {
  SERVER_PORT: process.env.SERVER_PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as ms.StringValue,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as ms.StringValue,
  JWT_ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION as ms.StringValue,
  JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION as ms.StringValue,
  NODE_ENV: process.env.NODE_ENV || "development",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  MAIL_HOST: process.env.MAIL_HOST,
  MAIL_PORT: process.env.MAIL_PORT,
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASS: process.env.MAIL_PASS,
};

export default config;
