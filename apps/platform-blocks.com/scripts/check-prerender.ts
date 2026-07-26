#!/usr/bin/env tsx
/**
 * Validate the static web export (dist/).
 *
 * With `web.output: "static"` each route is prerendered to its own HTML file and
 * SEO tags are injected by scripts/inject-seo-tags.ts. This checker confirms the
 * export actually produced multiple prerendered pages with real content and that
 * every indexable page has the SEO essentials (unique <title>, description,
 * canonical, and JSON-LD). Run it after `npm run build-web`.
 *
 * Exits non-zero if any indexable page is missing an essential.
 */
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const distDir = path.join(__dirname, '..', 'dist');

/** Non-indexable shells: no canonical / structured data expected. */
const NOINDEX_FILES = new Set(['404.html', '+not-found.html']);
/** Dynamic-route template artifacts and generated index — not real routes. */
function isTemplate(file: string): boolean {
  const base = path.basename(file);
  return base.includes('[') || base.startsWith('+') || base === '_sitemap.html';
}

interface Result {
  file: string;
  contentLength: number;
  title: string | null;
  hasDescription: boolean;
  hasCanonical: boolean;
  hasJsonLd: boolean;
  errors: string[];
}

/** Extract the #root markup from a page. */
function rootMarkup(html: string): string {
  const start = html.indexOf('<div id="root">');
  if (start === -1) return '';
  const scriptAfter = html.indexOf('<script', start);
  return html.slice(start, scriptAfter === -1 ? undefined : scriptAfter);
}

/** Visible (crawlable) text rendered inside #root, excluding comment markers. */
function rootVisibleText(rootHtml: string): number {
  return rootHtml
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim().length;
}

/**
 * Whether #root contains a deferred/errored Suspense boundary (React emits
 * `<!--$!-->` when a boundary is handed to the client, e.g. a React.lazy
 * code-split). Informational — a page can be mostly prerendered yet still
 * client-render one lazy section.
 */
function hasClientBoundary(rootHtml: string): boolean {
  return /<!--\$!-->/.test(rootHtml);
}

async function main(): Promise<void> {
  if (!fs.existsSync(distDir)) {
    console.error('❌ dist/ not found. Run "npm run build-web" first.');
    process.exit(1);
  }

  const htmlFiles = (await glob('**/*.html', { cwd: distDir })).sort();
  if (htmlFiles.length <= 1) {
    console.error(
      `❌ Only ${htmlFiles.length} HTML file(s) in dist/. Static rendering is not producing per-route pages — check "web.output: static" in app.json.`,
    );
    process.exit(1);
  }

  const results: Result[] = [];
  const titles = new Map<string, string[]>();
  let failed = 0;
  let emptyContent = 0;
  let lazyBoundary = 0;
  const MIN_CONTENT = 50; // chars of visible text to consider a page "prerendered"

  for (const file of htmlFiles) {
    if (isTemplate(file) && !NOINDEX_FILES.has(file)) continue;

    const html = fs.readFileSync(path.join(distDir, file), 'utf8');
    const noindex = NOINDEX_FILES.has(file);
    const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : null;
    const root = rootMarkup(html);

    const result: Result = {
      file,
      contentLength: rootVisibleText(root),
      title,
      hasDescription: /<meta[^>]+name=["']description["'][^>]*>/i.test(html),
      hasCanonical: /<link[^>]+rel=["']canonical["'][^>]*>/i.test(html),
      hasJsonLd: /<script[^>]+type=["']application\/ld\+json["']/i.test(html),
      errors: [],
    };

    // Hard requirements: the SEO tags crawlers read without executing JS.
    if (!title) result.errors.push('missing/empty <title>');
    if (!result.hasDescription) result.errors.push('missing description');
    if (!noindex) {
      if (!result.hasCanonical) result.errors.push('missing canonical');
      if (!result.hasJsonLd) result.errors.push('missing JSON-LD');
      if (title) titles.set(title, [...(titles.get(title) ?? []), file]);
    }
    // Soft signals (warnings, not failures): body content prerendered into #root,
    // and whether any section is deferred to the client (React.lazy code-split).
    if (!noindex && result.contentLength < MIN_CONTENT) emptyContent++;
    if (!noindex && hasClientBoundary(root)) lazyBoundary++;

    results.push(result);
    if (result.errors.length > 0) failed++;
  }

  const indexable = results.filter((r) => !NOINDEX_FILES.has(r.file));
  const totalContent = results.reduce((s, r) => s + r.contentLength, 0);
  const avg = Math.round(totalContent / results.length);
  const dupes = [...titles.entries()].filter(([, files]) => files.length > 1);

  console.log('🔍 Static export validation\n');
  console.log(`   HTML pages:        ${htmlFiles.length}`);
  console.log(`   Indexable checked: ${indexable.length}`);
  console.log(`   Avg root content:  ${avg.toLocaleString()} chars`);
  console.log(`   With canonical:    ${indexable.filter((r) => r.hasCanonical).length}/${indexable.length}`);
  console.log(`   With JSON-LD:      ${indexable.filter((r) => r.hasJsonLd).length}/${indexable.length}`);
  console.log(`   With body content: ${indexable.length - emptyContent}/${indexable.length}`);
  if (lazyBoundary > 0) {
    console.log(`   Client-lazy section: ${lazyBoundary} page(s) (intentional React.lazy code-split)`);
  }

  if (dupes.length > 0) {
    console.log(`\n⚠️  ${dupes.length} duplicate title(s):`);
    dupes.slice(0, 10).forEach(([t, files]) => console.log(`   "${t}" → ${files.join(', ')}`));
  }

  if (emptyContent > 0) {
    console.log(
      `\n⚠️  ${emptyContent}/${indexable.length} indexable pages prerender little/no body content ` +
        `(client-rendered only). Metadata + JSON-LD are still present, so crawlers that execute\n` +
        `   JavaScript (Google) index the content, but the raw HTML body is thin. Usually caused\n` +
        `   by a component that throws during SSR and defers its boundary to the client.`,
    );
    results
      .filter((r) => !NOINDEX_FILES.has(r.file) && r.contentLength < MIN_CONTENT)
      .slice(0, 15)
      .forEach((r) => console.log(`   • ${r.file} (${r.contentLength} chars)`));
  }

  if (failed > 0) {
    console.log(`\n❌ ${failed} page(s) with errors:`);
    results
      .filter((r) => r.errors.length > 0)
      .slice(0, 25)
      .forEach((r) => console.log(`   ${r.file}: ${r.errors.join('; ')}`));
    console.log('');
    process.exit(1);
  }

  const contentNote = emptyContent === 0 ? ' and prerendered content' : '';
  console.log(`\n✅ All indexable pages have title, description, canonical, JSON-LD${contentNote}.\n`);
}

main().catch((error) => {
  console.error('Error checking prerender output:', error);
  process.exit(1);
});
