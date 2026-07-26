#!/usr/bin/env tsx
/**
 * Post-build SEO finalizer for the static web export.
 *
 * Expo Router static rendering prerenders each route to its own HTML file, but
 * expo-router/head's <Head> is focus-gated (it renders null unless the screen is
 * focused), so per-route <title>/description/canonical tags do not reliably land
 * in the prerendered HTML. Instead of wiring <Head> into every screen, we inject
 * the correct metadata here — deterministically, per file — using the shared
 * route→metadata resolver in config/routeSeo.ts (the same source of truth the app
 * uses). This runs once, over dist/, and is idempotent.
 *
 * It also:
 *   - writes dist/404.html from dist/index.html (GitHub Pages SPA fallback), and
 *   - marks the 404 / not-found shells noindex.
 */
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import {
  resolveRouteMeta,
  canonicalUrl,
  formatTitle,
  jsonLdForRoute,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
} from '../config/routeSeo';

const distDir = path.join(__dirname, '..', 'dist');
const MARK_START = '<!--pb-seo-->';
const MARK_END = '<!--/pb-seo-->';

const NOINDEX_FILES = new Set(['404.html', '+not-found.html']);

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Map a dist-relative HTML file path to its site route pathname. */
function fileToRoute(file: string): string {
  let route = '/' + file.replace(/\\/g, '/').replace(/\.html$/, '');
  route = route.replace(/\/index$/, '');
  return route === '' ? '/' : route;
}

/** Files that are not real, indexable routes. */
function isSkippable(file: string): boolean {
  const base = path.basename(file);
  return base.includes('[') || base.startsWith('+') || base === '_sitemap.html';
}

function buildSeoBlock(file: string): string {
  const noindex = NOINDEX_FILES.has(file);
  const route = fileToRoute(file);
  const meta = resolveRouteMeta(route);
  const title = escapeAttr(formatTitle(meta.title));
  const desc = escapeAttr(meta.description);
  const canonical = escapeAttr(canonicalUrl(route));

  const lines = [MARK_START, `<title>${title}</title>`, `<meta name="description" content="${desc}"/>`];

  if (noindex) {
    lines.push('<meta name="robots" content="noindex,follow"/>');
  } else {
    lines.push(`<link rel="canonical" href="${canonical}"/>`);
    lines.push('<meta property="og:type" content="website"/>');
    lines.push(`<meta property="og:site_name" content="${escapeAttr(SITE_NAME)}"/>`);
    lines.push(`<meta property="og:title" content="${title}"/>`);
    lines.push(`<meta property="og:description" content="${desc}"/>`);
    lines.push(`<meta property="og:url" content="${canonical}"/>`);
    lines.push(`<meta property="og:image" content="${escapeAttr(DEFAULT_OG_IMAGE)}"/>`);
    lines.push('<meta name="twitter:card" content="summary_large_image"/>');
    lines.push(`<meta name="twitter:title" content="${title}"/>`);
    lines.push(`<meta name="twitter:description" content="${desc}"/>`);
    lines.push(`<meta name="twitter:image" content="${escapeAttr(DEFAULT_OG_IMAGE)}"/>`);

    // JSON-LD structured data (indexable pages only).
    const graph = jsonLdForRoute(route);
    if (graph.length > 0) {
      // Escape `<` so a value can never break out of the <script> element.
      const json = JSON.stringify(graph.length === 1 ? graph[0] : graph).replace(/</g, '\\u003c');
      lines.push(`<script type="application/ld+json">${json}</script>`);
    }
  }
  lines.push(MARK_END);
  return lines.join('');
}

function injectInto(html: string, file: string): string {
  // Remove any previously injected block (idempotency).
  html = html.replace(new RegExp(`${MARK_START}[\\s\\S]*?${MARK_END}`), '');
  // Remove the prerenderer's (empty) <title> so we don't end up with two.
  html = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, '');

  const block = buildSeoBlock(file);
  // Insert right after the opening <head> tag.
  return html.replace(/(<head\b[^>]*>)/i, `$1${block}`);
}

async function main(): Promise<void> {
  if (!fs.existsSync(distDir)) {
    console.error('❌ dist/ not found. Run "expo export --platform web" first.');
    process.exit(1);
  }

  // GitHub Pages SPA fallback (created before injection so it gets tags too).
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, path.join(distDir, '404.html'));
    console.log('✅ Wrote dist/404.html (GitHub Pages SPA fallback)');
  } else {
    console.warn('⚠️  dist/index.html not found — skipped 404.html');
  }

  const htmlFiles = await glob('**/*.html', { cwd: distDir });
  let injected = 0;
  let skipped = 0;
  const titles = new Map<string, string[]>();

  for (const file of htmlFiles) {
    if (isSkippable(file) && !NOINDEX_FILES.has(file)) {
      skipped++;
      continue;
    }
    const filePath = path.join(distDir, file);
    const html = fs.readFileSync(filePath, 'utf8');
    if (!/<head\b[^>]*>/i.test(html)) {
      skipped++;
      continue;
    }
    const next = injectInto(html, file);
    fs.writeFileSync(filePath, next, 'utf8');
    injected++;

    const route = fileToRoute(file);
    const t = formatTitle(resolveRouteMeta(route).title);
    if (!NOINDEX_FILES.has(file)) {
      titles.set(t, [...(titles.get(t) ?? []), file]);
    }
  }

  const dupes = [...titles.entries()].filter(([, files]) => files.length > 1);

  console.log('\n📊 SEO injection summary');
  console.log(`   Pages injected: ${injected}`);
  console.log(`   Files skipped:  ${skipped} (dynamic templates / sitemap)`);
  if (dupes.length > 0) {
    console.log(`   ⚠️  ${dupes.length} duplicate title(s):`);
    dupes.slice(0, 10).forEach(([t, files]) => console.log(`      "${t}" → ${files.join(', ')}`));
  } else {
    console.log('   ✅ All injected titles are unique');
  }
  console.log('');
}

main().catch((error) => {
  console.error('Error finalizing web build:', error);
  process.exit(1);
});
