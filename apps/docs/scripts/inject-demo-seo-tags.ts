#!/usr/bin/env tsx
/** Add page-specific metadata to the standalone Expo app exports. */
import fs from 'node:fs';
import path from 'node:path';
import { EXAMPLE_APPS } from '../config/exampleApps';

const demosDir = path.resolve(process.argv[2] ?? path.resolve(__dirname, '../dist/demos'));
const startMarker = '<!--plocks-demo-seo-->';
const endMarker = '<!--/plocks-demo-seo-->';

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
}

function inject(file: string, title: string, description: string, canonical: string): void {
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`), '');
  html = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, '');
  if (!/<head\b[^>]*>/i.test(html)) throw new Error(`Missing <head> in ${file}`);

  const block = [
    startMarker,
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}"/>`,
    `<link rel="canonical" href="${escapeHtml(canonical)}"/>`,
    endMarker,
  ].join('');
  html = html.replace(/(<head\b[^>]*>)/i, `$1${block}`);
  fs.writeFileSync(file, html);
}

const exported = fs.readdirSync(demosDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const expected = EXAMPLE_APPS.map((app) => app.slug).sort();
if (JSON.stringify(exported) !== JSON.stringify(expected)) {
  throw new Error(`Demo exports do not match the examples registry. Exported: ${exported.join(', ')}. Expected: ${expected.join(', ')}.`);
}

for (const app of EXAMPLE_APPS) {
  const baseUrl = `https://plocks.dev/demos/${app.slug}/`;
  const appDir = path.join(demosDir, app.slug);
  inject(
    path.join(appDir, 'index.html'),
    `${app.title} demo | plocks`,
    app.description,
    baseUrl,
  );
  inject(
    path.join(appDir, 'source.html'),
    `${app.title} demo source | plocks`,
    `Browse the source code for the ${app.title} demo built with plocks.`,
    `${baseUrl}source.html`,
  );
}

console.log(`Added SEO metadata to ${EXAMPLE_APPS.length * 2} demo pages.`);
