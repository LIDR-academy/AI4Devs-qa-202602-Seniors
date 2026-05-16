import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  featuresRoot: './tests/features',
  steps: './tests/steps/**/*.ts',
});

export default defineConfig({
  testDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'bdd-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'bdd-firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'bdd-webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: [
    {
      command: 'cd frontend && npm start',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: { BROWSER: 'none' },
    },
  ],
});
