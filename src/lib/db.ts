import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool, type PoolConfig } from "pg";

/**
 * A single PrismaClient per process, using the `pg` driver adapter.
 *
 * - In production on Firebase App Hosting, `INSTANCE_CONNECTION_NAME` is set and
 *   we connect to Cloud SQL through the Cloud SQL Node.js Connector: an
 *   IAM-authenticated TLS tunnel that needs no VPC, no allow-listed IPs and no
 *   password in transit beyond the DB password itself.
 * - Everywhere else (local dev, CI, `prisma migrate`) we connect with a plain
 *   `DATABASE_URL`.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

async function createPool(): Promise<Pool> {
  const instanceConnectionName = process.env.INSTANCE_CONNECTION_NAME;

  if (instanceConnectionName) {
    // Loaded lazily so the connector is only a dependency of production runtime.
    const { Connector, IpAddressTypes } = await import("@google-cloud/cloud-sql-connector");
    const connector = new Connector();
    const clientOpts = await connector.getOptions({
      instanceConnectionName,
      ipType:
        process.env.CLOUD_SQL_IP_TYPE === "PUBLIC"
          ? IpAddressTypes.PUBLIC
          : IpAddressTypes.PRIVATE,
    });
    const config: PoolConfig = {
      ...clientOpts,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      max: 5,
    };
    return new Pool(config);
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set (and no INSTANCE_CONNECTION_NAME for Cloud SQL).");
  }
  return new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
}

// `createPool` is async; resolve it once and cache the client behind a proxy so
// callers keep the simple `import { db }` ergonomics.
const pool = globalForPrisma.pgPool ?? (await createPool());

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
