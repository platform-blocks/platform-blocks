#!/usr/bin/env ts-node
/**
 * Demo index generator (Phase 0)
 * Responsibilities:
 *   - Scan component demo directories: ui/src/components/<Component>/demo/*.tsx
 *   - Read optional paired markdown (.md) with YAML frontmatter for metadata
 *   - Emit generated artifacts to docs/data/generated/
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

import { GITHUB_REPO, SITE_URL } from '../apps/platform-blocks.com/config/urls';
import { LLMS_SHARED_PROPS_URL } from '../apps/platform-blocks.com/config/llmsDocs';

const ROOT = path.resolve(__dirname, '..');
const UI_COMPONENTS_DIR = path.join(ROOT, 'packages', 'ui', 'src', 'components');
const UI_HOOKS_DIR = path.join(ROOT, 'packages', 'ui', 'src', 'hooks');
const CHARTS_COMPONENTS_DIR = path.join(ROOT, 'packages', 'charts', 'src', 'components'); // charts components directory
const OUTPUT_DIR = path.join(ROOT, 'apps', 'platform-blocks.com', 'data', 'generated');
// Per-component markdown consumed by the docs app (CopyPageMenu) and by
// scripts/generate-llms.ts, which publishes it under public/llms/.
const COMPONENT_MARKDOWN_DIR = path.join(OUTPUT_DIR, 'component-markdown');

interface DemoMeta {
  id: string; // Component.demoId
  component: string;
  demo: string; // short demo key (no component prefix)
  title: string;
  kind?: 'component' | 'chart' | 'hook';
  description?: string;
  localizedDescriptions?: Record<string, string>;
  tags: string[];
  category: string;
  order: number;
  status?: string;
  since?: string;
  hidden?: boolean;
  highlightLines?: (number | string)[];
  renderStyle?: 'auto' | 'center';
  codeCopy?: boolean; // show copy button
  codeLineNumbers?: boolean; // show line numbers
  codeSpoiler?: boolean; // wrap code in spoiler
  codeSpoilerMaxHeight?: number;
  previewCenter?: boolean; // center preview region regardless of layout
  code?: string; // raw source when inlined (hooks, playgrounds)
  importPath?: string; // source module path reference
  githubUrl?: string; // source file on GitHub, linked from the demo's code panel
}

interface DemoFile { name: string; code: string; githubUrl?: string; }
interface CodeEntry { code: string; hash: string; importPath: string; files?: DemoFile[]; githubUrl?: string; }

/** A public export documented on its parent's page — RadioGroup on Radio, Form.Field on Form. */
interface SubcomponentDoc { name: string; props: any[]; }
/** A hook exported beside a component — useToast beside Toast. */
interface RelatedHookDoc { name: string; signature?: string; summary?: string; }

/**
 * Branch the docs site links source at. `main` rather than a tag or commit SHA:
 * the site is rebuilt from main, so a permalink would start pointing at stale
 * source the moment a demo is edited.
 */
const GITHUB_BRANCH = 'main';

/**
 * Repo URL for a file on disk, powering the CodeBlock edit button on every demo.
 * Paths are relative to the repo root, so the link survives the demo folder
 * moving as long as the file still exists at its new path.
 */
function githubUrlFor(absPath: string): string {
  const relative = path.relative(ROOT, absPath).split(path.sep).join('/');
  return `${GITHUB_REPO}/blob/${GITHUB_BRANCH}/${relative}`;
}

/** Attaches `githubUrl` to `index.tsx` and keeps the sibling files' own links. */
function withEntryFiles(indexPath: string, code: string, extraFiles: DemoFile[]): DemoFile[] {
  return [{ name: 'index.tsx', code, githubUrl: githubUrlFor(indexPath) }, ...extraFiles];
}

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function sha256(content: string) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function parseStructuredValue(rawValue: string): any {
  const value = rawValue.trim();
  const looksJson = (value.startsWith('[') && value.endsWith(']')) || (value.startsWith('{') && value.endsWith('}'));
  if (!looksJson) return rawValue;
  try {
    return JSON.parse(value);
  } catch {
    if (value.startsWith('[') && value.endsWith(']')) {
      return value
        .slice(1, -1)
        .split(',')
        .map((token) => token.trim())
        .filter(Boolean);
    }
    return rawValue;
  }
}

