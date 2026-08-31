import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/**
 * A single PrismaClient per process, using the `pg` driver adapter so the same
 * code path works in local dev, CI and serverless (Vercel) without any native
 * query-engine binary. `DATABASE_URL` is the only connection input; SSL is
 * driven by the URL (`?sslmode=require` for hosted Postgres such as Neon).
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

function createPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set.");
  }
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    // Serverless functions are short-lived and many run concurrently; keep the
    // per-instance pool small. Use a pooled connection string in production.
    max: process.env.NODE_ENV === "production" ? 3 : 10,
  });
}

const pool = globalForPrisma.pgPool ?? createPool();

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(pool),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  globalForPrisma.pgPool = pool;
}
