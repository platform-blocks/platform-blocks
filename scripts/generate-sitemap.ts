import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHART_DOCS } from '../apps/docs/config/charts';
import { EXAMPLE_APPS } from '../apps/docs/config/exampleApps';
import { componentRoute } from '../apps/docs/utils/componentRoute';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const docsDir = path.join(repoRoot, 'apps', 'docs');
const publicDir = path.join(docsDir, 'public');
const generatedDir = path.join(docsDir, 'data', 'generated');
const outputPath = path.join(publicDir, 'sitemap.xml');

const BASE_URL = 'https://plocks.dev';

interface SitemapUrl {
  loc: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

async function readJSON<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw) as T;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function createUrlEntry(url: SitemapUrl): string {
  let entry = '  <url>\n';
  entry += `    <loc>${escapeXml(url.loc)}</loc>\n`;
  if (url.changefreq) {
    entry += `    <changefreq>${url.changefreq}</changefreq>\n`;
  }
  if (url.priority !== undefined) {
    entry += `    <priority>${url.priority.toFixed(1)}</priority>\n`;
  }
  entry += '  </url>';
  return entry;
}

async function generateSitemap(): Promise<void> {
  const urls: SitemapUrl[] = [];

  // Homepage
  urls.push({
    loc: `${BASE_URL}/`,
    changefreq: 'weekly',
    priority: 1.0,
  });

  // Main sections
  const mainSections = [
    { path: '/getting-started', priority: 0.9 },
    { path: '/examples', priority: 0.8 },
    { path: '/extensions', priority: 0.8 },
    { path: '/examples/login', priority: 0.6 },
    { path: '/examples/settings', priority: 0.6 },
    { path: '/examples/dashboard', priority: 0.6 },
    { path: '/components', priority: 0.9 },
    { path: '/charts', priority: 0.9 },
    { path: '/hooks', priority: 0.9 },
    { path: '/accessibility', priority: 0.8 },
    { path: '/localization', priority: 0.8 },
    { path: '/contribute', priority: 0.7 },
    { path: '/llms', priority: 0.6 },
    { path: '/faq', priority: 0.6 },
  ];

  mainSections.forEach(section => {
    urls.push({
      loc: `${BASE_URL}${section.path}`,
      changefreq: 'weekly',
      priority: section.priority,
    });
  });

  // The full app demos are published only by build-web-with-demos.
  if (process.env.EXPO_PUBLIC_DEMOS_BUNDLED === 'true') {
    EXAMPLE_APPS.forEach(({ slug }) => {
      urls.push({
        loc: `${BASE_URL}/demos/${slug}/`,
        changefreq: 'monthly',
        priority: 0.6,
      });
      urls.push({
        loc: `${BASE_URL}/demos/${slug}/source.html`,
        changefreq: 'monthly',
        priority: 0.5,
      });
    });
  }

  // Load components from meta
  const componentsMeta = await readJSON<Record<string, any>>(
    path.join(generatedDir, 'components-meta.json')
  );

  const componentNames = Object.keys(componentsMeta).sort();
  componentNames.filter(name => componentsMeta[name]?.packageName !== '@plocks/charts').forEach(name => {
    urls.push({
      loc: `${BASE_URL}${componentRoute(name)}`,
      changefreq: 'monthly',
      priority: 0.8,
    });
  });

  // Charts (sourced from the docs app chart registry).
  CHART_DOCS.map((chart) => chart.slug)
    .sort()
    .forEach((slug) => {
      urls.push({
        loc: `${BASE_URL}/charts/${slug}`,
        changefreq: 'monthly',
        priority: 0.8,
      });
    });


  // Load hooks from meta
  const hooksMeta = await readJSON<Record<string, any>>(
    path.join(generatedDir, 'hooks-meta.json')
  );

  const hookNames = Object.keys(hooksMeta).sort();
  hookNames.forEach(name => {
    urls.push({
      loc: `${BASE_URL}/hooks/${name}`,
      changefreq: 'monthly',
      priority: 0.7,
    });
  });

  // Generate XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  urls.forEach(url => {
    xml += createUrlEntry(url) + '\n';
  });
  
  xml += '</urlset>\n';

  // Write to file
  await fs.mkdir(publicDir, { recursive: true });
  await fs.writeFile(outputPath, xml, 'utf8');
  
  console.log(`✅ Sitemap generated at ${outputPath}`);
  console.log(`   Total URLs: ${urls.length}`);
}

async function main(): Promise<void> {
  try {
    await generateSitemap();
  } catch (error) {
    console.error('❌ Failed to generate sitemap:', error);
    process.exitCode = 1;
  }
}

main();
