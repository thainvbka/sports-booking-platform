import { PrismaClient } from "./generated/prisma-client/client";

// Tránh tạo nhiều instance khi hot-reload
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Re-export types/models để dùng chung
export * from "./generated/prisma-client/client";
export * from "./generated/prisma-client/enums";
