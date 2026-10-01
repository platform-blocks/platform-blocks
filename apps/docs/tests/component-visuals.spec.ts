import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

interface VisualTarget {
  name: string;
  route: string;
}

const { componentPreviews } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'visual-targets.json'), 'utf8')
) as { componentPreviews: VisualTarget[] };

test.describe('Reviewed component previews', () => {
  for (const scheme of ['light', 'dark'] as const) {
    test.describe(scheme, () => {
      test.use({ colorScheme: scheme, contextOptions: { reducedMotion: 'reduce' }, viewport: { width: 1280, height: 1800 } });

      for (const { name, route } of componentPreviews) {
        test(name, async ({ page }) => {
          await page.goto(route, { waitUntil: 'networkidle' });
          await page.addStyleTag({ content: '[aria-label="Open actions"] { visibility: hidden !important; }' });
          await page.locator('main h1').first().waitFor();

          let preview;
          if (route.startsWith('/charts/')) {
            preview = page.locator('[data-testid^="demo-preview-"]').first();
            await preview.waitFor();
            await page.waitForTimeout(900);
          } else {
            const anchor = page.locator('main a.demo-anchor').first();
            await anchor.waitFor();
            preview = anchor.locator('xpath=..').locator(':scope > div').nth(1).locator(':scope > div').first();
            await preview.waitFor();
          }

          await expect(preview).toHaveScreenshot(`${scheme}-${name}.png`, {
            animations: 'disabled',
            maxDiffPixelRatio: 0.005,
          });
        });
      }
    });
  }
});
