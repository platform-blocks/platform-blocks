import { expect, test } from '@playwright/test';
import { existsSync } from 'node:fs';
import path from 'node:path';

const demos = path.resolve(__dirname, '../apps/docs/dist/demos');

test.describe('example overlays', () => {
  test.skip(!existsSync(path.join(demos, 'tiktok-shop/index.html')), 'Export the examples into docs/dist/demos first');

  test('Dialog closes with Escape and a backdrop click', async ({ page }) => {
    await page.goto('/demos/tiktok-shop/');
    const product = page.getByRole('button', { name: 'View Sunset Glow Lamp' });
    const dialog = page.getByRole('dialog', { name: 'Product details' });

    await product.click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(product).toBeFocused();

    await product.click();
    await expect(dialog).toBeVisible();
    await page.mouse.click(20, 20);
    await expect(dialog).toBeHidden();
  });

  test('Dialog fits a phone viewport using its defaults', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/demos/tiktok-shop/');
    await page.getByRole('button', { name: 'View Sunset Glow Lamp' }).click();

    const dialog = page.getByRole('dialog', { name: 'Product details' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Add to cart' })).toBeVisible();
    await expect.poll(async () => {
      const bounds = await dialog.boundingBox();
      return Boolean(bounds && bounds.x >= 0 && bounds.x + bounds.width <= 390
        && bounds.y >= 0 && bounds.y + bounds.height <= 844);
    }).toBe(true);
  });

  test('Escape closes a listing lightbox before its parent Dialog', async ({ page }) => {
    await page.goto('/demos/craigslist/');
    const listing = page.getByRole('button', { name: 'View Commuter bike, excellent condition' });
    const details = page.getByRole('dialog', { name: 'Commuter bike, excellent condition', exact: true });
    const gallery = page.getByRole('dialog', { name: 'Commuter bike, excellent condition photos' });

    await listing.click();
    await expect(details).toBeVisible();
    await details.getByRole('button', { name: 'View photos of Commuter bike, excellent condition' }).click();
    await expect(gallery).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(gallery).toBeHidden();
    await expect(details).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(details).toBeHidden();
    await expect(listing).toBeFocused();
  });

  test('Instagram carousel photo opens and dismisses its Lightbox', async ({ page }) => {
    await page.goto('/demos/instagram/');
    await page.getByRole('button', { name: /Open photo 1 of \d+ from/ }).first().click();
    const gallery = page.getByRole('dialog', { name: /post photos/ });
    await expect(gallery).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(gallery).toBeHidden();
  });

  for (const demo of [
    { slug: 'chatgpt', menu: 'Show chats', navigation: 'Chats', item: 'New chat' },
    { slug: 'gmail', menu: 'Show folders', navigation: 'Mail folders', item: 'Open Starred' },
  ]) {
    test(`${demo.slug} mobile navigation uses the AppShell drawer`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/demos/${demo.slug}/`);
      const opener = page.getByRole('button', { name: demo.menu });
      const drawer = page.getByRole('navigation', { name: demo.navigation });

      await opener.click();
      await expect(drawer).toBeVisible();
      await expect(drawer.getByRole('button', { name: demo.item })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(drawer).toBeHidden();
      await expect(opener).toBeFocused();

      await opener.click();
      await expect(drawer).toBeVisible();
      await page.mouse.click(375, 350);
      await expect(drawer).toBeHidden();
    });
  }

  test('Fitbit progress and charts use Plocks components', async ({ page }) => {
    await page.goto('/demos/fitbit/');
    const steps = page.getByRole('progressbar', { name: 'Step goal progress' });
    await expect(steps).toHaveAttribute('aria-valuenow', '6420');
    await page.getByRole('button', { name: '+ 500 steps' }).click();
    await expect(steps).toHaveAttribute('aria-valuenow', '6920');
    await expect(page.getByLabel('Sleep stages')).toBeVisible();
    await expect(page.getByLabel('Sleep duration over the past seven nights')).toBeVisible();
    await expect(page.getByLabel('Heart rate trend')).toBeVisible();
    await expect(page.getByLabel('Weight trend')).toBeVisible();
  });
});

test.describe('example tab navigation', () => {
  for (const [slug, tabName] of [
    ['craigslist', 'Saved'],
    ['fanduel', 'Live'],
    ['fish-dating', 'Matches'],
    ['instagram', 'explore'],
    ['netflix', 'Search'],
    ['new-york-times', 'Latest'],
    ['pinterest', 'Saved'],
    ['robinhood', 'Search'],
    ['tiktok-shop', 'Shop'],
    ['whatsapp', 'Updates'],
  ]) {
    test(`${slug} switches sections with Plocks Tabs`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/demos/${slug}/`);
      const tab = page.getByRole('tab', { name: new RegExp(`^${tabName}`, 'i') });
      await tab.click();
      await expect(tab).toHaveAttribute('aria-selected', 'true');
    });
  }
});

test.describe('example filters', () => {
  test('Robinhood chart range uses a single-choice control', async ({ page }) => {
    await page.goto('/demos/robinhood/');
    const range = page.getByRole('radiogroup', { name: 'Portfolio time range' });
    await range.getByRole('radio', { name: '1W' }).click();
    await expect(range.getByRole('radio', { name: '1W' })).toHaveAttribute('aria-checked', 'true');
  });

  test('WhatsApp chat filters use a single-choice control', async ({ page }) => {
    await page.goto('/demos/whatsapp/');
    const filters = page.getByRole('radiogroup', { name: 'Filter chats' });
    await filters.getByRole('radio', { name: 'Unread' }).click();
    await expect(filters.getByRole('radio', { name: 'Unread' })).toHaveAttribute('aria-checked', 'true');
  });

  for (const [slug, filterName] of [
    ['pinterest', 'Garden'],
    ['craigslist', 'Housing'],
    ['fanduel', 'Basketball'],
    ['new-york-times', 'World'],
  ]) {
    test(`${slug} category chips expose their pressed state`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/demos/${slug}/`);
      if (slug === 'new-york-times') await page.getByRole('tab', { name: 'Latest' }).click();
      const chip = page.getByRole('button', { name: filterName, exact: true });
      await chip.click();
      await expect(chip).toHaveAttribute('aria-pressed', 'true');
    });
  }
});
