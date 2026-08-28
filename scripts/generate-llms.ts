/**
 * llms.txt generator.
 *
 * Follows the https://llmstxt.org convention: instead of one enormous
 * truncated file, the site publishes
 *
 *   /llms.txt                    a compact index — one link + summary per page
 *   /llms-full.txt               every page concatenated, nothing truncated
 *   /llms/<section>/<page>.md    each page as a standalone Markdown file
 *
 * An agent reads the index, then fetches only the handful of pages it needs.
 *
 * Inputs are the artifacts written by scripts/generate-demos.ts plus the
 * JSX-free content modules under apps/platform-blocks.com/config/. Run
 * `npm run demos:generate` first — without the generated data this emits an
 * index of whatever it can find and warns about the rest.
 */

import { promises as fs, type Dirent } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CORE_COMPONENTS, type CoreComponentConfig } from '../apps/platform-blocks.com/config/coreComponents';
import { FAQ_ITEMS } from '../apps/platform-blocks.com/config/faq';
import { GITHUB_REPO, NPM_PACKAGE, SITE_URL } from '../apps/platform-blocks.com/config/urls';
import {
  GETTING_STARTED_PREREQUISITES,
  GETTING_STARTED_STEPS,
  GETTING_STARTED_SUBTITLE,
} from '../apps/platform-blocks.com/config/gettingStarted';
import {
  STARTER_TEMPLATES,
  TEMPLATES_GUIDANCE,
  TEMPLATES_TITLE,
} from '../apps/platform-blocks.com/config/templates';
import {
  ACCESSIBILITY_EXAMPLE_LEAD,
  ACCESSIBILITY_EXAMPLE_SNIPPET,
  ACCESSIBILITY_EXAMPLE_TITLE,
  ACCESSIBILITY_INTRO,
  ACCESSIBILITY_OUTRO,
  ACCESSIBILITY_SECTIONS,
  ACCESSIBILITY_TITLE,
} from '../apps/platform-blocks.com/config/accessibility';
import {
  LOCALIZATION_NOTE_KEYS,
  LOCALIZATION_STEPS,
} from '../apps/platform-blocks.com/config/localization';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const docsDir = path.join(repoRoot, 'apps', 'platform-blocks.com');
const generatedDir = path.join(docsDir, 'data', 'generated');
const publicDir = path.join(docsDir, 'public');
const llmsDir = path.join(publicDir, 'llms');
const uiDir = path.join(repoRoot, 'packages', 'ui');

const GITHUB_BRANCH = 'main';
const GITHUB_TREE = `${GITHUB_REPO}/tree/${GITHUB_BRANCH}`;

type JSONObject = Record<string, unknown>;

/** One published page: a Markdown file plus its row in the index. */
interface LlmsPage {
  /** Path under /llms, e.g. `components/Button.md`. */
  slug: string;
  /** Link text in the index. */
  title: string;
  /** Trailing summary in the index. Omitted when there is nothing useful to say. */
  summary?: string;
  /** Full Markdown body of the page. */
  body: string;
}

/** An `## Heading` group of pages in llms.txt. */
interface LlmsSection {
  heading: string;
  pages: LlmsPage[];
}

// ---------------------------------------------------------------------------
// IO helpers
// ---------------------------------------------------------------------------

async function readTextIfExists(filePath: string): Promise<string | null> {
  try {
    return (await fs.readFile(filePath, 'utf8')).replace(/\r\n/g, '\n');
  } catch {
    return null;
  }
}

async function readJSONIfExists<T = any>(filePath: string): Promise<T | null> {
  const raw = await readTextIfExists(filePath);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Writes every page and removes any `.md` left over from a previous run, so a
 * renamed or deleted component never lingers as a stale URL the index no longer
 * links to.
 */
async function writePages(pages: LlmsPage[]): Promise<void> {
  const expected = new Set(pages.map(page => path.join(llmsDir, page.slug)));

  const stale: string[] = [];
  async function walk(dir: string): Promise<void> {
    let entries: Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.name.endsWith('.md') && !expected.has(full)) {
        stale.push(full);
      }
    }
  }
  await walk(llmsDir);
  await Promise.all(stale.map(file => fs.rm(file, { force: true })));

  for (const page of pages) {
    const target = path.join(llmsDir, page.slug);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, `${page.body.trimEnd()}\n`, 'utf8');
  }

  if (stale.length) {
    console.log(`   Removed ${stale.length} stale page(s)`);
  }
}

// ---------------------------------------------------------------------------
// Markdown helpers
// ---------------------------------------------------------------------------

