import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  globalSetup: "./tests/clean-local.ts",
  globalTeardown: "./tests/clean-local.ts",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: process.env.TEST_BASE_URL || "http://localhost:5173",
    channel: "chrome",
    headless: true,
    viewport: { width: 1440, height: 1000 },
  },
  reporter: "list",
  timeout: 90000,
});
