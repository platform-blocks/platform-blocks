/** Capture documented component previews for visual review. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inventory = JSON.parse(fs.readFileSync(path.join(root, 'reports/component-inventory.json'), 'utf8'));
const mode = process.env.VISUAL_MODE === 'variants' ? 'variants' : 'coverage';
const allTargets = mode === 'variants'
  ? inventory.components.filter((entry) => entry.variantDemo).map((entry) => entry.name)
  : inventory.gaps.find((gap) => gap.id === 'noWebComponentTest')?.components ?? [];
const requested = process.env.VISUAL_COMPONENTS?.split(',').map((name) => name.trim());
const targets = requested ? allTargets.filter((name) => requested.includes(name)) : allTargets;
const baseUrl = process.env.VISUAL_BASE_URL ?? 'http://localhost:8082';
const outputDir = process.env.VISUAL_OUTPUT_DIR ?? path.join(root, `reports/${mode === 'variants' ? 'variant-demo-visual-checks' : 'component-visual-checks'}`);
fs.mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const checks = [];
try {
  for (const scheme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: { width: 1280, height: mode === 'variants' ? 1800 : 800 }, colorScheme: scheme, reducedMotion: 'reduce' });

    for (const name of targets) {
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));
      const component = inventory.components.find((entry) => entry.name === name);
      const route = component.category === 'charts' ? `/charts/${name}` : `/components/${name}`;
      const result = { component: name, package: component.package, scheme, route, status: 'pending' };
      checks.push(result);
      try {
        await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.locator('main h1').first().waitFor({ timeout: 30000 });

        let preview;
        if (component.category === 'charts') {
          preview = page.locator('[data-testid^="demo-preview-"]').first();
          await preview.waitFor({ timeout: 30000 });
          await page.waitForTimeout(900);
        } else {
          const anchor = mode === 'variants'
            ? page.locator('main a.demo-anchor[href="#variants"]').first()
            : page.locator('main a.demo-anchor').first();
          await anchor.waitFor({ timeout: 30000 });
          preview = anchor.locator('xpath=..').locator(':scope > div').nth(1).locator(':scope > div').first();
          await preview.waitFor({ timeout: 30000 });
          await page.waitForTimeout(250);
        }

        const box = await preview.boundingBox();
        if (!box || box.width < 80 || box.height < 30) throw new Error(`Preview has invalid bounds: ${JSON.stringify(box)}`);
        const filename = `${scheme}-${name}.jpg`;
        await preview.screenshot({ path: path.join(outputDir, filename), type: 'jpeg', quality: 85, animations: 'disabled', timeout: 30000 });
        result.status = pageErrors.length ? 'page-error' : 'captured';
        result.bounds = { width: Math.round(box.width), height: Math.round(box.height) };
        result.screenshot = filename;
        if (pageErrors.length) result.errors = pageErrors;
      } catch (error) {
        result.status = 'failed';
        result.errors = [...pageErrors, error instanceof Error ? error.message : String(error)];
      } finally {
        await page.close();
      }
      console.log(`${scheme.padEnd(5)} ${name.padEnd(24)} ${result.status}${result.errors?.length ? ` — ${result.errors[0].split('\n')[0]}` : ''}`);
    }
    await context.close();
  }
} finally {
  await browser.close();
}

const report = {
  baseUrl,
  mode,
  targetCount: targets.length,
  purpose: `Light and dark browser screenshots of ${mode === 'variants' ? 'the variants demo' : 'the first documented demo'} for each component. Captures require human visual review; a successful capture alone does not prove design quality.`,
  checks,
};
fs.writeFileSync(path.join(outputDir, 'manifest.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Captured ${checks.filter((check) => check.status === 'captured').length}/${checks.length} previews.`);
if (checks.some((check) => check.status !== 'captured')) process.exitCode = 1;
