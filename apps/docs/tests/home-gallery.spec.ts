import { expect, test } from '@playwright/test';
import { GALLERY_TABS, getGalleryComponents } from '../components/home/galleryCatalog';

for (const width of [390, 1440]) {
  test(`home gallery renders every tab at ${width}px`, async ({ page }) => {
    test.setTimeout(240_000);
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    for (const tab of GALLERY_TABS) {
      const tabControl = page.getByRole('tab', { name: tab, exact: true });
      await tabControl.click();
      await expect(tabControl, `${tab} should stay selected`).toHaveAttribute('aria-selected', 'true');
      const names = getGalleryComponents(tab).map(component => component.name);
      const previews = page.locator('[data-testid^="gallery-demo-"]');
      await expect(previews, `${tab} should render its catalog`).toHaveCount(names.length);
      const columns = page.getByTestId('gallery-columns');
      await expect(columns).toHaveCount(1);
      await expect(columns.locator('[data-testid^="gallery-column-"]')).toHaveCount(width === 390 ? 1 : 3);
      await expect(columns.locator('[data-testid^="gallery-demo-"]')).toHaveCount(names.length);
      await expect(page.getByLabel(/^Loading /)).toHaveCount(0, { timeout: 60_000 });
      await expect(page.getByText('This preview is unavailable.', { exact: false })).toHaveCount(0);

      for (const name of names) {
        const preview = page.getByTestId(`gallery-demo-${name}`);
        await expect(preview).toBeVisible();
        await expect(preview.getByRole('link', { name: `${name} documentation` })).toHaveCount(0);
        const bounds = await preview.evaluate(element => ({
          width: element.clientWidth,
          contentWidth: element.scrollWidth,
        }));
        expect.soft(bounds.contentWidth, `${name} should fit its column at ${width}px`).toBeLessThanOrEqual(bounds.width + 1);
      }
    }

    // Verify representative interactions in the new examples and the waveform.
    await page.getByRole('tab', { name: 'Overlays', exact: true }).click();
    const dialogPreview = page.getByTestId('gallery-demo-Dialog');
    await dialogPreview.getByRole('button').first().click();
    await expect(page.getByRole('dialog').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await page.getByRole('tab', { name: 'Media', exact: true }).click();
    const waveform = page.getByRole('slider', { name: 'Waveform progress', exact: true });
    // Original and added media examples share a flowing column.
    const imageColumn = page.locator('[data-testid^="gallery-column-"]').filter({
      has: page.getByRole('button', { name: 'Open lightbox', exact: true }),
    });
    await expect(imageColumn.getByTestId('gallery-demo-AudioPlayer')).toHaveCount(1);
    await waveform.focus();
    await page.keyboard.press('End');
    await expect(waveform).toHaveAttribute('aria-valuenow', '100');
    expect(errors).toEqual([]);
  });
}
