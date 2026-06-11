const dotenv = require("dotenv");
const path = require("node:path");

dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

const databaseUrl = process.env.DATABASE_URL || "postgresql://mock:mock@localhost:5432/mock";

module.exports = {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
};
