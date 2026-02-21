import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // Tests must run sequentially because there is a single shared Next.js dev server instance.
  fullyParallel: false,
  // Prevent accidental `.only` calls from silently skipping the full suite in CI.
  forbidOnly: !!process.env.CI,
  // One automatic retry on CI gives flaky network/render tests a second chance without masking real failures.
  retries: process.env.CI ? 1 : 0,
  workers: 4,
  reporter: [["html", { outputFolder: "playwright-report" }], ["list"]],
  use: {
    baseURL: "http://localhost:3000",
    // Capture a trace archive on the first retry so failures are fully reproducible.
    trace: "on-first-retry",
    // Screenshots add noise for passing tests; capture only on failure.
    screenshot: "only-on-failure",
    // Record video on the first retry alongside the trace.
    video: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    // On local machines, reuse an already-running dev server to keep feedback fast.
    // On CI, always start fresh to guarantee a clean state.
    reuseExistingServer: !process.env.CI,
    // Allow up to 2 minutes for Next.js to compile on first boot.
    timeout: 120_000,
  },
  // PDF generation can take a few seconds, so give each test a generous budget.
  timeout: 15_000,
  expect: { timeout: 10_000 },
});
