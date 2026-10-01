import type { Page } from '@playwright/test';

export async function pauseChartClock(page: Page) {
  // Leave a generous gap between installation and pausing. Pausing at the
  // host's current time can already be in the browser clock's past on CI.
  await page.clock.install({ time: new Date('2024-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2024-01-01T01:00:00Z'));
}

export async function settleNetworkLayout(page: Page) {
  // Force layouts cool over roughly 1,090 animation frames. CSS animation
  // disabling does not stop their requestAnimationFrame simulation. Run it
  // to completion so screenshots and touch targets use the final positions.
  await page.clock.runFor(20_000);
}
