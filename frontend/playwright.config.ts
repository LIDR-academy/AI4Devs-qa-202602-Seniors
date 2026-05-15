/// <reference types="node" />
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  retries: process.env.CI ? 2 : 0,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // webServer no está configurado: arranca el frontend (npm start, puerto 3000)
  // y el backend (npm run dev, puerto 3010) manualmente antes de ejecutar las pruebas.
  // webServer: {
  //     command: 'npm start',
  //     url: 'http://localhost:3000',
  //     reuseExistingServer: !process.env.CI,
  // },
});
