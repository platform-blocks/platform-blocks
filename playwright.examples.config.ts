import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

export default defineConfig({
  testDir: 'tests',
  testMatch: 'example-overlays.spec.js',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:4174',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'npx serve dist --listen 4174',
    cwd: path.resolve(__dirname, 'apps/docs'),
    url: 'http://127.0.0.1:4174',
    reuseExistingServer: !process.env.CI,
  },
});
