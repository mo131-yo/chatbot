import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";
import { PrismaClient } from "@prisma/client";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

const adapter = new PrismaNeon(pool as any);

export const prisma = new PrismaClient({
  adapter,
});




// import { PrismaClient } from "@prisma/client";

// const globalForPrisma = global as unknown as { prisma: PrismaClient };

// export const prisma =
//   globalForPrisma.prisma || new PrismaClient();

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;