/**
 * Collapses a multi-paragraph description to the one line the index shows.
 *
 * Some component descriptions open with their own `# Heading` or a stray `---`
 * left over from frontmatter, so leading non-prose is skipped rather than
 * published as the summary.
 */
function toSummary(text: unknown): string | undefined {
  if (typeof text !== 'string') return undefined;
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph && !/^#{1,6}\s/.test(paragraph) && !/^-{3,}$/.test(paragraph));
  const firstParagraph = paragraphs[0] ?? '';
  const flat = firstParagraph
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  if (!flat) return undefined;
  // One sentence is enough for an index row; the page itself carries the rest.
  const sentenceEnd = flat.search(/\.\s/);
  const sentence = sentenceEnd > 40 ? flat.slice(0, sentenceEnd + 1) : flat;
  return sentence.replace(/\s*\.$/, '');
}

function codeBlock(code: string, language = 'tsx'): string {
  return `\`\`\`${language}\n${code.replace(/\r\n/g, '\n').trim()}\n\`\`\``;
}

function joinLines(lines: Array<string | null | undefined>): string {
  return lines.filter(line => line !== null && line !== undefined).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

/**
 * Guides — rendered from the same JSX-free config modules the pages import, so
 * the Markdown cannot drift from what the site shows.
 */
async function buildGuidePages(): Promise<LlmsPage[]> {
  const pages: LlmsPage[] = [];

  // Getting started
  pages.push({
    slug: 'guides/getting-started.md',
    title: 'Getting started',
    summary: GETTING_STARTED_SUBTITLE.replace(/\.$/, ''),
    body: joinLines([
      '# Getting started',
      '',
      GETTING_STARTED_SUBTITLE,
      '',
      `Docs: ${SITE_URL}/getting-started`,
      '',
      '**Prerequisites:**',
      '',
      ...GETTING_STARTED_PREREQUISITES.map(
        p => `- [${p.label} ${p.version}](${p.href}) — ${p.note}`
      ),
      '',
      ...GETTING_STARTED_STEPS.flatMap(step => [
        `## ${step.title}`,
        '',
        step.lead,
        '',
        step.fileName ? `\`${step.fileName}\`` : null,
        step.fileName ? '' : null,
        codeBlock(step.code, step.variant === 'terminal' ? 'bash' : 'tsx'),
        '',
        step.note ?? null,
        step.note ? '' : null,
      ]),
      `## ${TEMPLATES_TITLE}`,
      '',
      TEMPLATES_GUIDANCE,
      '',
      ...STARTER_TEMPLATES.map(t =>
        t.available
          ? `- [${t.name}](${t.repo}) — ${t.description} (${t.tags.join(', ')})`
          : `- ${t.name} (coming soon) — ${t.description} (${t.tags.join(', ')})`
      ),
      '',
    ]),
  });

  // Accessibility
  pages.push({
    slug: 'guides/accessibility.md',
    title: 'Accessibility',
    summary: 'How Platform Blocks meets WCAG 2.1 AA for keyboard, screen reader, low-vision, and motion-sensitive users',
    body: joinLines([
      `# ${ACCESSIBILITY_TITLE}`,
      '',
      ACCESSIBILITY_INTRO,
      '',
      `Docs: ${SITE_URL}/accessibility`,
      '',
      ...ACCESSIBILITY_SECTIONS.flatMap(section => [
        `## ${section.title}`,
        '',
        section.lead,
        '',
        ...section.items.map(item => `- ${item}`),
        '',
      ]),
      `## ${ACCESSIBILITY_EXAMPLE_TITLE}`,
      '',
      ACCESSIBILITY_EXAMPLE_LEAD,
      '',
      codeBlock(ACCESSIBILITY_EXAMPLE_SNIPPET),
      '',
      ACCESSIBILITY_OUTRO,
    ]),
  });

  // Localization — prose lives in the English i18n bundle the page renders.
  const enBundle = await readJSONIfExists<JSONObject>(
    path.join(docsDir, 'i18n', 'locales', 'en', 'common.json'),
  );
  const localization = (enBundle?.localization ?? {}) as JSONObject;
  const steps = (localization.steps ?? {}) as Record<string, string>;
  if (localization.intro) {
    pages.push({
      slug: 'guides/localization.md',
      title: 'Localization',
      summary: toSummary(localization.intro),
      body: joinLines([
        `# ${localization.title ?? 'Localization'}`,
        '',
        String(localization.intro),
        '',
        `Docs: ${SITE_URL}/localization`,
        '',
        ...LOCALIZATION_STEPS.flatMap(step => [
          `## ${step.title}`,
          '',
          steps[step.key]?.trim() ?? null,
          steps[step.key] ? '' : null,
          `\`${step.fileName}\``,
          '',
          codeBlock(step.snippet),
          '',
        ]),
        '## Notes',
        '',
        ...LOCALIZATION_NOTE_KEYS.map(key => (steps[key] ? `- ${steps[key]}` : null)),
      ]),
    });
  }

  return pages;
}

/** One file per question, so an agent can fetch a single answer. */
function buildFaqPages(): LlmsPage[] {
  return FAQ_ITEMS.map(item => ({
    slug: `faq/${item.key}.md`,
    title: item.question,
    summary: toSummary(item.answer),
    body: joinLines([
      `# ${item.question}`,
      '',
      item.answer,
      '',
      `Docs: ${SITE_URL}/faq`,
    ]),
  }));
}

/**
 * Components and charts, sourced from the per-component Markdown
 * generate-demos.ts already builds for the docs app's "Copy Markdown" action.
 */
async function buildComponentPages(): Promise<{ components: LlmsPage[]; charts: LlmsPage[] }> {
  const markdownIndex = await readJSONIfExists<Record<string, string>>(
    path.join(generatedDir, 'component-markdown.json'),
  );
  const meta = (await readJSONIfExists<Record<string, JSONObject>>(
    path.join(generatedDir, 'components-meta.json'),
  )) ?? {};

  if (!markdownIndex) {
    console.warn('⚠️  component-markdown.json not found — run `npm run demos:generate` first.');
    return { components: [], charts: [] };
  }

  // CORE_COMPONENTS is what the site's nav and /components page are built from,
  // so it decides both which components are published and how they are grouped.
  const configByName = new Map<string, CoreComponentConfig>(
    CORE_COMPONENTS.map(entry => [entry.name, entry]),
  );

  const components: LlmsPage[] = [];
  const charts: LlmsPage[] = [];

  for (const name of Object.keys(markdownIndex).sort((a, b) => a.localeCompare(b))) {
    const config = configByName.get(name);
    const componentMeta = meta[name] ?? {};
    const isChart = config?.category === 'charts' || componentMeta.category === 'charts';
    const page: LlmsPage = {
      slug: `components/${name}.md`,
      title: String(componentMeta.title || name),
      summary: toSummary(componentMeta.description) ?? config?.description,
      body: markdownIndex[name],
    };
    (isChart ? charts : components).push(page);
  }

  return { components, charts };
}

/**
 * Resolves the file that actually declares a hook.
 *
 * Most hook folders are a barrel: `index.ts` re-exports from a sibling file
 * (`./useHover`) or, for the hotkey family, from another hook's folder
 * (`../useHotkeys`). Follows those one hop at a time until a file declares the
 * hook, so the Definition block is never empty just because of indirection.
 */
async function resolveHookSource(name: string): Promise<string | null> {
  const hooksRoot = path.join(uiDir, 'src', 'hooks');
  const declares = (source: string) =>
    new RegExp(`^export\\s+(?:function|const)\\s+${name}\\b`, 'm').test(source);

  let current = path.join(hooksRoot, name, 'index.ts');
  const seen = new Set<string>();

  while (!seen.has(current)) {
    seen.add(current);
    const source = await readTextIfExists(current);
    if (!source) return null;
    if (declares(source)) return source;

    // `export { name, type Foo } from './somewhere';` — follow the one that
    // re-exports this hook.
    const reExport = [...source.matchAll(/export\s*\{([^}]*)\}\s*from\s*'([^']+)'/g)]
      .find(match => match[1].split(',').some(part => part.trim().replace(/^type\s+/, '') === name));
    if (!reExport) return null;

    const specifier = path.resolve(path.dirname(current), reExport[2]);
    current = (await readTextIfExists(`${specifier}.ts`)) !== null
      ? `${specifier}.ts`
      : path.join(specifier, 'index.ts');
  }

  return null;
}