function parseFrontmatter(raw: string): { frontmatter: any; body: string } {
  if (!raw.startsWith('---')) return { frontmatter: {}, body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { frontmatter: {}, body: raw };
  const fmBlock = raw.substring(3, end).trim();
  const body = raw.substring(end + 4).replace(/^\n/, '');
  const frontmatter: any = {};
  for (const line of fmBlock.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let value: any = m[2];
    if (typeof value === 'string') {
      value = value.replace(/\s+\/\/.*$/, '').replace(/\s+#.*$/, '').trim();
    }
    if (typeof value === 'string' && ((value.startsWith('[') && value.endsWith(']')) || (value.startsWith('{') && value.endsWith('}')))) {
      const structured = parseStructuredValue(value);
      if (structured !== value) {
        value = structured;
      }
    }
    // Quoted scalars are YAML strings, not part of the value — several meta
    // files quote category/status and were publishing `Category: "Input"`.
    if (typeof value === 'string' && /^(".*"|'.*')$/.test(value)) {
      value = value.slice(1, -1);
    }
    if (typeof value === 'string' && /^\d+$/.test(value)) value = parseInt(value, 10);
    if (value === 'true') value = true; else if (value === 'false') value = false;
    frontmatter[key] = value;
  }
  return { frontmatter, body };
}

/**
 * Index of the next character that is code: skips comments and string
 * literals, whose brackets would otherwise throw a bracket-depth scan off.
 */
function skipTrivia(source: string, index: number): number {
  let i = index;
  for (;;) {
    if (source.startsWith('/*', i)) {
      const end = source.indexOf('*/', i + 2);
      i = end === -1 ? source.length : end + 2;
    } else if (source.startsWith('//', i)) {
      const end = source.indexOf('\n', i);
      i = end === -1 ? source.length : end;
    } else if (source[i] === "'" || source[i] === '"' || source[i] === '`') {
      const quote = source[i];
      let j = i + 1;
      while (j < source.length && source[j] !== quote) j += source[j] === '\\' ? 2 : 1;
      i = j + 1;
    } else {
      return i;
    }
  }
}

/**
 * The frontmatter `description` one-liner, kept when a Markdown body replaces it
 * as the component's description. The body is the richer text for the page, but
 * it does not always open with a summary (Calendar's opens on its accessibility
 * notes), so the one-liner is published alongside as the index fallback.
 */
function frontmatterTagline(frontmatter: any, body: string | undefined): string | undefined {
  if (!(body || '').trim()) return undefined;
  const value = typeof frontmatter?.description === 'string' ? frontmatter.description.trim() : '';
  return value || undefined;
}

interface ComponentMetaRecord {
  [component: string]: any;
}

interface HookMetaRecord {
  [hook: string]: any;
}

type PlaygroundMetaConfig = {
  id: string;
  label?: string;
  description?: string;
};

function parseHighlight(val: any): (number | string)[] | undefined {
  if (!val) return undefined;
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    return val.split(',').map(s => s.trim()).filter(Boolean);
  }
  return undefined;
}

/**
 * Extensions a demo folder can contribute as an extra source tab (`data.ts`,
 * `theme.ts`, `fixtures.json`, …). `index.tsx` is the demo entry and is added
 * first by the caller; `metadata.ts` and the description markdown are docs
 * plumbing rather than example source, so they stay out of the tab strip.
 */
const DEMO_FILE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.css']);
const DEMO_FILE_EXCLUDE = new Set(['index.tsx', 'index.ts', 'metadata.ts']);

function collectDemoFiles(folderPath: string): DemoFile[] {
  let entries: string[] = [];
  try { entries = fs.readdirSync(folderPath); } catch { return []; }
  return entries
    .filter(name => !name.startsWith('.'))
    .filter(name => !DEMO_FILE_EXCLUDE.has(name))
    .filter(name => DEMO_FILE_EXTENSIONS.has(path.extname(name)))
    .filter(name => { try { return fs.statSync(path.join(folderPath, name)).isFile(); } catch { return false; } })
    .sort()
    .map(name => ({
      name,
      code: fs.readFileSync(path.join(folderPath, name), 'utf8').trim(),
      githubUrl: githubUrlFor(path.join(folderPath, name)),
    }));
}

/**
 * Fixtures a demo imports from outside its own folder — `../data`, shared by
 * every demo of a component, and the occasional `../../<Other>/demos/data`.
 * They are emitted as `data.ts` alongside the demo so the source tab strip and
 * the Snack bundle both see a self-contained example; snackUrl.ts rewrites the
 * import to match. Only `data` modules travel: a demo reaching further into the
 * package is a component import, which the Snack resolves from npm instead.
 */
function collectSharedDataFiles(code: string, folderPath: string): DemoFile[] {
  const files: DemoFile[] = [];
  const seen = new Set<string>();
  for (const match of code.matchAll(/from\s*['"]((?:\.\.\/)+(?:[^'"]*\/)?data)(?:\.ts)?['"]/g)) {
    const resolved = path.resolve(folderPath, match[1]);
    if (seen.has(resolved)) continue;
    seen.add(resolved);
    for (const ext of ['.ts', '.tsx']) {
      if (!fs.existsSync(resolved + ext)) continue;
      // The link points at the shared fixture's real location, not the demo
      // folder it is surfaced under.
      files.push({
        name: 'data.ts',
        code: fs.readFileSync(resolved + ext, 'utf8').trim(),
        githubUrl: githubUrlFor(resolved + ext),
      });
      break;
    }
  }
  // Two different shared fixtures would collide on the single `data.ts` name;
  // no demo does that today, and shipping one silently would be worse.
  return files.length > 1 ? [] : files;
}

function normalizePlaygroundMeta(value: any, componentName: string): PlaygroundMetaConfig | undefined {
  if (!value) return undefined;
  if (value === true) {
    return { id: componentName };
  }
  if (typeof value === 'string') {
    return { id: value };
  }
  if (typeof value === 'object') {
    const id = typeof value.id === 'string' && value.id.trim() ? value.id.trim() : componentName;
    const label = typeof value.label === 'string' ? value.label : undefined;
    const description = typeof value.description === 'string' ? value.description : undefined;
    return { id, label, description };
  }
  return undefined;
}

function collectDemos() {
  const demos: DemoMeta[] = [];
  const codeByComponent: Record<string, Record<string, CodeEntry>> = {};
  const componentMeta: ComponentMetaRecord = {};
  // Track source directory per component so props extraction works across multiple roots
  const componentSourceDir: Record<string, string> = {};

  const components = fs.readdirSync(UI_COMPONENTS_DIR).filter(f => fs.statSync(path.join(UI_COMPONENTS_DIR, f)).isDirectory());

  for (const comp of components) {
    componentSourceDir[comp] = path.join(UI_COMPONENTS_DIR, comp);
    const demoDir = path.join(UI_COMPONENTS_DIR, comp, 'demos');
    const metaDir = path.join(UI_COMPONENTS_DIR, comp, 'meta');
    if (!fs.existsSync(demoDir)) continue;

    const entries = fs.readdirSync(demoDir);

    // New canonical metadata location: meta/component.md
    const canonicalMetaMd = path.join(metaDir, 'component.md');
    if (fs.existsSync(canonicalMetaMd)) {
      try {
        const raw = fs.readFileSync(canonicalMetaMd, 'utf8');
        const { frontmatter, body } = parseFrontmatter(raw);
        const fm = { ...(frontmatter || {}) } as any;
        const { playground: playgroundRaw, ...restFm } = fm;
        const desc = (body || '').trim() || (typeof fm.description === 'string' ? fm.description : '');
        const name = typeof fm.name === 'string' && fm.name.trim() ? fm.name : comp;
        const title = typeof fm.title === 'string' && fm.title.trim() ? fm.title : comp;
        const playgroundMeta = normalizePlaygroundMeta(playgroundRaw, comp);
        const metaEntry: Record<string, any> = { ...restFm, name, title, description: desc || `${comp} component` };
        const tagline = frontmatterTagline(fm, body);
        if (tagline) metaEntry.tagline = tagline;
        if (playgroundMeta) metaEntry.playground = playgroundMeta;
        componentMeta[comp] = metaEntry;
      } catch {
        console.warn(`[generate-demos] Failed to parse metadata for ${comp}`);
      }
    } else {
      console.warn(`[generate-demos] Missing canonical meta/component.md for ${comp}`);
    }
    const tsxFiles = entries.filter(f => f.endsWith('.tsx'));
    const subfolders = entries.filter(f => fs.existsSync(path.join(demoDir, f)) && fs.statSync(path.join(demoDir, f)).isDirectory());

    codeByComponent[comp] = codeByComponent[comp] || {};

    // 1. New structure: each subfolder is a demo (expects index.tsx, optional description.md, metadata.ts)
    for (const folder of subfolders) {
      const indexPath = path.join(demoDir, folder, 'index.tsx');
      if (!fs.existsSync(indexPath)) continue; // skip non-demo folders
      const raw = fs.readFileSync(indexPath, 'utf8');

      // Attempt to extract exported code snippet if defined as export const code = `...`;
      let codeSnippet = raw;
      const codeMatch = raw.match(/export const code\s*=\s*`([\s\S]*?)`;/);
      if (codeMatch) {
        codeSnippet = codeMatch[1];
      }
      const codeHash = sha256(codeSnippet);
      const id = `${comp}.${folder}`;
      const relImport = `../../../../packages/ui/src/components/${comp}/demos/${folder}`;
      // Sibling sources (data.ts, fixtures.json, …) become extra file tabs in
      // the docs code panel. Emitted only when the demo actually has them.
      const localFiles = collectDemoFiles(path.join(demoDir, folder));
      const extraFiles = [
        ...localFiles,
        // A demo-local data.ts wins: the demo's own `./data` import points at it.
        ...collectSharedDataFiles(codeSnippet, path.join(demoDir, folder))
          .filter(file => !localFiles.some(local => local.name === file.name)),
      ];
      codeByComponent[comp][id] = {
        code: codeSnippet,
        hash: codeHash,
        importPath: relImport,
        githubUrl: githubUrlFor(indexPath),
        ...(extraFiles.length ? { files: withEntryFiles(indexPath, codeSnippet, extraFiles) } : {}),
      };

      // Metadata precedence: metadata.ts -> frontmatter in description.md -> defaults
      let meta: any = {};
      const metadataTs = path.join(demoDir, folder, 'metadata.ts');
      if (fs.existsSync(metadataTs)) {
        // Naive parse: look for export const <folder> = { ... } capturing JSON-ish body
        const metaRaw = fs.readFileSync(metadataTs, 'utf8');
        const m = metaRaw.match(new RegExp(`export const ${folder}[^=]*=\\s*({[\\s\\S]*?});`));
        if (m) {
          try {
            // Transform to valid JSON: remove trailing commas and unquoted keys (simple heuristic)
            const jsonish = m[1]
              .replace(/:(\s*)(true|false)/g, ':$1$2')
              .replace(/:(\s*)([A-Za-z0-9_]+)([,\n])/g, ':$1"$2"$3');
            meta = {}; // fallback keep empty; proper evaluation intentionally avoided (no eval)
          } catch { }
        }
      }
      const descPath = path.join(demoDir, folder, 'description.md');
      let mdDesc = '';
      // Collect localized descriptions pattern: description.<locale>.md
      const localizedDescriptions: Record<string, string> = {};
      try {
        const localeFiles = fs.readdirSync(path.join(demoDir, folder)).filter(f => /^description\.[a-zA-Z-]+\.md$/.test(f));
        for (const lf of localeFiles) {
          const rawLocale = fs.readFileSync(path.join(demoDir, folder, lf), 'utf8');
          const { body } = parseFrontmatter(rawLocale);
          const locale = lf.split('.')[1];
          localizedDescriptions[locale] = body.trim();
        }
      } catch { }
      if (fs.existsSync(descPath)) {
        const mdRaw = fs.readFileSync(descPath, 'utf8');
        const { frontmatter, body } = parseFrontmatter(mdRaw);
        meta = { ...frontmatter, ...meta }; // frontmatter overrides parsed metadata
        mdDesc = body.trim();
      }
      const short = folder;
      const title = meta.title || short.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      demos.push({
        id,
        component: comp,
        demo: short,
        title,
        // The whole body, not just its first line: the docs page renders demo
        // descriptions through <Markdown>, so lists and paragraphs must survive.
        description: meta.description || mdDesc || '',
        localizedDescriptions: Object.keys(localizedDescriptions).length ? localizedDescriptions : undefined,
        tags: Array.isArray(meta.tags) ? meta.tags : [],
        category: meta.category || 'general',
        order: typeof meta.order === 'number' ? meta.order : 100,
        status: meta.status,
        since: meta.since,
        hidden: meta.hidden === true,
        highlightLines: parseHighlight(meta.highlightLines),
        renderStyle: ['center', 'auto'].includes(meta.renderStyle) ? meta.renderStyle : undefined,
        codeCopy: meta.codeCopy === true || meta.codeCopy === false ? meta.codeCopy : undefined,
        codeLineNumbers: meta.codeLineNumbers === true || meta.codeLineNumbers === false ? meta.codeLineNumbers : undefined,
        codeSpoiler: meta.codeSpoiler === true,
        codeSpoilerMaxHeight: typeof meta.codeSpoilerMaxHeight === 'number' ? meta.codeSpoilerMaxHeight : undefined,
        previewCenter: meta.previewCenter === true ? true : undefined,
      });
    }

    // 2. Legacy flat .tsx files (kept for incremental migration)
    for (const file of tsxFiles) {
      if (file === 'index.ts' || file === 'index.tsx') continue; // ignore aggregator
      const baseName = file.replace(/\.tsx$/, '');
      const prefix = `${comp}.demo.`;
      let short = baseName.startsWith(prefix) ? baseName.slice(prefix.length) : baseName;
      short = short.replace(/\.+/g, '-');
      const id = `${comp}.${short}`;
      if (codeByComponent[comp][id]) continue; // skip if new structure already registered same id
      const tsxPath = path.join(demoDir, file);
      const raw = fs.readFileSync(tsxPath, 'utf8');
      const codeHash = sha256(raw);
      const relImport = `../../../../packages/ui/src/components/${comp}/demos/${baseName}`;
      codeByComponent[comp][id] = { code: raw, hash: codeHash, importPath: relImport, githubUrl: githubUrlFor(tsxPath) };
      const mdPath = path.join(demoDir, `${baseName}.md`);
      let meta: any = {};
      let mdBody = '';
      const localizedDescriptions2: Record<string, string> = {};
      try {
        const localeFiles = fs.readdirSync(demoDir).filter(f => f.startsWith(baseName + '.description.') && f.endsWith('.md'));
        for (const lf of localeFiles) {
          const rawLoc = fs.readFileSync(path.join(demoDir, lf), 'utf8');
          const { body } = parseFrontmatter(rawLoc);
          const parts = lf.split('.');
          const locale = parts[parts.length - 2];
          localizedDescriptions2[locale] = body.trim();
        }
      } catch { }
      if (fs.existsSync(mdPath)) {
        const mdRaw = fs.readFileSync(mdPath, 'utf8');
        const { frontmatter, body } = parseFrontmatter(mdRaw);
        meta = frontmatter;
        mdBody = body.trim();
      }
      const title = meta.title || short.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      demos.push({
        id,
        component: comp,
        demo: short,
        title,
        description: meta.description || mdBody || '',
        localizedDescriptions: Object.keys(localizedDescriptions2).length ? localizedDescriptions2 : undefined,
        tags: Array.isArray(meta.tags) ? meta.tags : [],
        category: meta.category || 'general',
        order: typeof meta.order === 'number' ? meta.order : 100,
        status: meta.status,
        since: meta.since,
        hidden: meta.hidden === true,
        highlightLines: parseHighlight(meta.highlightLines),
        renderStyle: ['center', 'auto'].includes(meta.renderStyle) ? meta.renderStyle : undefined,
        codeCopy: meta.codeCopy === true || meta.codeCopy === false ? meta.codeCopy : undefined,
        codeLineNumbers: meta.codeLineNumbers === true || meta.codeLineNumbers === false ? meta.codeLineNumbers : undefined,
        codeSpoiler: meta.codeSpoiler === true,
        codeSpoilerMaxHeight: typeof meta.codeSpoilerMaxHeight === 'number' ? meta.codeSpoilerMaxHeight : undefined,
        previewCenter: meta.previewCenter === true ? true : undefined,
      });
    }
  }

  // Also collect from charts package if present
  if (fs.existsSync(CHARTS_COMPONENTS_DIR)) {
    const chartComponents = fs.readdirSync(CHARTS_COMPONENTS_DIR).filter(f => fs.statSync(path.join(CHARTS_COMPONENTS_DIR, f)).isDirectory());
    if (process.env.DEMOS_DEBUG) {
      console.log('[generate-demos][charts] Candidate component dirs:', chartComponents);
    }
    for (const comp of chartComponents) {
      componentSourceDir[comp] = path.join(CHARTS_COMPONENTS_DIR, comp);
      const demoDir = path.join(CHARTS_COMPONENTS_DIR, comp, 'demos');
      const metaDir = path.join(CHARTS_COMPONENTS_DIR, comp, 'meta');
      if (!fs.existsSync(demoDir)) continue; // skip if no demos

      const entries = fs.readdirSync(demoDir);
      const canonicalMetaMd = path.join(metaDir, 'component.md');
      if (fs.existsSync(canonicalMetaMd)) {
        try {
          const raw = fs.readFileSync(canonicalMetaMd, 'utf8');
          const { frontmatter, body } = parseFrontmatter(raw);
          const fm = { ...(frontmatter || {}) } as any;
          const { playground: playgroundRaw, ...restFm } = fm;
          const desc = (body || '').trim() || (typeof fm.description === 'string' ? fm.description : '');
          const name = typeof fm.name === 'string' && fm.name.trim() ? fm.name : comp;
          const title = typeof fm.title === 'string' && fm.title.trim() ? fm.title : comp;
          const category = fm.category || 'charts';
          const playgroundMeta = normalizePlaygroundMeta(playgroundRaw, comp);
          const metaEntry: Record<string, any> = { ...restFm, name, title, description: desc || `${comp} component`, category };
          const tagline = frontmatterTagline(fm, body);
          if (tagline) metaEntry.tagline = tagline;
          if (playgroundMeta) metaEntry.playground = playgroundMeta;
          componentMeta[comp] = metaEntry;
        } catch {
          console.warn(`[generate-demos] Failed to parse metadata for chart ${comp}`);
        }
      } else {
        console.warn(`[generate-demos] Missing canonical meta/component.md for chart ${comp}`);
      }

      const tsxFiles = entries.filter(f => f.endsWith('.tsx'));
      const subfolders = entries.filter(f => fs.existsSync(path.join(demoDir, f)) && fs.statSync(path.join(demoDir, f)).isDirectory());
      codeByComponent[comp] = codeByComponent[comp] || {};

      // New structured demos
      for (const folder of subfolders) {
        const indexPath = path.join(demoDir, folder, 'index.tsx');
        if (!fs.existsSync(indexPath)) continue;
        const raw = fs.readFileSync(indexPath, 'utf8');
        if (process.env.DEMOS_DEBUG) {
          console.log(`[generate-demos][charts] Processing structured demo: ${comp}/${folder}`);
        }
        let codeSnippet = raw;
        const codeMatch = raw.match(/export const code\s*=\s*`([\s\S]*?)`;/);
        if (codeMatch) codeSnippet = codeMatch[1];
        const codeHash = sha256(codeSnippet);
        const id = `${comp}.${folder}`;
        const relImport = `../../../../packages/charts/src/components/${comp}/demos/${folder}`;
        const chartExtraFiles = collectDemoFiles(path.join(demoDir, folder));
        codeByComponent[comp][id] = {
          code: codeSnippet,
          hash: codeHash,
          importPath: relImport,
          githubUrl: githubUrlFor(indexPath),
          ...(chartExtraFiles.length ? { files: withEntryFiles(indexPath, codeSnippet, chartExtraFiles) } : {}),
        };
        let meta: any = {};
        const descPath = path.join(demoDir, folder, 'description.md');
        let mdDesc = '';
        if (fs.existsSync(descPath)) {
          const mdRaw = fs.readFileSync(descPath, 'utf8');
          const { frontmatter, body } = parseFrontmatter(mdRaw);
          meta = { ...frontmatter };
          mdDesc = body.trim();
        }
        const short = folder;
        const title = meta.title || short.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        demos.push({
          id,
          component: comp,
          demo: short,
          title,
          description: meta.description || mdDesc || '',
          localizedDescriptions: undefined,
          tags: Array.isArray(meta.tags) ? meta.tags : [],
          category: meta.category || 'charts',
          order: typeof meta.order === 'number' ? meta.order : 100,
          status: meta.status,
          since: meta.since,
          hidden: meta.hidden === true,
          highlightLines: parseHighlight(meta.highlightLines),
          renderStyle: ['center', 'auto'].includes(meta.renderStyle) ? meta.renderStyle : undefined,
          codeCopy: meta.codeCopy === true || meta.codeCopy === false ? meta.codeCopy : undefined,
          codeLineNumbers: meta.codeLineNumbers === true || meta.codeLineNumbers === false ? meta.codeLineNumbers : undefined,
          codeSpoiler: meta.codeSpoiler === true,
          codeSpoilerMaxHeight: typeof meta.codeSpoilerMaxHeight === 'number' ? meta.codeSpoilerMaxHeight : undefined,
          previewCenter: meta.previewCenter === true ? true : undefined,
        });
      }

      // Legacy flat .tsx demo files
      for (const file of tsxFiles) {
        if (file === 'index.ts' || file === 'index.tsx') continue;
        const baseName = file.replace(/\.tsx$/, '');
        const prefix = `${comp}.demo.`;
        let short = baseName.startsWith(prefix) ? baseName.slice(prefix.length) : baseName;
        short = short.replace(/\.+/g, '-');
        const id = `${comp}.${short}`;
        if (codeByComponent[comp][id]) continue;
        const tsxPath = path.join(demoDir, file);
        const raw = fs.readFileSync(tsxPath, 'utf8');
        if (process.env.DEMOS_DEBUG) {
          console.log(`[generate-demos][charts] Processing legacy demo file: ${comp}/${file}`);
        }
        const codeHash = sha256(raw);
        const relImport = `../../../../packages/charts/src/components/${comp}/demos/${baseName}`;
        codeByComponent[comp][id] = { code: raw, hash: codeHash, importPath: relImport, githubUrl: githubUrlFor(tsxPath) };
        const mdPath = path.join(demoDir, `${baseName}.md`);
        let meta: any = {};
        let mdBody = '';
        if (fs.existsSync(mdPath)) {
          const mdRaw = fs.readFileSync(mdPath, 'utf8');
          const { frontmatter, body } = parseFrontmatter(mdRaw);
          meta = frontmatter;
          mdBody = body.trim();
        }
        const title = meta.title || short.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        demos.push({
          id,
          component: comp,
          demo: short,
          title,
          description: meta.description || mdBody || '',
          localizedDescriptions: undefined,
          tags: Array.isArray(meta.tags) ? meta.tags : [],
          category: meta.category || 'charts',
          order: typeof meta.order === 'number' ? meta.order : 100,
          status: meta.status,
          since: meta.since,
          hidden: meta.hidden === true,
          highlightLines: parseHighlight(meta.highlightLines),
          renderStyle: ['center', 'auto'].includes(meta.renderStyle) ? meta.renderStyle : undefined,
          codeCopy: meta.codeCopy === true || meta.codeCopy === false ? meta.codeCopy : undefined,
          codeLineNumbers: meta.codeLineNumbers === true || meta.codeLineNumbers === false ? meta.codeLineNumbers : undefined,
          codeSpoiler: meta.codeSpoiler || true,
          codeSpoilerMaxHeight: typeof meta.codeSpoilerMaxHeight === 'number' ? meta.codeSpoilerMaxHeight : undefined,
          previewCenter: meta.previewCenter === true ? true : undefined,
        });
      }
    }
  }

  if (process.env.DEMOS_DEBUG) {
    const chartDemos = demos.filter(d => d.component === 'LineChart' || d.component === 'AreaChart').map(d => d.id);
    console.log('[generate-demos][charts] Final collected chart demo IDs:', chartDemos);
  }

  // Extract simple props metadata per component (heuristic)
  const propsMeta: Record<string, any[]> = {};
  const warningCounts: Record<string, number> = {};
  const componentWarnings: Record<string, Record<string, number>> = {};
  const addWarning = (type: string, comp?: string) => {
    warningCounts[type] = (warningCounts[type] || 0) + 1;
    if (comp) {
      componentWarnings[comp] = componentWarnings[comp] || {};
      componentWarnings[comp][type] = (componentWarnings[comp][type] || 0) + 1;
    }
  };

  // ---- Interface parsing + `extends` resolution -------------------------------
  // Locate an interface/type-alias `${name}Props` in a source string, returning
  // its body and the raw `extends` clause (empty for type aliases).
  const NESTED_GENERIC = '<(?:[^<>]|<[^<>]*>)*>';
  function extractPropsShape(name: string, source: string): { body: string | null; ext: string } {
    const iface = new RegExp(`(?:export\\s+)?interface\\s+${name}Props(?:\\s*${NESTED_GENERIC})?((?:\\s+extends[^{]+)?)\\s*{`, 'm');
    const typeAlias = new RegExp(`(?:export\\s+)?type\\s+${name}Props(?:\\s*${NESTED_GENERIC})?\\s*=\\s*{`, 'm');
    let ext = '';
    let m = iface.exec(source);
    if (m) ext = (m[1] || '').replace(/^\s*extends\s+/, '').replace(/\s+/g, ' ').trim();
    else m = typeAlias.exec(source);
    if (!m) return { body: null, ext: '' };
    const startIdx = source.indexOf('{', m.index);
    if (startIdx === -1) return { body: null, ext: '' };
    let depth = 0;
    for (let i = startIdx; i < source.length; i++) {
      const ch = source[i];
      if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) return { body: source.substring(startIdx + 1, i), ext }; }
    }
    addWarning('unbalanced-interface');
    return { body: null, ext: '' };
  }

  // Parse an interface body into prop records. Self-contained (own dedupe) so it
  // can be reused for both a component's own interface and any base it extends.
  function parseBody(body: string): any[] {
    const collected: any[] = [];
    const dedupe = new Set<string>();
    const lines = body.split(/\n/);
    let inJsDoc = false;
    let jsDocLines: string[] = [];
    let pendingLineComment: string | undefined;
    const flushJsDoc = () => {
      if (!jsDocLines.length) return { description: undefined as string | undefined, tags: '' };
      const content = jsDocLines.join('\n');
      // The description is everything before the first `@tag`. Filtering only
      // the lines that *start* with `@` leaks the continuation lines of a
      // wrapped tag (a multi-line `@deprecated` note) into the description.
      const stripped = jsDocLines.map(l => l.replace(/^\s*\* ?/, ''));
      const firstTag = stripped.findIndex(l => l.trim().startsWith('@'));
      const cleaned = (firstTag === -1 ? stripped : stripped.slice(0, firstTag))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      jsDocLines = [];
      return { description: cleaned || undefined, tags: content };
    };
    const bracketDepth = (s: string) => {
      let d = 0;
      for (const ch of s.replace(/=>/g, '')) {
        if (ch === '{' || ch === '<' || ch === '(' || ch === '[') d++;
        else if (ch === '}' || ch === '>' || ch === ')' || ch === ']') d--;
      }
      return d;
    };
    const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/, '').trim();
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) continue;
      if (line.startsWith('/**')) {
        inJsDoc = true;
        jsDocLines.push(line.replace('/**', ''));
        if (line.includes('*/')) { inJsDoc = false; jsDocLines[jsDocLines.length - 1] = jsDocLines[jsDocLines.length - 1].replace('*/', ''); }
        continue;
      }
      if (inJsDoc) {
        jsDocLines.push(line);
        if (line.includes('*/')) { inJsDoc = false; jsDocLines[jsDocLines.length - 1] = jsDocLines[jsDocLines.length - 1].replace('*/', ''); }
        continue;
      }
      if (line.startsWith('//')) { pendingLineComment = line.replace(/^\/\//, '').trim() || pendingLineComment; continue; }
      // The type may start on the next line — a wide union is usually written as
      // `type?:` followed by one `| 'value'` per line. Requiring a non-empty
      // remainder here dropped those props from the table entirely.
      const sigMatch = line.match(/^(readonly\s+)?([A-Za-z0-9_]+)\??:\s*(.*)$/);
      if (!sigMatch) continue;
      const name = sigMatch[2];
      if (dedupe.has(name)) { pendingLineComment = undefined; jsDocLines = []; continue; }
      let typePortion = sigMatch[3];
      // Consume continuation lines while inside unbalanced brackets so inline
      // object/generic types like `ChartTooltip<{ record: T }>` stay whole.
      while (i + 1 < lines.length && (bracketDepth(typePortion) > 0 || (!typePortion.includes(';') && !lines[i + 1].trim().match(/^(readonly\s+)?[A-Za-z0-9_]+\??:/)))) { i++; const seg = stripComments(lines[i]); if (seg) typePortion += ' ' + seg; }
      let trailingComment: string | undefined;
      const commentSplit = typePortion.split(/\/\/+/);
      if (commentSplit.length > 1) { trailingComment = commentSplit.slice(1).join('//').trim(); typePortion = commentSplit[0].trim(); }
      if (typePortion.endsWith(';')) typePortion = typePortion.slice(0, -1).trim();
      // A union whose members each sit on their own line arrives as `| 'a' | 'b'`.
      if (typePortion.startsWith('|')) typePortion = typePortion.slice(1).trim();
      let defaultValue: string | undefined;
      const eqIdx = typePortion.indexOf('=');
      if (eqIdx !== -1) { const two = typePortion.substring(eqIdx, eqIdx + 2); if (two !== '=>') { defaultValue = typePortion.slice(eqIdx + 1).trim(); typePortion = typePortion.slice(0, eqIdx).trim(); } }
      const optional = sigMatch[0].includes(name + '?:');
      const { description: jsDesc, tags } = flushJsDoc();
      const description = jsDesc || pendingLineComment || trailingComment;
      let deprecated: boolean | undefined; let internal: boolean | undefined; let jsDefault: string | undefined;
      if (tags) {
        const tagLines = tags.split(/@/).slice(1).map(s => s.trim());
        for (const t of tagLines) {
          if (t.startsWith('deprecated')) deprecated = true;
          if (t.startsWith('internal')) internal = true;
          const defMatch = t.match(/^default\s+([^\n]*)/); if (defMatch) jsDefault = defMatch[1].trim();
        }
      }
      pendingLineComment = undefined;
      if (name) { collected.push({ name, type: typePortion, required: !optional, defaultValue: jsDefault || defaultValue, description, deprecated, internal }); dedupe.add(name); }
    }
    return collected;
  }

  // Global index of every named interface (name -> { body, extends clause }),
  // built lazily from shared type files so base interfaces such as
  // `BaseChartProps`, `SpacingProps`, `LineChartProps` can be resolved.
  const ifaceIndex = new Map<string, { body: string; ext: string; alias?: boolean }>();
  // Literal unions by alias name (`ButtonVariant` → `'default' | 'filled' | …`).
  const unionIndex = new Map<string, string[]>();
  // Declaration source by name, for the Types section of a component's page.
  const declIndex = new Map<string, { text: string; file: string }>();
  const recordDeclaration = (name: string, text: string, file: string) => {
    if (!declIndex.has(name)) declIndex.set(name, { text: text.trim(), file });
  };
  const scannedFiles = new Set<string>();
  const scanForInterfaces = (file: string) => {
    if (scannedFiles.has(file)) return;
    scannedFiles.add(file);
    let src: string;
    try { if (!fs.existsSync(file)) return; src = fs.readFileSync(file, 'utf8'); } catch { return; }
    const re = new RegExp(`(?:export\\s+)?interface\\s+([A-Za-z0-9_]+)(?:\\s*${NESTED_GENERIC})?((?:\\s+extends[^{]+)?)\\s*{`, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) {
      const name = m[1];
      const ext = (m[2] || '').replace(/^\s*extends\s+/, '').replace(/\s+/g, ' ').trim();
      const startIdx = src.indexOf('{', m.index);
      if (startIdx === -1) continue;
      let depth = 0, end = -1;
      for (let i = startIdx; i < src.length; i++) { const ch = src[i]; if (ch === '{') depth++; else if (ch === '}') { depth--; if (depth === 0) { end = i; break; } } }
      if (end === -1) continue;
      if (!ifaceIndex.has(name)) ifaceIndex.set(name, { body: src.substring(startIdx + 1, end), ext });
      recordDeclaration(name, src.slice(m.index, end + 1), file);
    }

    // Intersection aliases — `type BaseProps<S> = SpacingProps & VisibilityProps
    // & { style?: … }` — indexed in the same shape: inline object members become
    // the body and every other operand an `extends` entry. Shared prop bags
    // moved to this form, and an index that only knew `interface … extends`
    // silently dropped every prop they carry.
    const aliasRe = new RegExp(`(?:export\\s+)?type\\s+([A-Za-z0-9_]+)(?:\\s*${NESTED_GENERIC})?\\s*=`, 'g');
    while ((m = aliasRe.exec(src))) {
      const name = m[1];
      if (ifaceIndex.has(name)) continue;
      const start = m.index + m[0].length;
      const operands: string[] = [];
      let depth = 0, cur = '', end = -1, union = false;
      for (let i = start; i < src.length; i++) {
        // Comments and strings are copied through untouched: a `>` or `|` in a
        // JSDoc line or a string literal is not structure.
        const next = skipTrivia(src, i);
        if (next !== i) { cur += src.slice(i, next); i = next - 1; continue; }
        const ch = src[i];
        if (ch === '>' && src[i - 1] === '=') { cur += ch; continue; } // `=>` is not a bracket
        if ('{<(['.includes(ch)) depth++;
        else if ('}>)]'.includes(ch)) depth--;
        if (depth === 0 && ch === ';') { end = i; break; }
        if (depth === 0 && ch === '|') union = true;
        if (depth === 0 && ch === '&') { operands.push(cur); cur = ''; continue; }
        cur += ch;
      }
      if (end === -1) continue;
      recordDeclaration(name, src.slice(m.index, end + 1), file);
      if (union) {
        // A union is a value type, not a props shape — but a union of literals
        // (`type ButtonVariant = 'default' | 'filled' | …`) is exactly what a
        // prop's type needs spelled out, so it is kept for expansion.
        const members: string[] = [];
        let level = 0, member = '';
        for (const ch of src.slice(start, end).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')) {
          if ('{<(['.includes(ch)) level++;
          else if ('}>)]'.includes(ch)) level--;
          if (level === 0 && ch === '|') { members.push(member.trim()); member = ''; } else member += ch;
        }
        members.push(member.trim());
        const literal = /^(?:'[^']*'|"[^"]*"|-?\d+(?:\.\d+)?|true|false|null|[A-Z][A-Za-z0-9_]*)$/;
        const cleaned = members.filter(Boolean);
        if (cleaned.length && cleaned.every(m => literal.test(m)) && !unionIndex.has(name)) unionIndex.set(name, cleaned);
        continue;
      }
      operands.push(cur);
      const bodies: string[] = [];
      const bases: string[] = [];
      for (const operand of operands.map(o => o.trim()).filter(Boolean)) {
        if (operand.startsWith('{') && operand.endsWith('}')) bodies.push(operand.slice(1, -1));
        else if (/^[A-Za-z0-9_.]+(?:\s*<[\s\S]*>)?$/.test(operand)) bases.push(operand.replace(/\s+/g, ' '));
      }
      if (bodies.length || bases.length) {
        ifaceIndex.set(name, { body: bodies.join('\n'), ext: bases.join(', '), alias: true });
      }
    }
  };
  // Pre-scan shared type files: everything under packages/charts/src plus each UI
  // component's `types.ts`. This covers cross-component bases (LineChartProps,
  // ComboChartProps) and shared bases (BaseChartProps, SpacingProps).
  const walkTs = (dir: string, pick: (f: string) => boolean, acc: string[] = []): string[] => {
    let entries: fs.Dirent[];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { if (e.name !== 'node_modules' && e.name !== 'lib' && e.name !== 'demos') walkTs(full, pick, acc); }
      else if (e.isFile() && pick(full)) acc.push(full);
    }
    return acc;
  };
  const chartsSrc = path.join(ROOT, 'packages', 'charts', 'src');
  for (const f of walkTs(chartsSrc, f => f.endsWith('.ts') && !f.endsWith('.d.ts'))) scanForInterfaces(f);
  for (const f of walkTs(UI_COMPONENTS_DIR, f => /(?:^|\/)types\.ts$|\.types\.ts$/.test(f.replace(/\\/g, '/')))) scanForInterfaces(f);
  // Shared prop bags live in core, not in any component's `types.ts` —
  // `BorderRadiusProps` (core/theme/radius) and `ShadowProps` (core/theme/shadow)
  // are extended by Card, Surface, Badge and others, and were silently dropped
  // from every prop table until this was scanned.
  const uiCore = path.join(ROOT, 'packages', 'ui', 'src', 'core');
  for (const f of walkTs(uiCore, f => f.endsWith('.ts') && !f.endsWith('.d.ts'))) scanForInterfaces(f);
  // Then every other component source file. Bases increasingly live beside the
  // implementation (`PickerFieldBaseProps` in DatePickerInput/PickerField.tsx,
  // `FieldBaseProps` in _internal/Field/fieldProps.ts); the index is
  // first-wins, so the `types.ts` files scanned above keep precedence.
  for (const f of walkTs(UI_COMPONENTS_DIR, f => /\.tsx?$/.test(f) && !f.endsWith('.d.ts') && !/__(web_)?tests__/.test(f.replace(/\\/g, '/')))) scanForInterfaces(f);

  // Split an `extends` clause into base specs, honouring `Omit<Base, 'k' | 'j'>`,
  // `Pick<Base, 'k' | 'j'>` and `Partial<Base>`.
  type BaseSpec = { name: string; omit?: string[]; pick?: string[]; partial?: boolean };
  const keysOf = (list: string) => (list.match(/'([^']+)'|"([^"]+)"/g) || []).map(k => k.replace(/['"]/g, ''));
  const splitExtends = (ext: string): BaseSpec[] => {
    if (!ext) return [];
    const parts: string[] = []; let d = 0, cur = '';
    for (const ch of ext) { if (ch === '<') d++; else if (ch === '>') d--; if (ch === ',' && d === 0) { parts.push(cur); cur = ''; } else cur += ch; }
    if (cur.trim()) parts.push(cur);
    const out: BaseSpec[] = [];
    for (const raw of parts.map(s => s.trim()).filter(Boolean)) {
      const omitM = raw.match(/^Omit\s*<\s*([A-Za-z0-9_]+)(?:\s*<[^<>]*>)?\s*,\s*([\s\S]+)>$/);
      if (omitM) { out.push({ name: omitM[1], omit: keysOf(omitM[2]) }); continue; }
      const pickM = raw.match(/^Pick\s*<\s*([A-Za-z0-9_]+)(?:\s*<[^<>]*>)?\s*,\s*([\s\S]+)>$/);
      if (pickM) { out.push({ name: pickM[1], pick: keysOf(pickM[2]) }); continue; }
      const partialM = raw.match(/^Partial\s*<\s*([A-Za-z0-9_]+)(?:\s*<[\s\S]*>)?\s*>$/);
      if (partialM) { out.push({ name: partialM[1], partial: true }); continue; }
      const bare = raw.replace(/\s*<[\s\S]*>\s*$/, '').trim();
      if (/^[A-Za-z0-9_]+$/.test(bare)) out.push({ name: bare });
    }
    return out;
  };
  const narrowBase = (base: BaseSpec, props: any[]): any[] => {
    let out = props;
    if (base.omit) out = out.filter(p => !base.omit!.includes(p.name));
    if (base.pick) out = out.filter(p => base.pick!.includes(p.name));
    if (base.partial) out = out.map(p => ({ ...p, required: false }));
    return out;
  };
  // Recursively resolve all props inherited through an interface's `extends`
  // chain. Own props win over inherited; earlier bases win over later ones.
  // Each inherited prop records the interface that declares it (`from`), which
  // is how the Markdown folds the shared SpacingProps/LayoutProps bags into one
  // line instead of repeating them on every component.
  const resolveBaseProps = (name: string, seen: Set<string>): any[] => {
    if (seen.has(name)) return [];
    seen.add(name);
    const entry = ifaceIndex.get(name);
    if (!entry) return [];
    const own = parseBody(entry.body).map(prop => ({ ...prop, from: name }));
    const names = new Set(own.map(p => p.name));
    const result = [...own];
    for (const base of splitExtends(entry.ext)) {
      let baseProps = resolveBaseProps(base.name, seen);
      baseProps = narrowBase(base, baseProps);
      for (const p of baseProps) { if (!names.has(p.name)) { names.add(p.name); result.push(p); } }
    }
    return result;
  };

  for (const comp of Object.keys(componentMeta)) {
    const compDir = componentSourceDir[comp] || path.join(UI_COMPONENTS_DIR, comp);
    const candidateFiles = [
      path.join(compDir, `${comp}.tsx`),
      path.join(compDir, 'index.tsx'),
      path.join(compDir, `${comp}.ts`),
      path.join(compDir, 'index.ts'),
      path.join(compDir, 'types.ts'), // component-local types
      path.join(compDir, `${comp}.types.ts`),
      path.join(compDir, `${comp}.types.tsx`),
      // For charts, also fallback to shared root types file so interfaces like HeatmapChartProps are discovered.
      /charts\/src\//.test(compDir.replace(/\\/g, '/')) ? path.join(ROOT, 'packages', 'charts', 'src', 'types.ts') : ''
    ].filter(f => f && fs.existsSync(f));
    if (!candidateFiles.length) continue;
    for (const f of candidateFiles) scanForInterfaces(f);

    let collected: any[] = [];
    let ownExt = '';
    for (const file of candidateFiles) {
      const raw = fs.readFileSync(file, 'utf8');
      const extracted = extractPropsShape(comp, raw);
      if (extracted.body == null) continue;
      const parsed = parseBody(extracted.body);
      // Accept the interface if it has own props OR is a thin alias that only
      // re-exports a base via `extends` (e.g. `interface FooProps extends BarProps {}`).
      if (parsed.length || extracted.ext) { collected = parsed; ownExt = extracted.ext; break; }
    }
    // A props type declared as an intersection alias (`type FooProps = BaseProps
    // & { … }`) never matches the object-literal pattern above; resolve it from
    // the index instead, own members first.
    const indexed = ifaceIndex.get(`${comp}Props`);
    if (indexed?.alias && !ownExt) {
      collected = resolveBaseProps(`${comp}Props`, new Set<string>())
        .map(({ from, ...prop }) => (from === `${comp}Props` ? prop : { ...prop, from }));
    }
    // Merge in props inherited through the `extends` chain (own props win).
    if (ownExt) {
      const dedupe = new Set(collected.map(p => p.name));
      for (const base of splitExtends(ownExt)) {
        let baseProps = resolveBaseProps(base.name, new Set<string>());
        baseProps = narrowBase(base, baseProps);
        for (const p of baseProps) { if (!dedupe.has(p.name)) { dedupe.add(p.name); collected.push(p); } }
      }
    }
    if (collected.length) {
      // Attempt to augment with default values from implementation destructuring
      try {
        const implFile = path.join(compDir, `${comp}.tsx`);
        if (fs.existsSync(implFile)) {
          const implRaw = fs.readFileSync(implFile, 'utf8');
          const destructureMatch = implRaw.match(/const\s+\{([\s\S]*?)\}\s*=\s*props\s*;/);
          if (destructureMatch) {
            // Collapse newlines inside destructure for simpler splitting while preserving spaces
            const blockRaw = destructureMatch[1];
            const block = blockRaw.replace(/\n+/g, ' ').replace(/\s+/g, ' ');
            // Split only on top-level commas so array/object/call defaults such
            // as `range = [36, 576]` stay intact. Track `[] {} ()` depth only —
            // `<>` is skipped to avoid miscounting `=>` arrows.
            const parts: string[] = [];
            let depth = 0, cur = '';
            for (const ch of block) {
              if (ch === '[' || ch === '{' || ch === '(') depth++;
              else if (ch === ']' || ch === '}' || ch === ')') depth--;
              if (ch === ',' && depth <= 0) { parts.push(cur); cur = ''; }
              else cur += ch;
            }
            parts.push(cur);
            const trimmedParts = parts.map(p => p.trim()).filter(Boolean);
            const defaultsMap: Record<string, string> = {};
            for (let part of trimmedParts) {
              if (!part || part.startsWith('...')) continue;
              // Ignore rest or spread or direct renames with colon (alias)
              if (/^[A-Za-z0-9_]+\s*:/.test(part)) continue;
              const mDef = part.match(/^([A-Za-z0-9_]+)\s*=\s*(.+)$/);
              if (mDef) {
                const name = mDef[1];
                let defVal = mDef[2].trim();
                // Remove trailing comma if any (post split safety)
                defVal = defVal.replace(/,$/, '').trim();
                // Basic cleanup for objects/arrays/functions: keep concise preview
                if (defVal.length > 80) defVal = defVal.slice(0, 77) + '...';
                defaultsMap[name] = defVal;
              }
            }
            if (Object.keys(defaultsMap).length) {
              collected = collected.map(p => {
                if (p.defaultValue == null && defaultsMap[p.name] !== undefined) {
                  return { ...p, defaultValue: defaultsMap[p.name] };
                }
                return p;
              });
            }
          }
        }
      } catch {/* non-fatal */ }

      // Attempt defaults.ts object parse (preferred source) if exists
      try {
        const defaultsFile = path.join(compDir, 'defaults.ts');
        if (fs.existsSync(defaultsFile)) {
          const raw = fs.readFileSync(defaultsFile, 'utf8');
          // Look for export const SOMETHING_DEFAULTS = { ... } as const;
          const m = raw.match(/export const [A-Z0-9_]+DEFAULTS\s*=\s*({[\s\S]*?})\s*as const/);
          if (m) {
            const obj = m[1];
            const kvPairs = obj
              .replace(/\n/g, ' ')
              .replace(/\s+/g, ' ')
              .replace(/\/\/.*?$/gm, '')
              .match(/([A-Za-z0-9_]+)\s*:\s*([^,}]+)/g) || [];
            const map: Record<string, string> = {};
            for (const pair of kvPairs) {
              const pm = pair.match(/([A-Za-z0-9_]+)\s*:\s*([^,}]+)/);
              if (pm) map[pm[1]] = pm[2].trim();
            }
            if (Object.keys(map).length) {
              collected = collected.map(p => map[p.name] ? { ...p, defaultValue: map[p.name] } : p);
            }
          }
        }
      } catch { }

      if (collected.some(p => p.internal)) addWarning('internal-props', comp);
      // Post-process warnings: missing docs / ambiguous types
      for (const p of collected) {
        if (!p.description) addWarning('missing-doc', comp);
        if (!p.type || /\bany\b/.test(p.type)) addWarning('ambiguous-type', comp);
      }
      propsMeta[comp] = collected;
    }
  }

  // ---- Sub-components and related hooks ---------------------------------------
  // Public exports that live in a component's folder beside it — RadioGroup next
  // to Radio, MenuItem next to Menu — and the hooks that drive it (useToast,
  // useDialog). Grouped by the package barrel, so only what a consumer can
  // actually import is documented; examples reach for these constantly, and a
  // page that documents only the parent leaves their props to guesswork.
  const subcomponents: Record<string, SubcomponentDoc[]> = {};
  const relatedHooks: Record<string, RelatedHookDoc[]> = {};

  // Exports documented on another component's page: Row and Column live in
  // components/Layout, but they are Flex with the direction fixed.
  const SUBCOMPONENT_HOSTS: Record<string, string> = { Layout: 'Flex' };

  const exportsByDir = new Map<string, string[]>();
  try {
    const barrel = fs.readFileSync(path.join(ROOT, 'packages', 'ui', 'src', 'index.ts'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    // `export { A, B } from './components/Dir'` — value exports only; the
    // `export type { … }` form never matches `export\s*\{`.
    for (const match of barrel.matchAll(/export\s*\{([^}]*)\}\s*from\s*'\.\/components\/([^'/]+)[^']*'/g)) {
      const names = match[1].split(',').map(part => part.trim()).filter(part => part && !part.startsWith('type '))
        .map(part => part.match(/\bas\s+([A-Za-z_$][\w$]*)$/)?.[1] ?? part);
      exportsByDir.set(match[2], [...(exportsByDir.get(match[2]) ?? []), ...names]);
    }
  } catch { /* no barrel: nothing to add */ }

  // `${name}Props`, interface or alias, with its `extends` chain resolved the
  // same way as a component's own props. Every component source file is in the
  // index by now, so the declaring file does not matter.
  const resolveNamedProps = (name: string): any[] | null => {
    const typeName = `${name}Props`;
    if (!ifaceIndex.has(typeName)) return null;
    return resolveBaseProps(typeName, new Set<string>())
      .filter(prop => !prop.internal)
      .map(({ from, ...prop }) => (from === typeName ? prop : { ...prop, from }));
  };

  for (const [dir, names] of exportsByDir) {
    const host = SUBCOMPONENT_HOSTS[dir] ?? dir;
    if (!componentMeta[host]) continue;
    const files = walkTs(
      path.join(UI_COMPONENTS_DIR, dir),
      f => /\.tsx?$/.test(f) && !f.endsWith('.d.ts') && !/__(web_)?tests__/.test(f.replace(/\\/g, '/')),
    );
    const sources = files.map(f => fs.readFileSync(f, 'utf8'));

    for (const name of new Set(names)) {
      // Documented on its own page (Calendar is exported from DatePicker's folder).
      if (name === host || componentMeta[name]) continue;
      if (/^use[A-Z]/.test(name)) {
        const hook = describeHook(name, sources);
        (relatedHooks[host] ??= []).push(hook);
        continue;
      }
      // PascalCase components only: no helpers (`buildNavTree`) or constants.
      if (!/^[A-Z]/.test(name) || (/^[A-Z0-9_]+$/.test(name) && name.length > 3)) continue;
      (subcomponents[host] ??= []).push({ name, props: resolveNamedProps(name) ?? [] });
    }
  }

  // Compound members used as `<Form.Field>` rather than imported by name.
  for (const [comp, entries] of Object.entries(codeByComponent)) {
    if (!componentMeta[comp]) continue;
    const members = new Set<string>();
    for (const entry of Object.values(entries)) {
      for (const match of entry.code.matchAll(new RegExp(`<${comp}\\.([A-Z]\\w*)`, 'g'))) members.add(match[1]);
    }
    if (!members.size) continue;
    for (const member of [...members].sort()) {
      const name = `${comp}.${member}`;
      if (subcomponents[comp]?.some(sub => sub.name === name)) continue;
      const props = resolveNamedProps(`${comp}${member}`) ?? resolveNamedProps(member) ?? [];
      (subcomponents[comp] ??= []).push({ name, props });
    }
  }

  // A prop typed with a named literal union tells a reader nothing on its own —
  // `variant: ButtonVariant` — so the members are recorded beside the type.
  // Only pure literal unions expand; shared vocabularies such as `SizeValue`
  // and `ColorProp` include `number` / `string` and are left to the style guide.
  const expandUnion = (name: string, seen = new Set<string>()): string[] | null => {
    if (seen.has(name)) return null;
    seen.add(name);
    const members = unionIndex.get(name);
    if (!members) return null;
    const out: string[] = [];
    for (const member of members) {
      if (/^[A-Z]/.test(member)) {
        const nested = expandUnion(member, seen);
        if (!nested) return null;
        out.push(...nested);
      } else {
        out.push(member);
      }
    }
    return out;
  };
  const annotateValues = (props: any[]) => {
    for (const prop of props) {
      const type = typeof prop.type === 'string' ? prop.type.trim() : '';
      if (!/^[A-Z][A-Za-z0-9_]*$/.test(type)) continue;
      const values = expandUnion(type);
      if (values && values.length <= 16) prop.values = values.join(' | ');
    }
  };
  for (const props of Object.values(propsMeta)) annotateValues(props);
  for (const subs of Object.values(subcomponents)) for (const sub of subs) annotateValues(sub.props);

  // Named types a page's own props reference — RadioGroupOption,
  // PieChartDataPoint — declared in the component's own folder, so the page
  // spells out the shapes it asks for. Shared vocabulary (the core tokens, the
  // chart-wide ChartAxis / ChartDataPoint) is documented once on the
  // shared-props guide instead, and types inherited from another component's
  // props belong on that component's page.
  const typeDocs: Record<string, string[]> = {};
  const MAX_TYPE_DECLARATION_CHARS = 2500;
  const MAX_TYPES_PER_PAGE = 8;
  const identifiers = (text: string) => text.match(/\b[A-Z][A-Za-z0-9_]*\b/g) ?? [];
  for (const comp of Object.keys(componentMeta)) {
    const dir = componentSourceDir[comp];
    if (!dir) continue;
    const inside = (file: string) => !path.relative(dir, file).startsWith('..');
    const own = [...(propsMeta[comp] ?? []), ...(subcomponents[comp] ?? []).flatMap(sub => sub.props)]
      .filter(prop => !prop.from && !prop.values && !prop.internal);
    const pending = own.flatMap(prop => identifiers(String(prop.type ?? '')));
    const seen = new Set<string>();
    const picked: string[] = [];
    while (pending.length && picked.length < MAX_TYPES_PER_PAGE) {
      const id = pending.shift()!;
      if (seen.has(id)) continue;
      seen.add(id);
      const declaration = declIndex.get(id);
      if (!declaration || !inside(declaration.file) || declaration.text.length > MAX_TYPE_DECLARATION_CHARS) continue;
      // A literal union a prop already spells out needs no declaration.
      if (unionIndex.has(id) && !own.some(prop => new RegExp(`\\b${id}\\b`).test(String(prop.type)) && !prop.values)) continue;
      picked.push(declaration.text);
      // One hop further: the shapes this one is built from, from the same folder.
      pending.push(...identifiers(declaration.text.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')));
    }
    if (picked.length) typeDocs[comp] = picked;
  }

  // Surface the names on the component meta too: the llms.txt index lists them
  // beside the parent so an agent looking for RadioGroup finds the Radio page.
  for (const [comp, subs] of Object.entries(subcomponents)) {
    componentMeta[comp].subcomponents = subs.map(sub => sub.name);
  }
  for (const [comp, hooks] of Object.entries(relatedHooks)) {
    componentMeta[comp].relatedHooks = hooks.map(hook => hook.name);
  }

  return { demos, codeByComponent, componentMeta, propsMeta, componentSourceDir, warningCounts, componentWarnings, subcomponents, relatedHooks, typeDocs };
}

/**
 * A hook exported beside a component, reduced to what an agent needs to call
 * it: the signature (parameters and declared return type) and the first
 * sentence of its JSDoc. Parameters are cut at the matching parenthesis rather
 * than the first `)`, so callback-typed options survive.
 */
function describeHook(name: string, sources: string[]): RelatedHookDoc {
  const declaration = new RegExp(`^export\\s+(?:function\\s+${name}\\b|const\\s+${name}\\b\\s*=\\s*(?:async\\s*)?)`, 'm');
  for (const source of sources) {
    const match = declaration.exec(source);
    if (!match) continue;

    let signature: string | undefined;
    const open = source.indexOf('(', match.index + match[0].length - 1);
    if (open !== -1) {
      let depth = 0;
      let close = -1;
      for (let i = open; i < source.length; i++) {
        if (source[i] === '(') depth++;
        else if (source[i] === ')' && --depth === 0) { close = i; break; }
      }
      if (close !== -1) {
        const generics = source.slice(match.index + match[0].length, open).trim();
        const params = source.slice(open, close + 1);
        const rest = source.slice(close + 1, close + 400);
        const returnType = rest.match(/^\s*:\s*([\s\S]+?)\s*(?:=>|\{)/)?.[1];
        signature = `${name}${generics.startsWith('<') ? generics : ''}${params}${returnType ? `: ${returnType}` : ''}`
          .replace(/\s+/g, ' ')
          .replace(/\(\s+/g, '(')
          .replace(/,?\s+\)/g, ')');
      }
    }

    // The JSDoc block directly above the declaration, if there is one.
    const before = source.slice(0, match.index).trimEnd();
    let summary: string | undefined;
    if (before.endsWith('*/')) {
      const doc = before.slice(before.lastIndexOf('/**'));
      const text = doc
        .replace(/^\/\*\*|\*\/$/g, '')
        .split('\n')
        .map(line => line.replace(/^\s*\*\s?/, ''))
        .join(' ')
        .split(/\s@\w/)[0]
        .replace(/\s+/g, ' ')
        .trim();
      const sentenceEnd = text.search(/\.\s/);
      summary = (sentenceEnd > 0 ? text.slice(0, sentenceEnd + 1) : text) || undefined;
    }
    return { name, signature, summary };
  }
  return { name };
}

function collectHooks() {
  const hooks: DemoMeta[] = [];
  const codeByHook: Record<string, Record<string, CodeEntry>> = {};
  const hookMeta: HookMetaRecord = {};

  if (!fs.existsSync(UI_HOOKS_DIR)) {
    return { hooks, codeByHook, hookMeta };
  }

  const hookDirs = fs.readdirSync(UI_HOOKS_DIR).filter(dir => {
    const full = path.join(UI_HOOKS_DIR, dir);
    return fs.statSync(full).isDirectory();
  });

  for (const hook of hookDirs) {
    const hookDir = path.join(UI_HOOKS_DIR, hook);
    const demosDir = path.join(hookDir, 'demos');
    const metaDir = path.join(hookDir, 'meta');

    if (!fs.existsSync(demosDir)) continue;

    const canonicalMetaMd = path.join(metaDir, 'hook.md');
    if (fs.existsSync(canonicalMetaMd)) {
      try {
        const raw = fs.readFileSync(canonicalMetaMd, 'utf8');
        const { frontmatter, body } = parseFrontmatter(raw);
        const fm = { ...(frontmatter || {}) } as any;
        const desc = (body || '').trim() || (typeof fm.description === 'string' ? fm.description : '');
        const name = typeof fm.name === 'string' && fm.name.trim() ? fm.name : hook;
        const title = typeof fm.title === 'string' && fm.title.trim() ? fm.title : hook;
        hookMeta[hook] = {
          ...fm,
          name,
          title,
          description: desc || `${hook} hook`
        };
      } catch {
        console.warn(`[generate-demos] Failed to parse hook metadata for ${hook}`);
      }
    } else {
      console.warn(`[generate-demos] Missing meta/hook.md for ${hook}`);
    }

    const entries = fs.readdirSync(demosDir);
    const subfolders = entries.filter(entry => {
      const full = path.join(demosDir, entry);
      return fs.existsSync(full) && fs.statSync(full).isDirectory();
    });

    codeByHook[hook] = codeByHook[hook] || {};

    for (const folder of subfolders) {
      const indexPath = path.join(demosDir, folder, 'index.tsx');
      if (!fs.existsSync(indexPath)) continue;

      const raw = fs.readFileSync(indexPath, 'utf8');
      let codeSnippet = raw;
      const codeMatch = raw.match(/export const code\s*=\s*`([\s\S]*?)`;/);
      if (codeMatch) codeSnippet = codeMatch[1];

      const codeHash = sha256(codeSnippet);
      const id = `${hook}.${folder}`;
      const relImport = `../../../../packages/ui/src/hooks/${hook}/demos/${folder}`;
      const hookExtraFiles = collectDemoFiles(path.join(demosDir, folder));
      codeByHook[hook][id] = {
        code: codeSnippet,
        hash: codeHash,
        importPath: relImport,
        githubUrl: githubUrlFor(indexPath),
        ...(hookExtraFiles.length ? { files: withEntryFiles(indexPath, codeSnippet, hookExtraFiles) } : {}),
      };

      let meta: any = {};
      const descPath = path.join(demosDir, folder, 'description.md');
      let mdDesc = '';
      const localizedDescriptions: Record<string, string> = {};

      try {
        const localeFiles = fs
          .readdirSync(path.join(demosDir, folder))
          .filter(f => /^description\.[a-zA-Z-]+\.md$/.test(f));
        for (const lf of localeFiles) {
          const rawLocale = fs.readFileSync(path.join(demosDir, folder, lf), 'utf8');
          const { body } = parseFrontmatter(rawLocale);
          const locale = lf.split('.')[1];
          localizedDescriptions[locale] = body.trim();
        }
      } catch {/* ignore */}

      if (fs.existsSync(descPath)) {
        const mdRaw = fs.readFileSync(descPath, 'utf8');
        const { frontmatter, body } = parseFrontmatter(mdRaw);
        meta = { ...meta, ...frontmatter };
        mdDesc = body.trim();
      }

      const short = folder;
      const title = meta.title || short.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

      hooks.push({
        id,
        component: hook,
        demo: short,
        title,
        kind: 'hook',
        description: meta.description || mdDesc || '',
        localizedDescriptions: Object.keys(localizedDescriptions).length ? localizedDescriptions : undefined,
        tags: Array.isArray(meta.tags) ? meta.tags : [],
        category: meta.category || 'general',
        order: typeof meta.order === 'number' ? meta.order : 100,
        status: meta.status,
        since: meta.since,
        hidden: meta.hidden === true,
        highlightLines: parseHighlight(meta.highlightLines),
        renderStyle: ['center', 'auto'].includes(meta.renderStyle) ? meta.renderStyle : undefined,
        codeCopy: meta.codeCopy === true || meta.codeCopy === false ? meta.codeCopy : undefined,
        codeLineNumbers: meta.codeLineNumbers === true || meta.codeLineNumbers === false ? meta.codeLineNumbers : undefined,
        codeSpoiler: meta.codeSpoiler === true,
        codeSpoilerMaxHeight: typeof meta.codeSpoilerMaxHeight === 'number' ? meta.codeSpoilerMaxHeight : undefined,
        previewCenter: meta.previewCenter === true ? true : undefined,
        code: codeSnippet,
        importPath: relImport,
        // Hook demos render straight from this index — they never go through
        // `attachDemoCode`, so the link has to ride along with the metadata.
        githubUrl: githubUrlFor(indexPath)
      });
    }
  }

  return { hooks, codeByHook, hookMeta };
}

function writeJsonPretty(file: string, data: any) {
  const content = JSON.stringify(data, null, 2) + '\n';
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === content) return; // skip unchanged
  fs.writeFileSync(file, content, 'utf8');
}

function writeTextFile(file: string, data: string) {
  const content = data.endsWith('\n') ? data : `${data}\n`;
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === content) return;
  fs.writeFileSync(file, content, 'utf8');
}

