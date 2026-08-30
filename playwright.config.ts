import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

export default defineConfig({
  testDir: 'apps/react-ui-library.com/tests',
  fullyParallel: true,
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    screenshot: 'off',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
    },
  ],
  webServer: {
    command: 'npx serve dist --listen 4173 --single',
    cwd: path.resolve(__dirname, 'apps/react-ui-library.com'),
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 2 * 60 * 1000,
  },
});
