import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'cd apps/gateway && pnpm start',
    url: 'http://localhost:8080/health',
    reuseExistingServer: !process.env.CI,
    env: {
      DATABASE_URL: 'postgres://postgres:postgres@localhost:5432/ritzie_test',
      REDIS_URL: 'redis://localhost:6379',
      JWT_SECRET: 'test_secret',
      OPENAI_API_KEY: 'sk-test',
      PORT: '8080'
    }
  },
});