function withCodeBlock(code: string, language = 'tsx'): string {
  const cleaned = code.replace(/\r\n/g, '\n').trimEnd();
  return `
\`\`\`${language}
${cleaned}
\`\`\`
`.trim();
}

/**
 * Demo source as published in the Markdown: the whole module, imports and all.
 *
 * Demos are written against the published package imports precisely so they can
 * be copied as-is. Stripping `import` / `export` lines (as this once did) left
 * every example without its imports and with a dangling `}` where the
 * `export function Demo() {` line had been.
 */
function normalizeDemoCode(code: string): string {
  return code.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * A demo's sibling files (`data.ts`, fixtures) are shown beneath it so the
 * example is self-contained. Large fixtures are cut to their opening lines —
 * enough to show the shape of the data — with a link to the rest.
 */
const MAX_INLINE_FILE_CHARS = 3000;
const TRIMMED_FILE_CHARS = 1500;
// The compact variant keeps only enough of a fixture to show its shape, and
// leaves out an example longer than this altogether.
const COMPACT_TRIMMED_FILE_CHARS = 600;
const MAX_COMPACT_EXAMPLE_CHARS = 1600;

function inlineFileCode(file: DemoFile, compact = false): string {
  const code = file.code.replace(/\r\n/g, '\n').trim();
  const limit = compact ? COMPACT_TRIMMED_FILE_CHARS : TRIMMED_FILE_CHARS;
  if (code.length <= (compact ? COMPACT_TRIMMED_FILE_CHARS * 2 : MAX_INLINE_FILE_CHARS)) return code;
  const lines = code.split('\n');
  const kept: string[] = [];
  let size = 0;
  for (const line of lines) {
    if (kept.length && size + line.length > limit) break;
    kept.push(line);
    size += line.length + 1;
  }
  const pointer = file.githubUrl ? ` — full file: ${file.githubUrl}` : '';
  return `${kept.join('\n')}\n// … ${lines.length - kept.length} more lines${pointer}`;
}

function compactParagraph(text?: string): string {
  if (!text) return '';
  return text
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The opening sentence, for the compact (llms-small) variant of a description. */
function firstSentence(text?: string): string {
  const flat = compactParagraph(text);
  const end = flat.search(/[.!?]\s/);
  return end > 20 ? flat.slice(0, end + 1) : flat;
}

/**
 * Component descriptions are authored as Markdown, and a handful carry real
 * structure — their own headings and bullet lists. Flattening those to one line
 * (as compactParagraph does for the short one-liners) turned AppShell's page
 * into a single unreadable paragraph, so the body is kept verbatim; only the
 * leading noise is trimmed: a frontmatter rule left behind by the meta parser,
 * and a heading that just repeats the title the page already prints.
 */
function normalizeComponentDescription(text: string | undefined, title: string): string {
  if (!text) return '';
  const withoutRule = text.trim().replace(/^-{3,}\s*/, '');
  const withoutTitle = withoutRule.replace(
    new RegExp(`^#{1,6}\\s+${title.replace(/[.*+?^$()|[\]\\]/g, '\\$&')}\\s*\n+`),
    '',
  );
  return withoutTitle.replace(/\n{3,}/g, '\n\n').trim();
}

function formatTagList(tags: unknown): string | null {
  if (!tags) return null;
  if (Array.isArray(tags)) {
    const normalized = tags
      .map(tag => (typeof tag === 'string' ? tag : String(tag ?? '')))
      .map(tag => tag.trim())
      .filter(Boolean);
    if (!normalized.length) return null;
    return normalized.join(', ');
  }
  if (tags instanceof Set) {
    return formatTagList(Array.from(tags));
  }
  if (typeof tags === 'string') {
    const trimmed = tags.trim();
    return trimmed || null;
  }
  return null;
}

/**
 * Prop bags many components extend. Repeating their rows on every page cost
 * tens of thousands of tokens across the docs, so a page names the ones it
 * accepts in one line and links the guide that documents them once. Matched by
 * the interface that declares the prop, never by name — PieChart's `radius` is
 * not a border radius. `names` groups keep their prop names in the compact
 * variant too: `label` / `error` are API an agent must know exists, where the
 * spacing props are covered by the conventions.
 */
const SHARED_PROP_GROUPS: Array<{ from: string; label: string; names?: boolean }> = [
  { from: 'FieldBaseProps', label: 'field', names: true },
  { from: 'TextFieldBaseProps', label: 'text field', names: true },
  { from: 'BaseChartProps', label: 'chart', names: true },
  { from: 'ChartInteractionCallbacks', label: 'chart events', names: true },
  { from: 'BaseProps', label: 'base' },
  { from: 'SpacingProps', label: 'spacing' },
  { from: 'LayoutProps', label: 'sizing' },
  { from: 'BorderRadiusProps', label: 'radius' },
  { from: 'ShadowProps', label: 'shadow' },
  { from: 'VisibilityProps', label: 'visibility' },
  { from: 'DisclaimerSupport', label: 'disclaimer' },
];

/** Cuts `text` to `max` characters on a word boundary, marking the cut. */
function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max * 0.6)).trimEnd()}…`;
}

const FILLER_WORDS = new Set([
  'a', 'an', 'the', 'to', 'of', 'for', 'is', 'be', 'on', 'in', 'or', 'and', 'this', 'it', 'its',
  'whether', 'if', 'when', 'called', 'enable', 'enables', 'show', 'shows', 'set', 'sets', 'value',
  'component', 'prop', 'optional', 'custom', 'use', 'should',
]);

/**
 * True when a description only restates the prop name — `autoCorrect`,
 * "Whether to enable auto-correct". The compact variant drops those: the name
 * and type already say it.
 */
function restatesName(name: string, description: string): boolean {
  const nameWords = new Set(name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
  const words = description.toLowerCase().replace(/[`'"().,:;]/g, ' ').split(/[^a-z0-9]+/).filter(Boolean);
  if (!words.length || words.length > 8) return false;
  const content = words.filter(word => !FILLER_WORDS.has(word));
  return content.every(word => nameWords.has(word) || nameWords.has(word.replace(/s$/, '')));
}

