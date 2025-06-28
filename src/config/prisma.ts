import { PrismaClient } from "@prisma/client";
import { DatabaseMonitor } from "../utils/db-monitor";

// Configure Prisma Client with connection pooling
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ["query", "info", "warn", "error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// Ensure we only create one instance of PrismaClient
declare global {
   
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

// Initialize database monitor
export const dbMonitor = new DatabaseMonitor(prisma);

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export { prisma };
