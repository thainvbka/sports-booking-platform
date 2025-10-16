import dotenv from "dotenv";

dotenv.config();

const config = {
  SERVER_PORT: process.env.SERVER_PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
};

export default config;
