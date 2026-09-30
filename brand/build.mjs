/**
 * Renders the brand's raster assets from the SVG masters in brand/svg.
 *
 *   npm run brand:build
 *
 * Every output below is generated — edit the masters (or og-image.html) and
 * rerun rather than touching the PNGs. Rendering goes through Playwright's
 * Chromium (a root devDependency), so what you see in a browser is what ships.
 */
import { chromium } from '@playwright/test';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const brand = dirname(fileURLToPath(import.meta.url));
const repo = join(brand, '..');
const svg = (name) => readFileSync(join(brand, 'svg', name), 'utf8');
const docsPublic = join(repo, 'apps/docs/public');
const docsAssets = join(repo, 'apps/docs/assets');

/** [master, width, height, destination] — transparent PNG renders. */
const PNGS = [
  ['icon.svg', 180, 180, join(docsPublic, 'apple-touch-icon.png')],
  ['icon-rounded.svg', 192, 192, join(docsPublic, 'icon-192.png')],
  ['icon-rounded.svg', 512, 512, join(docsPublic, 'icon-512.png')],
  ['icon-maskable.svg', 512, 512, join(docsPublic, 'icon-maskable-512.png')],
  ['icon-rounded.svg', 196, 196, join(docsAssets, 'favicon.png')],
  ['icon.svg', 1024, 1024, join(docsAssets, 'icon.png')],
  ['icon-adaptive-foreground.svg', 1024, 1024, join(docsAssets, 'adaptive-icon.png')],
  ['lockup.svg', 1200, 288, join(brand, 'png', 'lockup.png')],
  ['lockup-dark.svg', 1200, 288, join(brand, 'png', 'lockup-dark.png')],
  ['mark.svg', 272, 272, join(brand, 'png', 'mark.png')],
  ['icon.svg', 400, 400, join(brand, 'png', 'avatar.png')],
  ['icon-rounded.svg', 96, 96, join(repo, 'packages/qrcode/src/assets/logo-mark.png')],
];

/** favicon.ico: pixel-grid tiles at 16 and 32, the vector tile at 48. */
const ICO = [['icon-16.svg', 16], ['icon-32.svg', 32], ['icon-rounded.svg', 48]];

/** The master with its root <svg> sized to exactly width × height. */
const sized = (source, width, height) =>
  source.replace(/<svg\b[^>]*>/, (tag) =>
    tag.replace(/\s(width|height)="[^"]*"/g, '').replace(/^<svg/, `<svg width="${width}" height="${height}"`)
  );

async function renderSvg(page, source, width, height) {
  await page.setViewportSize({ width, height });
  await page.setContent(
    `<html><body style="margin:0;background:transparent">${sized(source, width, height)}</body></html>`
  );
  return page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width, height } });
}

/** An .ico holding PNG images (supported by every browser that reads .ico). */
function ico(images) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, png }, i) => {
    const entry = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, entry);
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    header.writeUInt8(0, entry + 2);
    header.writeUInt8(0, entry + 3);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map((image) => image.png)]);
}

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
const written = [];
const out = (path, data) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, data);
  written.push(path.replace(`${repo}/`, ''));
};

for (const [master, width, height, destination] of PNGS) {
  out(destination, await renderSvg(page, svg(master), width, height));
}

const icoImages = [];
for (const [master, size] of ICO) icoImages.push({ size, png: await renderSvg(page, svg(master), size, size) });
out(join(docsPublic, 'favicon.ico'), ico(icoImages));

copyFileSync(join(brand, 'svg', 'favicon.svg'), join(docsPublic, 'favicon.svg'));
written.push('apps/docs/public/favicon.svg');

// Social card
await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(
  readFileSync(join(brand, 'og-image.html'), 'utf8').replaceAll('{{LOCKUP}}', svg('lockup-dark.svg')),
  { waitUntil: 'networkidle' }
);
await page.evaluate(() => document.fonts.ready);
out(join(docsPublic, 'og-image.jpg'), await page.screenshot({ type: 'jpeg', quality: 92, clip: { x: 0, y: 0, width: 1200, height: 630 } }));

await browser.close();
console.log(`brand: wrote ${written.length} files\n  ${written.join('\n  ')}`);