/**
 * Pulls a hook's public surface out of its source: its signature plus the
 * exported types that signature names. This is the part an agent needs most —
 * hooks have no equivalent of the components' generated props tables.
 *
 * Scoped to the types the signature actually references, because several hooks
 * are declared alongside unrelated siblings in useHotkeys/index.ts.
 */
function extractHookDefinition(source: string, name: string): string | null {
  const signatureMatch =
    source.match(new RegExp(`^export\\s+function\\s+${name}\\b[\\s\\S]*?\\)\\s*(?::\\s*[^{]+?)?\\s*\\{`, 'm'))
    ?? source.match(new RegExp(`^export\\s+const\\s+${name}\\b[^=]*=\\s*[\\s\\S]*?\\)\\s*(?::\\s*[^=]+?)?\\s*=>`, 'm'));
  if (!signatureMatch) return null;

  // Flattened to one line: a multi-line parameter list reads worse than a
  // single signature once the body is gone.
  const signature = `${signatureMatch[0]
    .replace(/\s*(?:\{|=>)$/, '')
    .replace(/\s+/g, ' ')
    .replace(/\(\s+/g, '(')
    .replace(/,?\s+\)/g, ')')
    .trim()};`;

  // Exported interfaces and type aliases, kept whole so the member JSDoc
  // travels with them. Braced forms are matched before the `= ...;` form so a
  // one-line alias never swallows the file down to the next column-0 `}`.
  const declarations = new Map<string, string>();
  const patterns = [
    /^export\s+interface\s+(\w+)(?:<[^>]*>)?[^{]*\{[\s\S]*?^\}/gm,
    /^export\s+type\s+(\w+)(?:<[^>]*>)?\s*=\s*\{[\s\S]*?^\}/gm,
    /^export\s+type\s+(\w+)(?:<[^>]*>)?\s*=[^;]*?;$/gm,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      if (!declarations.has(match[1])) declarations.set(match[1], match[0].trim());
    }
  }

  // Follow references transitively: a hook returning `UseDisclosureReturn` is
  // only readable if the alias it points at comes along too.
  const included: string[] = [];
  const pending = [signature];
  while (pending.length) {
    const text = pending.shift()!;
    for (const [typeName, declaration] of declarations) {
      if (included.includes(typeName)) continue;
      if (!new RegExp(`\\b${typeName}\\b`).test(text)) continue;
      included.push(typeName);
      pending.push(declaration);
    }
  }

  return [...included.map(typeName => declarations.get(typeName)!), signature].join('\n\n');
}

