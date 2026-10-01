import { expect, test, type Locator, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const chartCases: readonly { chart: string; target: string; demo?: string }[] = [
  { chart: 'BubbleChart', target: 'bubble' },
  { chart: 'CandlestickChart', target: 'candlestick' },
  { chart: 'ComboChart', target: 'combo-bar-' },
  { chart: 'FunnelChart', target: 'funnel-segment-' },
  { chart: 'LineChart', target: 'line' },
  { chart: 'AreaChart', target: 'line' },
  { chart: 'MarimekkoChart', target: 'marimekko-segment-' },
  { chart: 'NetworkChart', target: 'network-node-' },
  { chart: 'ParetoChart', target: 'combo-bar-' },
  { chart: 'SankeyChart', target: 'sankey-node-' },
  { chart: 'BarChart', target: 'bar-gesture-surface' },
  { chart: 'GroupedBarChart', target: 'grouped-bar-gesture-surface' },
  { chart: 'StackedBarChart', target: 'stacked-bar-gesture-surface' },
  { chart: 'HeatmapChart', target: 'heatmap-gesture-surface' },
  { chart: 'HistogramChart', target: 'histogram-gesture-surface' },
  { chart: 'RidgeChart', target: 'ridge-gesture-surface' },
  { chart: 'ViolinChart', target: 'violin-gesture-surface' },
  { chart: 'StackedAreaChart', target: 'stacked-area-gesture-surface' },
  { chart: 'SparklineChart', target: 'sparkline-gesture-surface' },
  { chart: 'ScatterChart', target: 'scatter' },
  { chart: 'DonutChart', target: 'donut-gesture-surface' },
  { chart: 'PieChart', target: 'pie-gesture-surface' },
  { chart: 'RadarChart', target: 'radar-gesture-surface' },
  { chart: 'RadialBarChart', target: 'radial-bar-gesture-surface' },
  { chart: 'BarChart', target: 'bar-gesture-surface', demo: 'new-hire-recruiting-cycles' },
  { chart: 'HeatmapChart', target: 'heatmap-gesture-surface', demo: 'employee-engagement-scores' },
  { chart: 'ScatterChart', target: 'scatter', demo: 'customer-ltv-vs-cac' },
  { chart: 'ViolinChart', target: 'violin-gesture-surface', demo: 'delivery-times' },
];

async function tapCenter(page: Page, target: Locator) {
  const box = await target.boundingBox();
  expect(box).not.toBeNull();
  await page.touchscreen.tap(box!.x + box!.width / 2, box!.y + box!.height / 2);
}

async function firstHittableMark(preview: Locator, prefix: string): Promise<Locator> {
  const marks = preview.locator(`[data-testid^="${prefix}"]`);
  const index = await marks.evaluateAll((elements) => elements.findIndex((element) => {
    const box = element.getBoundingClientRect();
    if (box.width < 4 || box.height < 4) return false;
    const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
    return hit === element || element.contains(hit);
  }));
  expect(index, `${prefix} should have a hittable mark`).toBeGreaterThanOrEqual(0);
  return marks.nth(index);
}

async function tapGeometryPoint(page: Page, path: Locator, fraction = 0.5) {
  const point = await path.evaluate((element, fraction) => {
    const svgPath = element as SVGGeometryElement;
    const point = svgPath.getPointAtLength(svgPath.getTotalLength() * fraction);
    const matrix = svgPath.getScreenCTM();
    if (!matrix) return null;
    return {
      x: matrix.a * point.x + matrix.c * point.y + matrix.e,
      y: matrix.b * point.x + matrix.d * point.y + matrix.f,
    };
  }, fraction);
  expect(point).not.toBeNull();
  await page.touchscreen.tap(point!.x, point!.y);
}

for (const scheme of ['light', 'dark'] as const) {
  for (const width of [320, 390]) {
    test.describe(`chart values on phone touch ${scheme} ${width}px`, () => {
      test.use({
        viewport: { width, height: 844 },
        colorScheme: scheme,
        hasTouch: true,
        isMobile: true,
        contextOptions: { reducedMotion: 'reduce' },
      });

      for (const { chart, target, demo = 'basic' } of chartCases) {
        test(`${chart}.${demo} keeps selected values visible after release`, async ({ page }, testInfo) => {
          await page.goto(`/charts/${chart}`, { waitUntil: 'networkidle' });
          const preview = page.getByTestId(`demo-preview-${chart}.${demo}`).first();
          await expect(preview).toBeVisible();
          await preview.scrollIntoViewIfNeeded();
          await page.waitForTimeout(900);

          await page.addStyleTag({ content: '[aria-label="Open actions"] { visibility: hidden !important; }' });
          await page.clock.install();
          await page.clock.pauseAt(new Date());
          const tooltip = page.getByTestId(target === 'line' ? 'line-chart-tooltip' : target === 'pie-gesture-surface' ? 'pie-chart-tooltip' : 'chart-active-tooltip');
          if (target === 'bubble') {
            const surface = preview.getByTestId('bubble-gesture-surface');
            const bubbleBox = await surface.evaluate((element) => {
              const items = Array.from(element.previousElementSibling?.children ?? []);
              const first = items.map((item) => item.getBoundingClientRect()).find((rect) => rect.width > 10 && rect.height > 10);
              return first ? { x: first.x, y: first.y, width: first.width, height: first.height } : null;
            });
            expect(bubbleBox).not.toBeNull();
            await page.touchscreen.tap(bubbleBox!.x + bubbleBox!.width / 2, bubbleBox!.y + bubbleBox!.height / 2);
          } else if (target === 'candlestick') {
            const surface = preview.getByTestId('candlestick-gesture-surface');
            const box = await surface.boundingBox();
            expect(box).not.toBeNull();
            await page.touchscreen.tap(box!.x + box!.width / 2, box!.y + box!.height / 2);
          } else if (target === 'line') {
            await tapCenter(page, preview.locator('svg circle').nth(4));
          } else if (target === 'scatter') {
            await tapCenter(page, preview.getByTestId('scatter-point').nth(3));
          } else if (target.endsWith('-gesture-surface')) {
            const surface = preview.getByTestId(target);
            if (target === 'donut-gesture-surface') {
              await tapGeometryPoint(page, preview.locator('svg circle[stroke-width]').first(), 0);
            } else if (target === 'heatmap-gesture-surface') {
              if (demo === 'employee-engagement-scores') {
                const cell = await preview.locator('svg rect[rx]').nth(3).boundingBox();
                expect(cell?.height, 'use available height to keep narrow cells tappable').toBeGreaterThanOrEqual(24);
              }
              await tapCenter(page, preview.locator('svg rect[rx]').nth(3));
            } else if (target === 'radial-bar-gesture-surface') {
              await tapGeometryPoint(page, preview.locator('svg path[stroke-width]').first());
            } else if (target === 'stacked-area-gesture-surface') {
              await tapGeometryPoint(page, preview.locator('svg path[fill]').first(), 0.25);
            } else if (target === 'sparkline-gesture-surface') {
              await tapGeometryPoint(page, preview.locator('svg path[fill="none"][stroke]').first());
            } else {
              const box = await surface.boundingBox();
              expect(box).not.toBeNull();
              const polar = target === 'pie-gesture-surface';
              await page.touchscreen.tap(box!.x + box!.width * (polar ? 0.75 : 0.5), box!.y + box!.height * (polar ? 0.4 : 0.5));
            }
          } else {
            const mark = target === 'combo-bar-'
              ? await firstHittableMark(preview, target)
              : preview.locator(`[data-testid^="${target}"]`).first();
            await expect(mark).toBeVisible();
            await tapCenter(page, target === 'network-node-' ? mark.locator('circle').first() : mark);
          }

          await expect(tooltip).toBeVisible();
          await page.clock.runFor(500);
          await expect(tooltip).toBeVisible();
          if (demo === 'new-hire-recruiting-cycles') await expect(tooltip).toContainText('This cycle:');
          if (demo === 'employee-engagement-scores') await expect(tooltip).toContainText('score');
          if (demo === 'customer-ltv-vs-cac') await expect(tooltip).toContainText('CAC $');
          if (demo === 'delivery-times') await expect(tooltip).toContainText('Q1–Q3:');
          const overflow = await tooltip.evaluate(element => element.scrollWidth - element.clientWidth);
          expect(overflow, 'tooltip content should fit its box').toBeLessThanOrEqual(1);
          const box = await tooltip.boundingBox();
          expect(box).not.toBeNull();
          expect(box!.x).toBeGreaterThanOrEqual(0);
          expect(box!.y).toBeGreaterThanOrEqual(0);
          expect(box!.x + box!.width).toBeLessThanOrEqual(width);
          expect(box!.y + box!.height).toBeLessThanOrEqual(844);
          const previewBox = await preview.boundingBox();
          expect(previewBox).not.toBeNull();
          expect(box!.y + box!.height, 'tooltip should stay near the chart after release').toBeGreaterThanOrEqual(previewBox!.y - 32);
          expect(box!.y).toBeLessThanOrEqual(previewBox!.y + previewBox!.height + 32);
          const x = Math.max(0, Math.min(previewBox!.x, box!.x) - 4);
          const y = Math.max(0, Math.min(previewBox!.y, box!.y) - 4);
          const right = Math.min(width, Math.max(previewBox!.x + previewBox!.width, box!.x + box!.width) + 4);
          const bottom = Math.min(844, Math.max(previewBox!.y + previewBox!.height, box!.y + box!.height) + 4);
          const clip = { x, y, width: right - x, height: bottom - y };
          const selectedName = `${width}px${demo === 'basic' ? '' : `-${demo}`}-selected.png`;
          const file = path.join(testInfo.project.outputDir, 'visual-gallery', 'charts-mobile', chart, scheme, selectedName);
          fs.mkdirSync(path.dirname(file), { recursive: true });
          await page.screenshot({ path: file, clip, animations: 'disabled' });
          await expect(page).toHaveScreenshot(`${scheme}-${chart}-${selectedName}`, { clip, animations: 'disabled', maxDiffPixelRatio: 0.005 });
          await page.clock.runFor(7_000);
          await expect(tooltip).toBeVisible();
          await page.clock.runFor(600);
          await expect(tooltip).toBeHidden();
        });
      }

      for (const chart of ['NetworkChart', 'SankeyChart']) {
        test(`${chart} links expose their values on touch`, async ({ page }) => {
          await page.goto(`/charts/${chart}`, { waitUntil: 'networkidle' });
          const preview = page.getByTestId(`demo-preview-${chart}.basic`).first();
          await preview.scrollIntoViewIfNeeded();
          await page.waitForTimeout(900);
          await tapGeometryPoint(page, preview.locator(`[data-testid^="${chart === 'NetworkChart' ? 'network' : 'sankey'}-link-"]`).first());
          const tooltip = page.getByTestId('chart-active-tooltip');
          await expect(tooltip).toBeVisible();
          await page.waitForTimeout(500);
          await expect(tooltip).toBeVisible();
          await expect(tooltip).toContainText(/\d/);
        });
      }
    });
  }
}
