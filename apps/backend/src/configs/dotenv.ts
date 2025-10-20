import dotenv from "dotenv";
import ms from "ms";

dotenv.config();

const config = {
  SERVER_PORT: process.env.SERVER_PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as ms.StringValue,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as ms.StringValue,
  JWT_ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION as ms.StringValue,
  JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION as ms.StringValue,
  NODE_ENV: process.env.NODE_ENV || "development",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
};

export default config;