async function buildHookPages(): Promise<LlmsPage[]> {
  const hooksMeta = (await readJSONIfExists<Record<string, JSONObject>>(
    path.join(generatedDir, 'hooks-meta.json'),
  )) ?? {};
  const hooksJson = (await readJSONIfExists<{ hooks: Array<Record<string, any>> }>(
    path.join(generatedDir, 'hooks.json'),
  )) ?? { hooks: [] };

  const names = Object.keys(hooksMeta).sort((a, b) => a.localeCompare(b));
  if (!names.length) {
    console.warn('⚠️  hooks-meta.json not found or empty — run `npm run demos:generate` first.');
    return [];
  }

  const demosByHook = new Map<string, Array<Record<string, any>>>();
  for (const demo of hooksJson.hooks) {
    if (demo.hidden) continue;
    const hook = demo.component as string | undefined;
    if (!hook) continue;
    if (!demosByHook.has(hook)) demosByHook.set(hook, []);
    demosByHook.get(hook)!.push(demo);
  }

  const pages: LlmsPage[] = [];
  const missingDefinitions: string[] = [];
  for (const name of names) {
    const meta = hooksMeta[name];
    if (meta.hidden === true) continue;

    const sourcePath = `packages/ui/src/hooks/${name}`;
    const source = await resolveHookSource(name);
    const definition = source ? extractHookDefinition(source, name) : null;
    if (!definition) missingDefinitions.push(name);

    const metaList: string[] = [
      `- Canonical name: \`${name}\``,
      '- Package: `@platform-blocks/ui`',
      `- Import: \`import { ${name} } from '@platform-blocks/ui';\``,
    ];
    if (meta.status) metaList.push(`- Status: ${meta.status}`);
    if (meta.since) metaList.push(`- Since: ${meta.since}`);
    if (meta.category) metaList.push(`- Category: ${meta.category}`);
    if (Array.isArray(meta.tags) && meta.tags.length) {
      metaList.push(`- Tags: ${(meta.tags as string[]).join(', ')}`);
    }
    metaList.push(`- Docs: ${SITE_URL}/hooks/${name}`);
    metaList.push(`- Source: ${GITHUB_TREE}/${sourcePath}`);

    const demos = (demosByHook.get(name) ?? []).sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );

    pages.push({
      slug: `hooks/${name}.md`,
      title: String(meta.title || name),
      summary: toSummary(meta.description),
      body: joinLines([
        `# ${meta.title || name}`,
        '',
        meta.description ? String(meta.description) : null,
        '',
        '## Metadata',
        '',
        ...metaList,
        '',
        definition ? '## Definition' : null,
        definition ? '' : null,
        definition ? codeBlock(definition, 'ts') : null,
        definition ? '' : null,
        demos.length ? '## Examples' : null,
        demos.length ? '' : null,
        ...demos.flatMap(demo => [
          `### ${demo.title || demo.demo}`,
          '',
          demo.description ? String(demo.description) : null,
          demo.description ? '' : null,
          demo.code ? codeBlock(demo.code) : null,
          '',
        ]),
      ]),
    });
  }

  if (missingDefinitions.length) {
    console.warn(`⚠️  No type definition found for: ${missingDefinitions.join(', ')}`);
  }

  return pages;
}