/**
 * `compact` is the llms-small variant: types and descriptions clipped, and
 * `descriptions: false` drops the description altogether (sub-component props,
 * where the name and type carry most of the meaning).
 */
function formatProp(prop: Record<string, any>, compact: boolean, descriptions = true): string {
  const flags = [prop.required ? 'required' : null, prop.deprecated ? 'deprecated' : null].filter(Boolean);
  let type = compactParagraph(prop.values ?? prop.type);
  // A literal union's members are the API, so only other types are clipped.
  if (compact && !prop.values) type = clip(type, 100);
  const defaultValue = compactParagraph(prop.defaultValue);
  let description = !descriptions ? '' : compact ? clip(firstSentence(prop.description), 60) : compactParagraph(prop.description);
  if (compact && restatesName(prop.name, description)) description = '';
  return `- \`${prop.name}\`${flags.length ? ` (${flags.join(', ')})` : ''}${type ? `: ${type}` : ''}${defaultValue ? ` = ${compact ? clip(defaultValue, 40) : defaultValue}` : ''}${description ? ` — ${description}` : ''}`;
}

/**
 * Props the compact variant names without a line of their own: press and hover
 * lifecycle callbacks, passthrough prop and style objects, test and hint hooks.
 * They matter when needed and are rarely what an agent reaches for first.
 */
