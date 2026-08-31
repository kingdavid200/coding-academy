import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

/**
 * E2E tests run against a production build on a dedicated port and a dedicated
 * PostgreSQL database (`codestart_e2e`), so they never touch local dev data.
 * Override E2E_DATABASE_URL if your local Postgres differs.
 */
const E2E_DATABASE_URL =
  process.env.E2E_DATABASE_URL ??
  "postgresql://davidharris@localhost:5432/codestart_e2e?schema=public";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  timeout: 30_000,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command:
      "npx prisma migrate deploy && npx tsx prisma/seed.ts && npx next build && npx next start -p 3100",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      NODE_ENV: "production",
      DATABASE_URL: E2E_DATABASE_URL,
      DIRECT_URL: E2E_DATABASE_URL,
      NEXT_PUBLIC_SITE_URL: "http://localhost:3100",
      AUTH_SECRET: "e2e-test-secret-value-not-for-production-use-only",
      SEED_ADMIN_EMAIL: "admin@codingacademy.test",
      SEED_ADMIN_PASSWORD: "Admin!Passw0rd",
      SEED_ADMIN_NAME: "Platform Admin",
    },
  },
});
