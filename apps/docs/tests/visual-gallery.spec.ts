import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { EXAMPLE_APPS } from '../config/exampleApps';
import { EXAMPLES } from '../config/examples';

type Demo = { id: string; component: string; demo: string; hidden?: boolean };
type Meta = Record<string, { packageName?: string }>;

const generated = path.resolve(__dirname, '../data/generated');
const { demos } = JSON.parse(fs.readFileSync(path.join(generated, 'demos.json'), 'utf8')) as { demos: Demo[] };
const meta = JSON.parse(fs.readFileSync(path.join(generated, 'components-meta.json'), 'utf8')) as Meta;
const internalDemo = /(^|[-_])(test|migration|debug|scratch|wip|sandbox|internal)([-_]|$)/i;
const byComponent = new Map<string, Demo[]>();

for (const demo of demos) {
  if (demo.hidden || internalDemo.test(demo.demo || demo.id)) continue;
  const entries = byComponent.get(demo.component) ?? [];
  entries.push(demo);
  byComponent.set(demo.component, entries);
}

const outputRoot = (testInfo: TestInfo) => path.join(testInfo.project.outputDir, 'visual-gallery');
const save = async (locator: Locator, file: string) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await locator.screenshot({ path: file, animations: 'disabled', timeout: 20_000 });
};
const safeName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, '-');

async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: '[aria-label="Open actions"] { visibility: hidden !important; }' });
}