// ---------------------------------------------------------------------------
// Index + full text
// ---------------------------------------------------------------------------

function pageUrl(page: LlmsPage): string {
  return `${SITE_URL}/llms/${page.slug}`;
}

function buildIndex(sections: LlmsSection[], counts: Record<string, number>): string {
  const lines: string[] = [
    '# Platform Blocks',
    '',
    `> A cross-platform React Native UI library — ${counts.components} components, ${counts.charts} charts,`,
    `> and ${counts.hooks} hooks that render natively on iOS and Android and as real DOM on the web,`,
    '> from one themeable component model.',
    '',
    'This index lists Platform Blocks documentation pages formatted for LLMs.',
    'Each link points to a standalone Markdown file under the /llms path.',
    '',
    'For a single consolidated file with all content, use:',
    `- ${SITE_URL}/llms-full.txt`,
    '',
    'Install: `npm install @platform-blocks/ui`',
    `Website: ${SITE_URL} • GitHub: ${GITHUB_REPO} • npm: ${NPM_PACKAGE}`,
    '',
  ];

  for (const section of sections) {
    if (!section.pages.length) continue;
    lines.push(`## ${section.heading}`, '');
    for (const page of section.pages) {
      const summary = page.summary ? `: ${page.summary}` : '';
      lines.push(`- [${page.title}](${pageUrl(page)})${summary}`);
    }
    lines.push('');
  }

  return `${lines.join('\n').trimEnd()}\n`;
}

function buildFullText(sections: LlmsSection[]): string {
  const parts: string[] = [
    '# Platform Blocks — Complete Documentation',
    '',
    'Every documentation page concatenated in full: component and chart pages with',
    'their props tables and every demo, hook pages with their type definitions,',
    'the guides, and the FAQ. Nothing here is truncated.',
    '',
    `For an index of the same content as individually fetchable pages, use ${SITE_URL}/llms.txt`,
    '',
    'All code examples use the published package imports (@platform-blocks/ui, @platform-blocks/charts).',
    '',
    '='.repeat(80),
    '',
  ];

  for (const section of sections) {
    if (!section.pages.length) continue;
    parts.push(`# ${section.heading.toUpperCase()}`, '');
    for (const page of section.pages) {
      parts.push(`<!-- source: ${pageUrl(page)} -->`, '', page.body.trim(), '', '-'.repeat(80), '');
    }
  }

  return `${parts.join('\n').trimEnd()}\n`;
}

// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const [guides, faq, { components, charts }, hooks] = await Promise.all([
    buildGuidePages(),
    Promise.resolve(buildFaqPages()),
    buildComponentPages(),
    buildHookPages(),
  ]);

  const sections: LlmsSection[] = [
    { heading: 'Guides', pages: guides },
    { heading: 'Components', pages: components },
    { heading: 'Charts', pages: charts },
    { heading: 'Hooks', pages: hooks },
    { heading: 'FAQ', pages: faq },
  ];

  const pages = sections.flatMap(section => section.pages);

  await fs.mkdir(llmsDir, { recursive: true });
  await writePages(pages);

  const index = buildIndex(sections, {
    components: components.length,
    charts: charts.length,
    hooks: hooks.length,
  });
  await fs.writeFile(path.join(publicDir, 'llms.txt'), index, 'utf8');

  const full = buildFullText(sections);
  await fs.writeFile(path.join(publicDir, 'llms-full.txt'), full, 'utf8');

  console.log('✅ llms.txt generated');
  for (const section of sections) {
    if (section.pages.length) console.log(`   ${section.heading}: ${section.pages.length} pages`);
  }
  console.log(`   Index: ${(index.length / 1024).toFixed(1)} KB → public/llms.txt`);
  console.log(`   Full:  ${(full.length / 1024).toFixed(1)} KB → public/llms-full.txt`);
  console.log(`   Pages: ${pages.length} files → public/llms/`);
}

main().catch(error => {
  console.error('❌ Failed to generate llms.txt', error);
  process.exitCode = 1;
});
