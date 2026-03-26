// @ts-ignore
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
    // @ts-ignore
    engineType: "library", 
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;