const SECONDARY_PROP = /^(?:on(?:PressIn|PressOut|HoverIn|HoverOut|LongPress|Layout)|testID|accessibility(?:Hint|Role|State)|[a-z][A-Za-z]*(?:Props|Style))$/;

interface PropsListOptions {
  /** llms-small variant: clipped types and descriptions. */
  compact?: boolean;
  /** Include descriptions (off for compact sub-component lists). */
  descriptions?: boolean;
  /** The component the list belongs to — its own `${self}Props` never fold. */
  self?: string;
  /** Components with a page; props inherited from their `${Name}Props` fold into one line. */
  pages?: Set<string>;
  /** Name the props in the shared-group line (off where the parent already did). */
  sharedNames?: boolean;
}

/**
 * One line per prop — `name (required): Type = default — description` — rather
 * than a five-column table whose Required and Default cells were empty on
 * almost every row. `@internal` props are left out; deprecated ones are marked
 * (and dropped from the compact variant) so they are not copied into new code.
 *
 * Inherited props fold into one line each: the shared bags into a pointer at
 * the shared-props guide, and props inherited from another documented
 * component (`PasswordInput` from `Input`, `IconButton` from `Button`) into a
 * pointer at that component's page — instead of repeating its whole list.
 */
function buildPropsList(props: Array<Record<string, any>>, options: PropsListOptions = {}): string {
  const { compact = false, descriptions = true, self, pages, sharedNames = true } = options;
  const visible = props.filter(prop => !prop.internal && !(compact && prop.deprecated));
  if (!visible.length) return '_No documented props yet._';

  const shared = new Map<string, string[]>();
  const inherited = new Map<string, string[]>();
  const secondary: string[] = [];
  const lines: string[] = [];
  for (const prop of visible) {
    const group = SHARED_PROP_GROUPS.find(candidate => candidate.from === prop.from);
    const parent = typeof prop.from === 'string' ? prop.from.match(/^(\w+)Props$/)?.[1] : undefined;
    if (group) shared.set(group.label, [...(shared.get(group.label) ?? []), prop.name]);
    else if (parent && parent !== self && pages?.has(parent)) inherited.set(parent, [...(inherited.get(parent) ?? []), prop.name]);
    else if (compact && SECONDARY_PROP.test(prop.name) && !prop.required) secondary.push(prop.name);
    else lines.push(formatProp(prop, compact, descriptions));
  }

  const notes: string[] = [];
  if (secondary.length) notes.push(`Also: ${secondary.map(n => `\`${n}\``).join(' ')}`);
  for (const [parent, names] of inherited) {
    const list = compact ? '' : ` (${names.map(n => `\`${n}\``).join(' ')})`;
    notes.push(`Plus the \`${parent}\` props${list}: ${SITE_URL}/llms/components/${parent}.md`);
  }
  if (shared.size) {
    const groups = SHARED_PROP_GROUPS.filter(group => shared.has(group.label)).map(group => {
      const names = shared.get(group.label)!;
      if (!sharedNames || (compact && !group.names)) return group.label;
      return names.length === 1 && names[0] === group.label
        ? `\`${names[0]}\``
        : `${group.label} (${names.map(n => `\`${n}\``).join(' ')})`;
    });
    notes.push(`Also accepts the shared props — ${groups.join(', ')}: ${LLMS_SHARED_PROPS_URL}`);
  }
  return [lines.join('\n'), notes.join('\n\n')].filter(Boolean).join('\n\n');
}

function formatDemoMarkdown(
  demo: DemoMeta,
  codeEntry: CodeEntry | undefined,
  shownFiles: Map<string, string>,
  compact = false,
): string {
  const title = demo.title || demo.demo;
  const lines: string[] = [`### ${title}`];
  if (demo.description) {
    lines.push('', compactParagraph(demo.description));
  }
  if (codeEntry?.code) {
    const code = normalizeDemoCode(codeEntry.code);
    if (code) lines.push('', withCodeBlock(code));
    for (const file of codeEntry.files ?? []) {
      if (file.name === 'index.tsx') continue;
      // Every demo of a component often shares one `../data` fixture: print it
      // once per page and point back at it after that.
      const key = sha256(file.code);
      const firstShownIn = shownFiles.get(key);
      if (firstShownIn) {
        lines.push('', `\`${file.name}\` is the same file shown under “${firstShownIn}” above.`);
        continue;
      }
      shownFiles.set(key, title);
      lines.push('', `\`${file.name}\``, '', withCodeBlock(inlineFileCode(file, compact), path.extname(file.name).slice(1) || 'ts'));
    }
  }
  return lines.join('\n');
}

