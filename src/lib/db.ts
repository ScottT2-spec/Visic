import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url || url.includes("johndoe")) {
    // No real DB configured — return a client that will error on actual queries
    // but won't crash during build/import
    return new Proxy({} as PrismaClient, {
      get(_target, prop) {
        if (prop === "$connect" || prop === "$disconnect") return () => Promise.resolve();
        if (typeof prop === "string" && prop.startsWith("$")) return () => Promise.resolve();
        return new Proxy(() => {}, {
          get: () => () => { throw new Error("DATABASE_URL not configured"); },
          apply: () => { throw new Error("DATABASE_URL not configured"); },
        });
      },
    });
  }

  const adapter = new PrismaPg(url);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
