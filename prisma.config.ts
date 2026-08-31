import path from "node:path";
import { defineConfig } from "prisma/config";

// Prisma no longer auto-loads .env when a config file is present, so do it here
// — but only when DATABASE_URL is not already set, so CI / tests / production
// that provide real env vars are never overridden by a local .env file.
if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile(path.join(process.cwd(), ".env"));
  } catch {
    // No .env file — rely on the ambient environment.
  }
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
});
