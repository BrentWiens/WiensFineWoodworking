import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',  // Where your test files are
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  // Local runs hit `next dev`, which compiles each route and lazy chunk on first
  // request. With several workers that regularly pushes a first paint past the 5s
  // default and produces failures unrelated to the code under test — worst on a cold
  // .next, where whichever test lands on a route first pays the whole compile.
  // CI runs against the prebuilt production server and never needs this headroom.
  expect: { timeout: 15_000 },

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    // CI already runs `npm run build` before the E2E step, so serve that build
    // rather than `next dev`. The dev server compiles routes on first request, and
    // with several workers hitting cold routes at once that produced timeouts that
    // had nothing to do with the code under test. It also means CI exercises the
    // static generation and response headers that actually ship.
    command: process.env.CI ? 'npm run start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});