interface ComponentMarkdownContext {
  meta: ComponentMetaRecord;
  propsMap: Record<string, any[]>;
  demosMap: Map<string, DemoMeta[]>;
  codeMap: Record<string, Record<string, CodeEntry>>;
  subcomponents: Record<string, SubcomponentDoc[]>;
  relatedHooks: Record<string, RelatedHookDoc[]>;
  typeDocs: Record<string, string[]>;
}

/**
 * One component's Markdown page. `compact` is the llms-small variant: the lead
 * paragraph, own props with one-sentence descriptions, sub-components, and the
 * first example only — everything needed to write correct code, at a fraction
 * of the size.
 */
function buildComponentMarkdown(name: string, context: ComponentMarkdownContext, compact = false): string {
  const componentMeta = context.meta[name] || {};
  const lines: string[] = [];
  const title = componentMeta.title || name;
  lines.push(`# ${title}`);
  const description = normalizeComponentDescription(componentMeta.description, title);
  if (description) {
    lines.push('');
    if (compact) {
      // The opening sentence of the first prose paragraph; the full page has the rest.
      const lead = description.split(/\n\s*\n/).find(p => !/^[#\-*|>]/.test(p.trim()));
      lines.push(firstSentence(lead ?? '') || firstSentence(componentMeta.tagline));
    } else {
      lines.push(description);
    }
  }

  const packageName = componentMeta.packageName
    || (componentMeta.category === 'charts' ? '@platform-blocks/charts' : '@platform-blocks/ui');
  if (compact) {
    // One line in place of the Metadata section.
    const status = componentMeta.status && componentMeta.status !== 'stable' ? ` · Status: ${componentMeta.status}` : '';
    lines.push('', `\`import { ${name} } from '${packageName}';\`${status} · Full page: ${SITE_URL}/llms/components/${name}.md`);
  }
  const metaList: string[] = [];
  metaList.push(`- Import: \`import { ${name} } from '${packageName}';\``);
  if (packageName === '@platform-blocks/charts') {
    metaList.push('- Install: `npm install @platform-blocks/charts` — a separate package from `@platform-blocks/ui`');
  }
  if (componentMeta.status && componentMeta.status !== 'stable') metaList.push(`- Status: ${componentMeta.status}`);
  if (!compact) {
    const componentTags = formatTagList(componentMeta.tags);
    if (componentTags) metaList.push(`- Tags: ${componentTags}`);
    // Charts have their own detail route; everything else lives under /components.
    metaList.push(`- Docs: ${SITE_URL}/${packageName === '@platform-blocks/charts' ? 'charts' : 'components'}/${name}`);
    if (componentMeta.sourcePath) {
      metaList.push(`- Source: ${GITHUB_REPO}/tree/${GITHUB_BRANCH}/${componentMeta.sourcePath}`);
    }
  }
  if (!compact) lines.push('', '## Metadata', '', ...metaList);

  const pages = new Set(Object.keys(context.propsMap));
  lines.push('', '## Props', '', buildPropsList(context.propsMap[name] || [], { compact, self: name, pages }));

  const subs = context.subcomponents[name] ?? [];
  if (subs.length) {
    lines.push('', '## Sub-components', '');
    const importable = subs.filter(sub => !sub.name.includes('.')).map(sub => sub.name);
    if (importable.length) {
      lines.push(`\`import { ${importable.join(', ')} } from '${packageName}';\``, '');
    }
    const bare: string[] = [];
    for (const sub of subs) {
      if (!sub.props.length) { bare.push(sub.name); continue; }
      lines.push(`### ${sub.name}`, '', buildPropsList(sub.props, {
        compact,
        descriptions: !compact,
        self: sub.name.replace('.', ''),
        pages,
        // The parent's list above already named the shared props.
        sharedNames: !compact,
      }), '');
    }
    if (bare.length) {
      lines.push(`${bare.map(n => `\`${n}\``).join(', ')} ${bare.length === 1 ? 'has' : 'have'} no props interface of ${bare.length === 1 ? 'its' : 'their'} own.`);
    }
  }

  const hooks = context.relatedHooks[name] ?? [];
  if (hooks.length) {
    lines.push('', '## Related hooks', '');
    for (const hook of hooks) {
      const signature = hook.signature ?? `${hook.name}()`;
      lines.push(`- \`${signature}\`${hook.summary ? ` — ${hook.summary}` : ''}`);
    }
  }

  // Full pages only: the compact variant leans on its example for data shapes.
  const types = compact ? [] : context.typeDocs[name] ?? [];
  if (types.length) {
    lines.push('', '## Types', '', withCodeBlock(types.join('\n\n'), 'ts'));
  }

  const demos = (context.demosMap.get(name) || []).filter(d => !d.hidden);
  if (demos.length) {
    lines.push('', compact ? '## Example' : '## Examples', '');
    const shownFiles = new Map<string, string>();
    const codeFor = (demo: DemoMeta) => context.codeMap[name]?.[demo.id] || context.codeMap[name]?.[`${name}.${demo.demo}`] || context.codeMap[name]?.[`${demo.component}.${demo.demo}`];
    // The compact variant shows one example: the shortest of the first five
    // that needs no fixture file, so it stands alone without a data dump.
    const standalone = (demo: DemoMeta) => !(codeFor(demo)?.files ?? []).some(file => file.name !== 'index.tsx');
    const size = (demo: DemoMeta) => codeFor(demo)?.code.length ?? Infinity;
    const leading = demos.slice(0, 5);
    const candidates = leading.some(standalone) ? leading.filter(standalone) : leading;
    const shortest = candidates.reduce((best, demo) => (size(demo) < size(best) ? demo : best));
    // A long example costs more than it teaches in the compact file; the full
    // page has it.
    const selected = compact ? (size(shortest) <= MAX_COMPACT_EXAMPLE_CHARS ? [shortest] : []) : demos;
    selected.forEach((demo, index) => {
      if (index > 0) lines.push('');
      lines.push(formatDemoMarkdown(demo, codeFor(demo), shownFiles, compact));
    });
    const more = demos.length - selected.length;
    if (compact && more > 0) {
      lines.push('', `${more} ${selected.length ? 'more ' : ''}example${more > 1 ? 's' : ''} on the full page.`);
    }
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function generate() {
  ensureDir(OUTPUT_DIR);
  ensureDir(COMPONENT_MARKDOWN_DIR);
  const { demos, codeByComponent, componentMeta, propsMeta, componentSourceDir, warningCounts, componentWarnings, subcomponents, relatedHooks, typeDocs } = collectDemos();
  const { hooks, codeByHook, hookMeta } = collectHooks();

  // Attach source provenance so docs pages can link to GitHub / npm without
  // duplicating the package layout on the client.
  for (const [comp, sourceDir] of Object.entries(componentSourceDir)) {
    const meta = componentMeta[comp];
    if (!meta) continue;
    const relative = path.relative(ROOT, sourceDir).split(path.sep).join('/');
    meta.sourcePath = relative;
    meta.packageName = relative.startsWith('packages/charts/')
      ? '@platform-blocks/charts'
      : '@platform-blocks/ui';
    if (fs.existsSync(path.join(sourceDir, 'meta', 'component.md'))) {
      meta.docsPath = `${relative}/meta/component.md`;
    }
  }

  // Sort metadata
  demos.sort((a, b) => a.component.localeCompare(b.component) || a.order - b.order || a.title.localeCompare(b.title));
  hooks.sort((a, b) => a.component.localeCompare(b.component) || a.order - b.order || a.title.localeCompare(b.title));

  // Filter out hidden entities from metadata shards
  const visibleComponentMeta = Object.fromEntries(
    Object.entries(componentMeta).filter(([comp, meta]) => meta.hidden !== true)
  );
  const visibleHookMeta = Object.fromEntries(
    Object.entries(hookMeta).filter(([hook, meta]) => meta?.hidden !== true)
  );

  const demosByComponent = new Map<string, DemoMeta[]>();
  for (const demo of demos) {
    if (!demosByComponent.has(demo.component)) {
      demosByComponent.set(demo.component, []);
    }
    demosByComponent.get(demo.component)!.push(demo);
  }

  writeJsonPretty(path.join(OUTPUT_DIR, 'demos.json'), { demos, components: visibleComponentMeta });
  // Standalone component meta shard for global navigation/search facets
  writeJsonPretty(path.join(OUTPUT_DIR, 'components-meta.json'), visibleComponentMeta);
  // Regression safeguard: ensure no component lost >70% of props vs existing artifact
  const existingPropsPath = path.join(OUTPUT_DIR, 'components-props.json');
  if (fs.existsSync(existingPropsPath)) {
    try {
      const previous = JSON.parse(fs.readFileSync(existingPropsPath, 'utf8'));
      for (const comp of Object.keys(propsMeta)) {
        const prev = previous[comp];
        const curr = propsMeta[comp];
        if (Array.isArray(prev) && prev.length > 0 && curr && curr.length / prev.length < 0.3) {
          console.warn(`[generate-demos] WARNING: Prop extraction regression for ${comp} (prev ${prev.length} -> now ${curr.length}). Retaining previous set.`);
          propsMeta[comp] = prev; // retain previous to avoid data wipe
        }
      }
    } catch { }
  }
  writeJsonPretty(existingPropsPath, propsMeta);

  // Hooks metadata shards
  writeJsonPretty(path.join(OUTPUT_DIR, 'hooks.json'), { hooks });
  writeJsonPretty(path.join(OUTPUT_DIR, 'hooks-meta.json'), visibleHookMeta);

  // Write per-component code shards
  for (const comp of Object.keys(codeByComponent)) {
    const shardPath = path.join(OUTPUT_DIR, `demo-code-${comp}.json`);
    writeJsonPretty(shardPath, codeByComponent[comp]);
  }

  const componentNames = new Set<string>([
    ...Object.keys(componentMeta),
    ...Object.keys(propsMeta),
    ...Object.keys(codeByComponent),
    ...demos.map(d => d.component),
  ]);
  const sortedComponentNames = Array.from(componentNames).sort((a, b) => a.localeCompare(b));

  const markdownContext: ComponentMarkdownContext = {
    meta: componentMeta,
    propsMap: propsMeta,
    demosMap: demosByComponent,
    codeMap: codeByComponent,
    subcomponents,
    relatedHooks,
    typeDocs,
  };
  const markdownIndex: Record<string, string> = {};
  // The compact variant feeds /llms-small.txt (scripts/generate-llms.ts).
  const compactMarkdownIndex: Record<string, string> = {};
  for (const name of sortedComponentNames) {
    if (visibleComponentMeta[name]?.hidden === true) continue;
    const markdown = buildComponentMarkdown(name, markdownContext);
    markdownIndex[name] = markdown;
    compactMarkdownIndex[name] = buildComponentMarkdown(name, markdownContext, true);
    const filePath = path.join(COMPONENT_MARKDOWN_DIR, `${name}.md`);
    writeTextFile(filePath, markdown);
  }
  writeJsonPretty(path.join(OUTPUT_DIR, 'component-markdown.json'), markdownIndex);
  writeJsonPretty(path.join(OUTPUT_DIR, 'component-markdown-compact.json'), compactMarkdownIndex);

  // Write per-hook code shards
  for (const hook of Object.keys(codeByHook)) {
    const shardPath = path.join(OUTPUT_DIR, `hook-code-${hook}.json`);
    writeJsonPretty(shardPath, codeByHook[hook]);
  }

  // Simple search index combining component and hook names, titles, and demo titles
  const searchEntries: any[] = [];
  for (const comp of Object.keys(componentMeta)) {
    const meta = componentMeta[comp] || {};
    if (meta.hidden === true) continue;

    searchEntries.push({
      id: `component:${comp}`,
      type: 'component',
      title: meta.title || comp,
      description: meta.description?.slice(0, 140) || '',
      category: meta.category || 'component',
      keywords: [comp, ...(meta.tags || [])]
    });
  }

  for (const hookName of Object.keys(hookMeta)) {
    const meta = hookMeta[hookName] || {};
    if (meta.hidden === true) continue;

    searchEntries.push({
      id: `hook:${hookName}`,
      type: 'hook',
      title: meta.title || hookName,
      description: meta.description?.slice(0, 140) || '',
      category: meta.category || 'hook',
      keywords: [hookName, ...(meta.tags || [])]
    });
  }

  for (const demo of demos) {
    searchEntries.push({
      id: `demo:${demo.id}`,
      type: 'demo',
      title: demo.title,
      description: (demo.description || '').slice(0, 140),
      category: demo.category || 'demo',
      keywords: [demo.component, ...(demo.tags || [])]
    });
  }

  for (const demo of hooks) {
    searchEntries.push({
      id: `hook-demo:${demo.id}`,
      type: 'hook-demo',
      title: demo.title,
      description: (demo.description || '').slice(0, 140),
      category: demo.category || 'hook-demo',
      keywords: [demo.component, ...(demo.tags || [])]
    });
  }
  writeJsonPretty(path.join(OUTPUT_DIR, 'search-new.json'), { entries: searchEntries });

  // Manifest placeholder (Phase 1 may replace path strategy)
  const isProd = process.env.NODE_ENV === 'production' || process.argv.includes('--prod');
  const manifestLines: string[] = [];
  manifestLines.push('/* AUTO-GENERATED: demo-manifest */');
  manifestLines.push('// NOTE: This file is regenerated by scripts/generate-demos.ts – do not edit manually.');
  manifestLines.push('// Exports:');
  manifestLines.push('//   DEMO_MODULES: always present, async dynamic imports (code-split)');
  manifestLines.push('//   DEMO_STATIC: dev-only synchronous require map for instant demo rendering');
  manifestLines.push('');
  manifestLines.push('export const DEMO_MODULES = {');
  for (const comp of Object.keys(codeByComponent)) {
    for (const [id, entry] of Object.entries(codeByComponent[comp])) {
      manifestLines.push(`  '${id}': () => import('${entry.importPath}'),`);
    }
  }
  manifestLines.push('};');
  if (!isProd) {
    manifestLines.push('');
    manifestLines.push('// Dev eager map (omitted in production builds to keep bundle lean)');
    manifestLines.push('export const DEMO_STATIC = {');
    for (const comp of Object.keys(codeByComponent)) {
      for (const [id, entry] of Object.entries(codeByComponent[comp])) {
        manifestLines.push(`  '${id}': () => require('${entry.importPath}'),`);
      }
    }
    manifestLines.push('};');
  }
  const manifestPath = path.join(OUTPUT_DIR, 'demo-manifest.ts');
  const manifestContent = manifestLines.join('\n') + '\n';
  if (!fs.existsSync(manifestPath) || fs.readFileSync(manifestPath, 'utf8') !== manifestContent) {
    fs.writeFileSync(manifestPath, manifestContent, 'utf8');
  }

  // Hook manifest for demo components
  const hookManifestLines: string[] = [];
  hookManifestLines.push('/* AUTO-GENERATED: hook demo manifest */');
  hookManifestLines.push('// NOTE: This file is regenerated by scripts/generate-demos.ts – do not edit manually.');
  hookManifestLines.push('// Exports:');
  hookManifestLines.push('//   HOOK_DEMO_MODULES: async dynamic imports for hook demos');
  hookManifestLines.push('//   HOOK_DEMO_STATIC: dev-only synchronous require map');
  hookManifestLines.push('');
  hookManifestLines.push('export const HOOK_DEMO_MODULES = {');
  for (const hook of Object.keys(codeByHook)) {
    for (const [id, entry] of Object.entries(codeByHook[hook])) {
      hookManifestLines.push(`  '${id}': () => import('${entry.importPath}'),`);
    }
  }
  hookManifestLines.push('};');
  if (!isProd) {
    hookManifestLines.push('');
    hookManifestLines.push('// Dev eager map for hook demos (omitted in production)');
    hookManifestLines.push('export const HOOK_DEMO_STATIC = {');
    for (const hook of Object.keys(codeByHook)) {
      for (const [id, entry] of Object.entries(codeByHook[hook])) {
        hookManifestLines.push(`  '${id}': () => require('${entry.importPath}'),`);
      }
    }
    hookManifestLines.push('};');
  }
  const hookManifestPath = path.join(OUTPUT_DIR, 'hook-manifest.ts');
  const hookManifestContent = hookManifestLines.join('\n') + '\n';
  if (!fs.existsSync(hookManifestPath) || fs.readFileSync(hookManifestPath, 'utf8') !== hookManifestContent) {
    fs.writeFileSync(hookManifestPath, hookManifestContent, 'utf8');
  }

  // Generate code loader map for web bundling compatibility
  const codeLoaderLines: string[] = [];
  codeLoaderLines.push('/* AUTO-GENERATED: demo code loaders */');
  codeLoaderLines.push('// NOTE: This file is regenerated by scripts/generate-demos.ts – do not edit manually.');
  codeLoaderLines.push('// Static imports for demo code JSON files to avoid web bundling issues');
  codeLoaderLines.push('');
  codeLoaderLines.push('const DEMO_CODE_MAPS: Record<string, any> = {};');
  codeLoaderLines.push('');

  for (const comp of Object.keys(codeByComponent).sort()) {
    // Shards are written to OUTPUT_DIR alongside this loader, so the specifier
    // must be './' — '../' resolves outside data/generated and the require
    // silently falls into the catch, leaving every demo without code.
    codeLoaderLines.push(`try { DEMO_CODE_MAPS.${comp} = require('./demo-code-${comp}.json'); } catch { /* ignore */ }`);
  }

  codeLoaderLines.push('');
  codeLoaderLines.push('export function loadCodeMap(component: string): Record<string, any> | null {');
  codeLoaderLines.push('  return DEMO_CODE_MAPS[component] || null;');
  codeLoaderLines.push('}');

  const codeLoaderPath = path.join(OUTPUT_DIR, 'demoCodeLoader.ts');
  const codeLoaderContent = codeLoaderLines.join('\n') + '\n';
  if (!fs.existsSync(codeLoaderPath) || fs.readFileSync(codeLoaderPath, 'utf8') !== codeLoaderContent) {
    fs.writeFileSync(codeLoaderPath, codeLoaderContent, 'utf8');
  }

  // Hook code loader map
  const hookCodeLoaderLines: string[] = [];
  hookCodeLoaderLines.push('/* AUTO-GENERATED: hook demo code loaders */');
  hookCodeLoaderLines.push('// NOTE: This file is regenerated by scripts/generate-demos.ts – do not edit manually.');
  hookCodeLoaderLines.push('// Static imports for hook demo code JSON files to avoid web bundling issues');
  hookCodeLoaderLines.push('');
  hookCodeLoaderLines.push('const HOOK_CODE_MAPS: Record<string, any> = {};');
  hookCodeLoaderLines.push('');

  for (const hook of Object.keys(codeByHook).sort()) {
    hookCodeLoaderLines.push(`try { HOOK_CODE_MAPS.${hook} = require('./hook-code-${hook}.json'); } catch { /* ignore */ }`);
  }

  hookCodeLoaderLines.push('');
  hookCodeLoaderLines.push('export function loadHookCodeMap(hook: string): Record<string, any> | null {');
  hookCodeLoaderLines.push('  return HOOK_CODE_MAPS[hook] || null;');
  hookCodeLoaderLines.push('}');

  const hookCodeLoaderPath = path.join(OUTPUT_DIR, 'hookCodeLoader.ts');
  const hookCodeLoaderContent = hookCodeLoaderLines.join('\n') + '\n';
  if (!fs.existsSync(hookCodeLoaderPath) || fs.readFileSync(hookCodeLoaderPath, 'utf8') !== hookCodeLoaderContent) {
    fs.writeFileSync(hookCodeLoaderPath, hookCodeLoaderContent, 'utf8');
  }

  const componentCount = Object.keys(codeByComponent).length;
  const hookCount = Object.keys(codeByHook).length;
  console.log(`[generate-demos] Indexed ${demos.length} component demos across ${componentCount} components and ${hooks.length} hook demos across ${hookCount} hooks.`);
  if (Object.keys(warningCounts).length) {
    console.log('[generate-demos] Warning summary:');
    for (const k of Object.keys(warningCounts)) console.log(`  - ${k}: ${warningCounts[k]}`);
  }
  // Persist warnings shard
  writeJsonPretty(path.join(OUTPUT_DIR, 'warnings.json'), { total: warningCounts, byComponent: componentWarnings });

  // Validation mode (fail build on certain warning types or regression)
  if (process.argv.includes('--validate')) {
    const failTypes = ['unbalanced-interface', 'ambiguous-type'];
    const fatal = failTypes.some(t => warningCounts[t] > 0);
    if (fatal) {
      console.error('[generate-demos] Validation failed due to fatal warnings.');
      process.exit(1);
    } else {
      console.log('[generate-demos] Validation passed.');
    }
  }
}

generate();