test.describe('Visual gallery: every public component demo', () => {
  test.setTimeout(180_000);

  for (const scheme of ['light', 'dark'] as const) {
    test.describe(scheme, () => {
      test.use({ colorScheme: scheme, contextOptions: { reducedMotion: 'reduce' }, viewport: { width: 1440, height: 2200 } });

      for (const [component, entries] of [...byComponent].sort(([a], [b]) => a.localeCompare(b))) {
        test(component, async ({ page }, testInfo) => {
          const packageName = meta[component]?.packageName?.replace(/^@plocks\//, '') ?? 'ui';
          await page.goto(`/${packageName}/${component}`, { waitUntil: 'networkidle' });
          await settle(page);
          await expect(page.locator('main h1').first()).toBeVisible();
          for (const demo of entries) {
            const preview = page.getByTestId(`demo-preview-${demo.id}`).first();
            await expect(preview, `${component}.${demo.demo} should render`).toBeVisible();
            await expect(preview.getByText('Loading demo…')).toHaveCount(0);
            await expect(preview).not.toContainText(/Demo ".+" (failed|threw)/);
            const file = path.join(outputRoot(testInfo), 'components', component, scheme, `${safeName(demo.demo)}.png`);
            await save(preview, file);
          }
        });
      }
    });
  }
});

test.describe('Visual gallery: charts in phone-sized columns', () => {
  test.setTimeout(120_000);
  test.use({ contextOptions: { reducedMotion: 'reduce' }, hasTouch: true, isMobile: true });

  for (const scheme of ['light', 'dark'] as const) {
    test.describe(scheme, () => {
      test.use({ colorScheme: scheme });
      for (const viewportWidth of [320, 390]) {
        test.describe(`${viewportWidth}px`, () => {
          test.use({ viewport: { width: viewportWidth, height: 844 } });

          for (const [component, entries] of [...byComponent].filter(([name]) => meta[name]?.packageName === '@plocks/charts').sort(([a], [b]) => a.localeCompare(b))) {
            test(component, async ({ page }, testInfo) => {
              await page.goto(`/charts/${component}`, { waitUntil: 'networkidle' });
              await settle(page);
              const demosToCheck = viewportWidth === 320 ? entries : [entries[0]];
              for (const [index, demo] of demosToCheck.entries()) {
                const preview = page.getByTestId(`demo-preview-${demo.id}`).first();
                await expect(preview).toBeVisible();
                await preview.scrollIntoViewIfNeeded();
                await page.waitForTimeout(index === 0 ? 900 : 350);
                const { clientWidth, scrollWidth } = await preview.evaluate((element) => ({
                  clientWidth: element.clientWidth,
                  scrollWidth: element.scrollWidth,
                }));
                expect(scrollWidth, `${component}.${demo.demo} should fit a ${viewportWidth}px viewport`).toBeLessThanOrEqual(clientWidth + 1);
                if (component === 'HeatmapChart') {
                  const bounds = await preview.boundingBox();
                  expect(bounds).not.toBeNull();
                  const cells = await preview.locator('svg rect[rx]').evaluateAll(elements => elements.map(element => {
                    const rect = element.getBoundingClientRect();
                    return { left: rect.left, right: rect.right, width: rect.width };
                  }).filter(rect => rect.width > 0));
                  expect(cells.length).toBeGreaterThan(0);
                  for (const cell of cells) {
                    expect(cell.left, 'heatmap cells should not be clipped').toBeGreaterThanOrEqual(bounds!.x - 1);
                    expect(cell.right, 'heatmap cells should not be clipped').toBeLessThanOrEqual(bounds!.x + bounds!.width + 1);
                  }
                }
                const filename = index === 0 ? `${viewportWidth}px.png` : `${viewportWidth}px-${safeName(demo.demo)}.png`;
                await save(preview, path.join(outputRoot(testInfo), 'charts-mobile', component, scheme, filename));
                await expect(preview).toHaveScreenshot(`${scheme}-${component}-${viewportWidth}px-${safeName(demo.demo)}.png`, {
                  animations: 'disabled',
                  maxDiffPixelRatio: 0.005,
                });
              }
            });
          }

          if (viewportWidth === 320) {
            test('RadarChart compact key and touch details', async ({ page }, testInfo) => {
              await page.goto('/charts/RadarChart', { waitUntil: 'networkidle' });
              await settle(page);
              const preview = page.getByTestId('demo-preview-RadarChart.skill-comparison').first();
              await preview.scrollIntoViewIfNeeded();
              await expect(preview.getByTestId('radar-axis-key')).toBeVisible();
              await expect(preview.getByText('Collaboration')).toBeVisible();
              const surface = preview.getByTestId('radar-gesture-surface');
              const box = await surface.boundingBox();
              expect(box).not.toBeNull();
              await page.touchscreen.tap(box!.x + box!.width / 2, box!.y + box!.height * 0.24);
              await expect(page.getByText(/Code quality · Frontend guild/)).toBeVisible();
              await page.waitForTimeout(500);
              const tooltipText = page.getByText(/Code quality · Frontend guild/);
              await expect(tooltipText).toBeVisible();
              const tooltipBox = await tooltipText.locator('xpath=ancestor::div[contains(@style, "position: fixed")][1]').boundingBox();
              expect(tooltipBox).not.toBeNull();
              expect(tooltipBox!.x).toBeGreaterThanOrEqual(0);
              expect(tooltipBox!.y).toBeGreaterThanOrEqual(0);
              expect(tooltipBox!.x + tooltipBox!.width).toBeLessThanOrEqual(viewportWidth);
              expect(tooltipBox!.y + tooltipBox!.height).toBeLessThanOrEqual(844);
              await save(preview, path.join(outputRoot(testInfo), 'charts-mobile', 'RadarChart', scheme, '320px-skill-comparison-selected.png'));
            });

            test('PieChart selection keeps details inside the preview', async ({ page }, testInfo) => {
              await page.goto('/charts/PieChart', { waitUntil: 'networkidle' });
              await settle(page);
              const preview = page.getByTestId('demo-preview-PieChart.basic').first();
              await preview.scrollIntoViewIfNeeded();
              const surface = preview.getByTestId('pie-gesture-surface');
              const box = await surface.boundingBox();
              expect(box).not.toBeNull();
              await page.touchscreen.tap(box!.x + box!.width * 0.75, box!.y + box!.height * 0.45);
              await expect(preview.getByText('Direct: 55%')).toBeVisible();
              const { clientWidth, scrollWidth } = await preview.evaluate((element) => ({
                clientWidth: element.clientWidth,
                scrollWidth: element.scrollWidth,
              }));
              expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
              await save(preview, path.join(outputRoot(testInfo), 'charts-mobile', 'PieChart', scheme, '320px-contained-selection.png'));
            });
          }
        });
      }
    });
  }
});

test.describe('Visual gallery: examples and composition checks', () => {
  test.setTimeout(90_000);
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  for (const scheme of ['light', 'dark'] as const) {
    test.describe(scheme, () => {
      test.use({ colorScheme: scheme });

      for (const example of EXAMPLES) {
        for (const viewport of [{ name: 'desktop', width: 1280, height: 900 }, { name: 'phone', width: 390, height: 844 }]) {
          test(`snippet ${example.slug} ${viewport.name}`, async ({ page }, testInfo) => {
            await page.setViewportSize(viewport);
            await page.goto(`/examples/${example.slug}`, { waitUntil: 'networkidle' });
            await settle(page);
            await expect(page.getByRole('main')).toBeVisible();
            const file = path.join(outputRoot(testInfo), 'checks', 'snippets', example.slug, `${scheme}-${viewport.name}.png`);
            fs.mkdirSync(path.dirname(file), { recursive: true });
            await page.screenshot({ path: file, animations: 'disabled', fullPage: viewport.name === 'desktop' });
            await expect(page).toHaveScreenshot(`${scheme}-${example.slug}-${viewport.name}.png`, {
              animations: 'disabled',
              fullPage: viewport.name === 'desktop',
              maxDiffPixelRatio: 0.005,
            });
          });
        }
      }

      test('component combinations', async ({ page }, testInfo) => {
        await page.setViewportSize({ width: 1800, height: 2600 });
        await page.goto('/visual-checks', { waitUntil: 'networkidle' });
        await settle(page);
        for (const name of ['form-actions', 'field-shells', 'additional-fields']) {
          const group = page.getByTestId(`visual-check-${name}`);
          await expect(group).toBeVisible();
          const file = path.join(outputRoot(testInfo), 'checks', 'combinations', `${scheme}-${name}.png`);
          await save(group, file);
          await expect(group).toHaveScreenshot(`${scheme}-${name}.png`, {
            animations: 'disabled',
            maxDiffPixelRatio: 0.005,
          });
        }
      });

      for (const app of EXAMPLE_APPS) {
        test(`app ${app.slug}`, async ({ page }, testInfo) => {
          test.skip(!fs.existsSync(path.join(__dirname, '../dist/demos', app.slug)), 'Build with demos to capture app screens');
          await page.setViewportSize({ width: 390, height: 844 });
          await page.goto(`/demos/${app.slug}/`, { waitUntil: 'networkidle' });
          await settle(page);
          await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
            'href', `https://plocks.dev/demos/${app.slug}/`
          );
          await expect(page.locator('#root')).not.toBeEmpty();
          const file = path.join(outputRoot(testInfo), 'checks', 'apps', app.slug, `${scheme}-phone.png`);
          fs.mkdirSync(path.dirname(file), { recursive: true });
          await page.screenshot({ path: file, animations: 'disabled' });
        });
      }
    });
  }
});
